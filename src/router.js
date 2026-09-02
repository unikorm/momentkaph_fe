/**
 * A page is any class with a `render(container, params)` method and an optional
 * `destroy()` the router calls before swapping in the next page.
 *
 * A route record is `{ path, title?, redirectTo?, load? }` where `path` is
 * e.g. 'gallery/:type/:variant', '' for the index, or '*' for the catch-all,
 * and `title` is either a string or a function of the matched params.
 */

function compile(route) {
  const segments = route.path === '' ? [] : route.path.split('/');
  return { ...route, segments };
}

function matchSegments(segments, pathSegments) {
  if (segments[segments.length - 1] === '*') {
    if (pathSegments.length < segments.length - 1) return null;
  } else if (segments.length !== pathSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === '*') return params;
    const actual = pathSegments[i];
    if (actual === undefined) return null;
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(actual);
    } else if (segment !== actual) {
      return null;
    }
  }
  return params;
}

function toPathSegments(pathname) {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? [] : trimmed.split('/');
}

export class Router {
  #routes;
  #outlet;
  #currentPage = null;
  #currentRoute = null;
  #currentParams = {};

  constructor(routes, outlet) {
    this.#routes = routes.map(compile);
    this.#outlet = outlet;
  }

  /** Re-mounts the current page in place with the same params (e.g. after a locale switch), without touching history or scroll position. */
  async rerenderCurrent() {
    if (!this.#currentRoute) return;
    await this.#mount(this.#currentRoute, this.#currentParams);
  }

  start() {
    document.addEventListener('click', this.#onClick);
    window.addEventListener('popstate', () => void this.#resolve(location.pathname));
    void this.#resolve(location.pathname);
  }

  navigate(path, { replace = false } = {}) {
    const url = path.startsWith('/') ? path : `/${path}`;
    if (replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
    void this.#resolve(url);
  }

  #onClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;

    event.preventDefault();
    this.navigate(url.pathname + url.search);
  };

  async #resolve(pathname) {
    const pathSegments = toPathSegments(new URL(pathname, location.origin).pathname);

    for (const route of this.#routes) {
      const params = matchSegments(route.segments, pathSegments);
      if (params === null) continue;

      if (route.redirectTo) {
        this.navigate(route.redirectTo, { replace: true });
        return;
      }

      if (!route.load) return;

      await this.#mount(route, params);
      window.scrollTo(0, 0);
      return;
    }

    this.navigate('/404', { replace: true });
  }

  async #mount(route, params) {
    if (!route.load) return;

    const mod = await route.load();
    this.#currentPage?.destroy?.();
    this.#currentPage = new mod.default();
    this.#currentRoute = route;
    this.#currentParams = params;
    await this.#currentPage.render(this.#outlet, params);

    document.title = typeof route.title === 'function' ? route.title(params) : (route.title ?? 'momentkaph');
  }
}

let instance = null;

/** Called once by main.js after constructing the Router, so pages can request navigation (e.g. an invalid gallery type redirecting to 404) without importing main.js. */
export function setRouter(router) {
  instance = router;
}

export function getRouter() {
  if (!instance) throw new Error('Router not initialized yet');
  return instance;
}
