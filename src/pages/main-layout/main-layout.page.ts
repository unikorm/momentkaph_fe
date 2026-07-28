/** Persistent app shell, mounted once by main.ts. Returns the outlet element the Router renders pages into. */
export function mountLayout(root: HTMLElement): HTMLElement {
  root.innerHTML = `
    <div class="app-layout">
      <div class="app-layout__content" id="outlet"></div>
    </div>
  `;
  return root.querySelector('#outlet') as HTMLElement;
}
