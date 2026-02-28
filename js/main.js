document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

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
    initScrollAnimations();
    initHeroAnimation();
    initNavScroll();
    initProduct3D();
    initIntroTextScroll();
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

    // Generate organic starfield
    for (let i = 0; i < 1500; i++) {
        const x = Math.random() * cw;
        const y = Math.random() * ch;

        let maxRadius = 0.8;
        let p = Math.random();
        if (p > 0.9) maxRadius = 1.8;
        if (p > 0.98) maxRadius = 3;

        const radius = Math.random() * maxRadius;
        const opacity = Math.random() * 0.8 + 0.2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        const isBlue = Math.random() > 0.8;
        const isOrange = Math.random() > 0.95;

        if (isBlue) {
            ctx.fillStyle = `rgba(180, 210, 255, ${opacity})`;
        } else if (isOrange) {
            ctx.fillStyle = `rgba(255, 180, 140, ${opacity})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        }

        ctx.fill();

        // Glow for larger objects
        if (maxRadius > 1.8) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    const addNebula = (cx, cy, r, c1, c2) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };

    // Minimalist space nebulas
    addNebula(cw * 0.3, ch * 0.4, 1000, 'rgba(0, 80, 255, 0.04)', 'transparent');
    addNebula(cw * 0.8, ch * 0.7, 1200, 'rgba(233, 113, 50, 0.03)', 'transparent');
    addNebula(cw * 0.5, ch * 0.9, 1000, 'rgba(100, 0, 255, 0.02)', 'transparent');

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

    // Single combined ScrollTrigger: pins AND scrubs the animation together
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2200", // Increased pinning distance slightly to give the last text time to fade before unpinning
            pin: true,
            scrub: 1,
        }
    });

    // Animate texts sequentially (uniform timing for all three)
    const fadeIn = 0.8;
    const hold = 1.0;
    const fadeOut = 0.8;

    texts.forEach((text, index) => {
        // Fade In with transition
        tl.to(text, {
            opacity: 1,
            y: "-50%",
            duration: fadeIn,
            ease: "power2.out"
        });

        // Hold
        tl.to({}, { duration: hold });

        // Fade Out (ensure the last text also fades out before pinning ends)
        tl.to(text, {
            opacity: 0,
            y: "-80%",
            duration: fadeOut,
            ease: "power2.in"
        });
    });

    // Background Animation — covers the ENTIRE timeline
    if (bg) {
        tl.to(bg, {
            rotation: 4,
            scale: 1.15,
            x: "-1%",
            y: "0.5%",
            ease: "sine.inOut",
            duration: tl.duration()
        }, 0);
    }
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

    // Other elements animate on scroll
    allRevealElements.forEach(element => {
        if (element.closest('.hero')) return; // Skip hero elements

        gsap.fromTo(element,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

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
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initHeroAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Mouse interaction
    const mouse = { x: null, y: null, radius: 180, active: false };
    const heroEl = document.querySelector('.hero');

    window.addEventListener('mousemove', (e) => {
        const heroRect = heroEl.getBoundingClientRect();

        // If mouse is within the hero section vertically
        if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;

            // Hide lens if hovering over buttons, links, or header
            let isButton = false;
            if (e.target instanceof Element) {
                isButton = !!e.target.closest('a') || !!e.target.closest('button') || !!e.target.closest('.header');
            }
            mouse.active = !isButton;
        } else {
            mouse.active = false;
        }
    });

    // Handle leaving the browser window completely
    document.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Load the exact PCB image
    const pcbImage = new Image();
    pcbImage.src = 'images/Data_diode_structure.png';

    let imgX = 0, imgY = 0, imgW = 0, imgH = 0;
    const ACCENT = '#E97132';

    // ===== RESIZE =====
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        if (pcbImage.complete && pcbImage.width > 0) {
            const imgAspect = pcbImage.width / pcbImage.height;
            const screenAspect = width / height;

            if (screenAspect > imgAspect) {
                // Screen is wider than image -> width matches
                imgW = width * 1.0;
                imgH = imgW / imgAspect;
            } else {
                // Screen is taller -> height matches
                imgH = height * 1.0;
                imgW = imgH * imgAspect;
            }
            imgX = (width - imgW) / 2;
            imgY = (height - imgH) / 2;
        }
    }

    // Once image loads, recalculate everything
    pcbImage.onload = resize;
    window.addEventListener('resize', resize);
    resize();

    // ===== DRAW PCB IMAGE =====
    function drawPCBBackground() {
        if (!pcbImage.complete || pcbImage.width === 0) return;

        ctx.save();
        // The image is mostly white/grey, the site is dark.
        // We invert and tint it to look like a stealthy blueprint behind everything.
        ctx.globalAlpha = 0.25;
        ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.4)';
        ctx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        ctx.restore();
    }

    // ===== LENS EFFECT =====
    // Smooth mouse position for the lens to feel heavier/more premium
    let lensX = 0;
    let lensY = 0;
    let lensScale = 0; // for size
    let lensAlpha = 0; // independent opacity

    function drawLens(time) {
        if (!pcbImage.complete || pcbImage.width === 0) return;

        // Initialize lens exactly in the center of the screen initially
        if (width && height && lensX === 0) {
            lensX = width / 2;
            lensY = height / 2;
        }

        // Epic appear/disappear mechanics
        if (mouse.active) {
            // Smoothly open and fade in
            lensScale += (1 - lensScale) * 0.12;
            lensAlpha += (1 - lensAlpha) * 0.15;

            // Track mouse smoothly
            lensX += (mouse.x - lensX) * 0.15;
            lensY += (mouse.y - lensY) * 0.15;
        } else {
            // Sharp mechanical snap to close, fades out super fast
            lensScale += (0 - lensScale) * 0.25;
            lensAlpha += (0 - lensAlpha) * 0.35;
        }

        if (lensAlpha < 0.01 && lensScale < 0.01) return;

        // Ensure bounds
        lensScale = Math.max(0.001, Math.min(1, lensScale));
        lensAlpha = Math.max(0, Math.min(1, lensAlpha));

        const currentRadius = mouse.radius * lensScale;
        const zoom = 1.8;

        ctx.save();

        // --- NEW: Epic Ambient Underglow ---
        ctx.beginPath();
        const underGlow = ctx.createRadialGradient(lensX, lensY, currentRadius * 0.5, lensX, lensY, currentRadius * 1.8);
        underGlow.addColorStop(0, `rgba(233, 113, 50, ${0.15 * lensAlpha})`);
        underGlow.addColorStop(1, 'rgba(233, 113, 50, 0)');
        ctx.fillStyle = underGlow;
        ctx.arc(lensX, lensY, currentRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 1. Create Clipping Mask for the Lens
        ctx.beginPath();
        ctx.arc(lensX, lensY, currentRadius, 0, Math.PI * 2);
        ctx.clip();

        // 2. Clear background inside lens to ensure no ghosting if we use different alpha
        ctx.clearRect(lensX - currentRadius, lensY - currentRadius, currentRadius * 2, currentRadius * 2);

        // 3. Draw the zoomed image inside the lens
        ctx.save();
        // Move to lens center, scale around it
        ctx.translate(lensX, lensY);
        ctx.scale(zoom, zoom);
        ctx.translate(-lensX, -lensY);

        // Filter for the zoomed area: make it crisper, slightly brighter, and higher opacity
        ctx.globalAlpha = 0.9 * lensAlpha;
        ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.6) contrast(1.8)'; // Increased brightness
        ctx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        ctx.restore();

        // --- NEW: Inner Lens Edge Glow (Glass / Optical Effect) ---
        ctx.save();
        ctx.translate(lensX, lensY);
        const innerGlow = ctx.createRadialGradient(0, 0, currentRadius * 0.6, 0, 0, currentRadius);
        innerGlow.addColorStop(0, 'rgba(233, 113, 50, 0)');
        innerGlow.addColorStop(0.8, 'rgba(233, 113, 50, 0.05)');
        innerGlow.addColorStop(1, 'rgba(233, 113, 50, 0.45)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Tech Overlay within the lens (Scanlines / Grid)
        ctx.globalAlpha = 0.15 * lensAlpha;
        ctx.fillStyle = ACCENT;
        // Animated panning scanlines for a dynamic scanning feel
        const scanOffset = (time * 0.02) % 4;
        for (let i = 0; i < currentRadius * 2; i += 4) {
            ctx.fillRect(lensX - currentRadius, lensY - currentRadius + i + scanOffset, currentRadius * 2, 1);
        }

        ctx.restore(); // remove clip

        // 5. Draw Lens Border/Tech UI
        ctx.save();
        ctx.globalAlpha = lensAlpha;
        ctx.translate(lensX, lensY);

        // Epic soft glow behind border
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 30; // Increased for a brilliant aura

        // Main Ring
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(233, 113, 50, 0.9)`;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // --- NEW: Secondary optical focus ring ---
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius + 2, 0, Math.PI * 2);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.stroke();

        // Inner dashed ring
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, currentRadius - 8), 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.strokeStyle = `rgba(233, 113, 50, 0.4)`;
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer tech segments
        ctx.lineWidth = 3;
        ctx.strokeStyle = ACCENT;
        const segmentCount = 4;
        const segmentLength = Math.PI / 8;
        const offsetRotation = time * 0.0005; // slowly rotate the outer ring

        for (let i = 0; i < segmentCount; i++) {
            const angle = offsetRotation + (i * Math.PI * 2) / segmentCount;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius + 6, angle, angle + segmentLength);
            ctx.stroke();
        }

        // Crosshairs
        const chLength = 15;
        const chOffset = Math.max(10, currentRadius * 0.2); // clear center
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;

        // Center cross
        ctx.beginPath();
        ctx.moveTo(0, -chOffset - chLength);
        ctx.lineTo(0, -chOffset);
        ctx.moveTo(0, chOffset);
        ctx.lineTo(0, chOffset + chLength);
        ctx.moveTo(-chOffset - chLength, 0);
        ctx.lineTo(-chOffset, 0);
        ctx.moveTo(chOffset, 0);
        ctx.lineTo(chOffset + chLength, 0);
        ctx.stroke();

        // Optional center coordinate text for deep tech feel
        ctx.font = '10px monospace';
        ctx.fillStyle = `rgba(233, 113, 50, 0.8)`;
        ctx.fillText(`X:${Math.round(lensX)} Y:${Math.round(lensY)}`, chOffset + 10, 4);

        ctx.restore();
    }

    // ===== ANIMATION LOOP =====
    function animate(time) {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        drawPCBBackground();
        drawLens(time);
    }

    requestAnimationFrame(animate);
}

