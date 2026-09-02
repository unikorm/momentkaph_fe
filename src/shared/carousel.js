/**
 * Minimal index tracker shared by the reviews and tips carousels.
 * `maxIndex` is the last valid index (item count - 1); callers pass it explicitly.
 */
export class Carousel {
  index = 0;
  #maxIndex;

  constructor(maxIndex) {
    this.#maxIndex = maxIndex;
  }

  get atStart() {
    return this.index === 0;
  }

  get atEnd() {
    return this.index === this.#maxIndex;
  }

  next() {
    if (this.atEnd) return false;
    this.index++;
    return true;
  }

  prev() {
    if (this.atStart) return false;
    this.index--;
    return true;
  }
}
