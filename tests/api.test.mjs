import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.mjs';

test('auth, products, sale and dashboard work together', async t => {
 const dir=await mkdtemp(path.join(os.tmpdir(),'grocery-api-'));
 const {server}=await createApp({dataFile:path.join(dir,'store.json'),adminPassword:'SPI99'});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true})});
 const base=`http://127.0.0.1:${server.address().port}`;
 let response=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Admin',password:'wrong'})});
 assert.equal(response.status,401);
 response=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Admin',password:'SPI99'})});
 assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0];
 response=await fetch(base+'/api/products',{headers:{cookie}});let data=await response.json();assert.equal(data.count,9);
 response=await fetch(base+'/api/products',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({name:'বিস্কুট',price:25,unit:'প্যাকেট',stock:20})});assert.equal(response.status,201);const added=(await response.json()).product;assert.equal(added.name,'বিস্কুট');
 response=await fetch(base+'/api/sales',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({items:[{productId:added.id,name:added.name,price:added.price,quantity:2}],discount:5,paymentMethod:'নগদ'})});assert.equal(response.status,201);const sale=(await response.json()).sale;assert.equal(sale.total,45);assert.match(sale.invoiceNo,/^INV-/);
 response=await fetch(base+'/api/dashboard/summary',{headers:{cookie}});data=await response.json();assert.equal(data.totalProducts,10);assert.equal(data.todayBills,1);assert.equal(data.todayRevenue,45);
 response=await fetch(base+`/api/products/${added.id}`,{headers:{cookie}});assert.equal(response.status,404);
});

