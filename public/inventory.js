// inventory.js - communicates with backend API
(function(){
  // elements
  const itemsTableBody = document.querySelector('#itemsTable tbody');
  const itemForm = document.getElementById('itemForm');
  const addBtn = document.getElementById('addBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formPanel = document.getElementById('formPanel');
  const formTitle = document.getElementById('formTitle');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sortBy');
  const summary = document.getElementById('summary');

  let editId = null;

  function tokenHeaders(){
    const t = localStorage.getItem('ims_token') || '';
    return { 'Content-Type':'application/json', 'Authorization':'Bearer ' + t };
  }

  async function getItems(){
    const res = await fetch('/api/items', { headers: tokenHeaders() });
    if(res.status === 401){ alert('Please login.'); location.href='login.html'; return []; }
    return res.json();
  }
  async function saveItem(item){
    const res = await fetch('/api/items', { method:'POST', headers: tokenHeaders(), body: JSON.stringify(item) });
    return res.json();
  }
  async function updateItem(id, item){
    const res = await fetch('/api/items/' + id, { method:'PUT', headers: tokenHeaders(), body: JSON.stringify(item) });
    return res.json();
  }
  async function deleteItem(id){
    const res = await fetch('/api/items/' + id, { method:'DELETE', headers: tokenHeaders() });
    return res.json();
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]}) }

  async function render(){
    const q = (searchInput.value||'').toLowerCase();
    let items = await getItems();
    if(!items) items = [];

    // filter
    if(q) items = items.filter(it => (it.name||'').toLowerCase().includes(q) || (it.sku||'').toLowerCase().includes(q));

    // sort
    const s = sortSelect.value || 'created_desc';
    items.sort((a,b)=>{
      if(s==='name_asc') return a.name.localeCompare(b.name);
      if(s==='name_desc') return b.name.localeCompare(a.name);
      if(s==='created_asc') return a.created - b.created;
      if(s==='created_desc') return b.created - a.created;
      if(s==='qty_asc') return a.qty - b.qty;
      if(s==='qty_desc') return b.qty - a.qty;
      return 0;
    });

    // populate table
    itemsTableBody.innerHTML = '';
    items.forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(it.name)}</td>
                      <td>${escapeHtml(it.sku||'—')}</td>
                      <td>${it.qty}</td>
                      <td>₹ ${Number(it.price).toFixed(2)}</td>
                      <td>
                        <button class="btn" data-id="${it._id || it.id}" data-action="edit">Edit</button>
                        <button class="btn btn-ghost" data-id="${it._id || it.id}" data-action="del">Delete</button>
                      </td>`;
      itemsTableBody.appendChild(tr);
    });

    summary.textContent = items.length + ' item(s) shown.';
  }

  // form open for add
  addBtn.addEventListener('click', ()=>{
    editId = null;
    formTitle.textContent = 'Add item';
    itemForm.reset();
    // ensure SKU input exists
    if(!document.getElementById('itemSKU')){
      const label = document.createElement('label');
      label.innerHTML = 'SKU <input id="itemSKU" placeholder="SKU code (optional)">';
      const priceInput = document.getElementById('itemPrice');
      priceInput.parentNode.insertBefore(label, priceInput);
    }
    document.getElementById('itemQty').value = 1;
    document.getElementById('itemPrice').value = '0.00';
    window.scrollTo({top:0,behavior:'smooth'});
  });

  cancelBtn.addEventListener('click', ()=>{ itemForm.reset(); editId=null; formTitle.textContent='Add item'; });

  // submit add/edit
  itemForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const sku = (document.getElementById('itemSKU') && document.getElementById('itemSKU').value.trim()) || '';
    const qty = Number(document.getElementById('itemQty').value) || 0;
    const price = Number(document.getElementById('itemPrice').value) || 0;

    if(editId){
      await updateItem(editId, { name, sku, qty, price });
      editId = null;
      formTitle.textContent = 'Add item';
    } else {
      await saveItem({ name, sku, qty, price });
    }
    itemForm.reset();
    render();
  });

  // delegate edit/delete
  itemsTableBody.addEventListener('click', async e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if(action==='del'){
      if(!confirm('Delete this item?')) return;
      await deleteItem(id);
      render();
    } else if(action==='edit'){
      const items = await getItems();
      const it = items.find(i=> (i._id||i.id) === id || String(i._id) === String(id));
      if(!it) return;
      editId = id;
      formTitle.textContent = 'Edit item';
      document.getElementById('itemName').value = it.name;
      // ensure SKU input exists
      if(!document.getElementById('itemSKU')){
        const label = document.createElement('label');
        label.innerHTML = 'SKU <input id="itemSKU" placeholder="SKU code (optional)">';
        const priceInput = document.getElementById('itemPrice');
        priceInput.parentNode.insertBefore(label, priceInput);
      }
      document.getElementById('itemSKU').value = it.sku || '';
      document.getElementById('itemQty').value = it.qty;
      document.getElementById('itemPrice').value = it.price;
      window.scrollTo({top:0,behavior:'smooth'});
    }
  });

  // search/sort listeners
  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);

  // initial render
  render();

})();