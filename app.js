const API_URL = 'https://api.momentkaph.sk';

// ======= TRANSLATIONS =======

const REVIEWS = [
  {
    author: 'Ivana Moravcová',
    text: {
      sk: 'Mali sme nádherné fotenie v prírode s dcérkou. Fotografka je ústretová, milá a talentovaná, krásne zachytila spoločné chvíle.',
      en: 'We had a wonderful nature photoshoot with our daughter. The photographer is accommodating, kind, and talented — she beautifully captured our shared moments.',
      uk: 'Ми мали чудову фотосесію на природі з донькою. Фотограф уважна, мила і талановита — чудово зафіксувала наші спільні моменти.',
    },
  },
  {
    author: 'Paula Dobrovolská',
    text: {
      sk: 'Fotografie boli výnimočné, zachytila rodinné detaily z vynikajúcich uhlov. Bola pozorná, príjemná a vždy prítomná, s vynikajúcou komunikáciou.',
      en: 'Photos were exceptional — she captured family details from excellent angles. Attentive, pleasant, and always present, with outstanding communication.',
      uk: 'Фотографії були виняткові — вона вловила сімейні деталі з чудових ракурсів. Уважна, приємна і завжди присутня, з відмінним спілкуванням.',
    },
  },
  {
    author: 'Barbora Ti Ko',
    text: {
      sk: 'Veľmi priateľská a trpezlivá fotografka. Predsvadobné aj svadobné fotenie prekonali očakávania — rýchle dodanie a nádherné výsledky.',
      en: 'Very friendly and patient photographer. Both pre-wedding and wedding photography exceeded expectations — quick delivery and beautiful results.',
      uk: 'Дуже доброзичлива і терпелива фотограф. Обидві фотосесії перевершили очікування — швидка здача і прекрасні результати.',
    },
  },
  {
    author: 'Nikol Jachanová',
    text: {
      sk: 'Tehotenské fotky boli nádherné. Užívali sme si fotenie s partnerom a vznikli krásne spomienky. Veľmi odporúčam!',
      en: 'Maternity photos were lovely. We enjoyed the session together and created wonderful memories. Highly recommend!',
      uk: 'Фото вагітності були чудові. Ми насолоджувалися фотосесією разом і залишились прекрасні спогади. Дуже рекомендую!',
    },
  },
  {
    author: 'Dorka Hudeková',
    text: {
      sk: 'Fotky sú úžasné. Oceňujem kvalitu fotografií aj to, ako spríjemnila svadobný deň, a rýchle doručenie.',
      en: 'Photos are stunning. I appreciate both the photography quality and how she enhanced our wedding day experience, plus the rapid delivery.',
      uk: 'Фото приголомшливі. Ціную як якість фотографій, так і те, як вона прикрасила весільний день, а також швидку доставку.',
    },
  },
  {
    author: 'Kristína Smondek',
    text: {
      sk: 'Svadobné fotografie sú výnimočne krásne, plné radosti a emócií. Som veľmi spokojná a určite budem odporúčať ďalej.',
      en: 'Wedding photos are exceptionally beautiful, full of joy and emotion. Very satisfied and will definitely recommend her.',
      uk: 'Весільні фотографії надзвичайно красиві, сповнені радості та емоцій. Дуже задоволена і обовʼязково порекомендую.',
    },
  },
];

