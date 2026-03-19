document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer);
    
    // Enable normalizeScroll to prevent conflicts between native scroll and GSAP pinning
    // particularly when scrolling UP into a pinned section.
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ 
        ignoreMobileResize: true
        // Removed custom autoRefreshEvents to allow GSAP to use its highly optimized defaults,
        // which prevents the "flickering" effect during rapid scrolling.
    });

    const hasSeenIntro = sessionStorage.getItem('klein4_intro_seen');
    if (!hasSeenIntro) {
        document.body.classList.add('no-scroll');
        sessionStorage.setItem('klein4_intro_seen', 'true');
        playIntroAnimation(() => {
            initAll();
        });
    } else {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
        initAll();
    }
});

function initAll() {
    initUniverseStars();
    initHamburgerMenu();
    initHeroAnimation();
    initNavScroll();
    
    // Initialize pinning sections FIRST so they add their spacing to the page height
    // before the Reveal animations calculate their trigger points
    initIntroTextScroll();
    initNASAnimation();
    
    // Now initialize standard reveals and other interactive modules
    initSectionAnimations();
    initScrollAnimations();
    initCardSwap();
    initPlasma();
    initPilotForm();

    // Final refresh to ensure all ScrollTriggers are perfectly calculated
    ScrollTrigger.refresh();
    
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
        // Additional delayed refresh to catch any subtle layout shifts (like the one fixed by resizing)
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    });
}

function initHamburgerMenu() {
    const btn = document.getElementById('nav-hamburger');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        links.classList.toggle('open');
    });

    // Close menu when a link is clicked
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('open');
            links.classList.remove('open');
        });
    });

    // Close on resize past mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            btn.classList.remove('open');
            links.classList.remove('open');
        }
    });
}

