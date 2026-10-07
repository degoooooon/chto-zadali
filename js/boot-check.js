// Обычный скрипт, не модуль: он запускается и там, где модули не работают,
// и объясняет человеку, почему сайт пустой. Без него посетитель видит
// вечное «Карта загружается» и не понимает, что делать.

(function () {
  var status = document.querySelector('.map__status');
  var intro = document.querySelector('.chooser__lead');
  var message = '';

  if (window.location.protocol === 'file:') {
    // Сюда попадает только разработчик: посетители приходят по адресу сайта
    message = 'Страница открыта как файл с диска, так браузер не запускает скрипты. Запусти в папке проекта npm start и открой http://localhost:8080';
  } else if (!('noModule' in document.createElement('script'))) {
    message = 'Этот браузер слишком старый: карта в нём не откроется. Попробуйте свежий Chrome, Яндекс Браузер, Safari или Firefox.';
  }

  if (message) {
    if (status) {
      status.textContent = message;
    }
    if (intro) {
      intro.textContent = message;
    }
  }
})();