const TIPS = {
  sk: [
    { headline: 'Pripravte si detaily dopredu.', body: 'Prstienky, pozvánky, parfum, topánky či svadobnú kyticu si pripravte na jedno miesto. Ušetríme čas a ja ich môžem krásne nafotiť ešte pred obliekaním.' },
    { headline: 'Zastavte sa.', body: 'Počas dňa si vedome doprajte chvíľku len pre seba. Uvedomte si, že ten deň je o vás dvoch – nie len o programe. Tie najkrajšie momenty vznikajú práve v týchto tichých, úprimných okamihoch.' },
    { headline: 'Nechajte si viac času na prípravy.', body: 'Ráno vždy letí rýchlejšie, ako sa zdá. Zarezervujte si aspoň o 15–20 minút viac, ako si myslíte, že potrebujete – pre pokoj a pohodu.' },
    { headline: 'Nebojte sa emócií.', body: 'Plač, smiech, objatia – to všetko tvorí silné a nezabudnuteľné fotografie. Byť autentický = byť krásny.' },
    { headline: 'Dôverujte svojmu fotografovi.', body: 'Niektoré pózy alebo miesta môžu na prvý pohľad pôsobiť zvláštne, ale výsledok bude stáť za to. Niekedy ten najnudnejší múr dá najkrajšiu fotku.' },
    { headline: 'Zlatá hodina je váš priateľ.', body: 'Plánujte párové fotenie na čas pred západom slnka – svetlo bude mäkké, teplé a veľmi lichotivé.' },
    { headline: 'Majte plán B.', body: 'Ak svadba je vonku, myslite aj na dáždniky, prístrešok alebo alternatívnu lokalitu – aby vás počasie nezaskočilo.' },
    { headline: 'Foťme aj s hosťami.', body: 'Nezabudnite si vytvoriť zoznam ľudí, s ktorými chcete spoločnú fotku. V svadobnom zhone sa ľahko na niekoho zabudne.' },
  ],
  en: [
    { headline: 'Prepare your details in advance.', body: 'Rings, invitations, perfume, shoes, or the wedding bouquet — put them all in one place. We\'ll save time and I can photograph them beautifully before getting dressed.' },
    { headline: 'Pause.', body: 'Consciously give yourself a moment just for the two of you during the day. Remember that this day is about you — not just the schedule. The most beautiful moments happen in these quiet, genuine instances.' },
    { headline: 'Allow more time for preparation.', body: 'The morning always flies faster than expected. Reserve at least 15–20 minutes more than you think you need — for peace of mind.' },
    { headline: 'Don\'t be afraid of emotions.', body: 'Tears, laughter, hugs — all of this creates powerful and unforgettable photos. Being authentic = being beautiful.' },
    { headline: 'Trust your photographer.', body: 'Some poses or locations might seem odd at first glance, but the result will be worth it. Sometimes the most boring wall gives the most beautiful photo.' },
    { headline: 'The golden hour is your friend.', body: 'Plan the couple photoshoot around sunset — the light will be soft, warm, and very flattering.' },
    { headline: 'Have a plan B.', body: 'If the wedding is outdoors, think about umbrellas, a shelter, or an alternative location — so the weather won\'t catch you off guard.' },
    { headline: 'Let\'s shoot with guests too.', body: 'Don\'t forget to make a list of people you want a photo with. In the wedding rush, it\'s easy to forget someone.' },
  ],
  uk: [
    { headline: 'Підготуйте деталі заздалегідь.', body: 'Кільця, запрошення, парфум, туфлі чи весільний букет — складіть їх в одне місце. Ми зекономимо час, і я зможу красиво сфотографувати їх ще до вдягання.' },
    { headline: 'Зупиніться.', body: 'Свідомо дозвольте собі хвилинку лише для вас двох протягом дня. Памʼятайте — цей день про вас, а не лише про програму. Найкрасивіші моменти народжуються саме в тихих, щирих миттях.' },
    { headline: 'Залиште більше часу на підготовку.', body: 'Ранок завжди летить швидше, ніж здається. Заплануйте принаймні на 15–20 хвилин більше — для спокою і комфорту.' },
    { headline: 'Не бійтеся емоцій.', body: 'Сльози, сміх, обійми — все це творить сильні і незабутні фотографії. Бути справжнім = бути красивим.' },
    { headline: 'Довіртесь своєму фотографу.', body: 'Деякі пози або місця можуть здаватися дивними на перший погляд, але результат буде вартий. Іноді найнудніша стіна дає найкрасивішу фотографію.' },
    { headline: 'Золота година — ваш друг.', body: 'Плануйте парну фотосесію на час перед заходом сонця — світло буде мʼяким, теплим і дуже лагідним.' },
    { headline: 'Майте план Б.', body: 'Якщо весілля на вулиці — подумайте про парасольки, навіс або альтернативну локацію, щоб погода не застала зненацька.' },
    { headline: 'Фотографуємось і з гостями.', body: 'Не забудьте скласти список людей, з якими хочете спільне фото. У весільній метушні легко про когось забути.' },
  ],
};

