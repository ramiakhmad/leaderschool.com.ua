const root = document.documentElement;
const query = new URLSearchParams(location.search);
const designDialog = document.querySelector('#design-dialog');
const themeButtons = [...document.querySelectorAll('[data-design]')];

function selectDesign(design, save = false) {
  root.dataset.theme = design;
  for (const button of themeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.design === design));
  }

  if (save) {
    try {
      localStorage.setItem('ols-design', design);
    } catch {}
    if (location.protocol !== 'file:' && query.has('design')) {
      const url = new URL(location.href);
      url.searchParams.set('design', design);
      history.replaceState(null, '', url);
    }
  }

  if (location.protocol === 'file:' || query.has('design')) {
    for (const link of document.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (!/^[a-z-]+\.html(?:[?#]|$)/.test(href)) continue;
      const url = new URL(href, location.href);
      url.searchParams.set('design', design);
      const filename = url.pathname.split('/').pop();
      link.setAttribute('href', filename + url.search + url.hash);
    }
  }
}

selectDesign(root.dataset.theme);
document.querySelector('#open-design').addEventListener('click', () => designDialog.showModal());
for (const button of themeButtons) {
  button.addEventListener('click', () => selectDesign(button.dataset.design, true));
}

for (const dialog of document.querySelectorAll('dialog')) {
  for (const button of dialog.querySelectorAll('.close-dialog')) {
    button.addEventListener('click', () => dialog.close());
  }
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

const menuButton = document.querySelector('#menu-button');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  menuButton.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  navigation.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});

function setupRequestForm(form) {
  const formStatus = document.querySelector('#form-status');
  const phone = form.elements.phone;
  const requestType = form.elements.kind;
  const heading = document.querySelector('[data-request-heading]');
  const templates = {
    admission: ['Заявка на вступ', 'дізнатися про вступ до школи'],
    tour: ['Запис на екскурсію', 'відвідати школу з екскурсією'],
    consultation: ['Консультація щодо навчання', 'записатися на консультацію'],
  };
  const kind = query.get('kind');
  if (Object.hasOwn(templates, kind)) {
    requestType.value = kind;
    if (heading && kind !== 'admission') heading.textContent = templates[kind][0];
  }

  for (const link of document.querySelectorAll('a[href="#request"][data-request]')) {
    link.addEventListener('click', () => {
      requestType.value = link.dataset.request;
      formStatus.hidden = true;
    });
  }

  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const number = data.get('phone').trim();
    if (number.replace(/\D/g, '').length < 7) {
      phone.setCustomValidity('Вкажіть номер телефону, що містить щонайменше 7 цифр.');
      phone.reportValidity();
      return;
    }

    const [subject, purpose] = templates[requestType.value];
    const optional = [['child', 'Ім’я дитини'], ['age', 'Вік дитини'], ['email', 'Email']];
    const extra = optional.flatMap(([field, label]) => {
      const value = data.get(field)?.trim();
      return value ? [label + ': ' + value] : [];
    });
    const body = [
      'Вітаю! Хочу ' + purpose + '.',
      '',
      'Ім’я: ' + data.get('name').trim(),
      'Телефон: ' + number,
      (form.elements.age ? 'Програма: ' : 'Клас: ') + data.get('grade'),
      ...extra,
    ].join('\r\n');
    const email = 'odesa.leaders.school@gmail.com';
    const draft = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    const address = document.createElement('a');
    address.href = draft;
    address.textContent = email;
    formStatus.replaceChildren('Якщо поштова програма не відкрилася, напишіть на ', address, '.');
    formStatus.hidden = false;
    location.href = draft;
  });
}

function setupGallery(gallery) {
  const photoDialog = document.querySelector('#photo-dialog');
  const galleryFallback = document.querySelector('#gallery-fallback');
  const largePhoto = document.querySelector('#large-photo');
  const photoCaption = document.querySelector('#photo-caption');
  const photos = [...gallery.querySelectorAll('button')];
  const filterRow = document.querySelector('.filter-row');
  const filters = [...document.querySelectorAll('.filter-row [data-filter]')];
  let currentCategory = 'all';

  function renderGallery(category) {
    currentCategory = category;
    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
    }
    for (const photo of photos) {
      photo.hidden = photo.dataset.unavailable === 'true' ||
        (category !== 'all' && category !== photo.dataset.category);
    }
    const visible = photos.filter((photo) => !photo.hidden).length;
    galleryFallback.hidden = visible > 0;
    gallery.classList.toggle('gallery-single', visible === 1);
  }

  if (filterRow) filterRow.hidden = false;
  for (const filter of filters) {
    filter.addEventListener('click', () => renderGallery(filter.dataset.filter));
  }
  const requestedCategory = query.get('gallery');
  if (filters.some((filter) => filter.dataset.filter === requestedCategory)) {
    renderGallery(requestedCategory);
  }

  for (const button of photos) {
    const image = button.querySelector('img');
    function hideFailedPhoto() {
      button.dataset.unavailable = 'true';
      renderGallery(currentCategory);
    }
    image.addEventListener('error', hideFailedPhoto);
    if (image.complete && !image.naturalWidth) hideFailedPhoto();
    button.addEventListener('click', () => {
      largePhoto.src = image.currentSrc || image.src;
      largePhoto.alt = image.alt;
      photoCaption.textContent = image.alt;
      photoDialog.showModal();
    });
  }
}

const requestForm = document.querySelector('#request-form');
if (requestForm) setupRequestForm(requestForm);

const gallery = document.querySelector('#gallery');
if (gallery) setupGallery(gallery);

for (const logo of document.querySelectorAll('.brand-image')) {
  function hideLogo() {
    logo.hidden = true;
    logo.nextElementSibling.hidden = false;
  }
  logo.addEventListener('error', hideLogo);
  if (logo.complete && !logo.naturalWidth) hideLogo();
}
