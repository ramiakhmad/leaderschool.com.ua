(() => {
  const form = document.querySelector('#contact-message-form');
  const status = form.querySelector('.contacts-form-status');

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity?.('');
    status.hidden = true;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    if (!name) {
      form.elements.name.setCustomValidity('Вкажіть своє ім’я.');
      form.elements.name.reportValidity();
      return;
    }

    if (phone.replace(/\D/g, '').length < 7) {
      form.elements.phone.setCustomValidity('Вкажіть номер із принаймні сімома цифрами.');
      form.elements.phone.reportValidity();
      return;
    }

    if (!message) {
      form.elements.message.setCustomValidity('Напишіть повідомлення.');
      form.elements.message.reportValidity();
      return;
    }

    const details = [message, '', 'Ім’я: ' + name, 'Телефон: ' + phone];
    if (email) details.push('Email: ' + email);

    const subject = encodeURIComponent('Запитання для Leaders School');
    const draft = form.getAttribute('action') + '?subject=' + subject + '&body=' +
      encodeURIComponent(details.join('\r\n'));
    const link = document.createElement('a');
    link.href = draft;
    link.textContent = 'відкрити підготовлений лист';
    status.replaceChildren('Якщо пошта не відкрилася, спробуйте ', link, '.');
    status.hidden = false;
    window.location.href = draft;
  });
})();
