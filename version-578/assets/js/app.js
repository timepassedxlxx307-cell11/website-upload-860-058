(function () {
    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot'));
                showSlide(nextIndex);
                startTimer();
            });
        });

        startTimer();
    }

    var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));

    filterAreas.forEach(function (area) {
        var input = area.querySelector('[data-search-input]');
        var yearSelect = area.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));

        function readText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = readText(card);
                var cardYear = card.getAttribute('data-year') || '';
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var yearMatch = !year || cardYear === year;
                card.classList.toggle('is-filter-hidden', !(keywordMatch && yearMatch));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
            applyFilter();
        }
    });
})();
