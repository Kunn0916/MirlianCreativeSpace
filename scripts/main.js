// =========================
// Editable Settings
// =========================
const SETTINGS = {
  ui: {
    swipeThreshold: 50,
    heartIntervalMs: 850
  },
  knowledgePath: "data/site-knowledge.json"
};

const FALLBACK_SITE_KNOWLEDGE = {
  artist_name: "Mirlian",
  brand_name: "My Art Portfolio",
  bio: "Mirlian is a digital artist exploring illustration, animation, and 3D modeling while sharing progress publicly.",
  contact_email: "azuradoesart@gmail.com",
  social_links: {
    tiktok: "https://www.tiktok.com/@mirlian.does.art?_r=1&_t=ZS-92qVh6FIKzV",
    vgen: "https://vgen.co/MirlianJay"
  },
  faq: [
    {
      question: "How can I contact the artist?",
      answer: "Email azuradoesart@gmail.com or message through VGen."
    },
    {
      question: "Where can I see more works?",
      answer: "Check the portfolio gallery on this site and social pages."
    }
  ]
};

// =========================
// Mobile Menu
// =========================
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn?.addEventListener("click", () => mobileMenu?.classList.toggle("hidden"));

// =========================
// Gallery Carousel
// =========================
const carouselTrack = document.getElementById("galleryCarouselTrack");
const carouselViewport = document.getElementById("galleryCarouselViewport");
const prevCarouselBtn = document.getElementById("prevCarouselBtn");
const nextCarouselBtn = document.getElementById("nextCarouselBtn");
const carouselCounter = document.getElementById("carouselCounter");
const carouselDots = document.getElementById("carouselDots");
const carouselSlides = Array.from(document.querySelectorAll(".carousel-slide"));
const totalSlides = carouselSlides.length;
let currentSlideIndex = 0;

function updateCarousel() {
  if (!carouselTrack || !carouselCounter || !carouselDots || totalSlides === 0) return;
  carouselTrack.style.transform = "translateX(-" + currentSlideIndex * 100 + "%)";
  carouselCounter.textContent = currentSlideIndex + 1 + " / " + totalSlides;

  carouselDots.querySelectorAll(".carousel-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlideIndex);
    dot.setAttribute("aria-current", index === currentSlideIndex ? "true" : "false");
  });
}

function goToSlide(index) {
  if (totalSlides === 0) return;
  currentSlideIndex = (index + totalSlides) % totalSlides;
  updateCarousel();
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1);
}

function prevSlide() {
  goToSlide(currentSlideIndex - 1);
}

function initCarousel() {
  if (!carouselDots) return;
  carouselSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", "Go to slide " + (index + 1));
    dot.addEventListener("click", () => goToSlide(index));
    carouselDots.appendChild(dot);
  });

  nextCarouselBtn?.addEventListener("click", nextSlide);
  prevCarouselBtn?.addEventListener("click", prevSlide);

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
  });

  let touchStartX = 0;
  let touchEndX = 0;

  carouselViewport?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  carouselViewport?.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - SETTINGS.ui.swipeThreshold) nextSlide();
    if (touchEndX > touchStartX + SETTINGS.ui.swipeThreshold) prevSlide();
  });

  updateCarousel();
}

// =========================
// Floating Hearts
// =========================
const heartsContainer = document.getElementById("heartsContainer");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function spawnHeart() {
  if (!heartsContainer) return;
  const heart = document.createElement("span");
  heart.className = "heart-particle";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 2 + 3.5 + "s";
  heart.style.opacity = String(Math.random() * 0.35 + 0.3);
  heart.style.transform = "translateY(0) scale(" + (Math.random() * 0.6 + 0.6) + ")";
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 6500);
}

if (!reduceMotion) {
  setInterval(spawnHeart, SETTINGS.ui.heartIntervalMs);
}

// =========================
// FAQ + Website Knowledge
// =========================
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatCloseBtn = document.getElementById("chatCloseBtn");
const chatWidget = document.getElementById("chatWidget");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const commissionForm = document.getElementById("commissionForm");
const commissionStatus = document.getElementById("commissionStatus");

let siteKnowledge = FALLBACK_SITE_KNOWLEDGE;

