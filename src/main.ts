import { mountLayout } from './pages/main-layout/main-layout.page.js';
import { Router, setRouter } from './router.js';
import { routes } from './routes.js';
import { i18n } from './services/i18n.service.js';

async function bootstrap(): Promise<void> {
  await i18n.init();

  const root = document.getElementById('app');
  if (!root) throw new Error('#app mount point not found');

  const outlet = mountLayout(root);
  const router = new Router(routes, outlet);
  setRouter(router);
  i18n.onChange(() => void router.rerenderCurrent());
  router.start();
}

void bootstrap();
