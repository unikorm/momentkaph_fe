import type { Page } from '../../router.js';
import { renderNav } from '../../shared/nav.js';
import { i18n } from '../../services/i18n.service.js';

export default class AboutMePage implements Page {
  render(container: HTMLElement): void {
    container.innerHTML = `
      ${renderNav('/about-me')}
      <div class="about_container">
        <div class="about_container_content">
          <div class="about-me-image-container">
            <img src="/assets/about_photo.avif" alt="photo of me on about page" />
            <span>${i18n.t('common.thatsMe')}</span>
          </div>
          <div class="bio">
            <p>${i18n.t('aboutMe.bio.p1')}</p>
            <p>${i18n.t('aboutMe.bio.p2')}</p>
            <p>${i18n.t('aboutMe.bio.p3')}</p>
            <p>${i18n.t('aboutMe.bio.p4')}</p>
          </div>
        </div>
      </div>
    `;

    // pointer devices get CSS :hover; touch devices toggle the same class on tap.
    // No manual cleanup needed: this listener dies with the element when the next
    // page's render() replaces container.innerHTML.
    const imageContainer = container.querySelector('.about-me-image-container');
    imageContainer?.addEventListener('touchstart', () => imageContainer.classList.toggle('hovered'));
  }
}
