import http from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA = path.join(ROOT, 'data', 'store.json');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const SEED_PRODUCTS=[
 {id:1,name:'চাল',price:70,unit:'কেজি',stock:80,lowStockAt:15,icon:'./assets/Icon/rice.png'},
 {id:2,name:'ডাল',price:120,unit:'কেজি',stock:40,lowStockAt:10,icon:'./assets/Icon/coffee-beans.png'},
 {id:3,name:'সয়াবিন তেল',price:180,unit:'লিটার',stock:25,lowStockAt:8,icon:'./assets/Icon/oil.png'},
 {id:4,name:'চিনি',price:100,unit:'কেজি',stock:35,lowStockAt:10,icon:'./assets/Icon/sugar.png'},
 {id:5,name:'লবণ',price:40,unit:'কেজি',stock:8,lowStockAt:10,icon:'./assets/Icon/salt.png'},
 {id:6,name:'আটা',price:55,unit:'কেজি',stock:45,lowStockAt:12,icon:'./assets/Icon/flour.png'},
 {id:7,name:'দুধ',price:90,unit:'লিটার',stock:14,lowStockAt:10,icon:'./assets/Icon/milk.png'},
 {id:8,name:'ডিম',price:12,unit:'পিস',stock:90,lowStockAt:24,icon:'./assets/Icon/eggs.png'},
 {id:9,name:'সাবান',price:35,unit:'পিস',stock:30,lowStockAt:8,icon:'./assets/Icon/soap.png'}
];
const hashPassword=(password,salt=crypto.randomBytes(16).toString('hex'))=>({salt,hash:crypto.scryptSync(password,salt,64).toString('hex')});
const verifyPassword=(password,user)=>{const actual=crypto.scryptSync(password,user.salt,64),expected=Buffer.from(user.passwordHash,'hex');return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected)};
const cookieMap=header=>Object.fromEntries((header||'').split(';').filter(Boolean).map(v=>{const i=v.indexOf('=');return[decodeURIComponent(v.slice(0,i).trim()),decodeURIComponent(v.slice(i+1).trim())]}));
const send=(res,status,data,headers={})=>{const body=data===undefined?'':JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store',...headers});res.end(body)};
const readJson=async req=>{let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1_000_000)throw Object.assign(new Error('Request too large'),{status:413});body+=chunk}try{return body?JSON.parse(body):{}}catch{throw Object.assign(new Error('Invalid JSON'),{status:400})}};
const dateKey=d=>new Date(d).toISOString().slice(0,10);

