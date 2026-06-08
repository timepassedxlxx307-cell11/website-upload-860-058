(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");

    if (menuButton) {
      menuButton.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
      });
    }

    document.querySelectorAll(".header-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";

        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "search.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      showSlide(0);

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var trigger = scope.querySelector(".search-box button");
      var activeValue = "all";

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-region"));
          var chipMatch = activeValue === "all" || text.indexOf(normalize(activeValue)) !== -1;
          var queryMatch = !query || text.indexOf(query) !== -1;
          var shouldShow = chipMatch && queryMatch;
          card.style.display = shouldShow ? "" : "none";

          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeValue = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          applyFilter();
        });
      });

      if (trigger) {
        trigger.addEventListener("click", applyFilter);
      }

      if (input) {
        input.addEventListener("input", applyFilter);

        if (scope.getAttribute("data-search-page") === "true") {
          var params = new URLSearchParams(window.location.search);
          var query = params.get("q");

          if (query) {
            input.value = query;
          }
        }
      }

      applyFilter();
    });
  });
})();
