/** Contact form. The browser does the validating; we just send it. */
const form = document.querySelector('form');
const button = form.querySelector('button');
const API = 'https://api.momentkaph.sk';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  form.classList.add('submitted');
  if (!form.checkValidity()) return;

  button.textContent = 'Odosielam...';
  try {
    const res = await fetch(`${API}/email_sending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    button.textContent = res.ok ? 'Správa odoslaná!' : 'Niečo sa pokazilo!';
    if (res.ok) form.reset();
  } catch {
    button.textContent = 'Niečo sa pokazilo!';
  }
  form.classList.remove('submitted');
});
