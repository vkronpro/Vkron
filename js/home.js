// ===========================================
// UNIVERSAL CAROUSEL SYSTEM
// ===========================================

class Carousel {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.cards = Array.from(this.track.children);
        this.prevBtn = container.querySelector('.carousel-arrow.prev');
        this.nextBtn = container.querySelector('.carousel-arrow.next');
        this.indicatorsContainer = container.querySelector('.carousel-indicators');

        this.currentIndex = 0;
        this.defaultVisible = parseInt(container.dataset.visible) || 3;
        this.autoplayInterval = null;
        this.autoplayEnabled = container.dataset.autoplay === 'true';
        this.autoplayDelay = parseInt(container.dataset.autoplayInterval) || 4000;

        // Drag variables
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;

        this.init();
    }

    getVisibleCards() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 992) return Math.min(2, this.defaultVisible);
        if (width <= 1200 && this.defaultVisible > 3) return 3;
        return this.defaultVisible;
    }

    getMaxIndex() {
        return Math.max(0, this.cards.length - this.getVisibleCards());
    }

    init() {
        this.createIndicators();
        this.bindEvents();
        this.update();
        if (this.autoplayEnabled) {
            this.startAutoplay();
        }
    }

    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        const totalSlides = this.getMaxIndex() + 1;

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('span');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goTo(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    bindEvents() {
        // Só adiciona eventos aos botões se eles existirem
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Drag events
        this.track.addEventListener('mousedown', this.dragStart.bind(this));
        this.track.addEventListener('touchstart', this.dragStart.bind(this));
        this.track.addEventListener('mouseup', this.dragEnd.bind(this));
        this.track.addEventListener('touchend', this.dragEnd.bind(this));
        this.track.addEventListener('mousemove', this.drag.bind(this));
        this.track.addEventListener('touchmove', this.drag.bind(this));
        this.track.addEventListener('mouseleave', this.dragEnd.bind(this));

        // Stop autoplay on hover/touch
        if (this.autoplayEnabled) {
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        window.addEventListener('resize', () => {
            this.createIndicators();
            if (this.currentIndex > this.getMaxIndex()) {
                this.currentIndex = this.getMaxIndex();
            }
            this.update();
        });
    }

    dragStart(e) {
        this.isDragging = true;
        this.startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        this.track.style.cursor = 'grabbing';
        if (this.autoplayEnabled) {
            this.stopAutoplay();
        }
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentPosition - this.startPos;

        // Temporarily show drag movement
        const baseTranslate = -this.currentIndex * this.getCardWidth();
        this.track.style.transform = `translateX(${baseTranslate + diff}px)`;
    }

    dragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.cursor = 'grab';

        const movedBy = e.type.includes('mouse')
            ? e.pageX - this.startPos
            : (e.changedTouches ? e.changedTouches[0].clientX - this.startPos : 0);

        // If dragged more than 50px, change slide
        if (movedBy < -50 && this.currentIndex < this.getMaxIndex()) {
            this.next();
        } else if (movedBy > 50 && this.currentIndex > 0) {
            this.prev();
        } else {
            this.update();
        }

        if (this.autoplayEnabled) {
            this.startAutoplay();
        }
    }

    getCardWidth() {
        if (this.cards.length === 0) return 0;
        const gap = 30;
        return this.cards[0].offsetWidth + gap;
    }

    update() {
        const translateX = -this.currentIndex * this.getCardWidth();
        this.track.style.transform = `translateX(${translateX}px)`;

        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === this.currentIndex);
        });
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.update();
        }
    }

    next() {
        if (this.currentIndex < this.getMaxIndex()) {
            this.currentIndex++;
            this.update();
        }
    }

    goTo(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.getMaxIndex()));
        this.update();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            if (this.currentIndex < this.getMaxIndex()) {
                this.currentIndex++;
            } else {
                this.currentIndex = 0;
            }
            this.update();
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// Hydrate hero section from data/hero.json
async function loadHero() {
    try {
        const res = await fetch('/data/hero.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        document.querySelectorAll('[data-hero]').forEach(el => {
            const key = el.dataset.hero;
            if (data[key]) el.textContent = data[key];
        });
    } catch (e) {}
}

