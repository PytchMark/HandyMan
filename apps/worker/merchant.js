const workerTokenKey = 'worker_token';
let profile = null;
let requests = [];

function authHeaders() { return { Authorization: `Bearer ${localStorage.getItem(workerTokenKey)}` }; }

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const data = await api.request('/api/worker/login', { method: 'POST', body: JSON.stringify({ identity: identity.value, passcode: passcode.value }) });
    localStorage.setItem(workerTokenKey, data.token);
    toast('Welcome back');
    await bootstrap();
  } catch (err) { toast(err.message); }
});

async function bootstrap() {
  const token = localStorage.getItem(workerTokenKey);
  if (!token) return;
  loginView.style.display = 'none';
  dashboardView.style.display = 'grid';
  await Promise.all([loadProfile(), loadRequests(), loadPortfolio()]);
}

async function loadProfile() {
  const data = await api.request('/api/worker/me', { headers: authHeaders() });
  profile = data.profile;
  const p = await api.request('/api/public/parishes');
  parish.innerHTML = p.parishes.map((v) => `<option ${profile.parish === v ? 'selected' : ''}>${v}</option>`).join('');
  name.value = profile.name || ''; whatsapp.value = profile.whatsapp || ''; categories.value = (profile.categories || []).join(', ');
  bio.value = profile.bio || ''; experience.value = profile.experience_years || ''; qualifications.value = profile.qualifications || ''; logo.value = profile.logo_url || '';
  const checks = [profile.name, profile.whatsapp, profile.parish, (profile.categories || []).length, profile.bio, profile.logo_url];
  completion.innerHTML = `<div class='card'>Profile completion: ${Math.round((checks.filter(Boolean).length / checks.length) * 100)}%</div>`;
}

async function loadRequests() {
  const query = new URLSearchParams({ status: reqStatus.value, q: reqQuery.value });
  const data = await api.request(`/api/worker/requests?${query}`, { headers: authHeaders() });
  requests = data.items;
  reqList.innerHTML = requests.map((r) => `<div class='row' data-id='${r.request_id}'><strong>${r.customer_name}</strong><span>${r.status}</span><span>${dateTime(r.created_at)}</span></div>`).join('') || `<div class='card'>No requests yet.</div>`;
  reqList.querySelectorAll('.row').forEach((row) => row.onclick = () => openDrawer(row.dataset.id));

  const seven = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    return requests.filter((r) => (r.created_at || '').slice(0, 10) === k).length;
  });
  const ctx = trendChart.getContext('2d');
  ctx.clearRect(0, 0, trendChart.width, trendChart.height);
  const max = Math.max(...seven, 1);
  seven.forEach((v, i) => { const x = 40 + i * 90; const h = (v / max) * 160; ctx.fillStyle = '#e50914'; ctx.fillRect(x, 190 - h, 50, h); ctx.fillStyle='#ddd'; ctx.fillText(String(v), x + 16, 205); });

  const last7 = requests.filter((r) => Date.now() - new Date(r.created_at).getTime() < 7 * 864e5).length;
  const last30 = requests.filter((r) => Date.now() - new Date(r.created_at).getTime() < 30 * 864e5).length;
  const topCat = requests.reduce((acc, r) => (acc[r.service_category] = (acc[r.service_category] || 0) + 1, acc), {});
  const top = Object.entries(topCat).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  kpis.innerHTML = [`New requests (7d): ${last7}`, `Total requests (30d): ${last30}`, `Response rate: 92%`, `Top service: ${top}`].map((t) => `<div class='card'>${t}</div>`).join('');
}

function openDrawer(id) {
  const r = requests.find((x) => x.request_id === id); if (!r) return;
  requestDrawer.className = 'open';
  requestDrawer.innerHTML = `<h3>${r.request_id}</h3><p>${r.customer_name} • ${r.phone}</p><p>${r.notes||''}</p>${['new','contacted','scheduled','completed','archived'].map((s)=>`<button class='btn secondary st' data-s='${s}'>${s}</button>`).join(' ')}<a class='btn' target='_blank' href='https://wa.me/${(r.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${r.customer_name}, this is ${profile.name} from ClickTrade regarding ${r.request_id}.`)}'>WhatsApp customer</a>`;
  requestDrawer.querySelectorAll('.st').forEach((b) => b.onclick = async () => { await api.request(`/api/worker/requests/${id}/status`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ status: b.dataset.s }) }); await loadRequests(); toast('Status updated'); });
}

async function loadPortfolio() {
  const data = await api.request('/api/worker/portfolio', { headers: authHeaders() });
  portfolioGrid.innerHTML = data.items.map((m) => `<div class='card'>${m.media_type === 'video' ? `<video controls src='${m.url}' style='width:100%'></video>` : `<img src='${m.url}' style='width:100%'>`}<p>${m.caption||''}</p></div>`).join('') || `<div class='card'>Upload your best work to win trust faster.</div>`;
}

uploadBtn.onclick = async () => {
  const fd = new FormData();
  [...portfolioFiles.files].forEach((f) => fd.append('files', f));
  const res = await fetch('/api/media/upload', { method: 'POST', headers: { Authorization: authHeaders().Authorization }, body: fd });
  const json = await res.json(); if (!res.ok) return toast(json.error || 'Upload failed');
  for (const item of json.items) await api.request('/api/worker/portfolio', { method: 'POST', headers: authHeaders(), body: JSON.stringify(item) });
  toast('Portfolio updated'); await loadPortfolio();
};

saveProfile.onclick = async () => {
  await api.request('/api/worker/profile', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name: name.value, whatsapp: whatsapp.value, parish: parish.value, categories: categories.value.split(',').map((v) => v.trim()).filter(Boolean), bio: bio.value, experience_years: Number(experience.value) || null, qualifications: qualifications.value, logo_url: logo.value }) });
  toast('Profile saved'); await loadProfile();
};

refreshBtn.onclick = () => bootstrap();
logoutBtn.onclick = () => { localStorage.removeItem(workerTokenKey); location.reload(); };
reqFilter.onclick = loadRequests;

document.querySelectorAll('.nav-item').forEach((item) => item.onclick = () => {
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active')); item.classList.add('active');
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active')); document.getElementById(`panel-${item.dataset.panel}`).classList.add('active');
});

bootstrap();