const BIO = {
  sk: [
    'Ahoj! Volám sa Anna Lednicka a som človek, ktorý sa raz odvážil vybrať si svoj sen. Narodila som sa na Ukrajine, vyštudovala som lekársku univerzitu a stala som sa všeobecnou lekárkou. Ale vo štvrtom ročníku som sa zamilovala do fotografie a táto vášeň ma úplne pohltila. Kombinovala som prácu zdravotnej sestry a fotografovanie, kým som nedokončila univerzitu a neuvedomila si: fotografia je moje skutočné poslanie.',
    'Teraz žijem na Slovensku, kde začínam všetko od nuly. Nie je to ľahké, ale inšpiruje ma sen urobiť z fotografie svoje povolanie. Som manželka, mama a človek, ktorý verí, že je dôležité robiť to, čo vás zvnútra oživuje.',
    'Čo mám na svojej práci najradšej? Sú to momenty. Živé, skutočné emócie, nie len naaranžované zábery. Počas mojich fotení sa nemusíte obávať, ako sa postaviť alebo kam sa pozerať. Vytvorím pre vás ľahkú a príjemnú atmosféru: dám vám zaujímavú úlohu, vy ju splníte a ja medzitým zachytím úprimné emócie. Začnete sa baviť a fotenie sa premení na nezabudnuteľne strávený čas — so mnou, so sebou, s vašou rodinou alebo s vašou druhou polovičkou.',
    'Som presvedčená, že fotografie vytvorené s dušou zachovajú tieto momenty na celý život. Poďme ich vytvárať spolu!',
  ],
  en: [
    'Hi! My name is Anna Lednicka, and I\'m a person who once dared to choose her dream. I was born in Ukraine, graduated from medical university, and became a general practitioner. But in the fourth year of my studies, I fell in love with photography and this passion completely took over. I combined work as a nurse and photography until I finished university and realized: photography is my true calling.',
    'Now I live in Slovakia, where I\'m starting everything from scratch. It\'s not easy, but I\'m inspired by the dream of making photography my profession. I am a wife, a mother, and a person who believes it\'s important to do what makes you come alive.',
    'What do I love most about my work? It\'s the moments. Vivid, real emotions — not just posed shots. During my sessions, you don\'t have to worry about how to pose or where to look. I\'ll create a light and pleasant atmosphere: I\'ll give you an interesting task, you complete it, and I\'ll capture genuine emotions in the meantime. You\'ll start having fun and the session will transform into unforgettably spent time — with me, with yourself, with your family, or with your other half.',
    'I\'m confident that photos taken with soul will preserve these moments for a lifetime. Let\'s create them together!',
  ],
  uk: [
    'Привіт! Мене звати Анна Ледницька, і я людина, яка одного разу наважилась обрати свою мрію. Я народилась в Україні, закінчила медичний університет і стала лікарем загальної практики. Але на четвертому курсі я закохалась у фотографію, і ця пристрасть повністю поглинула мене. Я поєднувала роботу медсестри і фотографування, поки не закінчила університет і не зрозуміла: фотографія — моє справжнє покликання.',
    'Зараз я живу у Словаччині, де починаю все з нуля. Це нелегко, але мене надихає мрія зробити фотографію своєю професією. Я дружина, мама і людина, яка вірить, що важливо займатись тим, що оживляє зсередини.',
    'Що я найбільше люблю у своїй роботі? Це моменти. Живі, справжні емоції, а не лише постановочні кадри. Під час моїх зйомок вам не потрібно турбуватися, як стати або куди дивитись. Я створю для вас легку і приємну атмосферу: дам вам цікаве завдання, ви його виконаєте, а я тим часом зафіксую щирі емоції. Ви почнете отримувати задоволення, і зйомка перетвориться на незабутньо проведений час — зі мною, з собою, з вашою родиною або з вашою другою половинкою.',
    'Я впевнена, що фотографії, створені з душею, збережуть ці моменти на все життя. Давайте створювати їх разом!',
  ],
};