function appendChatMessage(role, text) {
  if (!chatMessages) return;
  const item = document.createElement("div");
  item.className = "chat-msg " + (role === "user" ? "chat-msg-user" : "chat-msg-assistant");
  item.textContent = text;
  chatMessages.appendChild(item);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function ensureIntroMessage() {
  if (!chatMessages || chatMessages.childElementCount > 0) return;
  appendChatMessage("assistant", "Browse the quick FAQs below or search by keyword for commissions, contact details, and portfolio info.");
}

function toggleChat(show) {
  if (!chatWidget) return;
  const isHidden = chatWidget.classList.contains("hidden");
  const shouldShow = typeof show === "boolean" ? show : isHidden;
  if (shouldShow === !isHidden) return;
  if (shouldShow) {
    chatWidget.classList.remove("hidden");
    ensureIntroMessage();
    chatInput?.focus();
  } else {
    chatWidget.classList.add("hidden");
  }
}

async function loadSiteKnowledge() {
  try {
    const res = await fetch(SETTINGS.knowledgePath, { cache: "no-store" });
    if (!res.ok) throw new Error("Knowledge file not found.");
    const data = await res.json();
    siteKnowledge = data && typeof data === "object" ? data : FALLBACK_SITE_KNOWLEDGE;
  } catch (_) {
    siteKnowledge = FALLBACK_SITE_KNOWLEDGE;
  }
}

function getFaqEntries() {
  return Array.isArray(siteKnowledge.faq) ? siteKnowledge.faq : FALLBACK_SITE_KNOWLEDGE.faq;
}

function getSuggestedQuestions() {
  return getFaqEntries().slice(0, 4).map((entry) => entry.question);
}

function normalizeText(text) {
  return String(text || "").toLowerCase().replace(/[^\w\s@.-]/g, " ").replace(/\s+/g, " ").trim();
}

function buildSearchCorpus() {
  const sections = [
    siteKnowledge.artist_name,
    siteKnowledge.brand_name,
    siteKnowledge.bio,
    siteKnowledge.tagline,
    siteKnowledge.contact_email,
    siteKnowledge.commission_status,
    Array.isArray(siteKnowledge.services) ? siteKnowledge.services.join(" ") : "",
    siteKnowledge.social_links ? Object.values(siteKnowledge.social_links).join(" ") : ""
  ];

  return normalizeText(sections.join(" "));
}

function findFaqAnswer(userText) {
  const query = normalizeText(userText);
  const faqEntries = getFaqEntries();

  if (!query) return null;

  const directMatch = faqEntries.find((entry) => normalizeText(entry.question).includes(query) || query.includes(normalizeText(entry.question)));
  if (directMatch) return directMatch.answer;

  const queryTerms = query.split(" ").filter((term) => term.length > 2);
  let bestEntry = null;
  let bestScore = 0;

  faqEntries.forEach((entry) => {
    const haystack = normalizeText(entry.question + " " + entry.answer);
    const score = queryTerms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  });

  if (bestEntry && bestScore > 0) return bestEntry.answer;

  const siteCorpus = buildSearchCorpus();
  if (queryTerms.some((term) => siteCorpus.includes(term))) {
    if (query.includes("contact") || query.includes("email") || query.includes("reach")) {
      return "You can contact Mirlian at " + (siteKnowledge.contact_email || "the listed email on this page") + ".";
    }

    if (query.includes("commission")) {
      return "Commission status: " + (siteKnowledge.commission_status || "Please contact the artist for current availability") + ". You can also message through VGen.";
    }

    if (query.includes("service") || query.includes("offer")) {
      return "Available services: " + ((siteKnowledge.services || []).join(", ") || "Digital illustrations and character art") + ".";
    }
  }

  return "I do not have a stored FAQ for that yet. Please email " + (siteKnowledge.contact_email || "the artist") + " for custom questions.";
}

function renderSuggestedQuestions() {
  if (!chatMessages) return;

  const existing = chatMessages.querySelector(".faq-suggestions");
  existing?.remove();

  const wrap = document.createElement("div");
  wrap.className = "faq-suggestions";

  getSuggestedQuestions().forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "faq-chip";
    button.textContent = question;
    button.addEventListener("click", () => {
      if (!chatInput) return;
      chatInput.value = question;
      chatForm?.requestSubmit();
    });
    wrap.appendChild(button);
  });

  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function initChat() {
  chatToggleBtn?.addEventListener("click", () => toggleChat());
  chatCloseBtn?.addEventListener("click", () => toggleChat(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleChat(false);
  });

  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm?.requestSubmit();
    }
  });

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!chatInput) return;

    const userText = chatInput.value.trim();
    if (!userText) return;

    appendChatMessage("user", userText);
    chatInput.value = "";
    appendChatMessage("assistant", findFaqAnswer(userText));
    renderSuggestedQuestions();
  });
}

function initCommissionForm() {
  commissionForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(commissionForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const details = String(formData.get("details") || "").trim();

    const subject = "Commission Request from " + (name || "Website Visitor");
    const body =
      "Name: " +
      name +
      "\nEmail: " +
      email +
      "\n\nCommission Details:\n" +
      details;

    const mailtoUrl =
      "mailto:azuradoesart@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = mailtoUrl;

    if (commissionStatus) {
      commissionStatus.textContent = "Your email app should now open with your request details.";
    }
  });
}

// =========================
// App Start
// =========================
(async function initApp() {
  initCarousel();
  await loadSiteKnowledge();
  initChat();
  renderSuggestedQuestions();
  initCommissionForm();
})();
