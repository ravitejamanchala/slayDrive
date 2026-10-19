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
const narrowScreen = matchMedia("(max-width: 800px)");
narrowScreen.addEventListener("change", () => {
  closeMenu();
  document
    .querySelector('[role="tablist"]')
    .setAttribute(
      "aria-orientation",
      narrowScreen.matches ? "horizontal" : "vertical",
    );
});
document
  .querySelector('[role="tablist"]')
  .setAttribute(
    "aria-orientation",
    narrowScreen.matches ? "horizontal" : "vertical",
  );

const rules = "https://www.gov.uk/guidance/the-highway-code/";
const questions = {
  mock: {
    kicker: "A LITTLE TEST DRIVE",
    question: "The limit is 30 mph. Is it always safe to drive at 30?",
    answers: ["Yes, if the road is clear", "No, conditions may call for less"],
    correct: 1,
    explanation:
      "A speed limit is a maximum, not a target. Weather, visibility, traffic and the road itself may mean you need to drive more slowly. Highway Code rule 125.",
    source:
      rules +
      "general-rules-techniques-and-advice-for-all-drivers-and-riders-103-to-158",
    symbol: "speed",
  },
  code: {
    kicker: "KNOW THE WHY",
    question:
      "Someone is waiting to cross a side road you’re turning into. What should you do?",
    answers: [
      "Give way to the person waiting",
      "Turn first because you’re on the road",
    ],
    correct: 0,
    explanation:
      "At a junction, you should give way to pedestrians crossing or waiting to cross a road into which or from which you are turning. Highway Code rule H2.",
    source: rules + "introduction",
    symbol: "crossing",
  },
  puzzle: {
    kicker: "PUT YOUR ROAD SENSE TO WORK",
    question: "A dry road turns wet. What should happen to your following gap?",
    answers: ["Keep the same gap", "At least double the gap"],
    correct: 1,
    explanation:
      "In wet weather, stopping distances will be at least double those on dry roads. Keep at least twice the normal following gap. Highway Code rule 227.",
    source: rules + "driving-in-adverse-weather-conditions-226-to-237",
    symbol: "rain",
  },
};
const visuals = {
  speed:
    '<path d="M75 125L140 0H200L265 125" fill="#535d50"/><path d="M170 0V125" stroke="#faf5df" stroke-width="3" stroke-dasharray="12 12"/><rect x="207" y="30" width="4" height="70" fill="#87917d"/><circle cx="209" cy="32" r="27" fill="#f5f1e9" stroke="#ed5726" stroke-width="7"/><text x="209" y="41" text-anchor="middle" font-size="26" font-weight="700" fill="#252e23">30</text><path d="M15 113h55M281 113h40" stroke="#87917d" stroke-width="2"/>',
  crossing:
    '<path d="M20 85H170V0H230V85H320V125H20Z" fill="#535d50"/><path d="M200 0V60" stroke="#faf5df" stroke-width="3" stroke-dasharray="10 10"/><path d="M178 68h44M178 75h44" stroke="#faf5df" stroke-width="2"/><circle cx="146" cy="35" r="9" fill="#ee5a2b"/><path d="M146 48v25m0-18-15 10m15-10 14 11m-14 7-12 22m12-22 10 22" stroke="#ee5a2b" stroke-width="6" stroke-linecap="round"/>',
  rain: '<path d="M25 104H315" stroke="#87917d" stroke-width="2"/><g fill="#535d50"><rect x="40" y="67" width="70" height="28" rx="8"/><path d="M55 67L63 51H89L100 67Z"/><rect x="230" y="67" width="70" height="28" rx="8"/><path d="M245 67L253 51H279L290 67Z"/></g><g fill="#252e23"><circle cx="56" cy="94" r="8"/><circle cx="94" cy="94" r="8"/><circle cx="246" cy="94" r="8"/><circle cx="284" cy="94" r="8"/></g><path d="M125 76H215M132 69L125 76L132 83M208 69L215 76L208 83" stroke="#ed5726" stroke-width="3" fill="none"/><g stroke="#849c9a" stroke-width="2"><path d="M40 10l-5 12M80 20l-5 12M120 10l-5 12M160 20l-5 12M200 10l-5 12M240 20l-5 12M280 10l-5 12M310 20l-5 12"/></g>',
};
let stage = "mock";
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector("#journey-panel");
const answerButtons = [...document.querySelectorAll("[data-answer]")];
const feedback = document.querySelector("#quiz-feedback");
function selectStage(nextStage) {
  stage = nextStage;
  const question = questions[stage];
  tabs.forEach((tab) => {
    const selected = tab.dataset.stage === stage;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panel.setAttribute("aria-labelledby", `tab-${stage}`);
  panel.querySelector(".panel-kicker").textContent = question.kicker;
  panel.querySelector("#quiz-question").textContent = question.question;
  panel.querySelector(".quiz-visual svg").innerHTML = visuals[question.symbol];
  panel.querySelector("#quiz-source").href = question.source;
  feedback.textContent = "";
  answerButtons.forEach((button, index) => {
    const letter = document.createElement("span");
    letter.textContent = String.fromCharCode(65 + index);
    button.replaceChildren(
      letter,
      document.createTextNode(question.answers[index]),
    );
    button.className = "";
    button.removeAttribute("aria-pressed");
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStage(tab.dataset.stage));
  tab.addEventListener("keydown", (event) => {
    const forward = narrowScreen.matches ? "ArrowRight" : "ArrowDown";
    const back = narrowScreen.matches ? "ArrowLeft" : "ArrowUp";
    let nextIndex;
    if (event.key === forward) nextIndex = (index + 1) % tabs.length;
    if (event.key === back) nextIndex = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectStage(tabs[nextIndex].dataset.stage);
    tabs[nextIndex].focus();
  });
});
answerButtons.forEach((button, index) =>
  button.addEventListener("click", () => {
    const question = questions[stage];
    const correct = index === question.correct;
    answerButtons.forEach((answer, i) => {
      answer.className =
        i === question.correct ? "correct" : i === index ? "incorrect" : "";
      answer.setAttribute("aria-pressed", String(i === index));
    });
    feedback.textContent = `${correct ? "That’s right." : "Not quite — a useful one to remember."} ${question.explanation}`;
  }),
);

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