const WEDDING_DESC = {
  sk: [
    { h: 'Svadobná fotografia — to je viac než len obyčajný obrázok.', p: 'Je to spomienka na váš výnimočný deň, plná emócií, lásky a radosti. Mojím cieľom je zachytiť prirodzené momenty, nežné dotyky a aj tie najmenšie detaily, ktoré spolu vytvárajú váš jedinečný príbeh.' },
    { h: 'Ako to prebieha?', p: 'Približne mesiac pred svadbou sa stretneme, aby sme spoločne prešli harmonogram dňa, vaše priania a dôležité momenty, ktoré chcete mať zachytené na fotografiách. Takáto príprava pomáha urobiť svadobný deň pokojnejším a príjemnejším — vy si ho môžete naplno užiť bez zbytočného stresu.' },
    { h: 'Skvelé odporúčanie — predsvadobné fotenie (tzv. "love story")', p: 'Počas tohto krátkeho a uvoľneného fotenia zažijete, ako prebieha spolupráca so mnou, a zároveň vzniknú krásne fotografie. Tento zážitok nám pomôže lepšie sa spoznať, čo výrazne znižuje stres počas svadobného dňa.' },
  ],
  en: [
    { h: 'Wedding photography — it\'s more than just an ordinary picture.', p: 'It\'s a memory of your exceptional day, full of emotions, love, and joy. My goal is to capture natural moments, gentle touches, and even the smallest details that together create your unique story.' },
    { h: 'How does it work?', p: 'About a month before the wedding, we\'ll meet to go over the day\'s schedule, your wishes, and the important moments you want captured. This preparation helps make the wedding day calmer and more enjoyable — you can fully enjoy it without unnecessary stress.' },
    { h: 'Great recommendation — pre-wedding shoot (the "love story")', p: 'During this short and relaxed session you\'ll experience what it\'s like to work with me, and beautiful photos will be created at the same time. This helps us get to know each other, significantly reducing stress on the wedding day.' },
  ],
  uk: [
    { h: 'Весільна фотографія — це більше, ніж просто знімок.', p: 'Це спогад про ваш особливий день, сповнений емоцій, кохання і радості. Моя мета — зафіксувати природні моменти, ніжні дотики і навіть найменші деталі, які разом створюють вашу унікальну історію.' },
    { h: 'Як це відбувається?', p: 'Приблизно за місяць до весілля ми зустрінемося, щоб разом пройтися по розкладу дня, вашим побажанням і важливим моментам, які ви хочете зафіксувати. Така підготовка допомагає зробити весільний день спокійнішим і приємнішим.' },
    { h: 'Відмінна рекомендація — передвесільна фотосесія ("love story")', p: 'Під час цієї короткої і розслабленої зйомки ви відчуєте, як проходить співпраця зі мною, і водночас зʼявляться красиві фотографії. Це допоможе нам краще познайомитись, що значно зменшує стрес у весільний день.' },
  ],
};

