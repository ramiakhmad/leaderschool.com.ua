{
  const categoryBar = document.querySelector('.reference-news-filters');
  const emptyMessage = document.querySelector('.reference-news-empty');
  const cards = [...document.querySelectorAll('[data-news-category]')];
  const filters = [...categoryBar.querySelectorAll('[data-news-filter]')];

  function setNewsCategory(category) {
    filters.forEach((filter) => {
      filter.setAttribute('aria-pressed', String(filter.dataset.newsFilter === category));
    });
    cards.forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.newsCategory !== category;
    });
    emptyMessage.hidden = cards.some((card) => !card.hidden);
  }

  categoryBar.hidden = false;
  filters.forEach((filter) => {
    filter.addEventListener('click', () => setNewsCategory(filter.dataset.newsFilter));
  });

  const subscribeForm = document.querySelector('.reference-news-subscribe-form');
  const status = document.querySelector('.reference-news-status');
  subscribeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = new FormData(subscribeForm).get('email').trim();
    const subject = encodeURIComponent('Запит про розсилку Leaders School');
    const message = encodeURIComponent('Вітаю! Підкажіть, будь ласка, як отримувати новини Leaders School на адресу ' + email + '.');
    status.textContent = 'Надішліть чернетку, яка відкриється у поштовій програмі.';
    status.hidden = false;
    window.location.href = 'mailto:odesa.leaders.school@gmail.com?subject=' + subject + '&body=' + message;
  });
}
