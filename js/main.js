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
    let particles = [];

    // Mouse interaction
    const mouse = {
        x: null,
        y: null,
        radius: 200 // Radius of interaction
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Resize handling
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5; // Faster movement
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 2 + 1;
            this.baseColor = Math.random() > 0.8 ? '#E97132' : '#333';
            this.color = this.baseColor;
            this.density = (Math.random() * 30) + 1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Check mouse position/interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;

                // Max distance, past that the force will be 0
                const maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;

                // If within radius, move away (repulsion)
                if (distance < mouse.radius) {
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;
                    this.x -= directionX;
                    this.y -= directionY;

                    // Highlight particles near mouse
                    this.color = '#E97132';
                } else {
                    if (this.color !== this.baseColor) {
                        this.color = this.baseColor;
                    }
                }
            }

            // Normal movement
            this.x += this.vx;
            this.y += this.vy;

            // Boundary checks
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            this.draw();
        }
    }

    // Init Particles
    function init() {
        particles = [];
        let numberOfParticles = (width * height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }
    init();

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }

        connect();
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                    + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

                if (distance < (width / 7) * (height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(150, 150, 150, ${opacityValue * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }

        // Connect to mouse
        if (mouse.x != null) {
            for (let i = 0; i < particles.length; i++) {
                let distance = ((particles[i].x - mouse.x) ** 2) + ((particles[i].y - mouse.y) ** 2);
                if (distance < mouse.radius ** 2) {
                    ctx.strokeStyle = `rgba(233, 113, 50, 0.2)`; // Orange connection to mouse
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    animate();

    // Re-init on resize to maintain density
    window.addEventListener('resize', init);
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