function initUniverseStars() {
    const bg = document.querySelector('.intro-bg');
    if (!bg) return;

    // Create high performance canvas for stars
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';

    // Virtual native resolution for crisp stars
    const cw = 3000;
    const ch = 3000;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cw, ch);

    // Generate organic starfield (Epic Upgrade: 2500 stars)
    for (let i = 0; i < 2500; i++) {
        const x = Math.random() * cw;
        const y = Math.random() * ch;

        let maxRadius = 0.9;
        let p = Math.random();
        // More variety in star sizes
        if (p > 0.85) maxRadius = 2.0;
        if (p > 0.96) maxRadius = 3.5;
        if (p > 0.995) maxRadius = 5.0; // Rare giant stars

        const radius = Math.random() * maxRadius;
        const opacity = Math.random() * 0.85 + 0.15;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        // More colorful star population
        const rand = Math.random();
        if (rand > 0.9) {
            ctx.fillStyle = `rgba(180, 210, 255, ${opacity})`; // Cool Blue
        } else if (rand > 0.85) {
            ctx.fillStyle = `rgba(255, 180, 140, ${opacity})`; // Warm Orange
        } else if (rand > 0.82) {
            ctx.fillStyle = `rgba(255, 100, 100, ${opacity})`; // Intense Red
        } else if (rand > 0.80) {
            ctx.fillStyle = `rgba(180, 255, 180, ${opacity})`; // Subtle Green
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`; // Pure White
        }

        ctx.fill();

        // Epic Glow for larger objects
        if (maxRadius > 1.9) {
            ctx.shadowBlur = maxRadius * 5;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Extra Stars at the TOP (Additional density for the entry view)
    for (let i = 0; i < 600; i++) {
        const x = Math.random() * cw;
        const y = Math.random() * (ch * 0.45); // Focus on top 45%

        const radius = Math.random() * 1.2;
        const opacity = Math.random() * 0.7 + 0.3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
    }

    const addNebula = (cx, cy, r, c1, c2) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };

    // Epic background nebulas — more numerous and vibrant
    addNebula(cw * 0.3, ch * 0.4, 1200, 'rgba(0, 80, 255, 0.05)', 'transparent');
    addNebula(cw * 0.8, ch * 0.7, 1400, 'rgba(233, 113, 50, 0.04)', 'transparent');
    addNebula(cw * 0.5, ch * 0.9, 1100, 'rgba(100, 0, 255, 0.03)', 'transparent');
    addNebula(cw * 0.1, ch * 0.2, 900, 'rgba(255, 50, 50, 0.02)', 'transparent');
    addNebula(cw * 0.9, ch * 0.1, 1000, 'rgba(0, 255, 200, 0.02)', 'transparent');
    addNebula(cw * 0.5, ch * 0.3, 1500, 'rgba(150, 0, 255, 0.025)', 'transparent');

    bg.appendChild(canvas);
}

function playIntroAnimation(onComplete) {
    const overlay = document.getElementById('intro-overlay');
    const logo = document.getElementById('intro-logo');

    if (!overlay || !logo) {
        if (onComplete) onComplete();
        return;
    }

    // Disable scrolling during intro
    document.body.classList.add('no-scroll');

    // Set initial states: blurred, slightly scaled down, masked to be fully hidden
    gsap.set(logo, {
        clipPath: "inset(0% 100% 0% 0%)",
        opacity: 0,
        scale: 0.95,
        filter: "blur(4px)"
    });

    const tl = gsap.timeline({
        onComplete: () => {
            overlay.style.display = 'none';
            document.body.classList.remove('no-scroll');
            if (onComplete) onComplete();
        }
    });

    // 1. Data load reveal (Left-to-Right sharp wiping while unblurring)
    tl.to(logo, {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.inOut",
        delay: 0.2
    });

    // 2. Brief hold (clean pause after reveal)
    tl.to({}, { duration: 0.5 });

    // 3. White background sharply splits horizontally like a mechanical shutter
    tl.to(overlay, {
        clipPath: "inset(50% 0% 50% 0%)",
        duration: 0.5,
        ease: "power4.inOut"
    });
}

function initIntroTextScroll() {
    const section = document.querySelector('.intro-text');
    const bg = document.querySelector('.intro-bg');
    const texts = document.querySelectorAll('.anim-text');

    if (!section || texts.length === 0) return;

    // Detect touch capability to specify layout/interaction (matches hero section logic)
    const isTouchDevice = !window.matchMedia('(hover: hover)').matches;

    // Initial setup: push texts into the depth
    gsap.set(texts, {
        rotationX: 45,
        translateZ: -300,
        opacity: 0,
        filter: "blur(12px)"
    });

    const totalScroll = 3500;
    const tl = gsap.timeline();

    // Text animations (only for non-touch devices)
    if (!isTouchDevice) {
        texts.forEach((text, i) => {
            const offset = i * 1.5;
            tl.to(text, { rotationX: 0, translateZ: 0, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power2.inOut" }, offset);
            tl.to(text, { rotationX: -45, translateZ: -300, opacity: 0.15, filter: "blur(12px)", duration: 1.5, ease: "power2.inOut" }, offset + 2.0);
            if (i < texts.length - 1) tl.to(text, { opacity: 0, duration: 1 }, offset + 4.0);
        });

        // Background Animation — tied to timeline on desktop
        if (bg) {
            tl.to(bg, {
                rotation: 12,
                scale: 1.25,
                x: "-2%",
                y: "1%",
                ease: "sine.inOut",
                duration: tl.duration()
            }, 0);
        }

        // Pinning for desktop (non-touch)
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${totalScroll}`,
            pin: true,
            scrub: 1.2,
            animation: tl,
            anticipatePin: 1
        });
    } 
    // --- MOBILE/HANDY LOGIC (Independent Drift) ---
    else {
        // Handle background as a standalone trigger on mobile
        if (bg) {
            gsap.to(bg, {
                rotation: 12,
                scale: 1.25,
                x: "-2%",
                y: "1%",
                ease: "sine.inOut",
                scrollTrigger: {
                    trigger: "#philosophy",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.2
                }
            });
        }

        // Individual reveal for each text on mobile (blurred transparent -> normal)
        texts.forEach((text) => {
            gsap.set(text, { 
                opacity: 0, 
                filter: "blur(12px)",
                rotationX: 0, 
                translateZ: 0 
            });

            gsap.to(text, {
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%", // Triggers when the top of each text hits the 85% mark
                    toggleActions: "play none none reverse"
                }
            });

            // Handle Long-Press to enable selection only when intended
            let touchTimer;
            text.addEventListener('touchstart', () => {
                touchTimer = setTimeout(() => {
                    text.classList.add('allow-select');
                }, 600);
            }, { passive: true });

            text.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
                // Grace period to allow context menu to appear and be used
                setTimeout(() => text.classList.remove('allow-select'), 2500);
            }, { passive: true });

            text.addEventListener('touchmove', () => {
                clearTimeout(touchTimer);
            }, { passive: true });
        });
    }
}