const I18N = {
  sk: {
    nav_about: 'O mne',
    nav_gallery: 'Galéria',
    nav_contact: 'Kontakt',
    thats_me: 'to som ja',
    reviews_label: 'recenzie',
    get_in_touch: 'kontaktuj ma',
    your_name: 'Tvoje meno',
    too_short: 'Príliš krátke...',
    your_email: 'Tvoj email',
    invalid_email: 'Prosím zadajte platný email...',
    invalid_phone: 'Prosím zadajte platné číslo...',
    your_phone: 'Tvoje tel. číslo',
    your_message: 'Správa pre mňa...',
    send: 'Odoslať správu',
    sending: 'Odosielam...',
    sent: 'Správa odoslaná!',
    form_error: 'Niečo sa pokazilo!',
    type_babies: 'Bábätká',
    type_weddings: 'Svadby',
    type_portrait: 'Portréty',
    type_love_story: 'Príbehy lásky',
    type_family: 'Rodina',
    type_studio: 'Ateliér',
    type_pregnancy: 'Tehuľky',
    type_baptism: 'Krsty',
    type_newborn: 'Novorodenci',
    gallery_error: 'Niečo sa nám pokazilo, ADMIN už o chybe vie a pracuje na jej vyriešení, skúste to o pár hodín opäť prosím',
    not_found_back: 'Hlavná stránka',
  },
  en: {
    nav_about: 'About Me',
    nav_gallery: 'Gallery',
    nav_contact: 'Contact',
    thats_me: "that's me",
    reviews_label: 'reviews',
    get_in_touch: 'get in touch',
    your_name: 'Your Name',
    too_short: 'Too short...',
    your_email: 'Your email',
    invalid_email: 'Please enter a valid email...',
    invalid_phone: 'Please enter a valid number...',
    your_phone: 'Your phone',
    your_message: 'Message to me...',
    send: 'Send message',
    sending: 'Sending...',
    sent: 'Message sent!',
    form_error: 'Something went wrong!',
    type_babies: 'Babies',
    type_weddings: 'Weddings',
    type_portrait: 'Portrait',
    type_love_story: 'Love Story',
    type_family: 'Family',
    type_studio: 'Studio',
    type_pregnancy: 'Pregnancy',
    type_baptism: 'Baptisms',
    type_newborn: 'Newborns',
    gallery_error: 'Something went wrong — the admin is aware and working on a fix. Please try again in a few hours.',
    not_found_back: 'Homepage',
  },
  uk: {
    nav_about: 'Про мене',
    nav_gallery: 'Галерея',
    nav_contact: 'Контакт',
    thats_me: 'це я',
    reviews_label: 'відгуки',
    get_in_touch: 'напишіть',
    your_name: "Ваше імʼя",
    too_short: 'Замало символів...',
    your_email: 'Ваша електронна пошта',
    invalid_email: 'Будь ласка, введіть правильний email...',
    invalid_phone: 'Будь ласка, введіть правильний номер...',
    your_phone: 'Ваш номер телефону',
    your_message: 'Ваше повідомлення...',
    send: 'Відправити повідомлення',
    sending: 'Відправляю...',
    sent: 'Повідомлення надіслано!',
    form_error: 'Щось пішло не так!',
    type_babies: 'Немовлята',
    type_weddings: 'Весілля',
    type_portrait: 'Портрети',
    type_love_story: 'Історії кохання',
    type_family: 'Родини',
    type_studio: 'Студія',
    type_pregnancy: 'Вагітність',
    type_baptism: 'Хрещення',
    type_newborn: 'Новонароджені',
    gallery_error: 'Щось пішло не так — адмін вже знає про помилку і працює над її вирішенням. Спробуйте знову через кілька годин.',
    not_found_back: 'Головна',
  },
};

// ======= LANGUAGE =======

function getLang() {
  return localStorage.getItem('lang') || 'sk';
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
  applyAll(lang);
}

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.sk[key] || key;
}

function applyAll(lang) {
  applyTranslations(lang);
  updateLangSwitcher(lang);
  renderDynamicContent(lang);
}

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = (I18N[lang] && I18N[lang][key]) || I18N.sk[key] || key;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

function updateLangSwitcher(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('activeLanguage', btn.dataset.lang === lang);
  });
}

// ======= DYNAMIC CONTENT RENDERING =======

function renderDynamicContent(lang) {
  renderBio(lang);
  renderWeddingDesc(lang);
  renderReviews(lang);
  renderTips(lang);
}

function renderBio(lang) {
  const bio = document.getElementById('bio-content');
  if (!bio) return;
  const paragraphs = BIO[lang] || BIO.sk;
  bio.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
}

function renderWeddingDesc(lang) {
  const container = document.getElementById('wedding-desc-content');
  if (!container) return;
  const items = WEDDING_DESC[lang] || WEDDING_DESC.sk;
  container.innerHTML = items.map(item => `
    <div class="headlineOfTextInDescription">${item.h}</div>
    <div class="contentOfTextInDescription">${item.p}</div>
  `).join('');
}

function renderReviews(lang) {
  const list = document.querySelector('.reviews-list');
  if (!list) return;
  list.innerHTML = REVIEWS.map(r => `
    <div class="review">
      <p class="review-header">&ldquo;</p>
      <p>${r.text[lang] || r.text.sk}</p>
      <p class="review-bottom">&rdquo;</p>
      <p class="review-author">${r.author}</p>
    </div>
  `).join('');
}

