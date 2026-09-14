/**
 * Arrow-driven horizontal strip that wraps in both directions.
 * `root` holds the arrows; `track` is the scrolling element,
 * `itemSelector` picks the slides inside it.
 */
export function wireCarousel(root, track, itemSelector) {
  const originals = [...track.querySelectorAll(itemSelector)];
  if (!originals.length) return;

  const prevArrows = [...root.querySelectorAll('.arrow-left, .arrow-smaller-left')];
  const nextArrows = [...root.querySelectorAll('.arrow-right, .arrow-smaller-right')];
  const arrows = [...prevArrows, ...nextArrows];

  // Nothing to loop through — leave the arrows dead.
  if (originals.length === 1) {
    arrows.forEach((a) => a.classList.add('disabled'));
    return;
  }

  // One set of clones each side, so there is always something to scroll into.
  const clone = (el) => {
    const copy = el.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.dataset.clone = '';
    return copy;
  };
  track.prepend(...originals.map(clone));
  track.append(...originals.map(clone));

  const items = [...track.querySelectorAll(itemSelector)];
  const count = originals.length;
  let index = count; // first item of the middle (real) set

  const offsetOf = (item) => {
    const box = item.getBoundingClientRect();
    const frame = track.getBoundingClientRect();
    return track.scrollLeft + (box.left + box.width / 2) - (frame.left + frame.width / 2);
  };

  const centre = (i, behavior) => track.scrollTo({ left: offsetOf(items[i]), behavior });

  const move = (step) => {
    index += step;
    centre(index, 'smooth');
  };

  // Once scrolling settles, snap the index back into the middle set.
  // The jump is one full set wide, so the item under the eye never changes.
  const recentre = () => {
    if (index >= count && index < count * 2) return;
    index = count + ((index - count) % count + count) % count;
    centre(index, 'instant');
  };

  let settle;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        // Trust the scroll position, not the index — the user may have swiped.
        const middle = track.scrollLeft + track.clientWidth / 2;
        const distance = (item) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
        index = items.reduce((best, item, i) => (distance(item) < distance(items[best]) ? i : best), 0);
        recentre();
      }, 120);
    },
    { passive: true }
  );

  prevArrows.forEach((a) => a.addEventListener('click', () => move(-1)));
  nextArrows.forEach((a) => a.addEventListener('click', () => move(1)));

  // Park on the first real item before the user sees anything.
  requestAnimationFrame(() => centre(index, 'instant'));
}