function initSectionAnimations() {
    const sections = document.querySelectorAll('.section');

    // Selectors for common block-level elements we want to animate
    const selectors = [
        '.eyebrow',
        'h2',
        'h3',
        '.p-large',
        'p',
        '.feature-item', // Animate items individually instead of the whole list
        '.button-primary',
        '.button-outline',
        '.product-image-container',
        '.specs-label',
        '.specs-grid',
        '.card-swap-container',
        '.form-container',
        '.qa-item-fancy'
    ].join(', ');

    sections.forEach(section => {
        // Philosophy section has its own custom GSAP pinning logic that shouldn't be overridden
        if (section.id === 'philosophy') return;

        const potentialElems = section.querySelectorAll(selectors);

        // Filter out elements that are nested inside other matched elements
        // Also exclude the product feature icons as they have custom complex CSS states
        const contentElems = Array.from(potentialElems).filter(el => {
            if (el.classList.contains('feature-icon')) return false;
            
            let parent = el.parentElement;
            while (parent && parent !== section) {
                if (parent.matches && parent.matches(selectors)) {
                    return false;
                }
                parent = parent.parentElement;
            }
            return true;
        });

        if (contentElems.length === 0) return;

        gsap.fromTo(contentElems,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
}

function initScrollAnimations() {
    // Reveal elements on scroll
    const allRevealElements = document.querySelectorAll('[data-reveal]');

    // Hero elements animate immediately on load
    const heroElements = document.querySelectorAll('.hero [data-reveal]');
    if (heroElements.length > 0) {
        gsap.fromTo(heroElements,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.1
            }
        );
    }

    // Marquee infinite scroll
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent && marqueeContent.children.length < 20) {
        // Clone for seamless loop if content is short
        const marqueeInner = marqueeContent.innerHTML;
        marqueeContent.innerHTML = marqueeInner + marqueeInner + marqueeInner;
    }
}

function initNavScroll() {
    const header = document.querySelector('.header');
    
    // 1. Fixed Header Background Transition
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // 2. Precise Smooth Scroll for Navigation Links
    document.querySelectorAll('.nav-link, a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                
                // Close hamburger menu if open
                const btn = document.getElementById('nav-hamburger');
                const links = document.getElementById('nav-links');
                if (btn && links) {
                    btn.classList.remove('open');
                    links.classList.remove('open');
                }

                // Refresh ScrollTrigger to ensure all dynamic heights/pins are current
                // For forward-scrolling, we refresh twice to catch any dynamic pin-spacing shifts
                ScrollTrigger.refresh();

                const performScroll = () => {
                    // We now consistently jump to the exact section top across all devices (mobile and desktop)
                    // The layout padding handles the header clearance
                    const target = targetElement;
                    const expectedHeaderHeight = 0;
                    const safetyBuffer = 0;
                    
                    // Refresh ScrollTrigger to ensure all dynamic heights/pins are current
                    ScrollTrigger.refresh();
                    
                    const startY = window.pageYOffset;
                    
                    // Helper to accurately calculate target destination
                    const getDestinationY = () => {
                        const originalTransform = target.style.transform;
                        target.style.transform = 'none';
                        const absoluteTop = target.getBoundingClientRect().top + window.pageYOffset;
                        target.style.transform = originalTransform;
                        return absoluteTop - expectedHeaderHeight - safetyBuffer;
                    };

                    const destinationY = getDestinationY();

                    // SKIP ANIMATION ZONE: If we are currently at Hero/Philosophy and going to any section below, 
                    // or vice-versa, we jump immediately to avoid the "Philosophy Scrub" effect.
                    const philosophySection = document.getElementById('philosophy');
                    if (philosophySection) {
                        const philTop = philosophySection.offsetTop;
                        const philEnd = philTop + 3500; // Match "+=3500" from initIntroTextScroll
                        
                        // Check if the scroll path crosses or starts/ends within the pinning zone
                        const isCrossingPhil = (startY < philEnd && destinationY > philTop) || 
                                               (startY > philTop && destinationY < philEnd);
                        
                        if (isCrossingPhil) {
                            window.scrollTo(0, destinationY);
                            // Also call refresh to make sure ScrollTrigger is in sync after jump
                            ScrollTrigger.refresh();
                            return;
                        }
                    }
                    
                    // Custom dynamic smooth scroll to handle 100vh mobile address bar shifts
                    const duration = 800; // ms
                    const startTime = performance.now();

                    function step(currentTime) {
                        const timeElapsed = currentTime - startTime;
                        let progress = Math.min(timeElapsed / duration, 1);
                        progress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

                        // Re-confirm destination on every frame to handle potential layout shifts/resizes
                        const currentDestinationY = getDestinationY();
                        const currentY = startY + (currentDestinationY - startY) * progress;

                        window.scrollTo(0, currentY);

                        if (timeElapsed < duration) {
                            requestAnimationFrame(step);
                        } else {
                            window.scrollTo(0, currentDestinationY);
                        }
                    }
                    requestAnimationFrame(step);
                };

                // Execute on next frame to ensure the refresh has propagated through the DOM
                requestAnimationFrame(performScroll);
            }
        });
    });
}

function initHeroAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Detect touch capability
    const isTouchDevice = !window.matchMedia('(hover: hover)').matches;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Mouse interaction
    const mouse = { x: null, y: null, radius: 180, active: false };
    const heroEl = document.querySelector('.hero');

    // Only add mouse interaction for devices that support hover
    if (!isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            const heroRect = heroEl.getBoundingClientRect();
            if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                let isButton = false;
                if (e.target instanceof Element) {
                    isButton = !!e.target.closest('a') || !!e.target.closest('button') || !!e.target.closest('.header');
                }
                mouse.active = !isButton;
            } else {
                mouse.active = false;
            }
        }, { passive: true });

        document.addEventListener('mouseleave', () => { mouse.active = false; }, { passive: true });
    }

    // Load PCB image — IMPORTANT: set onload BEFORE src to catch cached images
    const pcbImage = new Image();
    let imgX = 0, imgY = 0, imgW = 0, imgH = 0;
    const ACCENT = '#E97132';

    // ===== PRE-FILTERED OFFSCREEN CANVASES (eliminates per-frame CSS filter lag) =====
    const bgOff = document.createElement('canvas');
    const bgOffCtx = bgOff.getContext('2d');
    const lensOff = document.createElement('canvas');
    const lensOffCtx = lensOff.getContext('2d');
    let offscreenReady = false;

    function renderOffscreen() {
        if (!pcbImage.complete || pcbImage.width === 0 || !width) return;

        // Background: dim, inverted blueprint
        bgOff.width = width;
        bgOff.height = height;
        bgOffCtx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.4)';
        bgOffCtx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        bgOffCtx.filter = 'none';

        // Lens: brighter/crisper version for the magnified view
        lensOff.width = width;
        lensOff.height = height;
        lensOffCtx.filter = 'invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.7)';
        lensOffCtx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        lensOffCtx.filter = 'none';

        offscreenReady = true;
    }

    // ===== FISHEYE GRID (no getImageData — works on file:// and all protocols) =====
    // Pre-compute a grid of source displacement offsets for barrel distortion
    const GRID = 32; // Grid resolution (32×32 = 1024 cells — good balance)
    const fishGrid = []; // Array of { sx, sy } normalized source offsets per cell
    for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
            // Normalized coordinates for center of this cell (-1 to 1)
            const nx = (2 * (gx + 0.5) / GRID) - 1;
            const ny = (2 * (gy + 0.5) / GRID) - 1;
            const r = Math.sqrt(nx * nx + ny * ny);

            let snx = nx, sny = ny;
            if (r <= 1.0 && r > 0) {
                const nr = Math.min((r + (1.0 - Math.sqrt(1.0 - r * r))) / 2.0, 1.0);
                const theta = Math.atan2(ny, nx);
                snx = nr * Math.cos(theta);
                sny = nr * Math.sin(theta);
            }
            fishGrid.push({ snx, sny });
        }
    }

    // ===== RESIZE =====
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        if (pcbImage.complete && pcbImage.width > 0) {
            const imgAspect = pcbImage.width / pcbImage.height;
            const screenAspect = width / height;
            if (screenAspect > imgAspect) {
                imgW = width;
                imgH = imgW / imgAspect;
            } else {
                imgH = height;
                imgW = imgH * imgAspect;
            }
            imgX = (width - imgW) / 2;
            imgY = (height - imgH) / 2;
        }
        offscreenReady = false;
    }

    pcbImage.onload = () => { resize(); renderOffscreen(); };
    pcbImage.src = 'images/Data_diode_structure.png';

    // If already cached/complete, fire manually
    if (pcbImage.complete && pcbImage.naturalWidth > 0) {
        resize();
        renderOffscreen();
    }

    window.addEventListener('resize', () => { resize(); }, { passive: true });
    resize();

    // ===== SMOOTH LENS STATE =====
    let lensX = 0, lensY = 0, lensScale = 0, lensAlpha = 0;

    // ===== DRAW BACKGROUND (now just a cheap drawImage from pre-filtered cache) =====
    function drawPCBBackground() {
        if (!offscreenReady) renderOffscreen();
        if (!offscreenReady) return;
        ctx.save();
        // Slightly brighter background on mobile for better visibility
        ctx.globalAlpha = isTouchDevice ? 0.35 : 0.25;
        ctx.drawImage(bgOff, 0, 0);
        ctx.restore();
    }

    // ===== DRAW FISHEYE LENS =====
    function drawLens(time) {
        if (!offscreenReady) return;

        // Initialize lens in center on first frame
        if (width && height && lensX === 0) {
            lensX = width / 2;
            lensY = height / 2;
        }

        // Smooth interpolation
        if (mouse.active) {
            lensScale += (1 - lensScale) * 0.12;
            lensAlpha += (1 - lensAlpha) * 0.15;
            lensX += (mouse.x - lensX) * 0.15;
            lensY += (mouse.y - lensY) * 0.15;
        } else {
            lensScale += (0 - lensScale) * 0.25;
            lensAlpha += (0 - lensAlpha) * 0.35;
        }

        if (lensAlpha < 0.01 && lensScale < 0.01) return;
        lensScale = Math.max(0.001, Math.min(1, lensScale));
        lensAlpha = Math.max(0, Math.min(1, lensAlpha));

        const R = mouse.radius * lensScale;

        // Guard: skip drawing when lens is too small to render
        // (prevents DOMException from drawImage with near-zero source dimensions)
        if (R < 2) return;

        const zoom = 1.8;
        const cellW = (R * 2) / GRID;
        const cellH = (R * 2) / GRID;
        const halfView = R / zoom;

        // --- Fisheye content (clipped to circle, drawn ON TOP of background) ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(lensX, lensY, R, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = lensAlpha;

        for (let gy = 0; gy < GRID; gy++) {
            for (let gx = 0; gx < GRID; gx++) {
                const cell = fishGrid[gy * GRID + gx];
                const sx = lensX + cell.snx * halfView;
                const sy = lensY + cell.sny * halfView;
                const sw = halfView / GRID * 2;
                const sh = sw;
                const dx = lensX - R + gx * cellW;
                const dy = lensY - R + gy * cellH;

                ctx.drawImage(lensOff,
                    sx - sw / 2, sy - sh / 2, sw, sh,
                    dx, dy, cellW + 0.5, cellH + 0.5
                );
            }
        }

        // Vignette
        const vig = ctx.createRadialGradient(lensX, lensY, R * 0.5, lensX, lensY, R);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(0.8, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vig;
        ctx.fill();

        // Scanlines
        ctx.globalAlpha = 0.04 * lensAlpha;
        ctx.fillStyle = '#fff';
        const scanOff = (time * 0.03) % 4;
        for (let i = 0; i < R * 2; i += 4) {
            ctx.fillRect(lensX - R, lensY - R + i + scanOff, R * 2, 0.5);
        }

        ctx.restore();

        // ===== DEEP TECH LENS OVERLAY (white/grey palette) =====
        ctx.save();
        ctx.globalAlpha = lensAlpha;
        ctx.translate(lensX, lensY);

        // Outer glow (cool white)
        ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Main ring
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.stroke();

        // Outer precision ring
        ctx.beginPath();
        ctx.arc(0, 0, R + 5, 0, Math.PI * 2);
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();

        // Inner dashed measurement ring
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, R - 6), 0, Math.PI * 2);
        ctx.lineWidth = 0.6;
        ctx.setLineDash([2, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotating outer tech arcs (white/grey, 4 segments)
        const rot1 = time * 0.0004;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
            const a = rot1 + (i * Math.PI * 2) / 4;
            ctx.beginPath();
            ctx.arc(0, 0, R + 11, a, a + Math.PI / 14);
            ctx.strokeStyle = `rgba(180, 200, 220, ${0.3 + 0.15 * Math.sin(time * 0.002 + i)})`;
            ctx.stroke();
        }

        // Counter-rotating inner arcs (6 segments)
        const rot2 = -time * 0.0003;
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 6; i++) {
            const a = rot2 + (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0, R - 12), a, a + Math.PI / 22);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.stroke();
        }

        // Precision tick marks around circumference
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 36; i++) {
            const a = (i * Math.PI * 2) / 36;
            const inner = i % 9 === 0 ? R - 4 : R - 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
            ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
            ctx.stroke();
        }

        // Corner brackets
        const bLen = 12;
        const bOff = R * 0.42;
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(-bOff, -bOff + bLen); ctx.lineTo(-bOff, -bOff); ctx.lineTo(-bOff + bLen, -bOff);
        ctx.moveTo(bOff - bLen, -bOff); ctx.lineTo(bOff, -bOff); ctx.lineTo(bOff, -bOff + bLen);
        ctx.moveTo(-bOff, bOff - bLen); ctx.lineTo(-bOff, bOff); ctx.lineTo(-bOff + bLen, bOff);
        ctx.moveTo(bOff - bLen, bOff); ctx.lineTo(bOff, bOff); ctx.lineTo(bOff, bOff - bLen);
        ctx.stroke();

        // Crosshairs
        const chLen = 8;
        const chOff = Math.max(10, R * 0.15);
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(0, -chOff - chLen); ctx.lineTo(0, -chOff);
        ctx.moveTo(0, chOff); ctx.lineTo(0, chOff + chLen);
        ctx.moveTo(-chOff - chLen, 0); ctx.lineTo(-chOff, 0);
        ctx.moveTo(chOff, 0); ctx.lineTo(chOff + chLen, 0);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
        ctx.fill();

        // HUD readouts
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(`X:${Math.round(lensX)} Y:${Math.round(lensY)}`, chOff + 4, -4);
        ctx.fillText(`${zoom.toFixed(1)}x SCAN`, chOff + 4, 10);

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(180, 200, 220, 0.35)';
        ctx.font = '7px monospace';
        ctx.fillText('K4 · PHYSICAL LAYER ANALYSIS', 0, R - 16);

        ctx.restore();
    }

    // ===== VISIBILITY CHECK — skip rendering when hero off-screen =====
    let heroVisible = true;
    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(heroEl);
    }

    // ===== ANIMATION LOOP =====
    function animate(time) {
        requestAnimationFrame(animate);
        if (!heroVisible) return;

        ctx.clearRect(0, 0, width, height);
        drawPCBBackground();
        if (!isTouchDevice) drawLens(time); // Skip lens completely on mobile
    }

    requestAnimationFrame(animate);
}


