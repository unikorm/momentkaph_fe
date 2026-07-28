export type RouteParams = Record<string, string>;

export interface Page {
  render(container: HTMLElement, params: RouteParams): void | Promise<void>;
  destroy?(): void;
}

export interface RouteRecord {
  /** e.g. 'gallery/:type/:variant', '' for index, '*' for catch-all */
  path: string;
  title?: string | ((params: RouteParams) => string);
  redirectTo?: string;
  load?: () => Promise<{ default: new () => Page }>;
}

interface CompiledRoute extends RouteRecord {
  segments: string[];
}

function compile(route: RouteRecord): CompiledRoute {
  const segments = route.path === '' ? [] : route.path.split('/');
  return { ...route, segments };
}

function matchSegments(segments: string[], pathSegments: string[]): RouteParams | null {
  if (segments[segments.length - 1] === '*') {
    if (pathSegments.length < segments.length - 1) return null;
  } else if (segments.length !== pathSegments.length) {
    return null;
  }

  const params: RouteParams = {};
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]!;
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

function toPathSegments(pathname: string): string[] {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? [] : trimmed.split('/');
}

export class Router {
  private readonly routes: CompiledRoute[];
  private readonly outlet: HTMLElement;
  private currentPage: Page | null = null;
  private currentRoute: CompiledRoute | null = null;
  private currentParams: RouteParams = {};

  constructor(routes: RouteRecord[], outlet: HTMLElement) {
    this.routes = routes.map(compile);
    this.outlet = outlet;
  }

  /** Re-mounts the current page in place with the same params (e.g. after a locale switch), without touching history or scroll position. */
  async rerenderCurrent(): Promise<void> {
    if (!this.currentRoute) return;
    await this.mount(this.currentRoute, this.currentParams);
  }

  start(): void {
    document.addEventListener('click', this.onClick);
    window.addEventListener('popstate', () => void this.resolve(location.pathname));
    void this.resolve(location.pathname);
  }

  navigate(path: string, opts: { replace?: boolean } = {}): void {
    const url = path.startsWith('/') ? path : `/${path}`;
    if (opts.replace) {
      history.replaceState(null, '', url);
    } else {
      history.pushState(null, '', url);
    }
    void this.resolve(url);
  }

  private onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element).closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;

    event.preventDefault();
    this.navigate(url.pathname + url.search);
  };

  private async resolve(pathname: string): Promise<void> {
    const pathSegments = toPathSegments(new URL(pathname, location.origin).pathname);

    for (const route of this.routes) {
      const params = matchSegments(route.segments, pathSegments);
      if (params === null) continue;

      if (route.redirectTo) {
        this.navigate(route.redirectTo, { replace: true });
        return;
      }

      if (!route.load) return;

      await this.mount(route, params);
      window.scrollTo(0, 0);
      return;
    }

    this.navigate('/404', { replace: true });
  }

  private async mount(route: CompiledRoute, params: RouteParams): Promise<void> {
    if (!route.load) return;

    const mod = await route.load();
    this.currentPage?.destroy?.();
    this.currentPage = new mod.default();
    this.currentRoute = route;
    this.currentParams = params;
    await this.currentPage.render(this.outlet, params);

    document.title = typeof route.title === 'function' ? route.title(params) : (route.title ?? 'momentkaph');
  }
}

let instance: Router | null = null;

/** Called once by main.ts after constructing the Router, so pages can request navigation (e.g. an invalid gallery type redirecting to 404) without importing main.ts. */
export function setRouter(router: Router): void {
  instance = router;
}

export function getRouter(): Router {
  if (!instance) throw new Error('Router not initialized yet');
  return instance;
}
