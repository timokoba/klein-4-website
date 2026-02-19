document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initScrollAnimations();
    initHeroAnimation();
    initNavScroll();
    initProduct3D();
    initIntroTextScroll();
});

function initIntroTextScroll() {
    const section = document.querySelector('.intro-text');
    const bg = document.querySelector('.intro-bg');
    const texts = document.querySelectorAll('.anim-text');
    const final = document.querySelector('.anim-text-final');
    const finalImage = document.querySelector('.anim-image-final');
    const light = document.querySelector('.intro-epic-light');

    if (!section || texts.length === 0) return;

    // Create a timeline that pins the section
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3500", // Increased scroll distance
            pin: true,
            scrub: 1,
        }
    });

    // Background Animation (Drift over entire sequence)
    if (bg) {
        tl.to(bg, {
            scale: 1.3,
            rotation: 25,
            ease: "none",
            duration: texts.length * 2 + 7 // Duration covers text + final paragraph + image
        }, 0);
    }

    // Animate texts sequentially
    texts.forEach((text, index) => {
        // Fade In
        tl.to(text, {
            opacity: 1,
            y: "-50%",
            duration: 0.8,
            ease: "power2.out"
        });

        // Hold
        tl.to({}, { duration: 0.8 });

        // Fade Out
        tl.to(text, {
            opacity: 0,
            y: "-80%",
            duration: 0.8,
            ease: "power2.in"
        });
    });

    // Reveal final P tag
    tl.to(final, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    });

    // Hold P tag
    tl.to({}, { duration: 1.5 });

    // Fade Out P tag
    tl.to(final, {
        opacity: 0,
        y: "-20px",
        duration: 1,
        ease: "power2.in"
    });

    // Reveal Final Image with Deep Tech Scan Effect & Epic Light
    if (finalImage) {
        // Use fromTo for precise control of the 'tech reveal'
        tl.fromTo(finalImage,
            {
                opacity: 1,
                top: "50%",
                scale: 1.1,
                clipPath: "inset(45% 0 45% 0)", // Start as thin line
                filter: "brightness(2) blur(10px)" // Bright and blurry (Screenshot 1)
            },
            {
                clipPath: "inset(0% 0 0% 0)", // Open up cleanly
                filter: "brightness(1) blur(0px)", // Focus (Screenshot 2)
                scale: 1,
                duration: 2.5,
                ease: "power3.inOut"
            }
        );

        // Animate Light Burst in sync
        if (light) {
            // Start centered and small
            tl.fromTo(light,
                { scale: 0, opacity: 0 },
                { scale: 1.5, opacity: 0.6, duration: 1.5, ease: "power2.out" },
                "<" // Start at same time as image reveal
            );
            // Fade out light as image settles
            tl.to(light,
                { opacity: 0, scale: 2, duration: 1, ease: "power2.in" },
                "-=1" // Overlap end of reveal
            );
        }

        // Hold Image
        tl.to({}, { duration: 2 });
    }
}