function initCardSwap() {
    try {
        const container = document.querySelector('.card-swap-container');
        if (!container) return;

        const cards = Array.from(container.querySelectorAll('.card'));
        if (cards.length === 0) return;

        const total = cards.length;
        let order = cards.map((_, i) => i);
        let tlRef = null;

        let currentMode = null; // Track 'desktop' or 'mobile'

        const getLayoutSettings = () => {
            // Match the CSS media query perfectly (1200px)
            const isMobile = window.innerWidth <= 1200; 
            return {
                isMobile,
                cardDistance: isMobile ? 0 : 60,
                verticalDistance: isMobile ? 50 : 100, 
                skewAmount: isMobile ? 0 : 6
            };
        };

        const config = {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
        };

        const makeSlot = (i, distX, distY, total) => ({
            x: i * distX,
            y: -i * distY,
            z: -i * distX * 1.5,
            zIndex: total - i
        });

        const placeNow = (el, slot, skew) => {
            gsap.set(el, {
                x: slot.x,
                y: slot.y,
                z: slot.z,
                xPercent: -50,
                yPercent: -50,
                skewY: skew,
                transformOrigin: 'center center',
                zIndex: slot.zIndex,
                force3D: true
            });
        };

        const refreshLayout = () => {
            // Kill any active swap animation immediately on resize to prevent "lost" cards
            if (tlRef) {
                tlRef.kill();
                tlRef = null;
            }

            const settings = getLayoutSettings();
            const newMode = settings.isMobile ? 'mobile' : 'desktop';
            const modeSwitched = currentMode !== newMode;
            currentMode = newMode;

            // Clear all JS-managed styles to start fresh
            // This is essential for a 100% clean switch
            cards.forEach(el => {
                gsap.set(el, { 
                    clearProps: "all" 
                });
            });

            let finalCardHeight = 430; // Desktop default

            if (settings.isMobile) {
                // Efficient measurement for mobile
                let maxHeight = 0;
                const measureDiv = document.createElement('div');
                measureDiv.style.cssText = `position:absolute;visibility:hidden;width:${container.clientWidth}px;left:-9999px;pointer-events:none;`;
                document.body.appendChild(measureDiv);
                
                cards.forEach(card => {
                    const clone = card.cloneNode(true);
                    // Force the card to its natural height for measurement
                    clone.style.cssText = "position:relative;width:100%;height:auto;display:block;padding:2rem 1.5rem;box-sizing:border-box;";
                    measureDiv.appendChild(clone);
                    const h = clone.offsetHeight;
                    if (h > maxHeight) maxHeight = h;
                });
                
                document.body.removeChild(measureDiv);
                finalCardHeight = Math.max(300, maxHeight);
                
                const totalVerticalOffset = (total - 1) * settings.verticalDistance;
                container.style.height = `${finalCardHeight + totalVerticalOffset}px`;
            } else {
                // Fixed height for desktop to keep 3D origin stable
                container.style.height = "430px";
            }

            // Re-apply positioning
            order.forEach((originalIdx, currentPos) => {
                const el = cards[originalIdx];
                el.style.height = `${finalCardHeight}px`;
                const slot = makeSlot(currentPos, settings.cardDistance, settings.verticalDistance, total);
                placeNow(el, slot, settings.skewAmount);
            });

            // Ensure ScrollTrigger knows about the new container height immediately
            if (modeSwitched) {
                ScrollTrigger.refresh();
            }
        };

        const swap = (targetOriginalIndex = null) => {
            if (order.length < 2) return;
            if (tlRef && tlRef.isActive()) return;
            const settings = getLayoutSettings();
            let steps = 1;
            if (targetOriginalIndex !== null) {
                const targetIndexInOrder = order.indexOf(targetOriginalIndex);
                if (targetIndexInOrder === 0) return;
                steps = targetIndexInOrder;
            }

            const movingToBack = order.slice(0, steps);
            const movingForward = order.slice(steps);

            const tl = gsap.timeline({
                onComplete: () => {
                    order = [...movingForward, ...movingToBack];
                }
            });
            tlRef = tl;

            movingToBack.forEach((idx, i) => {
                const elFront = cards[idx];
                const backIndex = movingForward.length + i;
                const slot = makeSlot(backIndex, settings.cardDistance, settings.verticalDistance, total);

                tl.set(elFront, { zIndex: 100 }, i * 0.15);
                tl.to(elFront, {
                    y: '+=500',
                    z: slot.z,
                    duration: config.durDrop,
                    ease: config.ease
                }, i * 0.15);
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

            movingForward.forEach((idx, i) => {
                const el = cards[idx];
                const slot = makeSlot(i, settings.cardDistance, settings.verticalDistance, total);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(el, {
                    x: slot.x,
                    y: slot.y,
                    z: slot.z,
                    duration: config.durMove,
                    ease: config.ease
                }, `promote+=${i * 0.15}`);
            });

            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);

            movingToBack.forEach((idx, i) => {
                const elFront = cards[idx];
                const backIndex = movingForward.length + i;
                const slot = makeSlot(backIndex, settings.cardDistance, settings.verticalDistance, total);

                tl.set(elFront, { zIndex: slot.zIndex }, 'return');
                tl.to(elFront, {
                    x: slot.x,
                    y: slot.y,
                    duration: config.durReturn,
                    ease: config.ease
                }, `return+=${i * 0.15}`);
            });
        };

        // Initial placement
        refreshLayout();

        cards.forEach((card, i) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => swap(i));
        });

        // Dynamic resize listener
        window.addEventListener('resize', refreshLayout);



    } catch (err) {
        console.error("CardSwap initialization failed:", err);
    }
}

