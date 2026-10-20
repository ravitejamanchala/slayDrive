import "./style.css";
import "./editorial.css";

document.documentElement.classList.add("js");
document.querySelector("#year").textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  mobileNav.hidden = true;
}
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute(
    "aria-label",
    expanded ? "Open navigation" : "Close navigation",
  );
  mobileNav.hidden = expanded;
});
mobileNav
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia('(max-width: 800px)').addEventListener('change', closeMenu);

const privacyDialog = document.querySelector("#privacy-dialog");
document
  .querySelector("#privacy-open")
  .addEventListener("click", () => privacyDialog.showModal());
document
  .querySelector(".dialog-close")
  .addEventListener("click", () => privacyDialog.close());
privacyDialog.addEventListener("click", (event) => {
  if (event.target === privacyDialog) {
    const bounds = privacyDialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      privacyDialog.close();
  }
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => observer.observe(element));
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((element) => element.classList.add("is-visible"));
}

function openLinkedPrivacy() {
  if (location.hash === "#privacy" && !privacyDialog.open)
    privacyDialog.showModal();
}
window.addEventListener("hashchange", openLinkedPrivacy);
openLinkedPrivacy();

// Move only the product media, leaving reading and video controls stable.
const motionQuery = matchMedia('(prefers-reduced-motion: reduce), (max-width: 800px)');
const layers = [...document.querySelectorAll('[data-parallax]')];
let motionFrame = 0;
function updateDepth() {
  motionFrame = 0;
  layers.forEach(layer => {
    if (motionQuery.matches) { layer.style.transform = ''; return; }
    const section = layer.closest('section');
    const distance = innerHeight / 2 - (section.getBoundingClientRect().top + section.offsetHeight / 2);
    const offset = Math.max(-40, Math.min(40, distance * Number(layer.dataset.parallax)));
    layer.style.transform = `translateY(${offset}px)`;
  });
}
function queueDepth() { if (!motionFrame) motionFrame = requestAnimationFrame(updateDepth); }
addEventListener('scroll', queueDepth, { passive:true });
addEventListener('resize', queueDepth);
motionQuery.addEventListener('change', queueDepth);
queueDepth();

const carousel = document.querySelector('.hero-stage');
const demoVideo = carousel.querySelector('video');
const pauseMotion = carousel.querySelector('.carousel-pause');
const carouselStatus = carousel.querySelector('.carousel-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const heroCards = [carousel.querySelector('.hero-garage'), carousel.querySelector('.app-preview'), carousel.querySelector('.hero-feedback')];
const heroLabels = ['Choose your drive', 'Dutch roundabout', 'Police car'];
let heroIndex = 1;
let userPaused = reducedMotion.matches;
let carouselVisible = true;
let carouselTimer;
let pointerStart = null;
let recordingIndex = 0;
demoVideo.muted = true;
function syncCarousel() {
  clearInterval(carouselTimer);
  const running = !userPaused && carouselVisible && !document.hidden;
  pauseMotion.textContent = userPaused ? 'Play motion' : 'Pause motion';
  pauseMotion.setAttribute('aria-label', userPaused ? 'Play carousel and video' : 'Pause carousel and video');
  if (running) {
    if (heroIndex === 1) demoVideo.play().catch(() => { demoVideo.controls = true; });
    else demoVideo.pause();
    carouselTimer = setInterval(() => slideHero(1), 6500);
  } else demoVideo.pause();
}
function positionHero() {
  heroCards.forEach((card, index) => {
    const slot = (index - heroIndex + 3) % 3;
    card.dataset.slot = slot === 0 ? 'center' : slot === 1 ? 'right' : 'left';
  });
  carouselStatus.textContent = `0${heroIndex + 1} / 03 · ${heroLabels[heroIndex]}`;
}
function slideHero(direction) {
  heroIndex = (heroIndex + direction + 3) % 3;
  if (heroIndex === 1) {
    recordingIndex = 1 - recordingIndex;
    const prefix = recordingIndex ? 'compact' : 'driving';
    demoVideo.poster = '/media/' + (recordingIndex ? 'compact-poster.jpg' : 'driving-demo-poster.jpg');
    demoVideo.querySelector('source').src = `/media/${prefix}-demo.mp4`;
    demoVideo.load();
  }
  positionHero();
  syncCarousel();
}
pauseMotion.addEventListener('click', () => { userPaused = !userPaused; syncCarousel(); });
carousel.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
  event.preventDefault(); userPaused = true;
  slideHero(event.key === 'ArrowRight' ? 1 : -1);
});
carousel.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || event.button !== 0) return;
  pointerStart = {x:event.clientX, y:event.clientY};
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) slideHero(dx < 0 ? 1 : -1);
});
carousel.addEventListener('pointercancel', () => { pointerStart = null; });
carousel.addEventListener('dragstart', event => event.preventDefault());
carousel.addEventListener('focusin', event => {
  if (event.target === carousel && carousel.matches(':focus-visible')) { userPaused = true; syncCarousel(); }
});
reducedMotion.addEventListener('change', () => { userPaused = reducedMotion.matches; syncCarousel(); });
document.addEventListener('visibilitychange', syncCarousel);
new IntersectionObserver(entries => { carouselVisible = entries[0].isIntersecting; syncCarousel(); }, {threshold:.15}).observe(carousel);
positionHero(); syncCarousel();

