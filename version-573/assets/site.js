(() => {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');

    if (header && navToggle) {
        navToggle.addEventListener('click', () => {
            const open = header.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(open));
        });
    }

    const root = document.body ? document.body.getAttribute('data-root') || './' : './';

    document.querySelectorAll('[data-global-search]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[type="search"]');
            const value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = `${root}search.html`;
                return;
            }
            form.setAttribute('action', `${root}search.html`);
        });
    });

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = (nextIndex) => {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, position) => {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach((dot, position) => {
                dot.classList.toggle('is-active', position === index);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        dots.forEach((dot, position) => {
            dot.addEventListener('click', () => {
                show(position);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    const lists = Array.from(document.querySelectorAll('[data-card-list]'));

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const applyFilter = (keyword) => {
        const term = normalize(keyword);
        lists.forEach((list) => {
            const cards = Array.from(list.querySelectorAll('.movie-card'));
            let visible = 0;
            cards.forEach((card) => {
                const text = normalize(card.getAttribute('data-title'));
                const matched = !term || text.includes(term);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            const empty = list.parentElement ? list.parentElement.querySelector('[data-empty-state]') : null;
            if (empty) {
                empty.hidden = visible !== 0;
            }
            const title = document.querySelector('[data-result-title]');
            if (title && term) {
                title.textContent = `“${keyword}”相关内容`;
            }
        });
    };

    document.querySelectorAll('[data-local-filter]').forEach((form) => {
        const input = form.querySelector('input[type="search"]');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilter(input ? input.value : '');
        });
        if (input) {
            input.addEventListener('input', () => applyFilter(input.value));
        }
    });

    const searchForm = document.querySelector('[data-search-page-form]');

    if (searchForm) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const input = searchForm.querySelector('input[type="search"]');
        if (input) {
            input.value = query;
            input.addEventListener('input', () => applyFilter(input.value));
        }
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = input ? input.value.trim() : '';
            const target = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
            window.history.replaceState(null, '', target);
            applyFilter(value);
        });
        applyFilter(query);
    }

    document.querySelectorAll('[data-filter-chip]').forEach((button) => {
        button.addEventListener('click', () => {
            const group = button.parentElement;
            if (group) {
                group.querySelectorAll('[data-filter-chip]').forEach((item) => item.classList.remove('is-active'));
            }
            button.classList.add('is-active');
            applyFilter(button.getAttribute('data-filter-chip') || '');
        });
    });
})();
