1: document.addEventListener('DOMContentLoaded', () => {
2:     gsap.registerPlugin(ScrollTrigger);
3:     
4:     // Enable normalizeScroll to prevent conflicts between native scroll and GSAP pinning
5:     // particularly when scrolling UP into a pinned section.
6:     ScrollTrigger.normalizeScroll(true);
7:     ScrollTrigger.config({ 
8:         ignoreMobileResize: true,
9:         autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" // Reduce aggressive refreshes
10:     });
11: 
12:     const hasSeenIntro = sessionStorage.getItem('klein4_intro_seen');
13:     if (!hasSeenIntro) {
14:         document.body.classList.add('no-scroll');
15:         sessionStorage.setItem('klein4_intro_seen', 'true');
16:         playIntroAnimation(() => {
17:             initAll();
18:         });
19:     } else {
20:         const overlay = document.getElementById('intro-overlay');
21:         if (overlay) overlay.style.display = 'none';
22:         document.body.classList.remove('no-scroll');
23:         initAll();
24:     }
25: });
26: 
27: function initAll() {
28:     initUniverseStars();
29:     initHamburgerMenu();
30:     initHeroAnimation();
31:     initNavScroll();
32:     
33:     // Initialize pinning sections FIRST so they add their spacing to the page height
34:     // before the Reveal animations calculate their trigger points
35:     initIntroTextScroll();
36:     initNASAnimation();
37:     
38:     // Now initialize standard reveals and other interactive modules
39:     initSectionAnimations();
40:     initScrollAnimations();
41:     initCardSwap();
42:     initPlasma();
43:     initPilotForm();
44: 
45:     // Final refresh to ensure all ScrollTriggers are perfectly calculated
46:     ScrollTrigger.refresh();
47:     
48:     window.addEventListener('load', () => {
49:         ScrollTrigger.refresh();
50:         // Additional delayed refresh to catch any subtle layout shifts (like the one fixed by resizing)
51:         setTimeout(() => {
52:             ScrollTrigger.refresh();
53:         }, 500);
54:     });
55: }
56: 
57: function initHamburgerMenu() {
58:     const btn = document.getElementById('nav-hamburger');
59:     const links = document.getElementById('nav-links');
60:     if (!btn || !links) return;
61: 
62:     btn.addEventListener('click', () => {
63:         btn.classList.toggle('open');
64:         links.classList.toggle('open');
65:     });
66: 
67:     // Close menu when a link is clicked
68:     links.querySelectorAll('.nav-link').forEach(link => {
69:         link.addEventListener('click', () => {
70:             btn.classList.remove('open');
71:             links.classList.remove('open');
72:         });
73:     });
74: 
75:     // Close on resize past mobile breakpoint
76:     window.addEventListener('resize', () => {
77:         if (window.innerWidth > 900) {
78:             btn.classList.remove('open');
79:             links.classList.remove('open');
80:         }
81:     });
82: }
83: 
84: function initUniverseStars() {
85:     const bg = document.querySelector('.intro-bg');
86:     if (!bg) return;
87: 
88:     // Create high performance canvas for stars
89:     const canvas = document.createElement('canvas');
90:     canvas.style.position = 'absolute';
91:     canvas.style.top = '0';
92:     canvas.style.left = '0';
93:     canvas.style.width = '100%';
94:     canvas.style.height = '100%';
95:     canvas.style.zIndex = '0';
96: 
97:     // Virtual native resolution for crisp stars
98:     const cw = 3000;
99:     const ch = 3000;
100:     canvas.width = cw;
101:     canvas.height = ch;
102:     const ctx = canvas.getContext('2d');
103: 
104:     ctx.fillStyle = '#000000';
105:     ctx.fillRect(0, 0, cw, ch);
106: 
107:     // Generate organic starfield
108:     for (let i = 0; i < 1500; i++) {
109:         const x = Math.random() * cw;
110:         const y = Math.random() * ch;
111: 
112:         let maxRadius = 0.8;
113:         let p = Math.random();
114:         if (p > 0.9) maxRadius = 1.8;
115:         if (p > 0.98) maxRadius = 3;
116: 
117:         const radius = Math.random() * maxRadius;
118:         const opacity = Math.random() * 0.8 + 0.2;
119: 
120:         ctx.beginPath();
121:         ctx.arc(x, y, radius, 0, Math.PI * 2);
122: 
123:         const isBlue = Math.random() > 0.8;
124:         const isOrange = Math.random() > 0.95;
125: 
126:         if (isBlue) {
127:             ctx.fillStyle = `rgba(180, 210, 255, ${opacity})`;
128:         } else if (isOrange) {
129:             ctx.fillStyle = `rgba(255, 180, 140, ${opacity})`;
130:         } else {
131:             ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
132:         }
133: 
134:         ctx.fill();
135: 
136:         // Glow for larger objects
137:         if (maxRadius > 1.8) {
138:             ctx.shadowBlur = 12;
139:             ctx.shadowColor = ctx.fillStyle;
140:             ctx.fill();
141:             ctx.shadowBlur = 0;
142:         }
143:     }
144: 
145:     const addNebula = (cx, cy, r, c1, c2) => {
146:         const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
147:         grad.addColorStop(0, c1);
148:         grad.addColorStop(1, c2);
149:         ctx.fillStyle = grad;
150:         ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
151:     };
152: 
153:     // Minimalist space nebulas
154:     addNebula(cw * 0.3, ch * 0.4, 1000, 'rgba(0, 80, 255, 0.04)', 'transparent');
155:     addNebula(cw * 0.8, ch * 0.7, 1200, 'rgba(233, 113, 50, 0.03)', 'transparent');
156:     addNebula(cw * 0.5, ch * 0.9, 1000, 'rgba(100, 0, 255, 0.02)', 'transparent');
157: 
158:     bg.appendChild(canvas);
159: }
160: 
161: function playIntroAnimation(onComplete) {
162:     const overlay = document.getElementById('intro-overlay');
163:     const logo = document.getElementById('intro-logo');
164: 
165:     if (!overlay || !logo) {
166:         if (onComplete) onComplete();
167:         return;
168:     }
169: 
170:     // Disable scrolling during intro
171:     document.body.classList.add('no-scroll');
172: 
173:     // Set initial states: blurred, slightly scaled down, masked to be fully hidden
174:     gsap.set(logo, {
175:         clipPath: "inset(0% 100% 0% 0%)",
176:         opacity: 0,
177:         scale: 0.95,
178:         filter: "blur(4px)"
179:     });
180: 
181:     const tl = gsap.timeline({
182:         onComplete: () => {
183:             overlay.style.display = 'none';
184:             document.body.classList.remove('no-scroll');
185:             if (onComplete) onComplete();
186:         }
187:     });
188: 
189:     // 1. Data load reveal (Left-to-Right sharp wiping while unblurring)
190:     tl.to(logo, {
191:         opacity: 1,
192:         clipPath: "inset(0% 0% 0% 0%)",
193:         scale: 1,
194:         filter: "blur(0px)",
195:         duration: 0.6,
196:         ease: "power3.inOut",
197:         delay: 0.2
198:     });
199: 
200:     // 2. Brief hold (clean pause after reveal)
201:     tl.to({}, { duration: 0.5 });
202: 
203:     // 3. White background sharply splits horizontally like a mechanical shutter
204:     tl.to(overlay, {
205:         clipPath: "inset(50% 0% 50% 0%)",
206:         duration: 0.5,
207:         ease: "power4.inOut"
208:     });
209: }
210: 
211: function initIntroTextScroll() {
212:     const section = document.querySelector('.intro-text');
213:     const bg = document.querySelector('.intro-bg');
214:     const texts = document.querySelectorAll('.anim-text');
215: 
216:     if (!section || texts.length === 0) return;
217: 
218:     // Single combined ScrollTrigger: pins AND scrubs the animation together
219:     const tl = gsap.timeline({
220:         scrollTrigger: {
221:             trigger: section,
222:             start: "top top",
223:             end: "+=3000",
224:             pin: true,
225:             scrub: 1.0, // Optimized for smooth but responsive release
226:             anticipatePin: 1,
227:         }
228:     });
229: 
230:     // Animate texts sequentially (uniform timing for all three)
231:     const fadeIn = 0.8;
232:     const hold = 1.0;
233:     const fadeOut = 0.8;
234: 
235:     texts.forEach((text, index) => {
236:         // Fade In with transition
237:         tl.to(text, {
238:             opacity: 1,
239:             y: "-50%",
240:             duration: fadeIn,
241:             ease: "power2.out"
242:         });
243: 
244:         // Hold
245:         tl.to({}, { duration: hold });
246: 
247:         // Fade Out (ensure the last text also fades out before pinning ends)
248:         tl.to(text, {
249:             opacity: 0,
250:             y: "-80%",
251:             duration: fadeOut,
252:             ease: "power2.in"
253:         });
254:     });
255: 
256:     // Background Animation — covers the ENTIRE timeline
257:     if (bg) {
258:         tl.to(bg, {
259:             rotation: 4,
260:             scale: 1.15,
261:             x: "-1%",
262:             y: "0.5%",
263:             ease: "sine.inOut",
264:             duration: tl.duration()
265:         }, 0);
266:     }
267: }
268: 
269: function initSectionAnimations() {
270:     const sections = document.querySelectorAll('.section');
271: 
272:     // Selectors for common block-level elements we want to animate
273:     const selectors = [
274:         '.eyebrow',
275:         'h2',
276:         'h3',
277:         '.p-large',
278:         'p',
279:         'ul.feature-list',
280:         'ul',
281:         '.button-primary',
282:         '.button-outline',
283:         '.product-image-container',
284:         '.specs-label',
285:         '.specs-grid',
286:         '.card-swap-container',
287:         '.form-container',
288:         '.qa-item-fancy'
289:     ].join(', ');
290: 
291:     sections.forEach(section => {
292:         // Philosophy section has its own custom GSAP pinning logic that shouldn't be overridden
293:         if (section.id === 'philosophy') return;
294: 
295:         const potentialElems = section.querySelectorAll(selectors);
296: 
297:         // Filter out elements that are nested inside other matched elements
298:         // This ensures we only animate top-level blocks and not their children repeatedly
299:         const contentElems = Array.from(potentialElems).filter(el => {
300:             let parent = el.parentElement;
301:             while (parent && parent !== section) {
302:                 if (parent.matches && parent.matches(selectors)) {
303:                     return false;
304:                 }
305:                 parent = parent.parentElement;
306:             }
307:             return true;
308:         });
309: 
310:         if (contentElems.length === 0) return;
311: 
312:         gsap.fromTo(contentElems,
313:             { opacity: 0, y: 30 },
314:             {
315:                 opacity: 1,
316:                 y: 0,
317:                 duration: 1,
318:                 stagger: 0.15,
319:                 ease: 'power3.out',
320:                 scrollTrigger: {
321:                     trigger: section,
322:                     start: 'top 75%',
323:                     toggleActions: 'play none none reverse'
324:                 }
325:             }
326:         );
327:     });
328: }
329: 
330: function initScrollAnimations() {
331:     // Reveal elements on scroll
332:     const allRevealElements = document.querySelectorAll('[data-reveal]');
333: 
334:     // Hero elements animate immediately on load
335:     const heroElements = document.querySelectorAll('.hero [data-reveal]');
336:     if (heroElements.length > 0) {
337:         gsap.fromTo(heroElements,
338:             { opacity: 0, y: 30 },
339:             {
340:                 opacity: 1,
341:                 y: 0,
342:                 duration: 1,
343:                 stagger: 0.15,
344:                 ease: 'power3.out',
345:                 delay: 0.1
346:             }
347:         );
348:     }
349: 
350:     // Marquee infinite scroll
351:     const marqueeContent = document.querySelector('.marquee-content');
352:     if (marqueeContent && marqueeContent.children.length < 20) {
353:         // Clone for seamless loop if content is short
354:         const marqueeInner = marqueeContent.innerHTML;
355:         marqueeContent.innerHTML = marqueeInner + marqueeInner + marqueeInner;
356:     }
357: }
358: 
359: function initNavScroll() {
360:     const header = document.querySelector('.header');
361:     window.addEventListener('scroll', () => {
362:         if (window.scrollY > 50) {
363:             header.classList.add('scrolled');
364:         } else {
365:             header.classList.remove('scrolled');
366:         }
367:     }, { passive: true });
368: }
369: 
370: function initHeroAnimation() {
371:     const canvas = document.getElementById('hero-canvas');
372:     if (!canvas) return;
373: 
374:     // Detect touch capability
375:     const isTouchDevice = !window.matchMedia('(hover: hover)').matches;
376: 
377:     const ctx = canvas.getContext('2d');
378:     let width, height;
379: 
380:     // Mouse interaction
381:     const mouse = { x: null, y: null, radius: 180, active: false };
382:     const heroEl = document.querySelector('.hero');
383: 
384:     // Only add mouse interaction for devices that support hover
385:     if (!isTouchDevice) {
386:         window.addEventListener('mousemove', (e) => {
387:             const heroRect = heroEl.getBoundingClientRect();
388:             if (e.clientY >= heroRect.top && e.clientY <= heroRect.bottom) {
389:                 const rect = canvas.getBoundingClientRect();
390:                 mouse.x = e.clientX - rect.left;
391:                 mouse.y = e.clientY - rect.top;
392:                 let isButton = false;
393:                 if (e.target instanceof Element) {
394:                     isButton = !!e.target.closest('a') || !!e.target.closest('button') || !!e.target.closest('.header');
395:                 }
396:                 mouse.active = !isButton;
397:             } else {
398:                 mouse.active = false;
399:             }
400:         }, { passive: true });
401: 
402:         document.addEventListener('mouseleave', () => { mouse.active = false; }, { passive: true });
403:     }
404: 
405:     // Load PCB image — IMPORTANT: set onload BEFORE src to catch cached images
406:     const pcbImage = new Image();
407:     let imgX = 0, imgY = 0, imgW = 0, imgH = 0;
408:     const ACCENT = '#E97132';
409: 
410:     // ===== PRE-FILTERED OFFSCREEN CANVASES (eliminates per-frame CSS filter lag) =====
411:     const bgOff = document.createElement('canvas');
412:     const bgOffCtx = bgOff.getContext('2d');
413:     const lensOff = document.createElement('canvas');
414:     const lensOffCtx = lensOff.getContext('2d');
415:     let offscreenReady = false;
416: 
417:     function renderOffscreen() {
418:         if (!pcbImage.complete || pcbImage.width === 0 || !width) return;
419: 
420:         // Background: dim, inverted blueprint
421:         bgOff.width = width;
422:         bgOff.height = height;
423:         bgOffCtx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.4)';
424:         bgOffCtx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
425:         bgOffCtx.filter = 'none';
426: 
427:         // Lens: brighter/crisper version for the magnified view
428:         lensOff.width = width;
429:         lensOff.height = height;
430:         lensOffCtx.filter = 'invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.7)';
431:         lensOffCtx.drawImage(pcbImage, imgX, imgY, imgW, imgH);
432:         lensOffCtx.filter = 'none';
433: 
434:         offscreenReady = true;
435:     }
436: 
437:     // ===== FISHEYE GRID (no getImageData — works on file:// and all protocols) =====
438:     // Pre-compute a grid of source displacement offsets for barrel distortion
439:     const GRID = 32; // Grid resolution (32×32 = 1024 cells — good balance)
440:     const fishGrid = []; // Array of { sx, sy } normalized source offsets per cell
441:     for (let gy = 0; gy < GRID; gy++) {
442:         for (let gx = 0; gx < GRID; gx++) {
443:             // Normalized coordinates for center of this cell (-1 to 1)
444:             const nx = (2 * (gx + 0.5) / GRID) - 1;
445:             const ny = (2 * (gy + 0.5) / GRID) - 1;
446:             const r = Math.sqrt(nx * nx + ny * ny);
447: 
448:             let snx = nx, sny = ny;
449:             if (r <= 1.0 && r > 0) {
450:                 const nr = Math.min((r + (1.0 - Math.sqrt(1.0 - r * r))) / 2.0, 1.0);
451:                 const theta = Math.atan2(ny, nx);
452:                 snx = nr * Math.cos(theta);
453:                 sny = nr * Math.sin(theta);
454:             }
455:             fishGrid.push({ snx, sny });
456:         }
457:     }
458: 
459:     // ===== RESIZE =====
460:     function resize() {
461:         width = canvas.width = window.innerWidth;
462:         height = canvas.height = window.innerHeight;
463: 
464:         if (pcbImage.complete && pcbImage.width > 0) {
465:             const imgAspect = pcbImage.width / pcbImage.height;
466:             const screenAspect = width / height;
467:             if (screenAspect > imgAspect) {
468:                 imgW = width;
469:                 imgH = imgW / imgAspect;
470:             } else {
471:                 imgH = height;
472:                 imgW = imgH * imgAspect;
473:             }
474:             imgX = (width - imgW) / 2;
475:             imgY = (height - imgH) / 2;
476:         }
477:         offscreenReady = false;
478:     }
479: 
480:     pcbImage.onload = () => { resize(); renderOffscreen(); };
481:     pcbImage.src = 'images/Data_diode_structure.png';
482: 
483:     // If already cached/complete, fire manually
484:     if (pcbImage.complete && pcbImage.naturalWidth > 0) {
485:         resize();
486:         renderOffscreen();
487:     }
488: 
489:     window.addEventListener('resize', () => { resize(); }, { passive: true });
490:     resize();
491: 
492:     // ===== SMOOTH LENS STATE =====
493:     let lensX = 0, lensY = 0, lensScale = 0, lensAlpha = 0;
494: 
495:     // ===== DRAW BACKGROUND (now just a cheap drawImage from pre-filtered cache) =====
496:     function drawPCBBackground() {
497:         if (!offscreenReady) renderOffscreen();
498:         if (!offscreenReady) return;
499:         ctx.save();
500:         // Slightly brighter background on mobile for better visibility
501:         ctx.globalAlpha = isTouchDevice ? 0.35 : 0.25;
502:         ctx.drawImage(bgOff, 0, 0);
503:         ctx.restore();
504:     }
505: 
506:     // ===== DRAW FISHEYE LENS =====
507:     function drawLens(time) {
508:         if (!offscreenReady) return;
509: 
510:         // Initialize lens in center on first frame
511:         if (width && height && lensX === 0) {
512:             lensX = width / 2;
513:             lensY = height / 2;
514:         }
515: 
516:         // Smooth interpolation
517:         if (mouse.active) {
518:             lensScale += (1 - lensScale) * 0.12;
519:             lensAlpha += (1 - lensAlpha) * 0.15;
520:             lensX += (mouse.x - lensX) * 0.15;
521:             lensY += (mouse.y - lensY) * 0.15;
522:         } else {
523:             lensScale += (0 - lensScale) * 0.25;
524:             lensAlpha += (0 - lensAlpha) * 0.35;
525:         }
526: 
527:         if (lensAlpha < 0.01 && lensScale < 0.01) return;
528:         lensScale = Math.max(0.001, Math.min(1, lensScale));
529:         lensAlpha = Math.max(0, Math.min(1, lensAlpha));
530: 
531:         const R = mouse.radius * lensScale;
532: 
533:         // Guard: skip drawing when lens is too small to render
534:         // (prevents DOMException from drawImage with near-zero source dimensions)
535:         if (R < 2) return;
536: 
537:         const zoom = 1.8;
538:         const cellW = (R * 2) / GRID;
539:         const cellH = (R * 2) / GRID;
540:         const halfView = R / zoom;
541: 
542:         // --- Fisheye content (clipped to circle, drawn ON TOP of background) ---
543:         ctx.save();
544:         ctx.beginPath();
545:         ctx.arc(lensX, lensY, R, 0, Math.PI * 2);
546:         ctx.clip();
547:         ctx.globalAlpha = lensAlpha;
548: 
549:         for (let gy = 0; gy < GRID; gy++) {
550:             for (let gx = 0; gx < GRID; gx++) {
551:                 const cell = fishGrid[gy * GRID + gx];
552:                 const sx = lensX + cell.snx * halfView;
553:                 const sy = lensY + cell.sny * halfView;
554:                 const sw = halfView / GRID * 2;
555:                 const sh = sw;
556:                 const dx = lensX - R + gx * cellW;
557:                 const dy = lensY - R + gy * cellH;
558: 
559:                 ctx.drawImage(lensOff,
560:                     sx - sw / 2, sy - sh / 2, sw, sh,
561:                     dx, dy, cellW + 0.5, cellH + 0.5
562:                 );
563:             }
564:         }
565: 
566:         // Vignette
567:         const vig = ctx.createRadialGradient(lensX, lensY, R * 0.5, lensX, lensY, R);
568:         vig.addColorStop(0, 'rgba(0,0,0,0)');
569:         vig.addColorStop(0.8, 'rgba(0,0,0,0)');
570:         vig.addColorStop(1, 'rgba(0,0,0,0.55)');
571:         ctx.fillStyle = vig;
572:         ctx.fill();
573: 
574:         // Scanlines
575:         ctx.globalAlpha = 0.04 * lensAlpha;
576:         ctx.fillStyle = '#fff';
577:         const scanOff = (time * 0.03) % 4;
578:         for (let i = 0; i < R * 2; i += 4) {
579:             ctx.fillRect(lensX - R, lensY - R + i + scanOff, R * 2, 0.5);
580:         }
581: 
582:         ctx.restore();
583: 
584:         // ===== DEEP TECH LENS OVERLAY (white/grey palette) =====
585:         ctx.save();
586:         ctx.globalAlpha = lensAlpha;
587:         ctx.translate(lensX, lensY);
588: 
589:         // Outer glow (cool white)
590:         ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
591:         ctx.shadowBlur = 12;
592:         ctx.beginPath();
593:         ctx.arc(0, 0, R, 0, Math.PI * 2);
594:         ctx.lineWidth = 1.5;
595:         ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
596:         ctx.stroke();
597:         ctx.shadowBlur = 0;
598: 
599:         // Main ring
600:         ctx.beginPath();
601:         ctx.arc(0, 0, R, 0, Math.PI * 2);
602:         ctx.lineWidth = 1.2;
603:         ctx.strokeStyle = 'rgba(255,255,255,0.85)';
604:         ctx.stroke();
605: 
606:         // Outer precision ring
607:         ctx.beginPath();
608:         ctx.arc(0, 0, R + 5, 0, Math.PI * 2);
609:         ctx.lineWidth = 0.4;
610:         ctx.strokeStyle = 'rgba(255,255,255,0.15)';
611:         ctx.stroke();
612: 
613:         // Inner dashed measurement ring
614:         ctx.beginPath();
615:         ctx.arc(0, 0, Math.max(0, R - 6), 0, Math.PI * 2);
616:         ctx.lineWidth = 0.6;
617:         ctx.setLineDash([2, 10]);
618:         ctx.strokeStyle = 'rgba(255,255,255,0.25)';
619:         ctx.stroke();
620:         ctx.setLineDash([]);
621: 
622:         // Rotating outer tech arcs (white/grey, 4 segments)
623:         const rot1 = time * 0.0004;
624:         ctx.lineWidth = 1.2;
625:         for (let i = 0; i < 4; i++) {
626:             const a = rot1 + (i * Math.PI * 2) / 4;
627:             ctx.beginPath();
628:             ctx.arc(0, 0, R + 11, a, a + Math.PI / 14);
629:             ctx.strokeStyle = `rgba(180, 200, 220, ${0.3 + 0.15 * Math.sin(time * 0.002 + i)})`;
630:             ctx.stroke();
631:         }
632: 
633:         // Counter-rotating inner arcs (6 segments)
634:         const rot2 = -time * 0.0003;
635:         ctx.lineWidth = 0.6;
636:         for (let i = 0; i < 6; i++) {
637:             const a = rot2 + (i * Math.PI * 2) / 6;
638:             ctx.beginPath();
639:             ctx.arc(0, 0, Math.max(0, R - 12), a, a + Math.PI / 22);
640:             ctx.strokeStyle = 'rgba(255,255,255,0.15)';
641:             ctx.stroke();
642:         }
643: 
644:         // Precision tick marks around circumference
645:         ctx.lineWidth = 0.5;
646:         ctx.strokeStyle = 'rgba(255,255,255,0.2)';
647:         for (let i = 0; i < 36; i++) {
648:             const a = (i * Math.PI * 2) / 36;
649:             const inner = i % 9 === 0 ? R - 4 : R - 2;
650:             ctx.beginPath();
651:             ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
652:             ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
653:             ctx.stroke();
654:         }
655: 
656:         // Corner brackets
657:         const bLen = 12;
658:         const bOff = R * 0.42;
659:         ctx.lineWidth = 0.8;
660:         ctx.strokeStyle = 'rgba(255,255,255,0.35)';
661:         ctx.beginPath();
662:         ctx.moveTo(-bOff, -bOff + bLen); ctx.lineTo(-bOff, -bOff); ctx.lineTo(-bOff + bLen, -bOff);
663:         ctx.moveTo(bOff - bLen, -bOff); ctx.lineTo(bOff, -bOff); ctx.lineTo(bOff, -bOff + bLen);
664:         ctx.moveTo(-bOff, bOff - bLen); ctx.lineTo(-bOff, bOff); ctx.lineTo(-bOff + bLen, bOff);
665:         ctx.moveTo(bOff - bLen, bOff); ctx.lineTo(bOff, bOff); ctx.lineTo(bOff, bOff - bLen);
666:         ctx.stroke();
667: 
668:         // Crosshairs
669:         const chLen = 8;
670:         const chOff = Math.max(10, R * 0.15);
671:         ctx.lineWidth = 0.6;
672:         ctx.strokeStyle = 'rgba(255,255,255,0.4)';
673:         ctx.beginPath();
674:         ctx.moveTo(0, -chOff - chLen); ctx.lineTo(0, -chOff);
675:         ctx.moveTo(0, chOff); ctx.lineTo(0, chOff + chLen);
676:         ctx.moveTo(-chOff - chLen, 0); ctx.lineTo(-chOff, 0);
677:         ctx.moveTo(chOff, 0); ctx.lineTo(chOff + chLen, 0);
678:         ctx.stroke();
679: 
680:         // Center dot
681:         ctx.beginPath();
682:         ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
683:         ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
684:         ctx.fill();
685: 
686:         // HUD readouts
687:         ctx.font = '9px monospace';
688:         ctx.textAlign = 'left';
689:         ctx.fillStyle = 'rgba(255,255,255,0.35)';
690:         ctx.fillText(`X:${Math.round(lensX)} Y:${Math.round(lensY)}`, chOff + 4, -4);
691:         ctx.fillText(`${zoom.toFixed(1)}x SCAN`, chOff + 4, 10);
692: 
693:         ctx.textAlign = 'center';
694:         ctx.fillStyle = 'rgba(180, 200, 220, 0.35)';
695:         ctx.font = '7px monospace';
696:         ctx.fillText('K4 · PHYSICAL LAYER ANALYSIS', 0, R - 16);
697: 
698:         ctx.restore();
699:     }
700: 
701:     // ===== VISIBILITY CHECK — skip rendering when hero off-screen =====
702:     let heroVisible = true;
703:     if ('IntersectionObserver' in window) {
704:         const obs = new IntersectionObserver((entries) => {
705:             heroVisible = entries[0].isIntersecting;
706:         }, { threshold: 0.05 });
707:         obs.observe(heroEl);
708:     }
709: 
710:     // ===== ANIMATION LOOP =====
711:     function animate(time) {
712:         requestAnimationFrame(animate);
713:         if (!heroVisible) return;
714: 
715:         ctx.clearRect(0, 0, width, height);
716:         drawPCBBackground();
717:         if (!isTouchDevice) drawLens(time); // Skip lens completely on mobile
718:     }
719: 
720:     requestAnimationFrame(animate);
721: }
722: 
723: 
724: function initCardSwap() {
725:     try {
726:         const container = document.querySelector('.card-swap-container');
727:         if (!container) return;
728: 
729:         const cards = Array.from(container.querySelectorAll('.card'));
730:         if (cards.length === 0) return;
731: 
732:         const isMobileCards = window.innerWidth <= 900;
733:         const cardDistance = isMobileCards ? 40 : 60;
734:         const verticalDistance = isMobileCards ? 0 : 100; // Flat stacking on mobile
735:         const skewAmount = isMobileCards ? 0 : 6; // No skew on mobile
736:         const delay = 5000;
737: 
738:         // Elastic easing configuration from React component
739:         const config = {
740:             ease: 'elastic.out(0.6,0.9)',
741:             durDrop: 2,
742:             durMove: 2,
743:             durReturn: 2,
744:             promoteOverlap: 0.9,
745:             returnDelay: 0.05
746:         };
747: 
748:         const makeSlot = (i, distX, distY, total) => ({
749:             x: i * distX,
750:             y: -i * distY,
751:             z: -i * distX * 1.5,
752:             zIndex: total - i
753:         });
754: 
755:         const placeNow = (el, slot, skew) => {
756:             gsap.set(el, {
757:                 x: slot.x,
758:                 y: slot.y,
759:                 z: slot.z,
760:                 xPercent: -50,
761:                 yPercent: -50,
762:                 skewY: skew,
763:                 transformOrigin: 'center center',
764:                 zIndex: slot.zIndex,
765:                 force3D: true
766:             });
767:         };
768: 
769:         const total = cards.length;
770:         let order = cards.map((_, i) => i);
771:         let tlRef = null;
772: 
773:         const swap = (targetOriginalIndex = null) => {
774:             if (order.length < 2) return;
775:             if (tlRef && tlRef.isActive()) return;
776: 
777:             let steps = 1;
778:             if (targetOriginalIndex !== null) {
779:                 const targetIndexInOrder = order.indexOf(targetOriginalIndex);
780:                 if (targetIndexInOrder === 0) return; // Already front
781:                 if (targetIndexInOrder > 0) {
782:                     steps = targetIndexInOrder;
783:                 }
784:             }
785: 
786:             const movingToBack = order.slice(0, steps);
787:             const movingForward = order.slice(steps);
788: 
789:             const tl = gsap.timeline();
790:             tlRef = tl;
791: 
792:             movingToBack.forEach((idx, i) => {
793:                 const elFront = cards[idx];
794:                 const backIndex = movingForward.length + i;
795:                 const slot = makeSlot(backIndex, cardDistance, verticalDistance, total);
796: 
797:                 // Keep on top during the drop animation
798:                 tl.set(elFront, { zIndex: 100 }, i * 0.15);
799: 
800:                 tl.to(elFront, {
801:                     y: '+=500',
802:                     z: slot.z,
803:                     duration: config.durDrop,
804:                     ease: config.ease
805:                 }, i * 0.15); // Stagger drop
806:             });
807: 
808:             tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
809: 
810:             movingForward.forEach((idx, i) => {
811:                 const el = cards[idx];
812:                 const slot = makeSlot(i, cardDistance, verticalDistance, total);
813:                 tl.set(el, { zIndex: slot.zIndex }, 'promote');
814:                 tl.to(
815:                     el,
816:                     {
817:                         x: slot.x,
818:                         y: slot.y,
819:                         z: slot.z,
820:                         duration: config.durMove,
821:                         ease: config.ease
822:                     },
823:                     `promote+=${i * 0.15}`
824:                 );
825:             });
826: 
827:             tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
828: 
829:             movingToBack.forEach((idx, i) => {
830:                 const elFront = cards[idx];
831:                 const backIndex = movingForward.length + i;
832:                 const slot = makeSlot(backIndex, cardDistance, verticalDistance, total);
833: 
834:                 tl.call(() => {
835:                     gsap.set(elFront, { zIndex: slot.zIndex });
836:                 }, null, 'return');
837: 
838:                 tl.to(
839:                     elFront,
840:                     {
841:                         x: slot.x,
842:                         y: slot.y,
843:                         duration: config.durReturn,
844:                         ease: config.ease
845:                     },
846:                     `return+=${i * 0.15}`
847:                 );
848:             });
849: 
850:             tl.call(() => {
851:                 order = [...movingForward, ...movingToBack];
852:             });
853:         };
854: 
855:         cards.forEach((card, i) => {
856:             placeNow(card, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
857:             card.style.cursor = 'pointer';
858:             card.addEventListener('click', () => {
859:                 swap(i);
860:             });
861:         });
862:     } catch (err) {
863:         console.error("CardSwap initialization failed:", err);
864:     }
865: }
866: 
867: function initGrainient() {
868:     const cards = document.querySelectorAll('.card-swap-container .card');
869:     if (cards.length === 0) return;
870: 
871:     const vertSrc = `#version 300 es
872:     in vec2 position;
873:     void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
874: 
875:     const fragSrc = `#version 300 es
876:     precision highp float;
877:     uniform vec2 iResolution;
878:     uniform float iTime;
879:     uniform float uTimeSpeed;
880:     uniform float uColorBalance;
881:     uniform float uWarpStrength;
882:     uniform float uWarpFrequency;
883:     uniform float uWarpSpeed;
884:     uniform float uWarpAmplitude;
885:     uniform float uBlendAngle;
886:     uniform float uBlendSoftness;
887:     uniform float uRotationAmount;
888:     uniform float uNoiseScale;
889:     uniform float uGrainAmount;
890:     uniform float uGrainScale;
891:     uniform float uGrainAnimated;
892:     uniform float uContrast;
893:     uniform float uGamma;
894:     uniform float uSaturation;
895:     uniform vec2 uCenterOffset;
896:     uniform float uZoom;
897:     uniform vec3 uColor1;
898:     uniform vec3 uColor2;
899:     uniform vec3 uColor3;
900:     out vec4 fragColor;
901:     #define S(a,b,t) smoothstep(a,b,t)
902:     mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
903:     vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
904:     float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0,0)),f-vec2(0,0)),dot(-1.0+2.0*hash(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0,1)),f-vec2(0,1)),dot(-1.0+2.0*hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);return 0.5+0.5*n;}
905:     void main(){
906:       float t=iTime*uTimeSpeed;
907:       vec2 uv=gl_FragCoord.xy/iResolution.xy;
908:       float ratio=iResolution.x/iResolution.y;
909:       vec2 tuv=uv-0.5+uCenterOffset;
910:       tuv/=max(uZoom,0.001);
911:       float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
912:       tuv.y*=1.0/ratio;
913:       tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
914:       tuv.y*=ratio;
915:       float frequency=uWarpFrequency;
916:       float ws=max(uWarpStrength,0.001);
917:       float amplitude=uWarpAmplitude/ws;
918:       float warpTime=t*uWarpSpeed;
919:       tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
920:       tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);
921:       vec3 colLav=uColor1;
922:       vec3 colOrg=uColor2;
923:       vec3 colDark=uColor3;
924:       float b=uColorBalance;
925:       float s=max(uBlendSoftness,0.0);
926:       mat2 blendRot=Rot(radians(uBlendAngle));
927:       float blendX=(tuv*blendRot).x;
928:       float edge0=-0.3-b-s;
929:       float edge1=0.2-b+s;
930:       float v0=0.5-b+s;
931:       float v1=-0.3-b-s;
932:       vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
933:       vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
934:       vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));
935:       vec2 grainUv=uv*max(uGrainScale,0.001);
936:       if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
937:       float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
938:       col+=(grain-0.5)*uGrainAmount;
939:       col=(col-0.5)*uContrast+0.5;
940:       float luma=dot(col,vec3(0.2126,0.7152,0.0722));
941:       col=mix(vec3(luma),col,uSaturation);
942:       col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
943:       col=clamp(col,0.0,1.0);
944:       fragColor=vec4(col,1.0);
945:     }`;
946: 
947:     const hexToRgb = hex => {
948:         const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
949:         return r ? [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255] : [1, 1, 1];
950:     };
951: 
952:     function compile(gl, type, src) {
953:         const s = gl.createShader(type);
954:         gl.shaderSource(s, src);
955:         gl.compileShader(s);
956:         if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
957:             console.error('Grainient shader error:', gl.getShaderInfoLog(s));
958:             gl.deleteShader(s);
959:             return null;
960:         }
961:         return s;
962:     }
963: 
964:     function link(gl) {
965:         const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
966:         const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
967:         if (!vs || !fs) return null;
968:         const p = gl.createProgram();
969:         gl.attachShader(p, vs);
970:         gl.attachShader(p, fs);
971:         gl.linkProgram(p);
972:         if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
973:             console.error('Grainient link error:', gl.getProgramInfoLog(p));
974:             return null;
975:         }
976:         return p;
977:     }
978: 
979:     const params = {
980:         timeSpeed: 0.25, colorBalance: 0, warpStrength: 1, warpFrequency: 5,
981:         warpSpeed: 2, warpAmplitude: 50, blendAngle: 0, blendSoftness: 0.05,
982:         rotationAmount: 500, noiseScale: 2, grainAmount: 0.1, grainScale: 2,
983:         grainAnimated: false, contrast: 1.5, gamma: 1, saturation: 1,
984:         centerX: 0, centerY: 0, zoom: 0.9,
985:         color1: '#E97132', color2: '#1a0a00', color3: '#331500'
986:     };
987: 
988:     const cardColors = [
989:         { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
990:         { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
991:         { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
992:         { color1: '#E97132', color2: '#1a0a00', color3: '#331500' },
993:     ];
994: 
995:     const contexts = [];
996: 
997:     cards.forEach((card, cardIndex) => {
998:         const canvas = document.createElement('canvas');
999:         canvas.className = 'grainient-canvas';
1000:         card.insertBefore(canvas, card.firstChild);
1001: 
1002:         const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
1003:         if (!gl) return;
1004: 
1005:         const program = link(gl);
1006:         if (!program) return;
1007: 
1008:         gl.useProgram(program);
1009: 
1010:         // Fullscreen triangle
1011:         const posLoc = gl.getAttribLocation(program, 'position');
1012:         const buf = gl.createBuffer();
1013:         gl.bindBuffer(gl.ARRAY_BUFFER, buf);
1014:         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
1015:         gl.enableVertexAttribArray(posLoc);
1016:         gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
1017: 
1018:         // Set static uniforms
1019:         const u = name => gl.getUniformLocation(program, name);
1020:         gl.uniform1f(u('uTimeSpeed'), params.timeSpeed);
1021:         gl.uniform1f(u('uColorBalance'), params.colorBalance);
1022:         gl.uniform1f(u('uWarpStrength'), params.warpStrength);
1023:         gl.uniform1f(u('uWarpFrequency'), params.warpFrequency);
1024:         gl.uniform1f(u('uWarpSpeed'), params.warpSpeed);
1025:         gl.uniform1f(u('uWarpAmplitude'), params.warpAmplitude);
1026:         gl.uniform1f(u('uBlendAngle'), params.blendAngle);
1027:         gl.uniform1f(u('uBlendSoftness'), params.blendSoftness);
1028:         gl.uniform1f(u('uRotationAmount'), params.rotationAmount);
1029:         gl.uniform1f(u('uNoiseScale'), params.noiseScale);
1030:         gl.uniform1f(u('uGrainAmount'), params.grainAmount);
1031:         gl.uniform1f(u('uGrainScale'), params.grainScale);
1032:         gl.uniform1f(u('uGrainAnimated'), params.grainAnimated ? 1.0 : 0.0);
1033:         gl.uniform1f(u('uContrast'), params.contrast);
1034:         gl.uniform1f(u('uGamma'), params.gamma);
1035:         gl.uniform1f(u('uSaturation'), params.saturation);
1036:         gl.uniform2f(u('uCenterOffset'), params.centerX, params.centerY);
1037:         gl.uniform1f(u('uZoom'), params.zoom);
1038: 
1039:         const colors = cardColors[cardIndex % cardColors.length];
1040:         gl.uniform3fv(u('uColor1'), hexToRgb(colors.color1));
1041:         gl.uniform3fv(u('uColor2'), hexToRgb(colors.color2));
1042:         gl.uniform3fv(u('uColor3'), hexToRgb(colors.color3));
1043: 
1044:         contexts.push({ canvas, gl, program, uTime: u('iTime'), uRes: u('iResolution'), card });
1045:     });
1046: 
1047:     if (contexts.length === 0) return;
1048: 
1049:     const t0 = performance.now();
1050:     function render(t) {
1051:         const time = (t - t0) * 0.001;
1052:         contexts.forEach(ctx => {
1053:             const rect = ctx.card.getBoundingClientRect();
1054:             const w = Math.max(1, Math.floor(rect.width));
1055:             const h = Math.max(1, Math.floor(rect.height));
1056:             const dpr = Math.min(window.devicePixelRatio || 1, 2);
1057:             const cw = Math.floor(w * dpr);
1058:             const ch = Math.floor(h * dpr);
1059:             if (ctx.canvas.width !== cw || ctx.canvas.height !== ch) {
1060:                 ctx.canvas.width = cw;
1061:                 ctx.canvas.height = ch;
1062:             }
1063:             ctx.gl.viewport(0, 0, cw, ch);
1064:             ctx.gl.useProgram(ctx.program);
1065:             ctx.gl.uniform1f(ctx.uTime, time);
1066:             ctx.gl.uniform2f(ctx.uRes, cw, ch);
1067:             ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, 3);
1068:         });
1069:         requestAnimationFrame(render);
1070:     }
1071:     requestAnimationFrame(render);
1072: }
1073: 
1074: function initPlasma() {
1075:     const canvas = document.getElementById('plasma-canvas');
1076:     if (!canvas) return;
1077: 
1078:     const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: false });
1079:     if (!gl) return;
1080: 
1081:     const vertSrc = `#version 300 es
1082: precision highp float;
1083: in vec2 position;
1084: void main() {
1085:   gl_Position = vec4(position, 0.0, 1.0);
1086: }`;
1087: 
1088:     const fragSrc = `#version 300 es
1089: precision highp float;
1090: uniform vec2 iResolution;
1091: uniform float iTime;
1092: uniform vec3 uCustomColor;
1093: uniform float uSpeed;
1094: uniform float uScale;
1095: uniform float uOpacity;
1096: out vec4 fragColor;
1097: 
1098: void mainImage(out vec4 o, vec2 C) {
1099:   vec2 center = iResolution.xy * 0.5;
1100:   C = (C - center) / uScale + center;
1101:   float i, d, z, T = iTime * uSpeed;
1102:   vec3 O, p, S;
1103:   for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
1104:     p = z*normalize(vec3(C-.5*r,r.y));
1105:     p.z -= 4.;
1106:     S = p;
1107:     d = p.y-T;
1108:     p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
1109:     Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
1110:     z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
1111:     o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
1112:   }
1113:   o.xyz = tanh(O/1e4);
1114: }
1115: 
1116: bool finite1(float x){ return !(isnan(x) || isinf(x)); }
1117: vec3 sanitize(vec3 c){
1118:   return vec3(
1119:     finite1(c.r) ? c.r : 0.0,
1120:     finite1(c.g) ? c.g : 0.0,
1121:     finite1(c.b) ? c.b : 0.0
1122:   );
1123: }
1124: 
1125: void main() {
1126:   vec4 o = vec4(0.0);
1127:   mainImage(o, gl_FragCoord.xy);
1128:   vec3 rgb = sanitize(o.rgb);
1129:   float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
1130:   vec3 finalColor = intensity * uCustomColor;
1131:   float alpha = length(rgb) * uOpacity;
1132:   fragColor = vec4(finalColor, alpha);
1133: }`;
1134: 
1135:     function compile(gl, type, src) {
1136:         const s = gl.createShader(type);
1137:         gl.shaderSource(s, src);
1138:         gl.compileShader(s);
1139:         if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
1140:             console.error('Plasma shader error:', gl.getShaderInfoLog(s));
1141:             return null;
1142:         }
1143:         return s;
1144:     }
1145: 
1146:     const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
1147:     const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
1148:     if (!vs || !fs) return;
1149: 
1150:     const program = gl.createProgram();
1151:     gl.attachShader(program, vs);
1152:     gl.attachShader(program, fs);
1153:     gl.linkProgram(program);
1154:     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
1155:         console.error('Plasma link error:', gl.getProgramInfoLog(program));
1156:         return;
1157:     }
1158: 
1159:     gl.useProgram(program);
1160: 
1161:     // Fullscreen triangle
1162:     const posLoc = gl.getAttribLocation(program, 'position');
1163:     const buf = gl.createBuffer();
1164:     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
1165:     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
1166:     gl.enableVertexAttribArray(posLoc);
1167:     gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
1168: 
1169:     // Set uniforms
1170:     const u = name => gl.getUniformLocation(program, name);
1171:     gl.uniform3fv(u('uCustomColor'), [177 / 255, 158 / 255, 239 / 255]); // #B19EEF exact custom color
1172:     gl.uniform1f(u('uSpeed'), 0.6 * 0.4); // speed * 0.4 as in React
1173:     gl.uniform1f(u('uScale'), 1.1);
1174:     gl.uniform1f(u('uOpacity'), 0.8);
1175: 
1176:     const uTime = u('iTime');
1177:     const uRes = u('iResolution');
1178: 
1179:     gl.enable(gl.BLEND);
1180:     gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
1181: 
1182:     // Visibility check — skip GPU work when pilot section is off-screen
1183:     let plasmaVisible = false;
1184:     const pilotSection = document.getElementById('pilot');
1185:     if ('IntersectionObserver' in window && pilotSection) {
1186:         const obs = new IntersectionObserver((entries) => {
1187:             plasmaVisible = entries[0].isIntersecting;
1188:         }, { threshold: 0.05 });
1189:         obs.observe(pilotSection);
1190:     } else {
1191:         plasmaVisible = true;
1192:     }
1193: 
1194:     const t0 = performance.now();
1195:     function render(now) {
1196:         requestAnimationFrame(render);
1197:         if (!plasmaVisible) return;
1198: 
1199:         const card = canvas.parentElement;
1200:         if (!card) return;
1201:         const cw = card.clientWidth;
1202:         const ch = card.clientHeight;
1203:         if (canvas.width !== cw || canvas.height !== ch) {
1204:             canvas.width = cw;
1205:             canvas.height = ch;
1206:         }
1207:         gl.viewport(0, 0, cw, ch);
1208:         gl.useProgram(program);
1209:         gl.uniform1f(uTime, (now - t0) * 0.001);
1210:         gl.uniform2f(uRes, cw, ch);
1211:         gl.drawArrays(gl.TRIANGLES, 0, 3);
1212:     }
1213:     requestAnimationFrame(render);
1214: }
1215: 
1216: function initNASAnimation() {
1217:     const canvas = document.getElementById('nas-scroll-canvas');
1218:     if (!canvas) return;
1219: 
1220:     const ctx = canvas.getContext('2d');
1221:     if (!ctx) return;
1222: 
1223:     const TOTAL_FRAMES = 250;
1224:     const EAGER_COUNT = 10;       // Load immediately
1225:     const FAST_COUNT = 40;        // Load on first idle
1226:     const BATCH_SIZE = 10;        // Lazy batch size
1227:     const frames = new Array(TOTAL_FRAMES);
1228:     let loadedCount = 0;
1229:     let currentFrameIndex = -1;
1230: 
1231:     // Build frame path: 0001.webp ... 0250.webp
1232:     function framePath(i) {
1233:         return 'images/NAS animation/' + String(i + 1).padStart(4, '0') + '.webp';
1234:     }
1235: 
1236:     // Draw a frame onto the canvas, respecting the display size
1237:     function drawFrame(index) {
1238:         const img = frames[index];
1239:         if (!img || !img.complete || img.naturalWidth === 0) return;
1240: 
1241:         // Match canvas internal resolution to its CSS display size (for crisp rendering)
1242:         const dpr = Math.min(window.devicePixelRatio || 1, 2);
1243:         const rect = canvas.getBoundingClientRect();
1244:         const w = Math.round(rect.width * dpr);
1245:         const h = Math.round(rect.height * dpr);
1246: 
1247:         if (canvas.width !== w || canvas.height !== h) {
1248:             canvas.width = w;
1249:             canvas.height = h;
1250:         }
1251: 
1252:         ctx.clearRect(0, 0, w, h);
1253:         ctx.drawImage(img, 0, 0, w, h);
1254:     }
1255: 
1256:     // Load a single frame, returns a Promise
1257:     function loadFrame(index) {
1258:         return new Promise((resolve) => {
1259:             if (frames[index]) { resolve(); return; }
1260: 
1261:             const img = new Image();
1262:             img.src = framePath(index);
1263: 
1264:             img.onload = () => {
1265:                 frames[index] = img;
1266:                 loadedCount++;
1267: 
1268:                 // If this is the very first frame loaded, draw it immediately
1269:                 if (index === 0 && currentFrameIndex <= 0) {
1270:                     currentFrameIndex = 0;
1271:                     drawFrame(0);
1272:                 }
1273:                 resolve();
1274:             };
1275:             img.onerror = () => resolve(); // Silently skip broken frames
1276:         });
1277:     }
1278: 
1279:     // Load a batch of frames sequentially (to avoid network congestion)
1280:     async function loadRange(start, end) {
1281:         for (let i = start; i < Math.min(end, TOTAL_FRAMES); i++) {
1282:             await loadFrame(i);
1283:         }
1284:     }
1285: 
1286:     // Load remaining frames lazily in idle batches
1287:     function loadLazy(startFrom) {
1288:         let cursor = startFrom;
1289: 
1290:         function loadNextBatch() {
1291:             if (cursor >= TOTAL_FRAMES) return;
1292: 
1293:             const batchEnd = Math.min(cursor + BATCH_SIZE, TOTAL_FRAMES);
1294:             loadRange(cursor, batchEnd).then(() => {
1295:                 cursor = batchEnd;
1296:                 if (cursor < TOTAL_FRAMES) {
1297:                     // Use requestIdleCallback if available, otherwise setTimeout
1298:                     if ('requestIdleCallback' in window) {
1299:                         requestIdleCallback(loadNextBatch, { timeout: 200 });
1300:                     } else {
1301:                         setTimeout(loadNextBatch, 50);
1302:                     }
1303:                 }
1304:             });
1305:         }
1306: 
1307:         loadNextBatch();
1308:     }
1309: 
1310:     // --- Start progressive loading ---
1311:     // Phase 1: Load first N frames eagerly
1312:     loadRange(0, EAGER_COUNT).then(() => {
1313:         if (currentFrameIndex < 0) {
1314:             currentFrameIndex = 0;
1315:             drawFrame(0);
1316:         }
1317:         initTrigger();
1318:         ScrollTrigger.refresh(); // Ensure pinning positions are correct after init
1319: 
1320:         // Phase 2: Load next batch on idle
1321:         if ('requestIdleCallback' in window) {
1322:             requestIdleCallback(() => {
1323:                 loadRange(EAGER_COUNT, FAST_COUNT).then(() => {
1324:                     // Phase 3: Lazy-load the rest
1325:                     loadLazy(FAST_COUNT);
1326:                 });
1327:             }, { timeout: 500 });
1328:         } else {
1329:             setTimeout(() => {
1330:                 loadRange(EAGER_COUNT, FAST_COUNT).then(() => {
1331:                     loadLazy(FAST_COUNT);
1332:                 });
1333:             }, 100);
1334:         }
1335:     });
1336: 
1337:     // If frames are already cached/complete, we should init trigger even sooner if possible
1338:     // but the above eager load is usually < 50ms for 10 small webp frames.
1339: 
1340:     // --- GSAP ScrollTrigger: map scroll to frame index ---
1341:     const animObj = { frame: 0 };
1342:     let st = null;
1343: 
1344:     function initTrigger() {
1345:         if (st) {
1346:             st.kill();
1347:             st = null;
1348:         }
1349:         
1350:         if (window.innerWidth <= 900) {
1351:             // Mobile: Show assembled NAS (frame 40) as static image
1352:             const mobileFrame = 40;
1353:             const drawMobile = () => {
1354:                 currentFrameIndex = mobileFrame;
1355:                 drawFrame(mobileFrame);
1356:             };
1357:             if (frames[mobileFrame]) {
1358:                 drawMobile();
1359:             } else {
1360:                 loadFrame(mobileFrame).then(drawMobile);
1361:             }
1362:             return;
1363:         }
1364: 
1365:         // Desktop: Pinning animation
1366:         st = ScrollTrigger.create({
1367:             trigger: '#product',
1368:             start: 'top top',
1369:             end: '+=4000', // Restored slow cinematic feel
1370:             pin: true,
1371:             scrub: 0.1, // Ultra-low damping for immediate unpinning feel
1372:             fastScrollEnd: true,
1373:             anticipatePin: 1,
1374:             onUpdate: (self) => {
1375:                 const padding = 0.15; // 15% scroll buffer at start
1376:                 // Map progress so it starts after padding but ends exactly at 1.0 (unpin point)
1377:                 let p = (self.progress - padding) / (1 - padding);
1378:                 p = Math.max(0, Math.min(1, p));
1379:                 
1380:                 const idx = Math.round(p * (TOTAL_FRAMES - 1));
1381:                 if (idx !== currentFrameIndex && frames[idx]) {
1382:                     currentFrameIndex = idx;
1383:                     drawFrame(idx);
1384:                 }
1385:             }
1386:         });
1387: 
1388:         // Ensure we draw the first frame immediately if available
1389:         if (frames[0] && currentFrameIndex < 0) {
1390:             currentFrameIndex = 0;
1391:             drawFrame(0);
1392:         }
1393:     }
1394: 
1395: 
1396:     // Handle resize
1397:     let resizeTimer;
1398:     window.addEventListener('resize', () => {
1399:         clearTimeout(resizeTimer);
1400:         resizeTimer = setTimeout(() => {
1401:             initTrigger();
1402:             if (currentFrameIndex >= 0 && frames[currentFrameIndex]) {
1403:                 drawFrame(currentFrameIndex);
1404:             }
1405:         }, 200);
1406:     });
1407: }
1408: 
1409: function initPilotForm() {
1410:     const form = document.getElementById('pilot-form');
1411:     if (!form) return;
1412: 
1413:     const inputs = form.querySelectorAll('.pilot-form-input[required]');
1414: 
1415:     inputs.forEach(input => {
1416:         // Validate on blur
1417:         input.addEventListener('blur', () => {
1418:             validateInput(input);
1419:         });
1420: 
1421:         // Remove error on input/change
1422:         ['input', 'change'].forEach(evt => {
1423:             input.addEventListener(evt, () => {
1424:                 input.classList.remove('invalid');
1425:                 const formGroup = input.closest('.form-group');
1426:                 const errorMsg = formGroup ? formGroup.querySelector('.form-error') : null;
1427:                 if (errorMsg) errorMsg.classList.remove('visible');
1428:             });
1429:         });
1430:     });
1431: 
1432:     form.addEventListener('submit', (e) => {
1433:         e.preventDefault();
1434:         let isValid = true;
1435: 
1436:         inputs.forEach(input => {
1437:             if (!validateInput(input)) {
1438:                 isValid = false;
1439:             }
1440:         });
1441: 
1442:         if (isValid) {
1443:             // Optional: submit via fetch here
1444:             const btn = form.querySelector('button[type="submit"]');
1445:             const originalText = btn.textContent;
1446:             btn.textContent = 'Application Sent!';
1447:             btn.style.background = '#00C853';
1448:             btn.style.color = '#fff';
1449:             setTimeout(() => {
1450:                 btn.textContent = originalText;
1451:                 btn.style.background = '';
1452:                 btn.style.color = '';
1453:                 form.reset();
1454:             }, 3000);
1455:         }
1456:     });
1457: 
1458:     function validateInput(input) {
1459:         const formGroup = input.closest('.form-group');
1460:         const errorMsg = formGroup ? formGroup.querySelector('.form-error') : null;
1461:         if (!errorMsg) return true;
1462: 
1463:         if (!input.validity.valid) {
1464:             input.classList.add('invalid');
1465:             errorMsg.classList.add('visible');
1466:             return false;
1467:         } else {
1468:             input.classList.remove('invalid');
1469:             errorMsg.classList.remove('visible');
1470:             return true;
1471:         }
1472:     }
1473: }

