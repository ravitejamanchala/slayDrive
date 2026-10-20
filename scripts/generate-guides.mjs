const wheel = '<svg class="icon-spark" viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="5"/><path d="M5 16l10 3m10 0 10-3M18 25l-2 10m6-10 2 10M8 11q12-7 24 0"/></svg>';
import { mkdir, readFile, writeFile } from "node:fs/promises";
const pages = [
  {
    slug: "mock-driving-tests",
    label: "Mock driving tests",
    number: "01",
    title: "Unlimited Mock Driving Tests | SlayDrive",
    description:
      "Make practice part of your routine with unlimited simulator-style mock driving tests. SlayDrive membership includes maps, lessons and puzzles for £4.99/month.",
    heading: "More practice.<br>More perspective.",
    intro:
      "A mock test is a chance to think, make a decision and learn from it. SlayDrive gives you unlimited simulator-style mock tests as part of your £4.99 monthly membership.",
    sections: [
      [
        "Make room for repetition",
        "Learning to drive involves bringing several kinds of knowledge together: road signs, priorities, awareness and the decisions that keep a journey safe. Reading a rule once is rarely the end of that process. Revisiting it in a practice setting gives you another opportunity to make sense of it.",
        "Unlimited mock tests mean you can return to practice without counting down a fixed allowance. A short session can help you revisit something you found difficult, while another can give you time to reflect on a wider set of decisions.",
      ],
      [
        "Think beyond the answer",
        "The useful question after a practice attempt is not only “Was I right?” It is “Why would that choice make sense on the road?” Use the Highway Code alongside your practice to check the rule and the reasoning behind it.",
        "For example, knowing a speed limit does not tell you the appropriate speed for every situation. Visibility, weather, traffic and the condition of the road all matter. Building that habit of considering context is a valuable part of learning.",
      ],
      [
        "Build a practice routine that fits",
        "Start with an area you want to understand better. Spend time with the relevant Highway Code guidance, try some practice, then note the points you want to ask your driving instructor about. Leave room to come back to difficult topics rather than rushing through them.",
        "SlayDrive combines mock tests with different location maps, Highway Code lessons and road puzzles. They are complementary ways to engage with driving knowledge, all included in the same monthly membership.",
      ],
      [
        "Keep the real road in the picture",
        "Simulator-style mock tests are supplementary practice. They are not official DVSA tests, do not predict an official test result and cannot replace supervised experience in a real vehicle. Practical instruction is essential for learning how a car feels and responds.",
        "Use SlayDrive alongside lessons and current official learning materials. Talk with your instructor about readiness for a practical test, and use GOV.UK for the official booking process and test requirements.",
      ],
    ],
    source: "https://www.gov.uk/driving-test",
    sourceLabel: "Read the official practical driving test guidance",
  },
  {
    slug: "highway-code",
    label: "Highway Code lessons",
    number: "02",
    title: "Highway Code Lessons & Driving Practice | SlayDrive",
    description:
      "Explore Highway Code lessons and connect road rules to driving decisions. Learn alongside unlimited mock tests and road puzzles with SlayDrive for £4.99/month.",
    heading: "Know the rules.<br>Understand the road.",
    intro:
      "The Highway Code is more than something to revise before a test. It is a foundation for sharing the road. SlayDrive brings Highway Code learning together with practical thinking.",
    sections: [
      [
        "Start with the official source",
        "The Highway Code sets out rules, advice and guidance for road users. Some rules describe legal requirements, marked with “MUST” or “MUST NOT”; other wording gives advice about safer behaviour. Understanding that distinction is part of reading the Code carefully.",
        "Use the current official Highway Code as your reference. SlayDrive lessons sit alongside that reference, giving you another way to engage with the ideas as you learn to drive.",
      ],
      [
        "Connect a rule to a situation",
        "A rule is easier to think through when you connect it to something that could happen on a journey. Consider what you would look for, who else might be affected and how much time you have to respond. Understanding a situation matters as much as recognising a phrase.",
        "Take junctions as an example. Rule H2 says that drivers should give way to pedestrians crossing or waiting to cross a road into which or from which they are turning. Thinking about where you would look, and when, helps connect the written guidance to observation.",
      ],
      [
        "Revisit the topics that need time",
        "Some parts of driving knowledge will feel familiar quickly. Others need several visits. Signs, stopping distances, junctions, vulnerable road users and adverse weather all deserve time and attention. Use a learning session to focus on one area rather than treating everything as a race.",
        "The SlayDrive membership also includes mock tests and road puzzles. Use these different types of practice to challenge your understanding, then return to the relevant rule if you need to check it.",
      ],
      [
        "Keep learning after the test",
        "Passing a test is a milestone, not the end of learning. Roads change, guidance can be updated and unfamiliar situations still arise. Keeping the habit of checking current guidance is useful long after your first independent journey.",
        "SlayDrive is an independent learning platform, not an official DVSA product. For definitive rules, legal requirements and updates, always use the official Highway Code and appropriate professional instruction.",
      ],
    ],
    source: "https://www.gov.uk/guidance/the-highway-code",
    sourceLabel: "Read the current official Highway Code",
  },
  {
    slug: "driving-simulator",
    label: "Driving simulator & maps",
    number: "03",
    title: "Driving Simulator & Location Maps | SlayDrive",
    description:
      "Explore simulator-style driving practice with different location maps. SlayDrive brings unlimited mock tests, Highway Code lessons and puzzles together for £4.99/month.",
    heading: "A new setting.<br>A fresh perspective.",
    intro:
      "Familiar routes can become familiar decisions. SlayDrive combines simulator-style practice with different location maps to give your driving knowledge another setting.",
    sections: [
      [
        "Give your knowledge a different setting",
        "Location maps offer a way to explore driving situations beyond one familiar route. A change of setting encourages you to pay attention to what is in front of you rather than rely only on remembering what happened last time.",
        "Different locations are part of the SlayDrive membership, together with unlimited mock tests, Highway Code lessons and puzzles. Contact us for details of the map collection and platform access.",
      ],
      [
        "Practise the thinking behind the drive",
        "Good preparation involves more than remembering a sequence of turns. Think about observation, signs, other road users and the decisions a situation calls for. Practice can be a useful place to slow that thinking down and ask why a particular choice matters.",
        "After a session, identify a topic to revisit in the Highway Code or a question to bring to your instructor. Use the simulator as a companion to that wider learning process.",
      ],
      [
        "Understand what a map can and cannot tell you",
        "A digital map is a learning setting. It cannot reproduce every detail of a real road, changing traffic, temporary restrictions or the physical experience of driving. A familiar-looking area is not a promise that conditions outside will match it.",
        "Treat simulator maps as practice environments, not navigation aids or predictions of an official test route. On real roads, current signs, actual conditions and safe observation always take priority.",
      ],
      [
        "Bring your learning together",
        "The £4.99 monthly membership connects different ways of learning. Read a Highway Code lesson, put your thinking to work in mock practice, and explore a road puzzle when you want a focused challenge.",
        "No simulator replaces supervised driving in a real vehicle. Build your on-road skills with qualified instruction and use digital practice to support the knowledge and questions you bring to those lessons.",
      ],
    ],
    source: "https://www.gov.uk/driving-lessons-learning-to-drive",
    sourceLabel: "Explore the official guidance on learning to drive",
  },
  {
    slug: "driving-puzzles",
    label: "Road puzzles",
    number: "04",
    title: "Road Puzzles & Highway Code Practice | SlayDrive",
    description:
      "Challenge your road knowledge with SlayDrive puzzles. Connect Highway Code learning with focused practice, mock tests and simulator maps for £4.99/month.",
    heading: "A little challenge.<br>A new connection.",
    intro:
      "Road puzzles give you a different way to work with what you know. Pause, look at the situation and think it through. Sometimes a small question opens up a useful conversation.",
    sections: [
      [
        "Put your understanding to work",
        "It is possible to recognise a rule without fully understanding how it applies. A focused puzzle invites you to make a choice and explain your reasoning. That can reveal the areas where you are confident and the points you want to revisit.",
        "SlayDrive road puzzles are part of the same £4.99 monthly membership as Highway Code lessons, different location maps and unlimited mock tests. They add another way to engage with your learning.",
      ],
      [
        "Ask why, not just which answer",
        "When you work through a driving question, consider the reason behind your choice. What information matters? Who else is affected? Would your decision change if the weather, visibility or traffic were different?",
        "Our homepage sample asks what happens to your following gap in wet weather. Highway Code rule 227 explains that stopping distances are at least double those on dry roads. Understanding the reason is more useful than memorising an isolated answer.",
      ],
      [
        "Make small sessions count",
        "A focused challenge can fit into a short learning session. Give it your attention, check the relevant guidance and note anything you want to discuss with your instructor. Return to difficult topics over time rather than trying to solve everything at once.",
        "Learning tools should only be used when you are safely away from driving. Keep your attention on the road when you are in control of a vehicle, and save digital practice for an appropriate time and place.",
      ],
      [
        "Keep puzzles in perspective",
        "A puzzle simplifies a situation so you can focus on a particular point. Real driving is more complex, with changing conditions and several things to observe at once. A correct puzzle answer is not proof that you are ready for an official test or a real-road situation.",
        "Use puzzles as a companion to current Highway Code guidance, supervised driving practice and your instructor’s advice. The aim is to keep asking useful questions as your understanding grows.",
      ],
    ],
    source:
      "https://www.gov.uk/guidance/the-highway-code/driving-in-adverse-weather-conditions-226-to-237",
    sourceLabel: "Read the Highway Code guidance on adverse weather",
  },
];
pages.push(...[{"slug": "practice-between-driving-lessons", "label": "Practice between driving lessons", "number": "05", "title": "Practice Between Driving Lessons | Online Simulator | SlayDrive", "description": "Looking for an alternative to extra driving classes? Explore simulator practice between lessons, what it can teach and why real driving experience still matters.", "heading": "Between driving lessons.<br>Keep practising.", "intro": "When extra driving classes are expensive or difficult to book, an online driving simulator offers another way to think about the road. Use SlayDrive as a companion to practical lessons, with a £4.99 monthly subscription.", "sections": [["An alternative to extra classes for road-awareness practice", "Driving lessons teach practical skills in a real vehicle, with an instructor who can observe and guide you. A simulator is different: it gives you a place to explore road layouts, notice hazards and revisit decisions on screen.", "If you are searching for an alternative to driving classes, start by separating road-knowledge practice from learning to control a real car. SlayDrive supports the first part; it does not replace the second."], ["A short routine between lessons", "After a lesson, write down one situation you found difficult: giving way, a crossing, or spotting another road user. Read the relevant Highway Code guidance, then explore a related situation in the simulator.", "Pause after a decision and ask what you noticed, what you missed and which rule applies. Bring any uncertainty to your instructor rather than treating simulator feedback as proof that you have mastered a real-road skill."], ["When private practice is difficult", "Not everyone has access to a suitable car, a supervisor or affordable learner insurance. On-screen practice lets you continue learning about road decisions without arranging a vehicle for that session.", "SlayDrive includes simulator-style mock tests, location maps, Highway Code learning and puzzles. The subscription costs £4.99 per month; it is separate from the cost of driving lessons or insurance."], ["What still needs real driving practice", "A screen cannot reproduce the full experience of steering, braking, clutch control, observation and responding to real traffic. Arrange practical lessons and appropriately supervised practice to develop those skills.", "Simulator results do not count as official driving tests, guarantee a pass or certify readiness for the road. Follow current GOV.UK guidance and your instructor’s advice."]], "source": "https://www.gov.uk/driving-lessons-learning-to-drive", "sourceLabel": "Read GOV.UK guidance on driving lessons and learning to drive"}, {"slug": "driving-practice-without-a-car", "label": "Driving practice without a car", "number": "06", "title": "Driving Practice Without a Car | Learner Simulator | SlayDrive", "description": "No car or learner insurance for private practice? Explore on-screen road-awareness practice, what a simulator can help with and the rules for real-road driving.", "heading": "No practice car?<br>Keep your learning moving.", "intro": "Access to a car and suitable insurance can make private driving practice difficult. An online simulator gives you a place to work on road awareness at home, without driving a real vehicle.", "sections": [["What you can practise without a real car", "You can study the Highway Code, revisit signs and road priorities, and think through junctions and crossings. A simulator adds a visual setting in which to explore those decisions.", "In SlayDrive, you can practise with road scenarios and simulator-style mock tests, then review feedback. These activities support road awareness; they do not teach every physical skill involved in driving a car."], ["Do you need insurance for a driving simulator?", "You do not need motor insurance to use an on-screen simulator because you are not operating a real vehicle. A simulator subscription is not an insurance policy and does not give you cover for a car.", "If learner insurance is expensive, unavailable or unclear, you can use screen-based practice while arranging suitable real-world practice. SlayDrive does not resolve an insurance refusal or provide advice on whether an insurer will cover you."], ["Before you practise on a public road", "Real-road learning has separate requirements, including the appropriate provisional licence, suitable supervision and valid insurance. The vehicle must also meet the applicable legal requirements.", "Check current GOV.UK guidance and speak to the insurer about the exact vehicle, learner and practice arrangement. Do not assume someone else’s policy covers you, or that a simulator result changes the requirements."], ["Build a useful learning habit at home", "Choose one topic, read the official rule, explore it in the simulator and note a question for your next lesson. For example, consider who has priority at a crossing and what you would need to observe before moving.", "SlayDrive costs £4.99 per month and complements practical instruction. It does not guarantee a lower insurance premium, a test pass or readiness to drive without supervision."]], "source": "https://www.gov.uk/driving-lessons-learning-to-drive/practising-with-family-or-friends", "sourceLabel": "Check the official rules for private driving practice"}]);
const arrow =
  '<svg class="icon-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const spark =
  '<svg class="icon-spark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v34M3 20h34M8 8l24 24M8 32 32 8"/></svg>';
