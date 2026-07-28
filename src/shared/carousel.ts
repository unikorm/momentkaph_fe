/**
 * Minimal index tracker shared by the reviews and tips carousels.
 * `maxIndex` is the last valid index (item count - 1); callers pass it explicitly.
 */
export class Carousel {
  index = 0;
  private readonly maxIndex: number;

  constructor(maxIndex: number) {
    this.maxIndex = maxIndex;
  }

  get atStart(): boolean {
    return this.index === 0;
  }

  get atEnd(): boolean {
    return this.index === this.maxIndex;
  }

  next(): boolean {
    if (this.atEnd) return false;
    this.index++;
    return true;
  }

  prev(): boolean {
    if (this.atStart) return false;
    this.index--;
    return true;
  }
}
