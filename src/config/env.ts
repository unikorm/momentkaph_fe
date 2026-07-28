const DEV_HOSTS = new Set(['localhost', '127.0.0.1']);

export const apiUrl = DEV_HOSTS.has(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.momentkaph.sk';
