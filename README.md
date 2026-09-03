# momentkaph_fe

Static site for [momentka.ph](https://momentkaph.sk). Plain HTML, plain CSS, three
small scripts. No framework, no dependencies, no build step.

```bash
node dev.js      # http://localhost:4200
```

Edit a file, reload. The server exists only because Chrome blocks ES modules and
`fetch()` over `file://` — you cannot open the HTML directly from disk. Deploying
is uploading `src/`.

## Structure

```
src/
  index.html        gallery — the tile grid, home page
  about-me.html
  contact-me.html
  gallery.html      one page for all types: ?type=weddings
  404.html
  js/lang.js        language, on every page
  js/gallery.js     hero + fetch the images for ?type
  js/contact.js     the form
  i18n/             sk.json en.json uk.json
  styles/ assets/ fonts/
```

## Language

It lives in the URL: `about-me.html?lang=en`.

On a first visit there's no `?lang`, so `navigator.languages` decides and the
answer is written into the URL with `location.replace`. From then on the URL is
the only source of truth — refresh, share and back all keep it.

The Slovak text is written into the HTML, so Slovak visitors fetch no dictionary.
Any other language swaps it from `i18n/<lang>.json`:

```html
<p data-i18n="aboutMe.bio.p1">Ahoj! Volám sa Anna Lednicka…</p>
```

Clicking a language button sets `?lang` and reloads. `lang.js` also appends the
current language to every internal link so it survives navigation.

## Backend

`https://api.momentkaph.sk` — `GET /cloud_storage/{type}`, `POST /email_sending`.
Its CORS allowlist names only momentkaph.sk, so `dev.js` proxies both paths.