export async function createApp(options={}){
 const dataFile=options.dataFile||process.env.DATA_FILE||DEFAULT_DATA,adminPassword=options.adminPassword||process.env.ADMIN_PASSWORD||'SPI99';
 await mkdir(path.dirname(dataFile),{recursive:true});
 let store;
 try{store=JSON.parse(await readFile(dataFile,'utf8'))}catch{const p=hashPassword(adminPassword);store={version:1,nextProductId:10,nextSaleId:1,users:[{id:1,username:'Admin',role:'ADMIN',salt:p.salt,passwordHash:p.hash,active:true}],products:SEED_PRODUCTS,sales:[],stockMovements:[]};await writeFile(dataFile,JSON.stringify(store,null,2),'utf8')}
 const sessions=new Map(),attempts=new Map();let writeQueue=Promise.resolve();
 const persist=()=>{writeQueue=writeQueue.then(async()=>{const temp=dataFile+'.tmp';await writeFile(temp,JSON.stringify(store,null,2),'utf8');await rename(temp,dataFile)});return writeQueue};
 const userFor=req=>{const token=cookieMap(req.headers.cookie).grocery_session,session=token&&sessions.get(token);if(!session||session.expiresAt<Date.now()){if(token)sessions.delete(token);return null}return store.users.find(u=>u.id===session.userId&&u.active)||null};
 const requireUser=(req,res)=>{const user=userFor(req);if(!user){send(res,401,{error:'Authentication required'});return null}return user};
 const serveStatic=async(req,res,url)=>{let pathname=decodeURIComponent(url.pathname==='/'?'/page/login.html':url.pathname);if(pathname.includes('\0')||pathname.startsWith('/data/')||pathname.startsWith('/tests/')||pathname.includes('.git'))return send(res,404,{error:'Not found'});const file=path.resolve(ROOT,'.'+pathname);if(!file.startsWith(ROOT+path.sep))return send(res,403,{error:'Forbidden'});try{const info=await stat(file);if(!info.isFile())throw new Error();res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache'});createReadStream(file).pipe(res)}catch{send(res,404,{error:'Not found'})}};
 const server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),route=url.pathname,method=req.method;
  if(method==='GET'&&(route==='/login'||route==='/login/'||route==='/login.html')){res.writeHead(302,{Location:'/page/login.html'});return res.end()}
  if(method==='GET'&&(route==='/dashboard'||route==='/dashboard/'||route==='/dashboard.html')){res.writeHead(302,{Location:'/page/dashboard.html'});return res.end()}
  if(method==='GET'&&(route==='/billing'||route==='/billing/'||route==='/billing.html')){res.writeHead(302,{Location:'/index.html'});return res.end()}
  if(method==='GET'&&(route==='/products'||route==='/products/'||route==='/products.html')){res.writeHead(302,{Location:'/page/products.html'});return res.end()}
  if(method==='GET'&&(route==='/sales'||route==='/sales/'||route==='/sales.html')){res.writeHead(302,{Location:'/page/sales.html'});return res.end()}
  if(route==='/favicon.ico'&&method==='GET'){res.writeHead(204);return res.end()}
  if(route==='/api/health'&&method==='GET')return send(res,200,{ok:true,service:'grocery-shop-api'});
  if(route==='/api/auth/login'&&method==='POST'){
   const ip=req.socket.remoteAddress||'unknown',now=Date.now(),record=attempts.get(ip)||{count:0,start:now};if(now-record.start>60000){record.count=0;record.start=now}if(record.count>=8)return send(res,429,{error:'Too many login attempts'});
   const body=await readJson(req),user=store.users.find(u=>u.username===body.username&&u.active);if(!user||!verifyPassword(String(body.password||''),user)){record.count++;attempts.set(ip,record);return send(res,401,{error:'Invalid username or password'})}
   attempts.delete(ip);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{userId:user.id,expiresAt:now+8*60*60*1000});return send(res,200,{user:{id:user.id,username:user.username,role:user.role}},{'Set-Cookie':`grocery_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${process.env.NODE_ENV==='production'?'; Secure':''}`});
  }
  if(route==='/api/auth/logout'&&method==='POST'){const token=cookieMap(req.headers.cookie).grocery_session;if(token)sessions.delete(token);return send(res,200,{ok:true},{'Set-Cookie':'grocery_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'})}
  if(route==='/api/auth/me'&&method==='GET'){const user=requireUser(req,res);if(!user)return;return send(res,200,{user:{id:user.id,username:user.username,role:user.role}})}
  if(route==='/api/products'&&method==='GET'){if(!requireUser(req,res))return;const q=(url.searchParams.get('q')||'').toLowerCase();return send(res,200,{count:store.products.length,products:store.products.filter(p=>p.name.toLowerCase().includes(q))})}
  if(route==='/api/products'&&method==='POST'){if(!requireUser(req,res))return;const b=await readJson(req);if(!b.name||!(Number(b.price)>0)||!(Number(b.stock)>=0))return send(res,422,{error:'name, positive price and stock are required'});const product={id:store.nextProductId++,name:String(b.name).trim(),price:Number(b.price),unit:String(b.unit||'পিস'),stock:Number(b.stock),lowStockAt:Number(b.lowStockAt||10),icon:b.icon||null};store.products.push(product);await persist();return send(res,201,{product})}
  const productMatch=route.match(/^\/api\/products\/(\d+)$/);if(productMatch&&(method==='PATCH'||method==='DELETE')){const user=requireUser(req,res);if(!user)return;const id=Number(productMatch[1]),index=store.products.findIndex(p=>p.id===id);if(index<0)return send(res,404,{error:'Product not found'});if(method==='DELETE'){const removed=store.products.splice(index,1)[0];await persist();return send(res,200,{product:removed})}const b=await readJson(req),product=store.products[index],before=product.stock;for(const key of ['name','unit','icon'])if(b[key]!==undefined)product[key]=String(b[key]);for(const key of ['price','stock','lowStockAt'])if(b[key]!==undefined){const n=Number(b[key]);if(!Number.isFinite(n)||n<0)return send(res,422,{error:`Invalid ${key}`});product[key]=n}if(product.stock!==before)store.stockMovements.push({id:crypto.randomUUID(),productId:id,type:'ADJUSTMENT',before,after:product.stock,userId:user.id,createdAt:new Date().toISOString()});await persist();return send(res,200,{product})}
  if(route==='/api/sales'&&method==='GET'){if(!requireUser(req,res))return;const from=url.searchParams.get('from'),to=url.searchParams.get('to');let list=store.sales;if(from)list=list.filter(s=>s.date>=from);if(to)list=list.filter(s=>s.date<=to);return send(res,200,{count:list.length,sales:list.slice().reverse()})}
  if(route==='/api/sales'&&method==='POST'){const user=requireUser(req,res);if(!user)return;const b=await readJson(req);if(!Array.isArray(b.items)||!b.items.length)return send(res,422,{error:'At least one item is required'});const items=[];for(const raw of b.items){const qty=Number(raw.quantity);if(!(qty>0))return send(res,422,{error:'Invalid quantity'});const catalog=raw.productId?store.products.find(p=>p.id===Number(raw.productId)):store.products.find(p=>p.name===raw.name);if(catalog&&catalog.stock<qty)return send(res,409,{error:`Insufficient stock: ${catalog.name}`});const price=catalog?catalog.price:Number(raw.price);if(!(price>0))return send(res,422,{error:'Invalid price'});items.push({productId:catalog?.id||null,name:catalog?.name||String(raw.name),unitPrice:price,quantity:qty,lineTotal:price*qty})}
   const subtotal=items.reduce((a,i)=>a+i.lineTotal,0),discount=Math.min(Math.max(Number(b.discount)||0,0),subtotal),sale={id:store.nextSaleId++,invoiceNo:`INV-${String(store.nextSaleId-1).padStart(5,'0')}`,date:dateKey(new Date()),createdAt:new Date().toISOString(),subtotal,discount,total:subtotal-discount,paymentMethod:b.paymentMethod==='মোবাইল'?'মোবাইল':'নগদ',cashierId:user.id,items};for(const item of items){if(!item.productId)continue;const p=store.products.find(x=>x.id===item.productId),before=p.stock;p.stock-=item.quantity;store.stockMovements.push({id:crypto.randomUUID(),productId:p.id,type:'SALE',quantity:-item.quantity,before,after:p.stock,referenceId:sale.id,userId:user.id,createdAt:sale.createdAt})}store.sales.push(sale);await persist();return send(res,201,{sale})}
  if(route==='/api/dashboard/summary'&&method==='GET'){if(!requireUser(req,res))return;const today=dateKey(new Date()),todaySales=store.sales.filter(s=>s.date===today),revenue=todaySales.reduce((a,s)=>a+s.total,0),lowStock=store.products.filter(p=>p.stock<=p.lowStockAt);return send(res,200,{todayRevenue:revenue,todayBills:todaySales.length,totalProducts:store.products.length,totalStockUnits:store.products.reduce((a,p)=>a+p.stock,0),lowStockCount:lowStock.length,lowStock,recentSales:store.sales.slice(-5).reverse()})}
  if(route.startsWith('/api/'))return send(res,404,{error:'API route not found'});return serveStatic(req,res,url);
 }catch(error){console.error(error);send(res,error.status||500,{error:error.status?error.message:'Internal server error'})}});
 return {server,dataFile};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {server}=await createApp();const port=Number(process.env.PORT)||3000;
 server.on('error',error=>{
  if(error.code==='EADDRINUSE'){
   console.log(`Grocery Shop is already running at http://127.0.0.1:${port}`);
   process.exit(0);
  }
  console.error('Server error:',error.message);process.exit(1);
 });
 server.listen(port,'127.0.0.1',()=>console.log(`Grocery Shop running at http://127.0.0.1:${port}`));
}