function initGrainient() {
    const cards = document.querySelectorAll('.card-swap-container .card');
    if (cards.length === 0) return;

    const vertSrc = `#version 300 es
    in vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

    const fragSrc = `#version 300 es
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uTimeSpeed;
    uniform float uColorBalance;
    uniform float uWarpStrength;
    uniform float uWarpFrequency;
    uniform float uWarpSpeed;
    uniform float uWarpAmplitude;
    uniform float uBlendAngle;
    uniform float uBlendSoftness;
    uniform float uRotationAmount;
    uniform float uNoiseScale;
    uniform float uGrainAmount;
    uniform float uGrainScale;
    uniform float uGrainAnimated;
    uniform float uContrast;
    uniform float uGamma;
    uniform float uSaturation;
    uniform vec2 uCenterOffset;
    uniform float uZoom;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    out vec4 fragColor;
    #define S(a,b,t) smoothstep(a,b,t)
    mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
    vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0,0)),f-vec2(0,0)),dot(-1.0+2.0*hash(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0,1)),f-vec2(0,1)),dot(-1.0+2.0*hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);return 0.5+0.5*n;}
    void main(){
      float t=iTime*uTimeSpeed;
      vec2 uv=gl_FragCoord.xy/iResolution.xy;
      float ratio=iResolution.x/iResolution.y;
      vec2 tuv=uv-0.5+uCenterOffset;
      tuv/=max(uZoom,0.001);
      float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
      tuv.y*=1.0/ratio;
      tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
      tuv.y*=ratio;
      float frequency=uWarpFrequency;
      float ws=max(uWarpStrength,0.001);
      float amplitude=uWarpAmplitude/ws;
      float warpTime=t*uWarpSpeed;
      tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
      tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);
      vec3 colLav=uColor1;
      vec3 colOrg=uColor2;
      vec3 colDark=uColor3;
      float b=uColorBalance;
      float s=max(uBlendSoftness,0.0);
      mat2 blendRot=Rot(radians(uBlendAngle));
      float blendX=(tuv*blendRot).x;
      float edge0=-0.3-b-s;
      float edge1=0.2-b+s;
      float v0=0.5-b+s;
      float v1=-0.3-b-s;
      vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
      vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
      vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));
      vec2 grainUv=uv*max(uGrainScale,0.001);
      if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
      float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
      col+=(grain-0.5)*uGrainAmount;
      col=(col-0.5)*uContrast+0.5;
      float luma=dot(col,vec3(0.2126,0.7152,0.0722));
      col=mix(vec3(luma),col,uSaturation);
      col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
      col=clamp(col,0.0,1.0);
      fragColor=vec4(col,1.0);
    }`;

    const hexToRgb = hex => {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [1, 1, 1];
    };

    function compile(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Grainient shader error:', gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    }

    function link(gl) {
        const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
        const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
        if (!vs || !fs) return null;
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            console.error('Grainient link error:', gl.getProgramInfoLog(p));
            return null;
        }
        return p;
    }

    const params = {
        timeSpeed: 0.25, colorBalance: 0, warpStrength: 1, warpFrequency: 5,
        warpSpeed: 2, warpAmplitude: 50, blendAngle: 0, blendSoftness: 0.05,
        rotationAmount: 500, noiseScale: 2, grainAmount: 0.1, grainScale: 2,
        grainAnimated: false, contrast: 1.5, gamma: 1, saturation: 1,
        centerX: 0, centerY: 0, zoom: 0.9,
        color1: '#E97132', color2: '#1a0a00', color3: '#331500'
    };

    const cardColors = [
        { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
        { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
        { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
        { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
    ];

    const contexts = [];

    cards.forEach((card, cardIndex) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'grainient-canvas';
        card.insertBefore(canvas, card.firstChild);

        const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
        if (!gl) return;

        const program = link(gl);
        if (!program) return;

        gl.useProgram(program);

        // Fullscreen triangle
        const posLoc = gl.getAttribLocation(program, 'position');
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Set static uniforms
        const u = name => gl.getUniformLocation(program, name);
        gl.uniform1f(u('uTimeSpeed'), params.timeSpeed);
        gl.uniform1f(u('uColorBalance'), params.colorBalance);
        gl.uniform1f(u('uWarpStrength'), params.warpStrength);
        gl.uniform1f(u('uWarpFrequency'), params.warpFrequency);
        gl.uniform1f(u('uWarpSpeed'), params.warpSpeed);
        gl.uniform1f(u('uWarpAmplitude'), params.warpAmplitude);
        gl.uniform1f(u('uBlendAngle'), params.blendAngle);
        gl.uniform1f(u('uBlendSoftness'), params.blendSoftness);
        gl.uniform1f(u('uRotationAmount'), params.rotationAmount);
        gl.uniform1f(u('uNoiseScale'), params.noiseScale);
        gl.uniform1f(u('uGrainAmount'), params.grainAmount);
        gl.uniform1f(u('uGrainScale'), params.grainScale);
        gl.uniform1f(u('uGrainAnimated'), params.grainAnimated ? 1.0 : 0.0);
        gl.uniform1f(u('uContrast'), params.contrast);
        gl.uniform1f(u('uGamma'), params.gamma);
        gl.uniform1f(u('uSaturation'), params.saturation);
        gl.uniform2f(u('uCenterOffset'), params.centerX, params.centerY);
        gl.uniform1f(u('uZoom'), params.zoom);

        const colors = cardColors[cardIndex % cardColors.length];
        gl.uniform3fv(u('uColor1'), hexToRgb(colors.color1));
        gl.uniform3fv(u('uColor2'), hexToRgb(colors.color2));
        gl.uniform3fv(u('uColor3'), hexToRgb(colors.color3));

        contexts.push({ canvas, gl, program, uTime: u('iTime'), uRes: u('iResolution'), card });
    });

    if (contexts.length === 0) return;

    const t0 = performance.now();
    function render(t) {
        const time = (t - t0) * 0.001;
        contexts.forEach(ctx => {
            const rect = ctx.card.getBoundingClientRect();
            const w = Math.max(1, Math.floor(rect.width));
            const h = Math.max(1, Math.floor(rect.height));
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cw = Math.floor(w * dpr);
            const ch = Math.floor(h * dpr);
            if (ctx.canvas.width !== cw || ctx.canvas.height !== ch) {
                ctx.canvas.width = cw;
                ctx.canvas.height = ch;
            }
            ctx.gl.viewport(0, 0, cw, ch);
            ctx.gl.useProgram(ctx.program);
            ctx.gl.uniform1f(ctx.uTime, time);
            ctx.gl.uniform2f(ctx.uRes, cw, ch);
            ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, 3);
        });
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initPlasma() {
    const canvas = document.getElementById('plasma-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vertSrc = `#version 300 es
