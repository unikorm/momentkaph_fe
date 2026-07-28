import type { Page } from '../../router.js';
import { renderNav } from '../../shared/nav.js';
import { sendEmail } from '../../services/email.service.js';
import { i18n } from '../../services/i18n.service.js';
import type { SendEmailType } from '../../shared/types/send-email.type.js';

type ButtonStatus = 'idle' | 'sending' | 'success' | 'error';

const BUTTON_LABEL_KEY: Record<ButtonStatus, string> = {
  idle: 'contact.form.button.idle',
  sending: 'contact.form.button.sending',
  success: 'contact.form.button.success',
  error: 'contact.form.button.error',
};

export default class ContactPage implements Page {
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="contact-page">
        ${renderNav('/contact-me')}
        <div class="contact_container">
          <div class="contact_container__content">
            <div class="contact_container__content_title">
              <div class="image_group">
                <div class="contact-image-container">
                  <img src="/assets/contact_photo.avif" alt="photo of me on contact page" />
                  <span>${i18n.t('common.thatsMe')}</span>
                </div>
                <div style="width: 100%">
                  <p>${i18n.t('contact.contactMe')}</p>
                </div>
              </div>
            </div>
            <div class="contact_container__content_form">
              <form novalidate>
                <div class="box">
                  <input id="name" name="name" type="text" placeholder="${i18n.t('contact.form.name.placeholder')}" required minlength="3" maxlength="100" />
                  <span class="error-message">${i18n.t('contact.form.name.error')}</span>
                </div>
                <div class="box">
                  <input id="email" name="email" type="email" placeholder="${i18n.t('contact.form.email.placeholder')}" required />
                  <span class="error-message">${i18n.t('contact.form.email.error')}</span>
                </div>
                <div class="box">
                  <input id="phone" name="phone" type="tel" placeholder="${i18n.t('contact.form.phone.placeholder')}" required pattern="^\\+?[0-9\\s-]{10,}$" />
                  <span class="error-message">${i18n.t('contact.form.phone.error')}</span>
                </div>
                <div class="box">
                  <textarea id="message" name="message" placeholder="${i18n.t('contact.form.message.placeholder')}" rows="3" required minlength="20" maxlength="700"></textarea>
                  <span class="error-message textarea">${i18n.t('contact.form.message.error')}</span>
                </div>
                <button type="submit">${i18n.t(BUTTON_LABEL_KEY.idle)}</button>
              </form>
              <p class="or">${i18n.t('contact.or')}</p>
              <div class="social_network">
                <div>
                  <a href="https://www.instagram.com/momentka.ph/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/instagram.svg" alt="instagram clickable logo" />
                  </a>
                </div>
                <div>
                  <a href="https://m.me/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/messenger.svg" alt="messenger clickable logo" />
                  </a>
                </div>
                <div>
                  <a href="https://wa.me/421951775896" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/whatsapp.svg" alt="whats up clickable logo" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const imageContainer = container.querySelector('.contact-image-container');
    imageContainer?.addEventListener('touchstart', () => imageContainer.classList.toggle('hovered'));

    const form = container.querySelector('form')!;
    form.addEventListener('submit', (event) => this.onSubmit(event, form));
  }

  destroy(): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  private async onSubmit(event: SubmitEvent, form: HTMLFormElement): Promise<void> {
    event.preventDefault();
    form.classList.add('submitted');
    if (!form.checkValidity()) return;

    const button = form.querySelector('button')!;
    this.setStatus(button, 'sending');

    const data = Object.fromEntries(new FormData(form)) as unknown as SendEmailType;
    try {
      const res = await sendEmail(data);
      this.setStatus(button, res.status === 200 ? 'success' : 'error');
    } catch {
      this.setStatus(button, 'error');
    }

    form.reset();
    form.classList.remove('submitted');
    this.resetTimer = setTimeout(() => this.setStatus(button, 'idle'), 3000);
  }

  private setStatus(button: HTMLButtonElement, status: ButtonStatus): void {
    button.classList.toggle('success', status === 'success');
    button.classList.toggle('error', status === 'error');
    button.textContent = i18n.t(BUTTON_LABEL_KEY[status]);
  }
}
