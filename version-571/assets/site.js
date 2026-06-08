(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showHero(index + 1);
    }, 5600);
  }

  var searchPanel = document.querySelector('[data-search-panel]');
  if (searchPanel) {
    var input = searchPanel.querySelector('[data-search-input]');
    var category = searchPanel.querySelector('[data-category-select]');
    var year = searchPanel.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] .movie-card'));
    var counter = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function filterCards() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var c = category ? category.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();
        var okQuery = !q || text.indexOf(q) !== -1;
        var okCategory = !c || card.getAttribute('data-category') === c;
        var okYear = !y || card.getAttribute('data-year') === y;
        var show = okQuery && okCategory && okYear;
        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = visible ? '已筛选出可浏览影片' : '未找到匹配影片';
      }
    }

    [input, category, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', filterCards);
        item.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }

  var hlsPromise;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function prepareVideo(video, message) {
    var src = video.getAttribute('data-src');
    if (!src) {
      return Promise.reject(new Error('empty'));
    }
    if (video.dataset.ready === 'yes') {
      return Promise.resolve();
    }
    video.dataset.ready = 'yes';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var player = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(src);
        player.attachMedia(video);
        video._hlsPlayer = player;
        return Promise.resolve();
      }
      video.src = src;
      return Promise.resolve();
    }).catch(function () {
      video.src = src;
      if (message) {
        message.textContent = '播放失败，请稍后再试';
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var message = box.querySelector('[data-player-message]');

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      if (message) {
        message.textContent = '';
      }
      button.classList.add('is-hidden');
      prepareVideo(video, message).then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
}());
