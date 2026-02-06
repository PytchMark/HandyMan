const key = 'admin_token';
function ah() { return { Authorization: `Bearer ${localStorage.getItem(key)}` }; }

adminLoginForm.onsubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await api.request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: adminUser.value, password: adminPass.value }) });
    localStorage.setItem(key, data.token);
    await start();
  } catch (e2) { toast(e2.message); }
};

async function start() {
  if (!localStorage.getItem(key)) return;
  adminLogin.style.display = 'none'; adminApp.style.display = 'grid';
  const p = await api.request('/api/public/parishes');
  wParish.innerHTML = `<option value=''>Any parish</option>${p.parishes.map((v) => `<option>${v}</option>`).join('')}`;
  await Promise.all([loadWorkers(), loadRequests()]);
}

async function loadWorkers(offset = 0) {
  const query = new URLSearchParams({ q: wQuery.value, parish: wParish.value, status: wStatus.value, limit: 20, offset });
  const data = await api.request(`/api/admin/workers?${query}`, { headers: ah() });
  workersTable.innerHTML = data.items.map((w) => `<div class='row'><strong>${w.name || '-'}</strong><span>${w.worker_id}</span><span>${w.parish || '-'}</span><div><button class='btn secondary reset' data-id='${w.worker_id}'>Reset Passcode</button></div></div>`).join('') || `<div class='card'>No workers found.</div>`;
  workersTable.querySelectorAll('.reset').forEach((btn) => btn.onclick = async () => { const r = await api.request(`/api/admin/workers/${btn.dataset.id}/reset-passcode`, { method: 'POST', headers: ah(), body: JSON.stringify({}) }); toast(`New passcode: ${r.passcode}`); });
  overviewStats.innerHTML = `<div class='card'>Total workers: ${data.total}</div>`;
}

async function loadRequests() {
  const data = await api.request('/api/admin/requests', { headers: ah() });
  requestsTable.innerHTML = data.items.map((r) => `<div class='row'><strong>${r.request_id}</strong><span>${r.worker_id}</span><span>${r.status}</span><span>${dateTime(r.created_at)}</span></div>`).join('') || `<div class='card'>No requests yet.</div>`;
  overviewStats.innerHTML += `<div class='card'>Total requests: ${data.items.length}</div>`;
}

wSearch.onclick = () => loadWorkers();
document.querySelectorAll('.nav-item').forEach((item) => item.onclick = () => { document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active')); item.classList.add('active'); document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active')); document.getElementById(`panel-${item.dataset.panel}`).classList.add('active'); });
start();
