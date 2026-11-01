// One visible preview and one playing video; motion is always user-controllable.
export function initHeroCarousel(hero) {
  if (!hero) return;
  const buttons = [...hero.querySelectorAll('[data-hero-pick]')];
  const screens = [...hero.querySelectorAll('[data-hero-screen]')];
  const videos = [...hero.querySelectorAll('video')];
  const pause = hero.querySelector('[data-hero-pause]');
  const status = hero.querySelector('[data-hero-status]');
  const count = hero.querySelector('[data-hero-count]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let index = 0, paused = reduced.matches || !!navigator.connection?.saveData;
  let visible = false, hovered = false, focusStopped = false, timer, pointer, swipeAt = -Infinity;

  function sync() {
    clearTimeout(timer);
    const playing = !paused && visible && !document.hidden;
    pause.querySelector('span').textContent = paused ? 'Play motion' : 'Pause motion';
    pause.setAttribute('aria-label', paused ? 'Play hero motion' : 'Pause hero motion');
    pause.setAttribute('aria-pressed', String(paused));
    pause.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    pause.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
    for (const video of videos) {
      if (playing && video.closest('figure') === screens[index]) {
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        video.muted = true;
        video.play().catch(() => { video.dataset.ready = 'false'; });
      } else video.pause();
    }
    const rotating = playing && !hovered && !focusStopped;
    hero.dataset.rotating = String(rotating);
    if (rotating) timer = setTimeout(() => select(index + 1, false), 8000);
  }
  function select(next, manual = true) {
    index = (next + screens.length) % screens.length;
    if (manual) focusStopped = true;
    screens.forEach((screen, i) => {
      screen.hidden = i !== index;
      screen.classList.remove('hero-entering');
    });
    if (!reduced.matches) {
      // Re-trigger the short transition even on consecutive manual navigation.
      void screens[index].offsetWidth;
      screens[index].classList.add('hero-entering');
    }
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    count.textContent = `${index + 1} / ${screens.length}`;
    if (manual) status.textContent = `${buttons[index].textContent}, preview ${index + 1} of ${screens.length}`;
    sync();
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => select(i)));
  hero.querySelector('[data-hero-prev]').addEventListener('click', () => select(index - 1));
  hero.querySelector('[data-hero-next]').addEventListener('click', () => select(index + 1));
  pause.addEventListener('click', () => { paused = !paused; if (!paused) focusStopped = false; sync(); });
  hero.addEventListener('focusin', () => { focusStopped = true; sync(); });
  hero.addEventListener('pointerenter', () => { hovered = hover.matches; sync(); });
  hero.addEventListener('pointerleave', () => { hovered = false; sync(); });
  hero.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? screens.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  hero.addEventListener('pointerdown', event => {
    if (!event.target.closest('.hero-media') || event.button !== 0) return;
    pointer = { x: event.clientX, y: event.clientY };
    hero.setPointerCapture(event.pointerId);
  });
  hero.addEventListener('pointerup', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swipeAt = performance.now(); select(index + (dx < 0 ? 1 : -1)); }
  });
  hero.addEventListener('pointercancel', () => { pointer = null; });
  hero.addEventListener('click', event => { if (performance.now() - swipeAt < 400) { event.preventDefault(); event.stopPropagation(); } }, true);
  hero.addEventListener('dragstart', event => { if (event.target.closest('.hero-media')) event.preventDefault(); });
  videos.forEach(video => {
    video.addEventListener('playing', () => { video.dataset.ready = 'true'; });
    video.addEventListener('error', () => { video.dataset.ready = 'false'; });
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) paused = true; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(hero.querySelector('.hero-stage-viewport'));
  sync();
}
