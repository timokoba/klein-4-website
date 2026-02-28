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
    const mouse = { x: null, y: null, radius: 180, active: false };
    const heroEl = document.querySelector('.hero');

    heroEl.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    heroEl.addEventListener('mouseleave', () => { 
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
    let lensScale = 0; // for animating in/out

    function drawLens(time) {
        if (!pcbImage.complete || pcbImage.width === 0) return;

        // Initialize lens exactly in the center of the screen initially
        if (width && height && lensX === 0) {
           lensX = width / 2;
           lensY = height / 2;
        }

        // Smoothly interpolate lens position and size
        const targetScale = mouse.active ? 1 : 0;
        lensScale += (targetScale - lensScale) * 0.1;
        
        if (mouse.active) {
            lensX += (mouse.x - lensX) * 0.15;
            lensY += (mouse.y - lensY) * 0.15;
        }

        if (lensScale < 0.01) return;

        const currentRadius = mouse.radius * lensScale;
        const zoom = 2.5;
        
        ctx.save();
        
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
        ctx.globalAlpha = 0.85; 
        ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.4) contrast(1.8)';
        ctx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
        ctx.restore();

        // 4. Tech Overlay within the lens (Scanlines / Grid)
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = ACCENT;
        // Simple scanlines
        for(let i = 0; i < currentRadius * 2; i += 4) {
            ctx.fillRect(lensX - currentRadius, lensY - currentRadius + i, currentRadius * 2, 1);
        }
        
        ctx.restore(); // remove clip

        // 5. Draw Lens Border/Tech UI
        ctx.save();
        ctx.globalAlpha = lensScale;
        ctx.translate(lensX, lensY);

        // Soft glow behind border
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 20;
        
        // Main Ring
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = \`rgba(233, 113, 50, 0.6)\`;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Inner dashed ring
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius - 8, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.strokeStyle = \`rgba(233, 113, 50, 0.4)\`;
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
        ctx.strokeStyle = \`rgba(255, 255, 255, 0.4)\`;
        
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
        ctx.fillStyle = \`rgba(233, 113, 50, 0.8)\`;
        ctx.fillText(\`X:\${Math.round(lensX)} Y:\${Math.round(lensY)}\`, chOffset + 10, 4);

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
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated main.js');
