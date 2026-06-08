(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  function refreshHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  if (menuButton && mobilePanel && header) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      header.classList.toggle('is-open', opened);
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.js-local-filter').forEach(function (input) {
    var targetId = input.getAttribute('data-target');
    var target = targetId ? document.getElementById(targetId) : null;
    var items = target ? Array.prototype.slice.call(target.querySelectorAll('.movie-card, .rank-row')) : [];

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        item.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
      });
    });
  });

  function safeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function resultCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="movie-card-link" href="' + safeText(item.url) + '">',
      '<div class="poster-wrap">',
      '<img src="./' + safeText(item.cover) + '" alt="' + safeText(item.title) + '" loading="lazy">',
      '<span class="year-pill">' + safeText(item.year) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + safeText(item.title) + '</h3>',
      '<p>' + safeText(item.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + safeText(item.region) + '</span>',
      '<span>' + safeText(item.type) + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchTitle = document.getElementById('search-title');
  var searchDesc = document.getElementById('search-desc');

  function renderSearch(query) {
    if (!searchResults || !window.MovieSearchData) {
      return;
    }
    var value = String(query || '').trim().toLowerCase();
    if (!value) {
      return;
    }
    var results = window.MovieSearchData.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category].join(' ').toLowerCase();
      return haystack.indexOf(value) !== -1;
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = '搜索结果';
    }
    if (searchDesc) {
      searchDesc.textContent = results.length ? '已找到相关影片，点击卡片进入详情页。' : '没有找到匹配影片，可以尝试更短的关键词。';
    }
    searchResults.innerHTML = results.length ? results.map(resultCard).join('') : '';
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (initialQuery) {
      searchInput.value = initialQuery;
      renderSearch(initialQuery);
    }
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('.js-player');
    var cover = shell.querySelector('.player-cover');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function beginPlay() {
      attachStream();
      shell.classList.add('is-playing');
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', beginPlay);
    }
    if (video) {
      video.addEventListener('play', function () {
        attachStream();
        shell.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
