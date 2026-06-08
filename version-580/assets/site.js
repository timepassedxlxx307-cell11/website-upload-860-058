(function() {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
      toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = qs('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, idx) {
      dot.addEventListener('click', function() {
        show(idx);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function initFilters() {
    var buttons = qsa('.filter-btn');
    if (!buttons.length) {
      return;
    }
    var cards = qsa('.category-movie-grid .movie-card');
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        var value = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function(btn) {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || ''
          ].join(' ');
          card.style.display = value === 'all' || haystack.indexOf(value) !== -1 ? '' : 'none';
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>' +
      '<p class="card-desc">' + escapeHtml(movie.summary) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var results = qs('#search-results');
    var input = qs('#search-input');
    var title = qs('#search-title');
    if (!results || typeof MOVIE_INDEX === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var matched = MOVIE_INDEX.filter(function(movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.summary]
        .join(' ')
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = matched.length ? '搜索结果' : '暂无匹配';
    }
    results.innerHTML = matched.length ? matched.map(movieCard).join('') : '<div class="empty-state">暂无匹配影片</div>';
  }

  window.initMoviePlayer = function(streamUrl) {
    var video = qs('#movie-player');
    var overlay = qs('#player-overlay');
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    attach();
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('play', function() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function() {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
