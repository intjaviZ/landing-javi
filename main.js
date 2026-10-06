(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== Header: estado al hacer scroll ===== */
    const header = $('.header');
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });

    /* ===== Menú móvil ===== */
    const toggle = $('.nav__toggle');
    const menu = $('.nav__menu');

    const setMenu = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
    document.addEventListener('click', (e) => !header.contains(e.target) && setMenu(false));
    addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
    matchMedia('(min-width: 48rem)').addEventListener('change', () => setMenu(false));

    /* ===== Enlace activo según la sección visible ===== */
    const links = $$('.nav__menu a');
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => spy.observe(s));

    /* ===== Carrusel de herramientas ===== */
    const carousel = $('.carousel');
    if (carousel) {
        const viewport = $('.carousel__viewport', carousel);
        const track = $('.carousel__track', carousel);
        const items = [...track.children];
        const prev = $('.carousel__btn--prev', carousel);
        const next = $('.carousel__btn--next', carousel);
        let index = 0;
        let startX = null;

        const visible = () => parseInt(getComputedStyle(carousel).getPropertyValue('--visible'), 10) || 1;
        const maxIndex = () => Math.max(items.length - visible(), 0);

        const go = (n) => {
            const max = maxIndex();
            index = n > max ? 0 : n < 0 ? max : n; // vuelve al inicio/final (bucle)
            track.style.transform = `translateX(${-items[index].offsetLeft}px)`;
        };

        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));
        addEventListener('resize', () => go(Math.min(index, maxIndex())));

        // Teclado
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-roledescription', 'carrusel');
        carousel.setAttribute('aria-label', 'Herramientas');
        viewport.tabIndex = 0;
        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') go(index - 1);
            if (e.key === 'ArrowRight') go(index + 1);
        });

        // Deslizar con el dedo o el mouse
        viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
        const endDrag = (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        };
        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', () => { startX = null; });
        viewport.addEventListener('dragstart', (e) => e.preventDefault());

        go(0);
    }

    /* ===== Aparición escalonada de tarjetas ===== */
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const reveal = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add('is-visible');
                // Al terminar, se quita la clase para que el hover vuelva a funcionar
                el.addEventListener('transitionend', () => el.classList.remove('reveal', 'is-visible'), { once: true });
                obs.unobserve(el);
            });
        }, { threshold: 0.15 });

        $$('.card, .talk').forEach((el) => {
            const position = [...el.parentElement.children].indexOf(el);
            el.style.setProperty('--d', `${(position % 3) * 0.1}s`);
            el.classList.add('reveal');
            reveal.observe(el);
        });
    }

    /* ===== Copyright del footer ===== */
    const copy = $('.footer__copy');
    if (copy) copy.innerHTML = `<strong>@${new Date().getFullYear()}</strong> Javier Antonio Zárate Gómez`;
})();
