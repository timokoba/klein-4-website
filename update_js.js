const fs = require('fs');

const path = 'd:\\Wichtige Dokumente\\Klein 4 Start-up\\Website\\klein-4-website\\js\\main.js';
let content = fs.readFileSync(path, 'utf8');

const startStr = 'function initHeroAnimation() {';
const endStr = 'function initProduct3D() {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find functions');
    process.exit(1);
}

const replacement = `function initHeroAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Mouse interaction
    const mouse = { x: null, y: null, radius: 250 };
    const heroEl = document.querySelector('.hero');

    heroEl.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    heroEl.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    // Load the exact PCB image
    const pcbImage = new Image();
    pcbImage.src = 'images/Data_diode_structure.png';

    let imgX = 0, imgY = 0, imgW = 0, imgH = 0;

    const ACCENT = '#E97132';
    const ACCENT_GLOW = 'rgba(233, 113, 50, ';

    // Normalized Exact Trace Paths (x, y from 0.0 to 1.0 based on image)
    const normalizedTraces = [
        // Top Left Power to Left IC
        [{x: 0.22, y: 0.12}, {x: 0.22, y: 0.2}],
        [{x: 0.25, y: 0.12}, {x: 0.25, y: 0.25}],
        // Left Connector to Left IC
        [{x: 0.11, y: 0.55}, {x: 0.13, y: 0.55}, {x: 0.18, y: 0.45}, {x: 0.20, y: 0.45}],
        [{x: 0.11, y: 0.60}, {x: 0.13, y: 0.60}, {x: 0.15, y: 0.65}, {x: 0.22, y: 0.65}, {x: 0.25, y: 0.5}],
        [{x: 0.11, y: 0.45}, {x: 0.15, y: 0.35}, {x: 0.20, y: 0.35}],
        // Left IC to Gap/UART
        [{x: 0.28, y: 0.3}, {x: 0.43, y: 0.3}, {x: 0.46, y: 0.35}],
        [{x: 0.28, y: 0.4}, {x: 0.32, y: 0.4}, {x: 0.35, y: 0.5}, {x: 0.4, y: 0.5}, {x: 0.42, y: 0.55}],
        [{x: 0.28, y: 0.45}, {x: 0.3, y: 0.45}, {x: 0.33, y: 0.55}, {x: 0.42, y: 0.55}],
        [{x: 0.25, y: 0.5}, {x: 0.25, y: 0.68}, {x: 0.35, y: 0.68}, {x: 0.42, y: 0.58}],
        // OC1 (Optocoupler) to Right Side
        [{x: 0.48, y: 0.62}, {x: 0.52, y: 0.62}],
        [{x: 0.52, y: 0.62}, {x: 0.55, y: 0.65}, {x: 0.65, y: 0.65}, {x: 0.68, y: 0.55}, {x: 0.72, y: 0.55}],
        [{x: 0.52, y: 0.58}, {x: 0.58, y: 0.58}, {x: 0.62, y: 0.5}, {x: 0.7, y: 0.5}],
        [{x: 0.52, y: 0.54}, {x: 0.54, y: 0.54}, {x: 0.58, y: 0.45}, {x: 0.62, y: 0.45}],
        // UART across
        [{x: 0.48, y: 0.48}, {x: 0.52, y: 0.48}, {x: 0.55, y: 0.45}, {x: 0.62, y: 0.45}],
        [{x: 0.48, y: 0.52}, {x: 0.5, y: 0.52}, {x: 0.55, y: 0.55}, {x: 0.6, y: 0.55}, {x: 0.62, y: 0.48}],
        // Right IC to Right Connector
        [{x: 0.72, y: 0.3}, {x: 0.8, y: 0.3}, {x: 0.82, y: 0.45}, {x: 0.88, y: 0.45}],
        [{x: 0.72, y: 0.35}, {x: 0.82, y: 0.35}, {x: 0.85, y: 0.5}, {x: 0.88, y: 0.5}],
        [{x: 0.72, y: 0.4}, {x: 0.75, y: 0.4}, {x: 0.8, y: 0.55}, {x: 0.88, y: 0.55}],
        [{x: 0.72, y: 0.45}, {x: 0.78, y: 0.45}, {x: 0.78, y: 0.6}, {x: 0.88, y: 0.6}],
        // Right IC to Top Right Power
        [{x: 0.68, y: 0.25}, {x: 0.68, y: 0.15}, {x: 0.75, y: 0.15}],
        [{x: 0.7, y: 0.25}, {x: 0.7, y: 0.18}, {x: 0.78, y: 0.18}],
        // Diode symbol bottom
        [{x: 0.28, y: 0.75}, {x: 0.35, y: 0.75}, {x: 0.38, y: 0.75}],
    ];

    let actualTraces = [];
    let pulses = [];
    let ambientPulses = [];

    // ===== RECALCULATE TRACES based on image size =====
    function recalculateTraces() {
        actualTraces = [];
        normalizedTraces.forEach(normPath => {
            const actualPath = normPath.map(pt => ({
                x: imgX + pt.x * imgW,
                y: imgY + pt.y * imgH
            }));
            // Convert to segments for pulse traversal
            for (let i = 0; i < actualPath.length - 1; i++) {
                actualTraces.push({
                    x1: actualPath[i].x,
                    y1: actualPath[i].y,
                    x2: actualPath[i+1].x,
                    y2: actualPath[i+1].y,
                    len: Math.hypot(actualPath[i+1].x - actualPath[i].x, actualPath[i+1].y - actualPath[i].y)
                });
            }
        });
    }

    // ===== ELECTRICITY PULSE =====
    class ElectricityPulse {
        constructor(trace, fromMouse) {
            this.trace = trace;
            this.progress = fromMouse ? 0 : Math.random();
            this.speed = 2.0 / Math.max(trace.len, 50); // Speed normalized to trace length
            this.life = 1;
            this.decay = fromMouse ? 0.015 : 0.005;
            this.intensity = fromMouse ? 1.5 : 0.5;
            this.length = 0.2;
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
            const steps = 6;
            for (let i = 0; i < steps; i++) {
                const p = this.progress - (i / steps) * this.length;
                if (p < 0 || p > 1) continue;
                const x = t.x1 + dx * p, y = t.y1 + dy * p;
                const alpha = (1 - i / steps) * this.life * this.intensity;
                // Core glow
                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = \`\${ACCENT_GLOW}\${alpha})\`; ctx.fill();
                // Outer glow
                ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = \`\${ACCENT_GLOW}\${alpha * 0.3})\`; ctx.fill();
            }
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
            recalculateTraces();
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
        // Dark theme: The original image is light grey and white. 
        // We invert it completely and make it subtle so it looks like a glowing dark PCB structure.
        ctx.globalAlpha = 0.15; // "Sehr dezent im hintergrund"
        ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.5)';
        ctx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        ctx.restore();
    }

    // ===== MOUSE INTERACTION =====
    function drawInteractions() {
        if (mouse.x == null) return;

        // Soft ambient mouse light
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        grad.addColorStop(0, \`\${ACCENT_GLOW}0.15)\`);
        grad.addColorStop(0.5, \`\${ACCENT_GLOW}0.02)\`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);

        // Highlight exact traced lines faintly when hovering near them
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const t of actualTraces) {
            // Distance from mouse to line segment
            const len2 = t.len * t.len;
            let dist;
            if (len2 === 0) {
                dist = Math.hypot(t.x1 - mouse.x, t.y1 - mouse.y);
            } else {
                let p = ((mouse.x - t.x1) * (t.x2 - t.x1) + (mouse.y - t.y1) * (t.y2 - t.y1)) / len2;
                p = Math.max(0, Math.min(1, p));
                const px = t.x1 + p * (t.x2 - t.x1);
                const py = t.y1 + p * (t.y2 - t.y1);
                dist = Math.hypot(mouse.x - px, mouse.y - py);
            }

            if (dist < mouse.radius * 0.5) {
                const a = (1 - dist / (mouse.radius * 0.5)) * 0.8;
                ctx.strokeStyle = \`\${ACCENT_GLOW}\${a})\`;
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
            }
        }
    }

    // ===== PULSE SPAWNING =====
    let lastPulseTime = 0;
    function spawnMousePulses(time) {
        if (mouse.x == null || actualTraces.length === 0) return;
        if (time - lastPulseTime < 40) return;
        lastPulseTime = time;
        for (const t of actualTraces) {
            const mx = (t.x1 + t.x2) / 2, my = (t.y1 + t.y2) / 2;
            if (Math.hypot(mx - mouse.x, my - mouse.y) < mouse.radius * 0.4 && Math.random() < 0.25) {
                pulses.push(new ElectricityPulse(t, true));
            }
        }
    }

    let lastAmbientTime = 0;
    function spawnAmbientPulses(time) {
        if (actualTraces.length === 0) return;
        if (time - lastAmbientTime < 100) return;
        lastAmbientTime = time;
        if (ambientPulses.length < 40) {
            ambientPulses.push(new ElectricityPulse(actualTraces[Math.floor(Math.random() * actualTraces.length)], false));
        }
    }

    // ===== ANIMATION LOOP =====
    function animate(time) {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        drawPCBBackground();
        drawInteractions();
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
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated main.js');
