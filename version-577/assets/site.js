
(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  searchInputs.forEach(function (input) {
    var root = input.closest('[data-search-scope]') || document;
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var activeFilter = '';

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('hide-card', !(matchKeyword && matchFilter));
      });
    }

    input.addEventListener('input', applyFilter);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });
})();

function initVideoPlayer(streamUrl) {
  var video = document.querySelector('[data-video-player]');
  var overlay = document.querySelector('[data-player-overlay]');
  var button = document.querySelector('[data-player-button]');
  var ready = false;
  var hlsPlayer = null;

  if (!video) {
    return;
  }

  function start() {
    if (!ready) {
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}