function initProduct3D() {
    const container = document.querySelector('.product-visual');
    const image = document.querySelector('.product-img');

    if (!container || !image) return;

    // Track global mouse position for scroll checking
    let mouseX = null;
    let mouseY = null;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const resetTilt = () => {
        gsap.to(container, {
            rotationX: 0,
            rotationY: 0,
            ease: "elastic.out(1, 0.5)",
            duration: 1
        });
    };

    const updateTilt = (x, y) => {
        container.classList.remove('force-inactive');

        const rect = container.getBoundingClientRect();
        const xRel = x - rect.left - rect.width / 2;
        const yRel = y - rect.top - rect.height / 2;

        // Update CSS variables for Glow Position
        // Percentages relative to the container for CSS left/top
        const xPct = ((x - rect.left) / rect.width) * 100;
        const yPct = ((y - rect.top) / rect.height) * 100;

        container.style.setProperty('--mouse-x', `${xPct}%`);
        container.style.setProperty('--mouse-y', `${yPct}%`);

        const rotateMax = 10;
        const rotateX = -(yRel / (rect.height / 2)) * rotateMax;
        const rotateY = (xRel / (rect.width / 2)) * rotateMax;

        gsap.to(container, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: "power1.out",
            duration: 0.5
        });
    };

    container.addEventListener('mousemove', (e) => {
        updateTilt(e.clientX, e.clientY);
    });

    // Ensure we trigger active state when scrolling onto the element (browser fires mouseenter)
    container.addEventListener('mouseenter', (e) => {
        // Update global trackers in case they were null
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateTilt(e.clientX, e.clientY);
    });

    container.addEventListener('mouseleave', resetTilt);

    // Check on scroll if mouse is still over the element
    window.addEventListener('scroll', () => {
        if (mouseX === null || mouseY === null) return;

        const rect = container.getBoundingClientRect();
        // Check if mouse is within bounds
        const isOver = (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        );

        if (!isOver) {
            resetTilt();
            container.classList.add('force-inactive');
        } else {
            // Optional: Update tilt as the element moves under the static mouse
            container.classList.remove('force-inactive');
            updateTilt(mouseX, mouseY);
        }
    });
}
