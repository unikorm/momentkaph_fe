import { GALLERY_REVIEWS } from './data/reviews.js';
import { wireCarousel } from './carousel.js';

function reviewNode({ content, author }) {
    const el = document.createElement('div');
    el.className = 'review';
    el.innerHTML = `
    <span class="review-header">---</span>
    <div><p></p></div>
    <span class="review-bottom">---</span>
    <p class="review-author"></p>`;
    el.querySelector('div p').textContent = content;
    el.querySelector('.review-author').textContent = author;
    return el;
}

function wireReviews() {
    const root = document.querySelector('.reviews');
    if (!root) return;

    const list = root.querySelector('.reviews-list');
    list.replaceChildren(...GALLERY_REVIEWS.map(reviewNode));

    wireCarousel(root, list, '.review');
}

wireReviews();