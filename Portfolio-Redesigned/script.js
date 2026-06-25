// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ─── SMOOTH NAV SCROLL ───────────────────────────────────────────────────────
// Wire ALL anchor links (top bar + menu overlay) to Lenis scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target, {
                duration: 2.2,
                offset: -80,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});

// ─── 1. MENU OVERLAY ─────────────────────────────────────────────────────────
const menuTrigger = document.querySelector('.menu-trigger');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks   = document.querySelectorAll('.menu-links a');
let menuOpen = false;

function toggleMenu() {
    if (!menuOpen) {
        gsap.to(menuOverlay, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.inOut' });
        gsap.to(menuLinks,   { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.3 });
        if (menuTrigger) { menuTrigger.innerText = 'Close'; menuTrigger.style.color = 'var(--bg-base)'; }
    } else {
        gsap.to(menuLinks,   { y: 20, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.in' });
        gsap.to(menuOverlay, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut', delay: 0.2 });
        if (menuTrigger) { menuTrigger.innerText = 'Menu'; menuTrigger.style.color = ''; }
    }
    menuOpen = !menuOpen;
}

if (menuTrigger) {
    menuTrigger.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => {
        link.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
    });
}

// ─── 2. HEADER SCROLL STATE ──────────────────────────────────────────────────
const header = document.querySelector('header');
ScrollTrigger.create({
    start: 'top -50',
    onUpdate: (self) => {
        header.classList.toggle('scrolled', self.progress > 0);
    }
});

// ─── 3. LOGO COLOR SWITCH ────────────────────────────────────────────────────
const logo    = document.querySelector('.logo');
const sections = document.querySelectorAll('section');

sections.forEach(sec => {
    ScrollTrigger.create({
        trigger: sec,
        start: 'top 80px',
        end:   'bottom 80px',
        onEnter:     () => updateLogoColor(sec),
        onEnterBack: () => updateLogoColor(sec)
    });
});

function updateLogoColor(sec) {
    const darkSections = ['hero', 'footer', 'skills', 'works'];
    let targetLogoColor = '#241F21'; // --ink
    let targetHeaderColor = '#241F21'; // --ink

    if (sec.id === 'manifesto') {
        targetLogoColor = '#94C973';
        targetHeaderColor = '#ffffff';
    } else if (darkSections.includes(sec.id)) {
        targetLogoColor = '#ffffff';
        targetHeaderColor = '#ffffff';
    }

    // Premium smooth color transitions
    gsap.to(logo, { color: targetLogoColor, duration: 0.8, ease: "power2.inOut" });
    gsap.to(header, { color: targetHeaderColor, duration: 0.8, ease: "power2.inOut" });
}

// ─── 4. HERO — scale in + fade up ───────────────────────────────────────────
gsap.from('.hero-video',    { scale: 1.12, duration: 1.8, ease: 'power2.out' });
gsap.from('.hero-headline', { y: 30, opacity: 0, duration: 1.5, ease: 'power2.out', delay: 0.2 });
gsap.to('.scroll-indicator', { y: 8, repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut' });

// ─── 4.5. PREMIUM PARALLAX BACKGROUNDS ────────────────────────────────────────
gsap.utils.toArray('.hero-video, .manifesto-bg, .showcase-bg, .footer-video').forEach(bg => {
    gsap.fromTo(bg, 
        { yPercent: -10 },
        {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
                trigger: bg.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
});

// ─── 4.8. GLOBAL CURTAIN REVEALS ──────────────────────────────────────────────
// Pushes sections down and fades them into darkness as the next section slides over them
const revealPairs = [
    { target: '#hero', trigger: '#manifesto' },
    { target: '#manifesto', trigger: '#skills' },
    { target: '#skills', trigger: '#showcase' },
    { target: '#showcase', trigger: '#footer' }
];

revealPairs.forEach(({ target, trigger }) => {
    // Fade out everything in the target section
    gsap.to(`${target} > *`, {
        opacity: 0,
        scrollTrigger: {
            trigger: trigger,
            start: 'top bottom',
            end: 'top top',
            scrub: true
        }
    });
    
    // Sink and shrink only the foreground content (avoiding conflicts with bg parallax)
    // CRITICAL: We skip transforming #showcase because it breaks the pinned element inside it
    if (target !== '#showcase') {
        gsap.to(`${target} > *:not(.hero-video):not(.manifesto-bg):not(.showcase-bg):not(.footer-video)`, {
            yPercent: 30,
            scale: 0.95,
            scrollTrigger: {
                trigger: trigger,
                start: 'top bottom',
                end: 'top top',
                scrub: true
            }
        });
    }
});

// ─── 5. PHILOSOPHY — portrait slides left, bio text staggers up ──────────────
if (document.querySelector('.bio-portrait-col')) {
    gsap.from('.bio-portrait-col', {
        scrollTrigger: { trigger: '#manifesto', start: 'top 72%' },
        x: -80, opacity: 0, duration: 1.1, ease: 'power3.out'
    });
    gsap.from('.bio-name, .bio-meta', {
        scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
        x: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', delay: 0.15
    });
    gsap.from('.bio-body p', {
        scrollTrigger: { trigger: '#manifesto', start: 'top 65%' },
        y: 40, opacity: 0, stagger: 0.18, duration: 0.85, ease: 'power3.out', delay: 0.25
    });
}

// ─── 6. DISCIPLINES — clip-reveal stagger from bottom ───────────────────────
const skillItems = document.querySelectorAll('.skills-list li');
if (skillItems.length) {
    gsap.from(skillItems, {
        scrollTrigger: { trigger: '#skills', start: 'top 70%' },
        y: 60, opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        stagger: 0.15, duration: 0.9, ease: 'power4.out'
    });
}

// ─── 7. SELECTED WORK — label swoops in ────────────────────────────────────
gsap.from('#showcase .section-label', {
    scrollTrigger: { trigger: '#showcase', start: 'top 80%' },
    x: -120, opacity: 0, duration: 1.2, ease: 'expo.out'
});

// ─── 8. SELECTED WORK — scroll-pinned visual panel ──────────────────────────
let showcaseItems = gsap.utils.toArray('.showcase-item');
let visualImages  = gsap.utils.toArray('.visual-frame img');
let pinTrigger    = null;
let itemTriggers  = [];

function initShowcaseScroll() {
    if (pinTrigger) pinTrigger.kill();
    itemTriggers.forEach(t => t.kill());
    itemTriggers = [];

    showcaseItems = gsap.utils.toArray('.showcase-item').filter(item => item.style.display !== 'none');
    visualImages  = gsap.utils.toArray('.visual-frame img');

    pinTrigger = ScrollTrigger.create({
        trigger: '.showcase-container',
        start: 'top top',
        end:   'bottom bottom',
        pin:   '.showcase-visuals'
    });

    showcaseItems.forEach((item, i) => {
        let trigger = ScrollTrigger.create({
            trigger: item,
            start: 'top 50%',
            end:   'bottom 50%',
            onEnter:     () => activateVisual(i),
            onEnterBack: () => activateVisual(i),
        });
        itemTriggers.push(trigger);
    });

    if (showcaseItems.length > 0) activateVisual(0);
}

function activateVisual(index) {
    showcaseItems.forEach(item => item.classList.remove('active'));
    visualImages.forEach(img   => img.classList.remove('active'));
    if (showcaseItems[index]) showcaseItems[index].classList.add('active');
    if (visualImages[index])  visualImages[index].classList.add('active');
}

initShowcaseScroll();

// ─── 9. CONNECT / FOOTER — rise + stagger links ─────────────────────────────
gsap.from('.footer-statement', {
    scrollTrigger: { trigger: '#footer', start: 'top 80%' },
    y: 80, opacity: 0, duration: 1.2, ease: 'power3.out'
});
gsap.from('.footer-links a', {
    scrollTrigger: { trigger: '#footer', start: 'top 75%' },
    y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', delay: 0.3
});

// ─── 10. SECTION LABELS — subtle parallax drift on scroll ───────────────────
document.querySelectorAll('.section-label').forEach(label => {
    const parent = label.closest('section');
    if (!parent) return;
    gsap.to(label, {
        scrollTrigger: {
            trigger: parent,
            start: 'top bottom',
            end:   'bottom top',
            scrub: 1.5
        },
        y: -40, ease: 'none'
    });
});

// ─── 11. SEE MORE / SHOW LESS ────────────────────────────────────────────────
const seeMoreBtn    = document.getElementById('seeMoreBtn');
const showLessBtn   = document.getElementById('showLessBtn');
const extraProjects = document.querySelectorAll('.extra-project');

if (seeMoreBtn && showLessBtn) {
    seeMoreBtn.addEventListener('click', () => {
        extraProjects.forEach(proj => { proj.style.display = 'block'; });
        seeMoreBtn.style.display  = 'none';
        showLessBtn.style.display = 'inline-block';

        ScrollTrigger.refresh();
        initShowcaseScroll();

        gsap.from(extraProjects, {
            opacity: 0, y: 100, duration: 0.8, stagger: 0.2,
            ease: 'power3.out', clearProps: 'all'
        });

        lenis.scrollTo(showLessBtn, { duration: 3.5, offset: -200 });
    });

    showLessBtn.addEventListener('click', () => {
        const project4 = document.querySelectorAll('.showcase-item')[3];
        lenis.scrollTo(project4, { duration: 1.5, offset: -100 });

        setTimeout(() => {
            extraProjects.forEach(proj => { proj.style.display = 'none'; });
            showLessBtn.style.display = 'none';
            seeMoreBtn.style.display  = 'inline-block';
            ScrollTrigger.refresh();
            initShowcaseScroll();
        }, 1500);
    });
}