for (const page of pages) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "SlayDrive",
        item: "https://slaydrive.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.label,
        item: `https://slaydrive.com/${page.slug}/`,
      },
    ],
  };
  const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${page.title}</title><meta name="description" content="${page.description}"><meta name="theme-color" content="#f3f1e9"><link rel="canonical" href="https://slaydrive.com/${page.slug}/"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:type" content="website"><meta property="og:url" content="https://slaydrive.com/${page.slug}/"><meta property="og:image" content="https://slaydrive.com/social-card.png"><meta name="twitter:card" content="summary_large_image"></head>
<body class="guide-page"><a class="skip-link" href="#main">Skip to content</a><header class="header"><a class="wordmark" href="/" aria-label="SlayDrive home">slaydrive<span class="brand-spark">${wheel}</span></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/#perspective">The garage</a><a href="/#experience">The experience</a><a href="/#next">Subscribe</a></nav><a class="header-cta" href="/#next">Subscribe ${arrow}</a></header>
<main id="main"><section class="guide-hero section-pad"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">SlayDrive</a><span aria-hidden="true">/</span><span aria-current="page">${page.label}</span></nav><span class="eyebrow">THE SLAYDRIVE GUIDE / ${page.number}</span><h1>${page.heading}</h1><p>${page.intro}</p><div class="guide-motif" aria-hidden="true">${spark}</div></section><div class="guide-body section-pad"><aside><span class="eyebrow">ON THIS PAGE</span><nav aria-label="Guide contents">${page.sections.map(([title], i) => `<a href="#section-${i + 1}"><span>0${i + 1}</span>${title}</a>`).join("")}</nav><a class="text-link" href="/#next">£4.99 / month ${arrow}</a></aside><article>${page.sections.map(([title, ...paras], i) => `<section id="section-${i + 1}"><span class="eyebrow">0${i + 1}</span><h2>${title}</h2>${paras.map((p) => `<p>${p}</p>`).join("")}</section>`).join("")}<a class="guide-source" href="${page.source}" target="_blank" rel="noopener noreferrer">${page.sourceLabel} ${arrow}<span class="sr-only"> (opens in a new tab)</span></a></article></div><section class="guide-related section-pad"><span class="eyebrow">KEEP YOUR CURIOSITY MOVING</span><h2>More ways to <span class="serif">learn.</span></h2><div>${pages
    .filter((p) => p.slug !== page.slug)
    .map(
      (p) =>
        `<a href="/${p.slug}/"><span>0${pages.indexOf(p) + 1}</span><h3>${p.label}</h3>${arrow}</a>`,
    )
    .join(
      "",
    )}</div></section><section class="guide-cta section-pad"><h2>A little practice.<br>A world of <span class="serif">possibility.</span></h2><a class="button button-dark" href="https://manchala.co.uk/cambridge-learner-driv/">Subscribe · £4.99/month <span class="button-arrow">${arrow}</span></a></section></main><footer class="footer"><div class="footer-top"><a class="wordmark" href="/">slaydrive<span class="brand-spark">${wheel}</span></a><p>Less nerves. More ready.</p><a class="back-top" href="mailto:info@slaydrive.com">Say hello ${arrow}</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} SlayDrive</span><span>LEARN THE RULES. OPEN YOUR WORLD.</span><a href="/#privacy">Privacy</a></div></footer><script type="application/ld+json">${JSON.stringify(breadcrumb)}</script><script type="module" src="/src/guide.js"></script></body></html>`;
  await mkdir(page.slug, { recursive: true });
  await writeFile(`${page.slug}/index.html`, html);
}
let home = await readFile("index.html", "utf8");
home = home.replaceAll("↗", arrow).replaceAll("✳", spark);
await writeFile("index.html", home);
await writeFile(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", ...pages.map((p) => p.slug + "/")].map((p) => `<url><loc>https://slaydrive.com/${p}</loc></url>`).join("")}</urlset>\n`,
);
console.log(`Generated ${pages.length} guides and sitemap.`);
