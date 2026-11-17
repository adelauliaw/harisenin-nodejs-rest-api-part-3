const test = require('node:test');
const assert = require('node:assert/strict');
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/models');
const app = require('../src/app');

test('API + MySQL integration and frontend serving', async () => {
  await db.sequelize.authenticate();
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const email = `integration-${Date.now()}@example.com`;
  const password = 'Integration123!';
  let userId;
  const request = async (path, status, {method='GET', body, token, raw}={}) => {
    const response = await fetch(base+path, {method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:raw ?? (body===undefined?undefined:JSON.stringify(body))});
    const result = await response.json();
    assert.equal(response.status,status,`${method} ${path}: ${JSON.stringify(result)}`);
    return result.data;
  };
  try {
    await request('/',200);
    await request('/api/profile',401);
    await request('/api/users',401);
    await request('/api/profile',401,{token:'invalid'});
    await request('/api/auth/login',400,{method:'POST',body:{email:123,password:[]}});
    await request('/api/auth/login',400,{method:'POST'});
    await request('/api/auth/login',400,{method:'POST',raw:'{'});
    await request('/api/auth/register',400,{method:'POST',body:{name:'Test',email,password:'weak'}});
    const user=await request('/api/auth/register',201,{method:'POST',body:{name:'Integration Test',email,password}});
    userId=user.id; assert.equal(user.password,undefined);
    const stored=await db.user.findByPk(userId);
    assert.notEqual(stored.password,password);assert.ok(await bcrypt.compare(password,stored.password));
    await request('/api/auth/register',409,{method:'POST',body:{name:'Duplicate',email,password}});
    await request('/api/auth/login',401,{method:'POST',body:{email,password:'WrongPassword!'}});
    const {token}=await request('/api/auth/login',200,{method:'POST',body:{email,password}});
    const expired=jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:-1});
    await request('/api/profile',401,{token:expired});
    const profile=await request('/api/profile',200,{token});assert.equal(profile.id,userId);assert.equal(profile.password,undefined);
    const users=await request('/api/users',200,{token});assert.ok(users.some(u=>u.id===userId));assert.ok(users.every(u=>u.password===undefined));
    await request('/api/posts',401,{method:'POST',body:{title:'Unauthorized'}});
    await request('/api/posts',400,{method:'POST',token,body:{title:123}});
    const post=await request('/api/posts',201,{method:'POST',token,body:{title:'Integration post',content:'<script>alert(1)</script>',user_id:999999}});
    assert.equal(post.user_id,userId);assert.equal(post.user.name,'Integration Test');assert.equal(post.user.password,undefined);
    const sameTitle=await request('/api/posts',201,{method:'POST',token,body:{title:'Integration post'}});assert.notEqual(post.slug,sameTitle.slug);
    const detail=await request('/api/posts/'+post.slug,200);assert.equal(detail.id,post.id);
    assert.equal((await db.post.findByPk(post.id)).slug,post.slug);
    assert.ok((await request('/api/posts',200)).some(p=>p.id===post.id));
    await request('/api/posts/nonexistent-test-slug',404);
    await request('/api/missing',404);
    const html=await fetch(base+'/dashboard/');assert.equal(html.status,200);assert.match(await html.text(),/id="postForm"/);
    // Execute the actual inline frontend script against the live HTTP server.
    // This checks UI handlers and API wiring; it is not a browser layout test.
    const vm = require('node:vm');
    const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../frontend/index.html'), 'utf8');
    const elements = new Map();
    function element() {
      const classes = new Set();
      return { value:'', textContent:'', innerHTML:'', className:'', style:{}, dataset:{}, handlers:{},
        classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c),contains:c=>classes.has(c)},
        addEventListener(name,handler){this.handlers[name]=handler;},
        querySelector(){return this.button ??= element();},querySelectorAll(){return [];},reset(){},scrollIntoView(){} };
    }
    for (const match of source.matchAll(/id="([^"]+)"/g)) elements.set(match[1],element());
    const storage=new Map();
    const context=vm.createContext({
      document:{getElementById:id=>elements.get(id),querySelectorAll:()=>[]},
      location:{protocol:'http:',origin:base},
      sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},
      fetch,console,
    });
    vm.runInContext(source.match(/<script>([\s\S]*?)<\/script>/)[1],context);
    elements.get('loginEmail').value=email;elements.get('loginPassword').value=password;
    await elements.get('loginForm').handlers.submit({preventDefault(){}});
    assert.equal(elements.get('authStatus').textContent,'Terverifikasi');
    assert.match(elements.get('connectionStatus').textContent,/user dan/);
    await vm.runInContext('openPage("profile")',context);
    assert.match(elements.get('profileData').innerHTML,/Integration Test/);
    await vm.runInContext('openPage("users")',context);
    assert.ok(elements.get('usersData').innerHTML.includes(email));
    await vm.runInContext('openPage("posts")',context);
    assert.match(elements.get('postsData').innerHTML,/&lt;script&gt;/);
    elements.get('postTitle').value='Frontend integration post';
    elements.get('postContent').value='Saved through the HTML form handler';
    await elements.get('postForm').handlers.submit({preventDefault(){}});
    assert.match(elements.get('postMessage').textContent,/berhasil/);
    assert.match(elements.get('postDetail').innerHTML,/Saved through the HTML form handler/);
    assert.ok(await db.post.findOne({where:{user_id:userId,title:'Frontend integration post'}}));
    elements.get('logoutBtn').handlers.click();assert.equal(storage.size,0);
    assert.ok(elements.get('appView').classList.contains('hidden'));
    storage.set('harisenin_rest_api_token',expired);
    await vm.runInContext('openPage("overview")',context);
    assert.equal(storage.size,0);assert.match(elements.get('authMessage').textContent,/kedaluwarsa/);
    console.log('PASS: actual frontend JS login, overview, profile, users, escaped content, create/detail, logout, expired session');
    console.log('PASS: auth, hashing, JWT, validation, users, profile, post ownership, unique slugs, MySQL persistence, HTML serving');
  } finally {
    if(userId) {await db.post.destroy({where:{user_id:userId}});await db.user.destroy({where:{id:userId}});}
    await new Promise(resolve=>server.close(resolve));
    await db.sequelize.close();
  }
});