function initScrollAnimations() {
    // Reveal elements on scroll
    const revealElements = document.querySelectorAll('[data-reveal]');

    revealElements.forEach(element => {
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
    const mouse = { x: null, y: null, radius: 280 };
    const heroEl = document.querySelector('.hero');

    heroEl.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    heroEl.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    // ---- PCB Data ----
    let traces = [];
    let components = [];
    let pulses = [];
    let ambientPulses = [];

    const ACCENT = '#E97132';
    const ACCENT_GLOW = 'rgba(233, 113, 50, ';

    // Grey color palette
    const COL = {
        trace: 'rgba(60, 60, 66, 0.5)',
        pad: 'rgba(70, 70, 78, 0.5)',
        padFill: 'rgba(45, 45, 52, 0.6)',
        chipBody: 'rgba(18, 18, 22, 0.9)',
        chipBorder: 'rgba(65, 65, 72, 0.6)',
        pin: 'rgba(75, 75, 82, 0.6)',
        pinHL: 'rgba(90, 90, 98, 0.5)',
        smd: 'rgba(55, 50, 48, 0.7)',
        smdPad: 'rgba(75, 75, 82, 0.55)',
        hole: 'rgba(30, 30, 35, 0.9)',
        holeRing: 'rgba(70, 70, 78, 0.5)',
        conn: 'rgba(50, 50, 56, 0.7)',
        connBorder: 'rgba(80, 80, 88, 0.5)',
        crystal: 'rgba(60, 55, 50, 0.6)',
        crystalPad: 'rgba(75, 70, 65, 0.5)',
        diode: 'rgba(50, 50, 56, 0.7)',
        fiducial: 'rgba(65, 65, 72, 0.4)',
        label: 'rgba(70, 70, 78, 0.25)',
    };

    // Seeded random
    let seed = 42;
    function sr() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    // ===== GENERATE PCB (Data Diode layout) =====
    function generatePCB() {
        seed = 42;
        traces = [];
        components = [];

        // Board proportions matching the ~2:1 data diode render
        const boardW = 680;
        const boardH = 340;

        // Tile boards to cover viewport
        const tilesX = Math.ceil(width / boardW) + 1;
        const tilesY = Math.ceil(height / boardH) + 1;
        const offX = -(tilesX * boardW - width) / 2;
        const offY = -(tilesY * boardH - height) / 2;

        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                generateBoard(offX + tx * boardW, offY + ty * boardH, boardW, boardH);
            }
        }
    }

    function generateBoard(bx, by, bw, bh) {
        const s = bw / 680; // scale factor

        // ---- Mounting Holes (4 corners) ----
        const hR = 10 * s, hI = 22 * s;
        [
            [bx + hI, by + hI], [bx + bw - hI, by + hI],
            [bx + hI, by + bh - hI], [bx + bw - hI, by + bh - hI]
        ].forEach(([x, y]) => components.push({ type: 'hole', x, y, r: hR }));

        // ---- QFP-64 ICs (two large, like in the render) ----
        components.push({ type: 'qfp', x: bx + 155 * s, y: by + 78 * s, size: 68 * s, pins: 13 });
        components.push({ type: 'qfp', x: bx + 425 * s, y: by + 72 * s, size: 68 * s, pins: 13 });

        // ---- SOIC chips (U2, U3, U4, U5, U7 etc.) ----
        [
            [82, 195, 30, 24, 4],
            [138, 200, 26, 20, 4],
            [82, 260, 30, 24, 4],
            [528, 198, 24, 20, 4],
            [508, 258, 24, 20, 3],
            [528, 130, 20, 16, 3],
        ].forEach(([x, y, w, h, pins]) =>
            components.push({ type: 'soic', x: bx + x * s, y: by + y * s, w: w * s, h: h * s, pins })
        );

        // ---- SMD components (capacitors, resistors – small rectangles) ----
        [
            // Left region
            [98, 58, 11, 5], [98, 78, 11, 5], [118, 48, 11, 5],
            [143, 46, 11, 5], [98, 100, 11, 5], [113, 112, 9, 4],
            [128, 158, 11, 5], [153, 248, 9, 4], [173, 265, 9, 4],
            // Center
            [278, 198, 13, 6], [253, 218, 11, 5],
            // Right region
            [398, 53, 11, 5], [423, 46, 11, 5], [443, 93, 11, 5],
            [383, 103, 11, 5], [458, 58, 9, 4], [418, 163, 11, 5],
            // Far right
            [553, 173, 11, 5], [568, 243, 11, 5], [588, 258, 11, 5],
            // Bottom
            [358, 273, 13, 6], [383, 208, 11, 5],
        ].forEach(([x, y, w, h]) =>
            components.push({ type: 'smd', x: bx + x * s, y: by + y * s, w: w * s, h: h * s })
        );

        // ---- Optocoupler OC1 (larger package) ----
        components.push({
            type: 'soic', x: bx + 328 * s, y: by + 213 * s,
            w: 40 * s, h: 30 * s, pins: 5
        });

        // ---- Crystal oscillators ----
        [
            [68, 143, 17], [388, 98, 17]
        ].forEach(([x, y, sz]) =>
            components.push({ type: 'crystal', x: bx + x * s, y: by + y * s, size: sz * s })
        );

        // ---- USB connectors (edges) ----
        components.push({ type: 'usb', x: bx - 4 * s, y: by + 168 * s, w: 32 * s, h: 38 * s });
        components.push({ type: 'usb', x: bx - 4 * s, y: by + 113 * s, w: 24 * s, h: 28 * s });
        components.push({ type: 'usb', x: bx + bw - 28 * s, y: by + 168 * s, w: 32 * s, h: 38 * s });

        // ---- Through-hole pads (J2 connector area) ----
        const j2x = bx + 278 * s, j2y = by + 103 * s;
        for (let i = 0; i < 4; i++) {
            components.push({ type: 'thpad', x: j2x + i * 14 * s, y: j2y, r: 5.5 * s, drill: 3 * s });
        }
        for (let i = 0; i < 3; i++) {
            components.push({ type: 'thpad', x: j2x + 5 * s + i * 14 * s, y: j2y + 18 * s, r: 5.5 * s, drill: 3 * s });
        }

        // ---- J4 pads (right side) ----
        const j4x = bx + 553 * s, j4y = by + 88 * s;
        for (let r = 0; r < 2; r++)
            for (let c = 0; c < 3; c++)
                components.push({ type: 'thpad', x: j4x + c * 13 * s, y: j4y + r * 16 * s, r: 5 * s, drill: 2.5 * s });

        // ---- Fiducial markers ----
        [[38, 83], [bw / s - 32, bh / s - 27], [bw / s - 67, 53]].forEach(([x, y]) =>
            components.push({ type: 'fiducial', x: bx + x * s, y: by + y * s, r: 5 * s })
        );

        // ---- Data Diode arrow symbol (center-bottom) ----
        components.push({ type: 'diode', x: bx + 238 * s, y: by + 268 * s, size: 28 * s });

        // ---- Silkscreen text ----
        components.push({ type: 'label', x: bx + 228 * s, y: by + 40 * s, text: 'revision 1a', size: 14 * s });

        // ---- TRACES (routing that mimics the real board) ----
        const T = (x1, y1, x2, y2) =>
            traces.push({ x1: bx + x1 * s, y1: by + y1 * s, x2: bx + x2 * s, y2: by + y2 * s });

        // Horizontal buses
        T(48, 63, 148, 63); T(220, 63, 398, 63); T(498, 63, 598, 63);
        T(38, 143, 143, 143); T(223, 143, 423, 143); T(498, 143, 548, 143);
        T(28, 208, 78, 208); T(173, 208, 248, 208); T(373, 228, 518, 228);
        T(538, 208, 638, 208); T(78, 278, 228, 278); T(298, 273, 498, 273);
        T(528, 283, 618, 283);

        // Vertical traces
        T(58, 43, 58, 143); T(88, 63, 88, 193); T(118, 48, 118, 78);
        T(128, 158, 128, 198); T(83, 218, 83, 258); T(198, 78, 198, 143);
        T(268, 103, 268, 208); T(338, 143, 338, 213); T(248, 218, 248, 278);
        T(428, 138, 428, 228); T(478, 73, 478, 143); T(518, 143, 518, 198);
        T(553, 108, 553, 173); T(568, 208, 568, 283); T(598, 63, 598, 208);
        T(153, 46, 153, 76); T(443, 46, 443, 73); T(383, 98, 383, 143);

        // Extra detail traces
        T(113, 78, 153, 78); T(68, 143, 68, 193); T(155, 148, 198, 148);
        T(240, 108, 268, 108); T(338, 168, 383, 168); T(428, 168, 478, 168);
        T(498, 98, 553, 98); T(388, 228, 388, 273); T(173, 208, 173, 248);
        T(248, 63, 248, 103); T(308, 143, 308, 213); T(448, 228, 448, 273);
        T(78, 208, 78, 258); T(538, 208, 538, 258); T(618, 208, 618, 283);
    }

    // ===== COMPONENT DRAWING =====
    function drawMountingHole(h) {
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = COL.holeRing; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fillStyle = COL.hole; ctx.fill();
        ctx.beginPath(); ctx.arc(h.x, h.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = COL.holeRing; ctx.fill();
    }

    function drawQFP(c) {
        const sz = c.size;
        const gap = sz / (c.pins + 1);
        const pinL = 6, pinW = 2.5;

        // Body
        ctx.fillStyle = COL.chipBody; ctx.strokeStyle = COL.chipBorder; ctx.lineWidth = 1;
        ctx.fillRect(c.x, c.y, sz, sz); ctx.strokeRect(c.x, c.y, sz, sz);

        // Die pad
        const d = sz * 0.28;
        ctx.fillStyle = 'rgba(35, 35, 40, 0.5)';
        ctx.fillRect(c.x + d, c.y + d, sz - d * 2, sz - d * 2);

        // Pin 1 marker
        ctx.beginPath(); ctx.arc(c.x + 8, c.y + 8, 3, 0, Math.PI * 2);
        ctx.strokeStyle = COL.pinHL; ctx.lineWidth = 1; ctx.stroke();

        // Pins on 4 sides
        ctx.fillStyle = COL.pin;
        for (let i = 1; i <= c.pins; i++) {
            ctx.fillRect(c.x + i * gap - pinW / 2, c.y - pinL, pinW, pinL);      // top
            ctx.fillRect(c.x + i * gap - pinW / 2, c.y + sz, pinW, pinL);         // bottom
            ctx.fillRect(c.x - pinL, c.y + i * gap - pinW / 2, pinL, pinW);       // left
            ctx.fillRect(c.x + sz, c.y + i * gap - pinW / 2, pinL, pinW);         // right
        }
    }

    function drawSOIC(c) {
        ctx.fillStyle = COL.chipBody; ctx.strokeStyle = COL.chipBorder; ctx.lineWidth = 0.8;
        ctx.fillRect(c.x, c.y, c.w, c.h); ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.beginPath(); ctx.arc(c.x + 4, c.y + 4, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = COL.pinHL; ctx.fill();
        const gap = c.h / (c.pins + 1);
        ctx.fillStyle = COL.pin;
        for (let i = 1; i <= c.pins; i++) {
            ctx.fillRect(c.x - 4, c.y + i * gap - 1, 4, 2);
            ctx.fillRect(c.x + c.w, c.y + i * gap - 1, 4, 2);
        }
    }

    function drawSMD(c) {
        const pw = c.w * 0.25;
        ctx.fillStyle = COL.smdPad;
        ctx.fillRect(c.x, c.y, pw, c.h);
        ctx.fillRect(c.x + c.w - pw, c.y, pw, c.h);
        ctx.fillStyle = COL.smd;
        ctx.fillRect(c.x + pw, c.y, c.w - pw * 2, c.h);
    }

    function drawCrystal(c) {
        ctx.fillStyle = COL.crystal; ctx.strokeStyle = COL.crystalPad; ctx.lineWidth = 0.8;
        ctx.fillRect(c.x, c.y, c.size, c.size); ctx.strokeRect(c.x, c.y, c.size, c.size);
        ctx.fillStyle = COL.crystalPad;
        ctx.fillRect(c.x + c.size * 0.3, c.y + c.size * 0.3, c.size * 0.4, c.size * 0.4);
    }

    function drawUSB(c) {
        const r = 3;
        ctx.fillStyle = COL.conn; ctx.strokeStyle = COL.connBorder; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x + r, c.y); ctx.lineTo(c.x + c.w - r, c.y);
        ctx.quadraticCurveTo(c.x + c.w, c.y, c.x + c.w, c.y + r);
        ctx.lineTo(c.x + c.w, c.y + c.h - r);
        ctx.quadraticCurveTo(c.x + c.w, c.y + c.h, c.x + c.w - r, c.y + c.h);
        ctx.lineTo(c.x + r, c.y + c.h);
        ctx.quadraticCurveTo(c.x, c.y + c.h, c.x, c.y + c.h - r);
        ctx.lineTo(c.x, c.y + r);
        ctx.quadraticCurveTo(c.x, c.y, c.x + r, c.y);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = COL.hole;
        ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    }

    function drawTHPad(c) {
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = COL.pad; ctx.fill();
        ctx.beginPath(); ctx.arc(c.x, c.y, c.drill, 0, Math.PI * 2);
        ctx.fillStyle = COL.hole; ctx.fill();
    }

    function drawFiducial(c) {
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = COL.fiducial; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = COL.padFill; ctx.fill();
    }

    function drawDiodeSymbol(c) {
        const sz = c.size;
        ctx.fillStyle = COL.diode; ctx.strokeStyle = COL.diode; ctx.lineWidth = 2;
        // Line
        ctx.beginPath(); ctx.moveTo(c.x - sz * 1.2, c.y); ctx.lineTo(c.x + sz * 1.2, c.y); ctx.stroke();
        // Triangle
        ctx.beginPath();
        ctx.moveTo(c.x - sz * 0.5, c.y - sz * 0.6);
        ctx.lineTo(c.x + sz * 0.5, c.y);
        ctx.lineTo(c.x - sz * 0.5, c.y + sz * 0.6);
        ctx.closePath(); ctx.fill();
        // Bar
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(c.x + sz * 0.5, c.y - sz * 0.6);
        ctx.lineTo(c.x + sz * 0.5, c.y + sz * 0.6); ctx.stroke();
    }

    function drawLabel(l) {
        ctx.font = `300 ${l.size}px Inter, sans-serif`;
        ctx.fillStyle = COL.label; ctx.fillText(l.text, l.x, l.y);
    }

    // ===== DRAW PCB =====
    function drawPCB() {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';

        // Traces first
        for (const t of traces) {
            ctx.strokeStyle = COL.trace; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
        }

        // Components
        for (const c of components) {
            switch (c.type) {
                case 'hole': drawMountingHole(c); break;
                case 'qfp': drawQFP(c); break;
                case 'soic': drawSOIC(c); break;
                case 'smd': drawSMD(c); break;
                case 'crystal': drawCrystal(c); break;
                case 'usb': drawUSB(c); break;
                case 'thpad': drawTHPad(c); break;
                case 'fiducial': drawFiducial(c); break;
                case 'diode': drawDiodeSymbol(c); break;
                case 'label': drawLabel(c); break;
            }
        }
    }

    // ===== ELECTRICITY PULSE =====
    class ElectricityPulse {
        constructor(trace, fromMouse) {
            this.trace = trace;
            this.progress = fromMouse ? 0 : Math.random();
            this.speed = 0.008 + Math.random() * 0.012;
            this.life = 1;
            this.decay = fromMouse ? 0.006 : 0.002;
            this.intensity = fromMouse ? 1 : 0.3;
            this.fromMouse = fromMouse;
            this.length = 0.12 + Math.random() * 0.15;
        }

        update() {
            this.progress += this.speed;
            this.life -= this.decay;
            if (this.progress > 1 + this.length) this.life = 0;
        }

        draw() {
            if (this.life <= 0) return;
            const t = this.trace;
            const dx = t.x2 - t.x1, dy = t.y2 - t.y1;
            const steps = 8;
            for (let i = 0; i < steps; i++) {
                const p = this.progress - (i / steps) * this.length;
                if (p < 0 || p > 1) continue;
                const x = t.x1 + dx * p, y = t.y1 + dy * p;
                const alpha = (1 - i / steps) * this.life * this.intensity;
                // Glow
                ctx.beginPath(); ctx.arc(x, y, 6 - i * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `${ACCENT_GLOW}${alpha * 0.3})`; ctx.fill();
                // Core
                ctx.beginPath(); ctx.arc(x, y, 2 - i * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = `${ACCENT_GLOW}${alpha * 0.9})`; ctx.fill();
            }
        }
    }

    // ===== MOUSE GLOW =====
    function drawMouseGlow() {
        if (mouse.x == null) return;

        // Radial glow
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        grad.addColorStop(0, `${ACCENT_GLOW}0.06)`);
        grad.addColorStop(0.5, `${ACCENT_GLOW}0.02)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);

        // Highlight traces near mouse
        for (const t of traces) {
            const mx = (t.x1 + t.x2) / 2, my = (t.y1 + t.y2) / 2;
            const dist = Math.hypot(mx - mouse.x, my - mouse.y);
            if (dist < mouse.radius) {
                const a = (1 - dist / mouse.radius) * 0.7;
                ctx.strokeStyle = `${ACCENT_GLOW}${a})`;
                ctx.lineWidth = 2;
                ctx.shadowColor = ACCENT; ctx.shadowBlur = 8 * a;
                ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // Highlight components near mouse
        for (const c of components) {
            let cx, cy;
            if (c.type === 'qfp') { cx = c.x + c.size / 2; cy = c.y + c.size / 2; }
            else if (c.type === 'soic' || c.type === 'smd' || c.type === 'usb') { cx = c.x + c.w / 2; cy = c.y + c.h / 2; }
            else if (c.type === 'thpad' || c.type === 'hole' || c.type === 'fiducial') { cx = c.x; cy = c.y; }
            else if (c.type === 'crystal') { cx = c.x + c.size / 2; cy = c.y + c.size / 2; }
            else if (c.type === 'diode') { cx = c.x; cy = c.y; }
            else continue;

            const dist = Math.hypot(cx - mouse.x, cy - mouse.y);
            if (dist < mouse.radius * 0.85) {
                const a = (1 - dist / (mouse.radius * 0.85));

                if (c.type === 'qfp' || c.type === 'soic') {
                    ctx.strokeStyle = `${ACCENT_GLOW}${a * 0.5})`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = ACCENT; ctx.shadowBlur = 12 * a;
                    const w = c.size || c.w, h = c.size || c.h;
                    ctx.strokeRect(c.x, c.y, w, h);
                    ctx.shadowBlur = 0;
                } else if (c.type === 'thpad' || c.type === 'hole') {
                    ctx.beginPath(); ctx.arc(cx, cy, (c.r || 5) + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = `${ACCENT_GLOW}${a * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = ACCENT; ctx.shadowBlur = 10 * a;
                    ctx.stroke(); ctx.shadowBlur = 0;
                } else if (c.type === 'smd') {
                    ctx.fillStyle = `${ACCENT_GLOW}${a * 0.4})`;
                    ctx.fillRect(c.x - 1, c.y - 1, c.w + 2, c.h + 2);
                }
            }
        }
    }

    // ===== PULSE SPAWNING =====
    let lastPulseTime = 0;
    function spawnMousePulses(time) {
        if (mouse.x == null) return;
        if (time - lastPulseTime < 60) return;
        lastPulseTime = time;
        for (const t of traces) {
            const mx = (t.x1 + t.x2) / 2, my = (t.y1 + t.y2) / 2;
            if (Math.hypot(mx - mouse.x, my - mouse.y) < mouse.radius * 0.6 && Math.random() < 0.15) {
                pulses.push(new ElectricityPulse(t, true));
            }
        }
    }

    let lastAmbientTime = 0;
    function spawnAmbientPulses(time) {
        if (time - lastAmbientTime < 150) return;
        lastAmbientTime = time;
        if (traces.length > 0 && ambientPulses.length < 30) {
            ambientPulses.push(new ElectricityPulse(traces[Math.floor(Math.random() * traces.length)], false));
        }
    }

    // ===== RESIZE =====
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        generatePCB();
    }
    window.addEventListener('resize', resize);
    resize();

    // ===== ANIMATION LOOP =====
    function animate(time) {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        drawPCB();
        drawMouseGlow();
        spawnMousePulses(time);
        spawnAmbientPulses(time);

        for (let i = pulses.length - 1; i >= 0; i--) {
            pulses[i].update(); pulses[i].draw();
            if (pulses[i].life <= 0) pulses.splice(i, 1);
        }
        for (let i = ambientPulses.length - 1; i >= 0; i--) {
            ambientPulses[i].update(); ambientPulses[i].draw();
            if (ambientPulses[i].life <= 0) ambientPulses.splice(i, 1);
        }
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