// Hydrate about section from data/about.json
async function loadAbout() {
    try {
        const res = await fetch('/data/about.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        document.querySelectorAll('[data-about]').forEach(el => {
            const key = el.dataset.about;
            if (data[key]) el.textContent = data[key];
        });
    } catch (e) {}
}

// Render partners marquee from data/partners.json
async function renderPartnersFromJSON() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    try {
        const res = await fetch('/data/partners.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const partners = Array.isArray(data.partners) ? data.partners : [];
        const fragment = document.createDocumentFragment();
        partners.forEach((p, i) => {
            if (!p || !p.image) return;
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = p.image;
            img.alt = p.alt || `Parceiro ${i + 1}`;
            fragment.appendChild(img);
        });
        track.appendChild(fragment);
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
        requestAnimationFrame(() => track.classList.add('playing'));
    } catch (e) {
        console.error('Falha ao carregar parceiros:', e);
    }
}

// Render Google reviews carousel from data/reviews.json
async function renderReviewsFromJSON() {
    const container = document.querySelector('[data-carousel="reviews"]');
    if (!container) return;
    const track = container.querySelector('.carousel-track');
    if (!track) return;
    try {
        const res = await fetch('/data/reviews.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];
        const initials = (name) => (name || '').trim().split(/\s+/).map(p => p[0] || '').slice(0, 2).join('').toUpperCase();
        const fragment = document.createDocumentFragment();
        reviews.forEach(r => {
            if (!r || !r.name || !r.text) return;
            const card = document.createElement('div');
            card.className = 'review-card';

            const header = document.createElement('div');
            header.className = 'review-header';
            const info = document.createElement('div');
            info.className = 'reviewer-info';
            const avatar = document.createElement('div');
            avatar.className = 'reviewer-avatar';
            avatar.textContent = initials(r.name);
            const meta = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.textContent = r.name;
            const stars = document.createElement('div');
            stars.className = 'review-stars';
            for (let i = 0; i < 5; i++) {
                const s = document.createElement('span');
                s.className = 'material-icons';
                s.textContent = 'star';
                stars.appendChild(s);
            }
            meta.append(h4, stars);
            info.append(avatar, meta);
            header.appendChild(info);
            if (r.date) {
                const date = document.createElement('div');
                date.className = 'review-date';
                date.textContent = r.date;
                header.appendChild(date);
            }

            const text = document.createElement('p');
            text.className = 'review-text';
            text.textContent = `"${r.text}"`;

            const footer = document.createElement('div');
            footer.className = 'review-footer';
            const gimg = document.createElement('img');
            gimg.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg';
            gimg.alt = 'Google';
            gimg.width = 16;
            const span = document.createElement('span');
            span.textContent = 'Avaliação verificada do Google';
            footer.append(gimg, span);

            card.append(header, text, footer);
            fragment.appendChild(card);
        });
        track.appendChild(fragment);
    } catch (e) {
        console.error('Falha ao carregar avaliações:', e);
    }
}

// Hydrate site info (contact + social) from data/info.json
async function loadSiteInfo() {
    try {
        const res = await fetch('/data/info.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const info = await res.json();

        const waDigits = (s) => {
            const d = (s || '').replace(/\D/g, '');
            return d.startsWith('55') ? d : '55' + d;
        };
        const waLink = info.whatsapp ? `https://wa.me/${waDigits(info.whatsapp)}` : null;

        const igHandle = (url) => {
            const m = (url || '').match(/instagram\.com\/@?([^/?]+)/);
            return m ? '@' + m[1] : '';
        };

        document.querySelectorAll('[data-info]').forEach(el => {
            const key = el.dataset.info;
            if (key === 'instagram_handle' && info.instagram) {
                el.textContent = igHandle(info.instagram);
            } else if (info[key]) {
                el.textContent = info[key];
            }
        });

        document.querySelectorAll('[data-info-href]').forEach(el => {
            const key = el.dataset.infoHref;
            if (key === 'whatsapp' && waLink) {
                const msg = el.dataset.infoMsg;
                el.href = msg ? `${waLink}?text=${encodeURIComponent(msg)}` : waLink;
            } else if (key === 'email' && info.email) {
                el.href = `mailto:${info.email}`;
            } else if (info[key]) {
                el.href = info[key];
            }
        });
    } catch (e) {}
}

// Render CEOs from data/ceos.json
async function renderCEOsFromJSON() {
    const grid = document.querySelector('.ceos-grid');
    if (!grid) return;
    try {
        const res = await fetch('/data/ceos.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const ceos = Array.isArray(data.ceos) ? data.ceos : [];
        const fragment = document.createDocumentFragment();
        ceos.forEach(c => {
            if (!c || !c.name) return;
            const card = document.createElement('div');
            card.className = 'team-card';
            const photoWrap = document.createElement('div');
            photoWrap.className = 'team-photo';
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = c.photo || '';
            img.alt = c.name;
            photoWrap.appendChild(img);
            const h3 = document.createElement('h3');
            h3.textContent = c.name;
            const p = document.createElement('p');
            p.textContent = c.role || '';
            card.append(photoWrap, h3, p);
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
    } catch (e) {
        console.error('Falha ao carregar CEOs:', e);
    }
}

// Render results from data/results.json
async function renderResultsFromJSON() {
    const grid = document.querySelector('.resultados-grid');
    if (!grid) return;
    try {
        const res = await fetch('/data/results.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        const defaultIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        const fragment = document.createDocumentFragment();
        results.forEach(r => {
            if (!r || !r.text) return;
            const card = document.createElement('div');
            card.className = 'resultado-card';
            const iconWrap = document.createElement('div');
            iconWrap.className = 'resultado-icon';
            if (r.image) {
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = r.image;
                img.alt = '';
                img.style.cssText = 'width: 60px; height: auto;';
                iconWrap.appendChild(img);
            } else {
                iconWrap.innerHTML = defaultIcon;
            }
            const text = document.createElement('div');
            text.className = 'resultado-text';
            text.textContent = r.text;
            card.append(iconWrap, text);
            fragment.appendChild(card);
        });
        grid.appendChild(fragment);
    } catch (e) {
        console.error('Falha ao carregar resultados:', e);
    }
}

// Render team carousel cards from data/team.json
async function renderTeamFromJSON() {
    const container = document.querySelector('[data-carousel="team"]');
    if (!container) return;
    const track = container.querySelector('.carousel-track');
    if (!track) return;

    try {
        const res = await fetch('/data/team.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const members = Array.isArray(data.members) ? data.members.slice() : [];
        members.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

        const fragment = document.createDocumentFragment();
        members.forEach(m => {
            if (!m || !m.name) return;
            const card = document.createElement('div');
            card.className = 'team-card';

            const photoWrap = document.createElement('div');
            photoWrap.className = 'team-photo';
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = m.photo || '';
            img.alt = m.name;
            photoWrap.appendChild(img);

            const h3 = document.createElement('h3');
            h3.textContent = m.name;
            const p = document.createElement('p');
            p.textContent = m.role || '';

            card.append(photoWrap, h3, p);
            fragment.appendChild(card);
        });
        track.appendChild(fragment);
    } catch (e) {
        console.error('Falha ao carregar equipe:', e);
    }
}

// Render testimonials carousel from data/testimonials.json
async function renderTestimonialsFromJSON() {
    const container = document.querySelector('[data-carousel="testimonials"]');
    if (!container) return;
    const track = container.querySelector('.carousel-track');
    if (!track) return;

    try {
        const res = await fetch('/data/testimonials.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const videos = Array.isArray(data.videos) ? data.videos : [];

        const youtubeEmbedUrl = (url) => {
            if (!url) return '';
            const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
            return m ? `https://www.youtube.com/embed/${m[1]}` : '';
        };

        const fragment = document.createDocumentFragment();
        videos.forEach(v => {
            if (!v || !v.name || !v.youtube) return;
            const embedUrl = youtubeEmbedUrl(v.youtube);
            if (!embedUrl) return;

            const card = document.createElement('div');
            card.className = 'testimonial-card';

            const videoWrap = document.createElement('div');
            videoWrap.className = 'video-container';
            const iframe = document.createElement('iframe');
            iframe.width = 560;
            iframe.height = 315;
            iframe.src = embedUrl;
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            videoWrap.appendChild(iframe);

            const h3 = document.createElement('h3');
            h3.textContent = v.name;
            const p = document.createElement('p');
            p.textContent = v.demand || '';

            card.append(videoWrap, h3, p);
            fragment.appendChild(card);
        });
        track.appendChild(fragment);
    } catch (e) {
        console.error('Falha ao carregar depoimentos:', e);
    }
}

// Initialize all carousels
document.addEventListener('DOMContentLoaded', async () => {
    loadSiteInfo();
    loadHero();
    loadAbout();
    renderCEOsFromJSON();
    renderResultsFromJSON();
    await renderTeamFromJSON();
    await renderTestimonialsFromJSON();
    await renderReviewsFromJSON();
    await renderPartnersFromJSON();

    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(container => {
        const carousel = new Carousel(container);

        // Se tiver autoplay, só inicia quando a seção entrar na tela
        if (container.dataset.autoplay === 'true') {
            carousel.stopAutoplay(); // garante que não começa antes

            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        carousel.startAutoplay();
                    } else {
                        carousel.stopAutoplay();
                    }
                });
            }, { threshold: 0.05 });

            sectionObserver.observe(container);
        }
    });
});

// ===========================================
// SCROLL ANIMATIONS
// ===========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .team-card, .blog-card, .testimonial-card, .certificate-card, .review-card, .partner-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// ===========================================
// HEADER SCROLL EFFECT
// ===========================================
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    } else {
        header.style.background = 'white';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// ===========================================
// SMOOTH SCROLL WITHOUT URL CHANGE
// ===========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Ignore empty anchors or just "#"
        if (href === '#' || href === '') return;

        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            history.replaceState(null, '', window.location.pathname);
        }
    });
});