function renderTips(lang) {
  const container = document.querySelector('.gallery-tips');
  if (!container) return;
  const tips = TIPS[lang] || TIPS.sk;
  container.innerHTML = tips.map(tip => `
    <div class="tip">
      <span class="tip-number">---</span>
      <div>
        <div class="headlineOfTipInDescription">${tip.headline}</div>
        <div class="contentOfTipInDescription">${tip.body}</div>
      </div>
      <span class="tip-number">---</span>
    </div>
  `).join('');
}

// ======= CAROUSEL (shared for reviews and tips) =======

function makeCarousel(listSelector, arrowLeftSel, arrowRightSel) {
  let index = 0;

  function getItems() {
    return document.querySelectorAll(`${listSelector} > *`);
  }

  function updateArrows() {
    const items = getItems();
    document.querySelectorAll(arrowLeftSel).forEach(el =>
      el.classList.toggle('disabled', index === 0)
    );
    document.querySelectorAll(arrowRightSel).forEach(el =>
      el.classList.toggle('disabled', index >= items.length - 1)
    );
  }

  function goTo(i) {
    const items = getItems();
    index = Math.max(0, Math.min(items.length - 1, i));
    if (items[index]) {
      items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    updateArrows();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  document.querySelectorAll(arrowLeftSel).forEach(el =>
    el.addEventListener('click', prev)
  );
  document.querySelectorAll(arrowRightSel).forEach(el =>
    el.addEventListener('click', next)
  );

  updateArrows();
  return { goTo, updateArrows, getIndex: () => index };
}

// ======= GALLERY LOADER =======

async function loadGallery(type, variant) {
  const apiType = variant || type;
  const grid = document.getElementById('gallery-grid');
  const errorEl = document.getElementById('gallery-error');
  if (!grid) return;

  try {
    const res = await fetch(`${API_URL}/cloud_storage/${apiType}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const images = await res.json();

    const isMobile = window.innerWidth < 700;
    const colCount = isMobile ? 2 : 3;
    const columns = Array.from({ length: colCount }, () => []);

    images.forEach((img, i) => {
      const ratio = img.width && img.height ? img.width / img.height : 0.75;
      columns[i % colCount].push({ ...img, aspectRatio: ratio });
    });

    grid.innerHTML = columns.map(col => `
      <div class="image-column">
        ${col.map(img => `
          <div class="image-card" style="aspect-ratio: ${img.aspectRatio}">
            <img
              src="${img.url}"
              ${img.width ? `width="${img.width}"` : ''}
              ${img.height ? `height="${img.height}"` : ''}
              loading="lazy"
              alt="photo"
            />
          </div>
        `).join('')}
      </div>
    `).join('');

  } catch {
    if (errorEl) {
      errorEl.style.display = 'block';
      const msgEl = errorEl.querySelector('.gallery-error-msg');
      if (msgEl) msgEl.textContent = t('gallery_error');
    }
    if (grid) grid.style.display = 'none';
  }
}

// ======= GALLERY TYPE PAGE SETUP =======

const GALLERY_LABELS = {
  weddings: 'type_weddings',
  'love-story': 'type_love_story',
  pregnancy: 'type_pregnancy',
  studio: 'type_studio',
  family: 'type_family',
  babies: 'type_babies',
  portrait: 'type_portrait',
};

function setupGalleryPage() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'weddings';
  const variant = params.get('variant') || null;

  // Title
  const titleEl = document.getElementById('gallery-title');
  if (titleEl) titleEl.textContent = t(GALLERY_LABELS[type] || 'type_' + type);

  // Hero image
  const heroImg = document.getElementById('gallery-header-img');
  if (heroImg) {
    heroImg.src = `assets/gallery_${type}.avif`;
    heroImg.className = '';
    if (type === 'portrait' || type === 'love-story') heroImg.className = 'adjusted-title';
    else if (type === 'pregnancy') heroImg.className = 'pregnancy-title';
  }

  // Babies sub-nav
  const babiesNav = document.getElementById('babies-variant-nav');
  if (babiesNav) {
    if (type === 'babies') {
      babiesNav.style.display = 'flex';
      if (!variant) {
        window.location.replace('gallery.html?type=babies&variant=baptism');
        return;
      }
      babiesNav.querySelectorAll('a[data-variant]').forEach(a => {
        a.classList.toggle('active-link-section', a.dataset.variant === variant);
        a.href = `gallery.html?type=babies&variant=${a.dataset.variant}`;
      });
    } else {
      babiesNav.style.display = 'none';
    }
  }

  // Wedding description section
  const weddingDescSection = document.getElementById('wedding-description');
  if (weddingDescSection) {
    weddingDescSection.style.display = type === 'weddings' ? 'block' : 'none';
  }

  loadGallery(type, variant);
}

// ======= CONTACT FORM =======

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = form.querySelector('[name=name]');
  const emailInput = form.querySelector('[name=email]');
  const phoneInput = form.querySelector('[name=phone]');
  const msgInput = form.querySelector('[name=message]');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');

  nameInput.addEventListener('input', function () {
    const bad = this.value.trim().length > 0 && this.value.trim().length < 2;
    this.classList.toggle('invalid', bad);
    if (nameError) {
      nameError.textContent = t('too_short');
      nameError.classList.toggle('visible', bad);
    }
  });

  emailInput.addEventListener('input', function () {
    const bad = this.value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    this.classList.toggle('invalid', bad);
    if (emailError) {
      emailError.textContent = t('invalid_email');
      emailError.classList.toggle('visible', bad);
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    let valid = true;
    if (nameInput.value.trim().length < 2) {
      nameInput.classList.add('invalid');
      if (nameError) { nameError.textContent = t('too_short'); nameError.classList.add('visible'); }
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      emailInput.classList.add('invalid');
      if (emailError) { emailError.textContent = t('invalid_email'); emailError.classList.add('visible'); }
      valid = false;
    }
    if (!valid) return;

    const btn = form.querySelector('.submit-btn');
    btn.textContent = t('sending');
    btn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/email_sending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput ? phoneInput.value.trim() : '',
          message: msgInput.value.trim(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      btn.textContent = t('sent');
      btn.style.backgroundColor = 'var(--SUCCESS-SMOOTH)';
    } catch {
      btn.textContent = t('form_error');
      btn.style.backgroundColor = 'var(--DANGER-SMOOTH)';
      setTimeout(() => {
        btn.textContent = t('send');
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 3000);
    }
  });
}

// ======= ACTIVE NAV =======

function setActiveNav() {
  const path = window.location.pathname;
  const isIndex = path.endsWith('/') || path.endsWith('index.html') || path === '';
  const isAbout = path.includes('about');
  const isContact = path.includes('contact');
  const isGallery = path.includes('gallery');

  document.querySelectorAll('nav a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    let active = false;
    if (href.includes('index') || href === '/' || href === '.') active = isIndex;
    else if (href.includes('about')) active = isAbout;
    else if (href.includes('contact')) active = isContact;
    else if (href.includes('gallery')) active = isGallery;
    a.classList.toggle('active-link', active);
  });
}

// ======= TOUCH HOVER =======

function setupTouchHover() {
  document.querySelectorAll('.grid_item:not(.empty), .image-container').forEach(el => {
    el.addEventListener('touchstart', () => el.classList.toggle('touch-active'), { passive: true });
  });
}

// ======= INIT =======

function init() {
  const lang = getLang();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => setLang(btn.dataset.lang);
  });

  applyAll(lang);
  setActiveNav();
  setupTouchHover();

  if (document.querySelector('.reviews-list')) {
    renderReviews(lang);
    makeCarousel('.reviews-list', '.review-arrow-left', '.review-arrow-right');
  }

  if (document.querySelector('.gallery-tips')) {
    renderTips(lang);
    makeCarousel('.gallery-tips', '.tip-arrow-left', '.tip-arrow-right');
  }

  setupGalleryPage();
  setupContactForm();
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('htmx:afterSettle', init);
