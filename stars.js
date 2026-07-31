const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const starsLayer = document.getElementById('shooting-stars');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [];
let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(240, Math.floor((width * height) / 6500));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + 0.15,
    alpha: Math.random() * 0.7 + 0.2,
    pulse: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.012 + 0.004,
  }));
}

function drawStars(time = 0) {
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    const alpha = reducedMotion
      ? star.alpha
      : star.alpha * (0.72 + Math.sin(time * star.speed + star.pulse) * 0.28);
    ctx.beginPath();
    ctx.fillStyle = `rgba(220, 238, 255, ${Math.max(0.08, alpha)})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reducedMotion) requestAnimationFrame(drawStars);
}

function buildShootingStars() {
  if (reducedMotion) return;
  const count = window.innerWidth < 700 ? 3 : 6;
  starsLayer.replaceChildren();
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'shooting-star';
    star.style.top = `${Math.random() * 55 - 5}%`;
    star.style.left = `${60 + Math.random() * 55}%`;
    star.style.setProperty('--delay', `${Math.random() * 10 + i * 2.2}s`);
    star.style.setProperty('--duration', `${1.05 + Math.random() * 0.75}s`);
    star.style.setProperty('--length', `${90 + Math.random() * 110}px`);
    starsLayer.appendChild(star);
  }
}

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }),
  { threshold: 0.13 }
);
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('resize', () => {
  resizeCanvas();
  buildShootingStars();
});

resizeCanvas();
buildShootingStars();
drawStars();
