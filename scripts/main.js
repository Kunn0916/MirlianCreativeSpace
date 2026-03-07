// =========================
// Editable Settings
// =========================
const SETTINGS = {
  ui: {
    swipeThreshold: 50,
    heartIntervalMs: 850
  },
  knowledgePath: "data/site-knowledge.json",
  chat: {
    endpoint: "/api/chat",
    model: "gemini-2.5-flash",
    baseSystemPrompt: "You are the portfolio assistant for Yuna's art portfolio. Be brief, warm, and helpful. IMPORTANT: Always detect and match the language of the user's message. If the user writes in Filipino, reply in Filipino. If they write in Japanese, reply in Japanese. If they write in Spanish, reply in Spanish. Always respond in whatever language the user is using, not just English.",
    useDirectGeminiFromBrowser: true,
    directApiKey: "AIzaSyDjFNIYO8vlE74vjBADp03Qfpy38MRaguc"
  }
};

const FALLBACK_SITE_KNOWLEDGE = {
  artist_name: "Yuna",
  brand_name: "My Art Portfolio",
  bio: "Yuna is a digital artist exploring illustration, animation, and 3D modeling while sharing progress publicly.",
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
// Chat + Website Knowledge
// =========================
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatCloseBtn = document.getElementById("chatCloseBtn");
const chatWidget = document.getElementById("chatWidget");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const commissionForm = document.getElementById("commissionForm");
const commissionStatus = document.getElementById("commissionStatus");

let chatBusy = false;
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
  appendChatMessage("assistant", "Hi! I can answer questions about the artist, portfolio, and commissions.");
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

function buildSystemPrompt() {
  const serializedKnowledge = JSON.stringify(siteKnowledge);
  return (
    SETTINGS.chat.baseSystemPrompt +
    " Answer using only these website details when relevant: " +
    serializedKnowledge +
    " If info is missing, say you are not sure and suggest contacting " +
    (siteKnowledge.contact_email || "the artist by email") +
    "."
  );
}

async function extractErrorMessage(res) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || JSON.stringify(data);
  } catch (_) {
    return await res.text();
  }
}

async function fetchAssistantReply(userText) {
  const systemPrompt = buildSystemPrompt();

  if (!SETTINGS.chat.useDirectGeminiFromBrowser) {
    const res = await fetch(SETTINGS.chat.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        model: SETTINGS.chat.model,
        systemPrompt
      })
    });

    if (!res.ok) {
      const detail = await extractErrorMessage(res);
      throw new Error("Proxy error " + res.status + ": " + detail);
    }
    const data = await res.json();
    return data.reply || "No response returned by server.";
  }

  if (!SETTINGS.chat.directApiKey || SETTINGS.chat.directApiKey.includes("PASTE_YOUR_GEMINI_API_KEY_HERE")) {
    throw new Error("Set SETTINGS.chat.directApiKey in scripts/main.js.");
  }

  if (window.location.protocol === "file:") {
    throw new Error("Open this site via localhost, not file://. Example: python -m http.server 5500");
  }

  const modelName = SETTINGS.chat.model;
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      modelName +
      ":generateContent?key=" +
      encodeURIComponent(SETTINGS.chat.directApiKey),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userText }] }]
      })
    }
  );

  if (!res.ok) {
    const detail = await extractErrorMessage(res);
    throw new Error("Gemini error " + res.status + " (" + modelName + "): " + detail);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  return text || "No text returned by API.";
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
      if (!chatBusy) chatForm?.requestSubmit();
    }
  });

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (chatBusy || !chatInput || !chatSendBtn) return;

    const userText = chatInput.value.trim();
    if (!userText) return;

    appendChatMessage("user", userText);
    chatInput.value = "";
    chatBusy = true;
    chatSendBtn.disabled = true;
    chatSendBtn.textContent = "Sending...";

    try {
      const reply = await fetchAssistantReply(userText);
      appendChatMessage("assistant", reply);
    } catch (err) {
      appendChatMessage("assistant", "Chat error: " + err.message);
    } finally {
      chatBusy = false;
      chatSendBtn.disabled = false;
      chatSendBtn.textContent = "Send";
    }
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
  initChat();
  initCommissionForm();
  await loadSiteKnowledge();
})();
