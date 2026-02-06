const categories = ['Plumbing', 'Electrical', 'Carpentry', 'AC Repair', 'Masonry', 'Cleaning', 'Painting', 'Appliance Repair'];

async function initStorefront() {
  if (!document.getElementById('results')) return;
  const category = document.getElementById('category');
  const parish = document.getElementById('parish');
  category.innerHTML = `<option value=''>All categories</option>${categories.map((c) => `<option>${c}</option>`).join('')}`;
  const p = await api.request('/api/public/parishes');
  parish.innerHTML = `<option value=''>All parishes</option>${p.parishes.map((v) => `<option>${v}</option>`).join('')}`;

  document.getElementById('searchBtn').onclick = search;
  await search();
}

function workerCard(item) {
  return `<article class='card'>
    <img src='${item.logo_url || 'https://placehold.co/120x120/111/EEE?text=PRO'}' style='width:64px;height:64px;border-radius:12px;object-fit:cover'>
    <h3>${item.name || item.worker_id}</h3>
    <div>${(item.categories || []).map((c) => `<span class='badge'>${c}</span>`).join(' ')}</div>
    <p>${item.parish || ''} • ${stars(item.rating_avg)} (${item.rating_count || 0})</p>
    <small>${item.response_speed}</small><div style='margin:.5rem 0'>${(item.tags || []).map((t) => `<span class='badge'>${t}</span>`).join(' ')}</div>
    <div style='display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.7rem'>
      <a class='btn' href='/storefront/worker.html?workerId=${item.worker_id}'>Request Booking</a>
      <a class='btn secondary' target='_blank' href='https://wa.me/${(item.whatsapp||'').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${item.name || ''}, I found you on ClickTrade and need help.`)}'>WhatsApp Now</a>
    </div>
  </article>`;
}

async function search() {
  const mount = document.getElementById('results');
  mount.innerHTML = `<div class='skeleton' style='height:190px'></div><div class='skeleton' style='height:190px'></div><div class='skeleton' style='height:190px'></div>`;
  try {
    const q = new URLSearchParams({
      category: document.getElementById('category').value,
      parish: document.getElementById('parish').value,
      q: document.getElementById('keyword').value
    });
    const data = await api.request(`/api/public/workers?${q}`);
    if (!data.items.length) {
      mount.innerHTML = `<div class='card'><h3>No pros yet in this filter</h3><p>Try another category/parish and get matched fast.</p></div>`;
      return;
    }
    mount.innerHTML = data.items.map(workerCard).join('');
  } catch (e) {
    mount.innerHTML = `<div class='card'>${e.message}</div>`;
  }
}

async function initWorkerProfile() {
  const mount = document.getElementById('workerMount');
  if (!mount) return;
  const workerId = new URLSearchParams(location.search).get('workerId');
  if (!workerId) return;

  const [{ worker }, { items }] = await Promise.all([
    api.request(`/api/public/workers/${workerId}`),
    api.request(`/api/public/workers/${workerId}/portfolio`)
  ]);

  mount.innerHTML = `<section class='card'>
    <h1>${worker.name}</h1><p>${worker.parish} • ${(worker.categories||[]).join(', ')}</p>
    <div>${['Verified', 'Licensed', ...worker.tags].map((b) => `<span class='badge'>${b}</span>`).join(' ')}</div>
    <p>${worker.bio || 'Professional service provider ready to take your request.'}</p>
    <p>Reviews: <em>Coming soon</em></p>
  </section>`;

  document.getElementById('portfolio').innerHTML = items.length ? items.map((m) => `<div class='card'>${m.media_type === 'video' ? `<video controls src='${m.url}' style='width:100%'></video>` : `<img src='${m.url}' style='width:100%;border-radius:10px'>`}<p>${m.caption||''}</p></div>`).join('') : `<div class='card'>Portfolio coming soon.</div>`;

  const bar = document.getElementById('stickyCta');
  bar.innerHTML = `<button class='btn' id='openRequest'>Request Booking</button><a class='btn secondary' target='_blank' href='${whatsAppLink(worker)}'>WhatsApp</a>`;
  document.getElementById('openRequest').onclick = () => openWizard(worker);
}

function whatsAppLink(worker, requestId = '') {
  const n = (worker.whatsapp || '').replace(/\D/g, '');
  const text = `Hi ${worker.name}, I found you on ClickTrade. I need help with ${(worker.categories||['a service'])[0]}. My parish is ${worker.parish || ''}. Job details: ${requestId ? `Request ${requestId}` : '...'} .`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

function openWizard(worker) {
  let step = 1;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:#000c;display:grid;place-items:center;z-index:200';
  const box = document.createElement('div'); box.className='card'; box.style.width='min(640px,95vw)';
  modal.appendChild(box); document.body.appendChild(modal);
  const state = { service_category: (worker.categories||[''])[0], request_type:'visit' };

  const render = () => {
    box.innerHTML = step === 1 ? `<h3>Step 1 — Tell us about the job</h3>
      <div class='grid'>
      <input class='input' placeholder='Your name' id='name'><input class='input' placeholder='Phone' id='phone'><input class='input' placeholder='Email (optional)' id='email'>
      <input class='input' value='${state.service_category}' id='cat'><textarea class='input' id='desc' placeholder='Quick job description'></textarea>
      <select id='urgency'><option>Today</option><option>This week</option><option>Flexible</option></select>
      </div><div style='display:flex;justify-content:flex-end;margin-top:1rem'><button class='btn' id='next'>Next</button></div>`
    : `<h3>Step 2 — Location & timing</h3><div class='grid'>
      <input class='input' id='parish' placeholder='Parish' value='${worker.parish||''}'><input class='input' id='address' placeholder='Address / landmark'>
      <input class='input' id='time' placeholder='Preferred time window'><select id='type'><option value='visit'>Visit</option><option value='video'>Video Call</option><option value='quote'>Quote Only</option></select>
      </div><div style='display:flex;justify-content:space-between;margin-top:1rem'><button class='btn secondary' id='back'>Back</button><button class='btn' id='submit'>Submit</button></div>`;

    if (step === 1) {
      box.querySelector('#next').onclick = () => {
        Object.assign(state, {
          customer_name: box.querySelector('#name').value, phone: box.querySelector('#phone').value,
          email: box.querySelector('#email').value, service_category: box.querySelector('#cat').value,
          notes: box.querySelector('#desc').value, urgency: box.querySelector('#urgency').value
        });
        step = 2; render();
      };
    } else {
      box.querySelector('#back').onclick = () => { step = 1; render(); };
      box.querySelector('#submit').onclick = async () => {
        Object.assign(state, { parish: box.querySelector('#parish').value, address_details: box.querySelector('#address').value, preferred_time: box.querySelector('#time').value, request_type: box.querySelector('#type').value });
        const { requestId } = await api.request(`/api/public/workers/${worker.worker_id}/requests`, { method: 'POST', body: JSON.stringify(state) });
        box.innerHTML = `<h3>Request received (${requestId})</h3><p>Your pro was notified. Continue on WhatsApp for fastest response.</p><div style='display:flex;gap:.5rem'><a class='btn' target='_blank' href='${whatsAppLink(worker, requestId)}'>Message on WhatsApp</a><button class='btn secondary' id='close'>Close</button></div>`;
        box.querySelector('#close').onclick = () => modal.remove();
      };
    }
  };
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  render();
}

initStorefront();
initWorkerProfile();
