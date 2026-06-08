(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      body.classList.toggle('nav-open', opened);
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    showHero(0);
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(scope, keyword) {
    var query = normalize(keyword);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !query || normalize(card.getAttribute('data-search-text')).indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    scope.classList.toggle('has-empty', cards.length > 0 && visible === 0);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
    var scopeSelector = input.getAttribute('data-filter-input');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : input.closest('[data-filter-scope]');
    if (!scope) {
      scope = document;
    }
    input.addEventListener('input', function () {
      applyFilter(scope, input.value);
    });
  });

  var searchScope = document.querySelector('[data-search-page]');
  if (searchScope) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = document.querySelector('[data-search-query]');
    if (input) {
      input.value = q;
      input.addEventListener('input', function () {
        applyFilter(searchScope, input.value);
      });
    }
    applyFilter(searchScope, q);
  }

  function prepareVideo(player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    if (!video || !stream || player.getAttribute('data-ready') === '1') {
      return video;
    }
    player.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return video;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
      player._hls = hls;
      return video;
    }
    video.src = stream;
    return video;
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var cover = player.querySelector('[data-play-cover]');
    var video = player.querySelector('video');
    var start = function () {
      var preparedVideo = prepareVideo(player);
      if (cover) {
        cover.classList.add('hidden');
      }
      if (preparedVideo) {
        preparedVideo.controls = true;
        var playRequest = preparedVideo.play();
        if (playRequest && typeof playRequest.catch === 'function') {
          playRequest.catch(function () {
            preparedVideo.controls = true;
          });
        }
      }
    };
    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          start();
        }
      });
    }
  });
})();
