import { i18n } from '../../services/i18n.service.js';

export default class NotFoundPage {
  render(container) {
    container.innerHTML = `
      <div class="not-found">
        <p class="error">404</p>
        <p class="error_text">${i18n.t('notFound.text')}</p>
        <a href="/">${i18n.t('notFound.link')}</a>
      </div>
    `;
  }
}