// If the page was opened with a hash (e.g., ...#blog), scroll smoothly then remove the hash from the URL
if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    // Clean the URL immediately so the hash never sticks
    history.replaceState(null, '', window.location.pathname);
    window.addEventListener('load', () => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

// ===========================================
// HAMBURGER MENU
// ===========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.querySelector('.nav-overlay');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            if (navOverlay) navOverlay.classList.remove('active');
        });
    });
}

// ===========================================
// SCROLL TO BLOG WHEN COMING FROM BLOG PAGE
// ===========================================
if (sessionStorage.getItem('scrollToBlog') === 'true') {
    sessionStorage.removeItem('scrollToBlog');
    const blogSection = document.getElementById('blog');
    if (blogSection) {
        setTimeout(() => {
            blogSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
}

// ===========================================
// FLIP CARDS — INTERSECTIONOBSERVER (MOBILE)
// ===========================================
if (window.innerWidth <= 768) {
    const flipCards = document.querySelectorAll('.flip-card');
    const flipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const inner = entry.target.querySelector('.flip-inner');
            if (entry.isIntersecting) {
                inner.classList.add('flipped');
            } else {
                inner.classList.remove('flipped');
            }
        });
    }, { threshold: 0.5 });
    flipCards.forEach(card => flipObserver.observe(card));
}

// ===========================================
// PRELOADER
// ===========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('hidden'), 800);
    }
});

// ===========================================
// VOLTAR AO TOPO
// ===========================================
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ===========================================
// BANNER LGPD
// ===========================================
const lgpdBanner = document.getElementById('lgpd-banner');
const lgpdAccept = document.getElementById('lgpd-accept');
if (lgpdBanner && !localStorage.getItem('lgpd-accepted')) {
    setTimeout(() => lgpdBanner.classList.add('visible'), 1500);
}
if (lgpdAccept) {
    lgpdAccept.addEventListener('click', () => {
        localStorage.setItem('lgpd-accepted', 'true');
        lgpdBanner.classList.remove('visible');
    });
}
