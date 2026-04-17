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
        const members = Array.isArray(data.members) ? data.members : [];

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

// Initialize all carousels
document.addEventListener('DOMContentLoaded', async () => {
    await renderTeamFromJSON();

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
// MARQUEE AUTO-CLONE
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.marquee-track');
    if (track) {
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    }
});

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
