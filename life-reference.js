(() => {
  const gallery = document.querySelector('.life-reference #gallery');
  const filters = [...document.querySelectorAll('.life-reference [data-filter]')];
  const previous = document.querySelector('.life-slider-previous');
  const next = document.querySelector('.life-slider-next');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function updateCarousel() {
    const last = gallery.scrollWidth - gallery.clientWidth;
    const scrollable = last > 2;
    previous.hidden = next.hidden = !scrollable;
    previous.disabled = gallery.scrollLeft < 2;
    next.disabled = gallery.scrollLeft >= last - 2;
  }

  for (const button of [previous, next]) {
    button.addEventListener('click', () => {
      gallery.scrollBy({
        left: Number(button.dataset.galleryScroll) * gallery.clientWidth * .78,
        behavior: reduceMotion.matches ? 'instant' : 'smooth',
      });
    });
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      gallery.scrollLeft = 0;
      updateCarousel();
    });
  }

  for (const link of document.querySelectorAll('[data-life-filter]')) {
    link.addEventListener('click', () => {
      const filter = filters.find((item) => item.dataset.filter === link.dataset.lifeFilter);
      filter?.click();
    });
  }

  gallery.addEventListener('scroll', updateCarousel, { passive: true });
  new ResizeObserver(updateCarousel).observe(gallery);
  new MutationObserver(updateCarousel).observe(gallery, {
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden'],
  });
  updateCarousel();

  const week = document.querySelector('.life-week');
  const days = [...week.querySelectorAll('[data-agenda-day]')];
  const activities = document.querySelectorAll('[data-activity-days]');
  week.hidden = false;

  for (const day of days) {
    day.addEventListener('click', () => {
      for (const button of days) {
        button.setAttribute('aria-pressed', String(button === day));
      }
      for (const activity of activities) {
        activity.hidden = !activity.dataset.activityDays.split(' ').includes(day.dataset.agendaDay);
      }
    });
  }
})();
