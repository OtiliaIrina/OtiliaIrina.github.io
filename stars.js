(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initStarfield(canvas, fullScreen = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let meteors = [];
    let lastMeteor = 0;

    function getSizeTarget() {
      if (fullScreen) return { width: window.innerWidth, height: window.innerHeight };
      const parent = canvas.parentElement;
      return { width: parent.clientWidth, height: parent.clientHeight };
    }

    function resize() {
      const size = getSizeTarget();
      width = Math.max(size.width, 1);
      height = Math.max(size.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = fullScreen ? 7600 : 8600;
      const count = Math.round((width * height) / density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * .8 + .12,
        a: Math.random() * .45 + .12,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * .0008 + .0002
      }));
      meteors = [];
    }

    function spawnMeteor() {
      const fromRight = Math.random() > .12;
      meteors.push({
        x: fromRight ? width * (.62 + Math.random() * .42) : width * Math.random(),
        y: -30 + Math.random() * height * .25,
        vx: -(5.2 + Math.random() * 2.8),
        vy: 2.7 + Math.random() * 2.2,
        life: 0,
        max: 62 + Math.random() * 34,
        length: 135 + Math.random() * 120,
        alpha: .45 + Math.random() * .28
      });
    }

    function draw(t = 0) {
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        const pulse = reduceMotion ? 1 : .84 + Math.sin(t * s.speed + s.phase) * .16;
        ctx.beginPath();
        ctx.fillStyle = `rgba(241,245,255,${s.a * pulse})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion && t - lastMeteor > 4300 + Math.random() * 2600) {
        spawnMeteor();
        lastMeteor = t;
      }

      meteors = meteors.filter(m => m.life < m.max);
      for (const m of meteors) {
        const fade = Math.sin((m.life / m.max) * Math.PI);
        const norm = Math.hypot(m.vx, m.vy);
        const tx = m.x - (m.vx / norm) * m.length;
        const ty = m.y - (m.vy / norm) * m.length;
        const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${m.alpha * fade})`);
        grad.addColorStop(.18, `rgba(167,217,232,${m.alpha * .5 * fade})`);
        grad.addColorStop(1, 'rgba(130,145,190,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        m.x += m.vx;
        m.y += m.vy;
        m.life += 1;
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  const globalCanvas = document.getElementById('global-starfield');
  if (globalCanvas) initStarfield(globalCanvas, true);
  const headerCanvas = document.getElementById('starfield');
  if (headerCanvas && !globalCanvas) initStarfield(headerCanvas, false);
})();

const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});
