document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initScrollAnimations();
    initHeroAnimation();
    initNavScroll();
});

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
