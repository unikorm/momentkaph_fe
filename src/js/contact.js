const form = document.getElementById('contact-form');
const button = form.querySelector('button');
const API = location.hostname === 'localhost' ? 'http://localhost:3069' : 'https://api.momentkaph.sk';

const LABELS = {
  idle: 'Odoslať správu',
  sending: 'Odosielam...',
  success: 'Správa odoslaná!',
  error: 'Niečo sa pokazilo!',
};
let resetTimer;

function setStatus(status) {
  button.className = status === 'idle' ? '' : status;
  button.textContent = LABELS[status];
  clearTimeout(resetTimer);
  if (status === 'success' || status === 'error') {
    resetTimer = setTimeout(() => setStatus('idle'), 3000);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('sending');
  button.disabled = true;
  try {
    const res = await fetch(`${API}/email_sending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    setStatus(res.ok ? 'success' : 'error');
  } catch {
    setStatus('error');
  } finally {
    form.reset();
    form.classList.remove('submitted');
    button.disabled = false;
  }
});