precision highp float;
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    const fragSrc = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  float i, d, z, T = iTime * uSpeed;
  vec3 O, p, S;
  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 finalColor = intensity * uCustomColor;
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

    function compile(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Plasma shader error:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Plasma link error:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    // Fullscreen triangle
    const posLoc = gl.getAttribLocation(program, 'position');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Set uniforms
    const u = name => gl.getUniformLocation(program, name);
    gl.uniform3fv(u('uCustomColor'), [177 / 255, 158 / 255, 239 / 255]); // #B19EEF exact custom color
    gl.uniform1f(u('uSpeed'), 0.6 * 0.4); // speed * 0.4 as in React
    gl.uniform1f(u('uScale'), 1.1);
    gl.uniform1f(u('uOpacity'), 0.8);

    const uTime = u('iTime');
    const uRes = u('iResolution');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Visibility check — skip GPU work when pilot section is off-screen
    let plasmaVisible = false;
    const pilotSection = document.getElementById('pilot');
    if ('IntersectionObserver' in window && pilotSection) {
        const obs = new IntersectionObserver((entries) => {
            plasmaVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        obs.observe(pilotSection);
    } else {
        plasmaVisible = true;
    }

    const t0 = performance.now();
    function render(now) {
        requestAnimationFrame(render);
        if (!plasmaVisible) return;

        const card = canvas.parentElement;
        if (!card) return;
        const cw = card.clientWidth;
        const ch = card.clientHeight;
        if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
        }
        gl.viewport(0, 0, cw, ch);
        gl.useProgram(program);
        gl.uniform1f(uTime, (now - t0) * 0.001);
        gl.uniform2f(uRes, cw, ch);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(render);
}

function initNASAnimation() {
    const canvas = document.getElementById('nas-scroll-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load only the specific 'exploded' render
    const img = new Image();
    img.src = 'images/K4 NAS render exploded.png';

    function draw() {
        if (!img.complete || img.naturalWidth === 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
    }

    img.onload = () => {
        draw();
        // Refresh ScrollTrigger as the layout is now stable without pinning
        ScrollTrigger.refresh();
    };

    window.addEventListener('resize', draw);
}

function initPilotForm() {
    const form = document.getElementById('pilot-form');
    if (!form) return;

    const inputs = form.querySelectorAll('.pilot-form-input[required]');

    inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', () => {
            validateInput(input);
        });

        // Remove error on input/change
        ['input', 'change'].forEach(evt => {
            input.addEventListener(evt, () => {
                input.classList.remove('invalid');
                const formGroup = input.closest('.form-group');
                const errorMsg = formGroup ? formGroup.querySelector('.form-error') : null;
                if (errorMsg) errorMsg.classList.remove('visible');
            });
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            // Visual feedback: Sending...
            btn.disabled = true;
            btn.textContent = 'Sending Application...';
            btn.style.background = '#E97132';

            const formData = new FormData(form);
            
            // To make the background submission work seamlessly, we use fetch()
            // Sending it to Formspree (or any form backend)
            fetch('https://formspree.io/f/xnjglybp', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(async response => {
                if (response.ok) {
                    // Success!
                    btn.textContent = 'Success! Application Sent';
                    btn.style.background = '#00C853';
                    form.reset();
                    // Reset button after a delay
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = originalText;
                        btn.style.background = '';
                    }, 5000);
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        console.error('Formspree Errors:', data.errors);
                        throw new Error(data.errors.map(e => e.message).join(', '));
                    } else {
                        throw new Error('Network response was not ok');
                    }
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                btn.textContent = 'Error! Please try again';
                btn.style.background = '#ff4d4d';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 3000);
            });
        }
    });

    function validateInput(input) {
        const formGroup = input.closest('.form-group');
        const errorMsg = formGroup ? formGroup.querySelector('.form-error') : null;
        if (!errorMsg) return true;

        if (!input.validity.valid) {
            input.classList.add('invalid');
            errorMsg.classList.add('visible');
            return false;
        } else {
            input.classList.remove('invalid');
            errorMsg.classList.remove('visible');
            return true;
        }
    }
}
