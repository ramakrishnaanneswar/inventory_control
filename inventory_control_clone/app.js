
// Simple client-side inventory demo
const SAMPLE_DATA_URL = 'data/sample-data.json';

async function loadData(){
  const res = await fetch(SAMPLE_DATA_URL);
  const data = await res.json();
  return data;
}

function setUser(){
  const u = localStorage.getItem('inventory_user') || 'demo';
  document.getElementById('userArea').innerHTML = '<span class="small">User: ' + u + ' • <a href="#" id="logout">Logout</a></span>';
  document.getElementById('userArea').querySelector('#logout').onclick = ()=>{ localStorage.removeItem('inventory_user'); location.href='index.html'; }
}

function renderDashboard(data){
  const totalProducts = data.products.length;
  const totalOrders = data.orders.length;
  const lowStock = data.products.filter(p=>p.quantity<=p.reorder).length;
  return `<h2>Dashboard</h2>
    <div style="display:flex;gap:12px">
      <div class="card"><h3>Total Products</h3><div style="font-size:24px">${totalProducts}</div></div>
      <div class="card"><h3>Total Orders</h3><div style="font-size:24px">${totalOrders}</div></div>
      <div class="card"><h3>Low Stock</h3><div style="font-size:24px">${lowStock}</div></div>
    </div>
    <h3 style="margin-top:20px">Recent Orders</h3>
    ${renderOrdersTable(data.orders.slice(-5).reverse())}
  `;
}

function renderProducts(data){
  return `<h2>Products</h2>
    <button id="addProd" class="btn">Add Product</button>
    <div style="margin-top:12px">${renderProductsTable(data.products)}</div>
  `;
}

function renderProductsTable(products){
  let rows = products.map(p=>`<tr>
    <td>${p.id}</td><td>${p.name}</td><td>${p.category}</td><td>${p.quantity}</td><td>₹${p.price}</td>
  </tr>`).join('');
  return `<table class="table"><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Qty</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderOrders(data){
  return `<h2>Orders</h2>
    ${renderOrdersTable(data.orders)}
  `;
}

function renderOrdersTable(orders){
  let rows = orders.map(o=>`<tr>
    <td>${o.id}</td><td>${o.date}</td><td>${o.customer}</td><td>${o.items.length}</td><td>₹${o.total}</td>
  </tr>`).join('');
  return `<table class="table"><thead><tr><th>ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderWarehouses(data){
  let rows = data.warehouses.map(w=>`<tr><td>${w.id}</td><td>${w.name}</td><td>${w.location}</td><td>${w.stock_value}</td></tr>`).join('');
  return `<h2>Warehouses</h2>
    <table class="table"><thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Stock Value</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderReports(data){
  return `<h2>Reports</h2>
    <p>Export sample stock report:</p>
    <button id="exportCsv" class="btn">Download Products CSV</button>
  `;
}

function mountEventHandlers(data){
  document.querySelectorAll('.sidebar a').forEach(a=>{
    a.onclick = async (e)=>{
      e.preventDefault();
      const view = a.getAttribute('data-view');
      const root = document.getElementById('appRoot');
      if(view==='dashboard') root.innerHTML = renderDashboard(data);
      if(view==='products') root.innerHTML = renderProducts(data);
      if(view==='orders') root.innerHTML = renderOrders(data);
      if(view==='warehouses') root.innerHTML = renderWarehouses(data);
      if(view==='reports') root.innerHTML = renderReports(data);
      if(view==='products'){
        document.getElementById('addProd').onclick = ()=>{ alert('In the demo, product creation is simulated. Edit data/sample-data.json to persist changes.'); }
      }
      if(view==='reports'){
        document.getElementById('exportCsv').onclick = ()=>exportProductsCsv(data.products);
      }
    }
  });
  // default
  document.querySelector('.sidebar a[data-view="dashboard"]').click();
}

function exportProductsCsv(products){
  const header = ['id','name','category','quantity','price'];
  const rows = products.map(p=>[p.id,p.name,p.category,p.quantity,p.price].join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click();
  URL.revokeObjectURL(url);
}

(async function(){
  setUser();
  const data = await loadData();
  mountEventHandlers(data);
})();
