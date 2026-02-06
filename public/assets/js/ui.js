function toast(message, timeout = 3200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), timeout);
}

function qs(id) { return document.querySelector(id); }
