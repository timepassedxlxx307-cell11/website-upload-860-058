(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dots button'));
        var index = 0;

        var showSlide = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('.filter-input');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

    var applyFilters = function () {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var activeFilters = {};

        filterSelects.forEach(function (select) {
            var key = select.getAttribute('data-filter');
            var value = select.value.trim().toLowerCase();
            if (key && value) {
                activeFilters[key] = value;
            }
        });

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' ').toLowerCase();

            var matched = !query || haystack.indexOf(query) !== -1;

            Object.keys(activeFilters).forEach(function (key) {
                var cardValue = (card.getAttribute('data-' + key) || '').toLowerCase();
                if (cardValue.indexOf(activeFilters[key]) === -1) {
                    matched = false;
                }
            });

            card.classList.toggle('is-hidden', !matched);
        });
    };

    if (searchInput || filterSelects.length) {
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
            }
        }

        filterSelects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }
}());