const carsTrack = document.querySelector('.car-collection');
const carsPause = document.querySelector('.cars-pause');
let carsPaused = reducedMotion.matches;
let carsVisible = false;
let carsTimer;
let carDrag;
function syncCars() {
  clearInterval(carsTimer);
  carsPause.textContent = carsPaused ? 'Play motion' : 'Pause motion';
  if (carsPaused || !carsVisible || document.hidden || carDrag) return;
  carsTimer = setInterval(() => {
    const step = carsTrack.querySelector('figure').offsetWidth + parseFloat(getComputedStyle(carsTrack).gap);
    const atEnd = carsTrack.scrollLeft >= carsTrack.scrollWidth - carsTrack.clientWidth - 5;
    carsTrack.scrollTo({left:atEnd ? 0 : carsTrack.scrollLeft + step, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
  }, 3500);
}
carsPause.addEventListener('click', () => { carsPaused = !carsPaused; syncCars(); });
carsTrack.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  carDrag = {x:event.clientX, scroll:carsTrack.scrollLeft};
  carsTrack.classList.add('is-dragging');
  syncCars();
});
carsTrack.addEventListener('pointermove', event => {
  if (carDrag && Math.abs(event.clientX - carDrag.x) > 5) {
    carsTrack.setPointerCapture(event.pointerId);
    carsTrack.scrollLeft = carDrag.scroll - (event.clientX - carDrag.x);
  }
});
function endCarDrag() { carDrag = null; carsTrack.classList.remove('is-dragging'); syncCars(); }
carsTrack.addEventListener('pointerup', endCarDrag);
carsTrack.addEventListener('pointercancel', endCarDrag);
carsTrack.addEventListener('dragstart', event => event.preventDefault());
carsTrack.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  carsPaused = true;
  syncCars();
  const step = carsTrack.querySelector('figure').offsetWidth + parseFloat(getComputedStyle(carsTrack).gap);
  const left = event.key === 'Home' ? 0 : event.key === 'End' ? carsTrack.scrollWidth : carsTrack.scrollLeft + (event.key === 'ArrowRight' ? step : -step);
  carsTrack.scrollTo({left, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
});
carsTrack.addEventListener('mouseenter', () => clearInterval(carsTimer));
carsTrack.addEventListener('mouseleave', syncCars);
carsTrack.addEventListener('focusin', () => { carsPaused = true; syncCars(); });
reducedMotion.addEventListener('change', () => { carsPaused = reducedMotion.matches; syncCars(); });
document.addEventListener('visibilitychange', syncCars);
new IntersectionObserver(entries => { carsVisible = entries[0].isIntersecting; syncCars(); }, {threshold:.2}).observe(carsTrack);
syncCars();

const carChoices = [...document.querySelectorAll('.car-choice')];
carChoices.forEach(choice => choice.addEventListener('click', () => {
  const name = choice.closest('figure').querySelector('figcaption').textContent;
  const selectedImage = document.querySelector('#selected-car-image');
  selectedImage.src = choice.querySelector('img').getAttribute('src');
  selectedImage.alt = `${name} selected for preview`;
  document.querySelector('#selected-car-name').textContent = name;
  document.querySelector('#loop-car-image').setAttribute('href', selectedImage.getAttribute('src'));
  document.querySelector('#loop-car-name').textContent = name;
  carChoices.forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
  carsPaused = true;
  syncCars();
}));

const garageMap = document.querySelector('.garage-map');
const mapPauseButton = document.querySelector('.garage-loop-pause');
let mapPaused = reducedMotion.matches;
let mapVisible = false;
function syncMapLoop() {
  garageMap.classList.toggle('is-running', !mapPaused && mapVisible && !document.hidden);
  mapPauseButton.textContent = mapPaused ? 'Play preview' : 'Pause preview';
  mapPauseButton.setAttribute('aria-label', mapPaused ? 'Play map animation' : 'Pause map animation');
}
mapPauseButton.addEventListener('click', () => { mapPaused = !mapPaused; syncMapLoop(); });
reducedMotion.addEventListener('change', () => { mapPaused = reducedMotion.matches; syncMapLoop(); });
document.addEventListener('visibilitychange', syncMapLoop);
new IntersectionObserver(entries => { mapVisible = entries[0].isIntersecting; syncMapLoop(); }, {threshold:.3}).observe(garageMap);
syncMapLoop();
