import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://fkmssqbzfsqqonoghmmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nWTkmo1OOY4Y32WZdhdKMw_ZkKaLWO8";
const BIRTHDAY_ISO = "2026-07-22T00:00:00+02:00";
const birthday = new Date(BIRTHDAY_ISO);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let letters = [];

function byId(id) { return document.getElementById(id); }
function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}
function formatDate(value) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg"
  });
}
function isUnlocked(value) { return new Date(value).getTime() <= Date.now(); }
function dateKeyInJohannesburg(value) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}
function isBirthdayLetter(letter) {
  return dateKeyInJohannesburg(letter.unlock_date) === "2026-07-22";
}
function johannesburgDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}
function isDesreBirthday() {
  const p = johannesburgDateParts();
  return p.year === "2026" && p.month === "07" && p.day === "22";
}

function updateCountdown() {
  const countdown = byId("countdown");
  if (!countdown) return;
  const difference = birthday.getTime() - Date.now();
  if (difference <= 0) {
    countdown.innerHTML = "<div style='grid-column:1/-1'><strong>Happy Birthday!</strong><span>Today we celebrate Desre</span></div>";
    return;
  }
  byId("days").textContent = String(Math.floor(difference / 86400000)).padStart(2, "0");
  byId("hours").textContent = String(Math.floor((difference / 3600000) % 24)).padStart(2, "0");
  byId("minutes").textContent = String(Math.floor((difference / 60000) % 60)).padStart(2, "0");
  byId("seconds").textContent = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
} else {
  document.querySelectorAll(".reveal").forEach(item => item.classList.add("visible"));
}

function launchConfetti() {
  const symbols = ["✦", "♥", "●", "❀"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDuration = `${2.8 + Math.random() * 3}s`;
    piece.style.fontSize = `${10 + Math.random() * 18}px`;
    piece.style.color = ["#b66b7a", "#7d3f50", "#b8935c", "#9da791"][Math.floor(Math.random() * 4)];
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6500);
  }
}

function openBirthdaySurprise() {
  const surprise = byId("birthday-surprise");
  if (!surprise) return;
  surprise.classList.add("open");
  surprise.setAttribute("aria-hidden", "false");
  launchConfetti();
}
function closeBirthdaySurprise() {
  const surprise = byId("birthday-surprise");
  if (!surprise) return;
  surprise.classList.remove("open");
  surprise.setAttribute("aria-hidden", "true");
}

function renderBirthdayCelebrateButton() {
  const slot = byId("celebrate-button-slot");
  if (!slot) return;
  slot.innerHTML = "";
  if (!isDesreBirthday()) return;
  const button = document.createElement("button");
  button.className = "button light";
  button.type = "button";
  button.textContent = "Celebrate Desre ✨";
  button.addEventListener("click", openBirthdaySurprise);
  slot.appendChild(button);
}
renderBirthdayCelebrateButton();
setInterval(renderBirthdayCelebrateButton, 60000);
byId("close-surprise")?.addEventListener("click", closeBirthdaySurprise);

function openVaultModal(letter) {
  const modal = byId("vault-modal");
  const content = byId("vault-modal-content");
  if (!modal || !content || !letter || !isUnlocked(letter.unlock_date) || !letter.content) return;
  content.innerHTML = `
    <p class="eyebrow">Opened ${escapeHtml(formatDate(letter.unlock_date))}</p>
    <h2>${escapeHtml(letter.title)}</h2>
    <div class="hidden-letter-content">${escapeHtml(letter.content).replace(/\n/g, "<br>")}</div>`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeVaultModal() {
  const modal = byId("vault-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
byId("close-vault-modal")?.addEventListener("click", closeVaultModal);
byId("vault-modal")?.addEventListener("click", event => { if (event.target === byId("vault-modal")) closeVaultModal(); });

function renderVault() {
  const container = byId("vault-timeline");
  if (!container) return;
  const monthly = letters.filter(letter => !isBirthdayLetter(letter));
  if (!monthly.length) {
    container.innerHTML = `<div class="vault-empty"><div class="vault-empty-icon">✉</div><h3>No monthly letters yet</h3><p>New letters will appear here once Claudia adds them.</p></div>`;
    return;
  }
  container.innerHTML = monthly.map(letter => {
    const unlocked = isUnlocked(letter.unlock_date) && Boolean(letter.content);
    return `<article class="vault-card ${unlocked ? "vault-letter" : "vault-sealed"}">
      <div class="vault-icon">${unlocked ? "💌" : "🔒"}</div>
      <p class="vault-month">${escapeHtml(formatDate(letter.unlock_date))}</p>
      <h3>${escapeHtml(letter.title)}</h3>
      <p class="vault-preview">${unlocked ? "This letter is ready to open." : "Safely sealed until its opening date."}</p>
      <button class="button ${unlocked ? "primary" : "vault-button"}" type="button" ${unlocked ? "" : "disabled"} data-letter-id="${letter.id}">
        ${unlocked ? "Open Letter" : `Locked until ${escapeHtml(formatDate(letter.unlock_date))}`}
      </button>
    </article>`;
  }).join("");
  container.querySelectorAll("[data-letter-id]").forEach(button => {
    button.addEventListener("click", () => openVaultModal(letters.find(letter => letter.id === button.dataset.letterId)));
  });
}

function updateBirthdayLetter() {
  const card = byId("birthday-message-card");
  const title = byId("birthday-message-title");
  const status = byId("birthday-message-status");
  const button = byId("open-birthday-letter");
  const subtext = byId("birthday-message-subtext");
  if (!card || !title || !status || !button) return;
  const letter = letters.find(isBirthdayLetter);
  const unlocked = letter && isUnlocked(letter.unlock_date) && Boolean(letter.content);
  if (unlocked) {
    card.classList.remove("locked");
    title.textContent = letter.title;
    status.textContent = "Your birthday letter is ready to open.";
    button.disabled = false;
    button.textContent = "Open Your Birthday Letter";
    if (subtext) subtext.textContent = "Your special birthday letter is now open.";
    button.onclick = () => openVaultModal(letter);
  } else {
    card.classList.add("locked");
    title.textContent = "A Sealed Birthday Letter";
    status.textContent = letter ? "Your birthday message is safely sealed until your special day." : "Claudia is still preparing your special birthday message.";
    button.disabled = true;
    button.textContent = "Locked until 22 July 2026";
    button.onclick = null;
  }
}
byId("surprise-open-letter")?.addEventListener("click", () => {
  const letter = letters.find(isBirthdayLetter);
  if (letter && isUnlocked(letter.unlock_date) && letter.content) {
    closeBirthdaySurprise();
    openVaultModal(letter);
  }
});

async function loadLetters() {
  const container = byId("vault-timeline");
  try {
    // First use the vault RPC so future locked letters can still appear safely.
    const rpcResult = await supabaseClient.rpc("get_letter_vault");
    if (!rpcResult.error && Array.isArray(rpcResult.data) && rpcResult.data.length) {
      letters = rpcResult.data;
    } else {
      // Reliable fallback: RLS permits the public site to read letters only after unlock.
      const directResult = await supabaseClient
        .from("letters")
        .select("id,title,unlock_date,content")
        .lte("unlock_date", new Date().toISOString())
        .order("unlock_date", { ascending: true });
      if (directResult.error) throw directResult.error;
      letters = directResult.data || [];
    }
    renderVault();
    updateBirthdayLetter();
  } catch (error) {
    console.error("Letter load failed:", error);
    if (container) container.innerHTML = `<div class="vault-empty"><h3>The vault could not be loaded</h3><p>${escapeHtml(error.message || "Please try again shortly.")}</p></div>`;
  }
}

function openPhotoLightbox(url, caption) {
  const lightbox = byId("photo-lightbox");
  const image = byId("photo-lightbox-image");
  const text = byId("photo-lightbox-caption");
  if (!lightbox || !image || !text) return;
  image.src = url;
  image.alt = caption || "Memory photograph";
  text.textContent = caption || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closePhotoLightbox() {
  const lightbox = byId("photo-lightbox");
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
byId("close-photo-lightbox")?.addEventListener("click", closePhotoLightbox);
byId("photo-lightbox")?.addEventListener("click", event => { if (event.target === byId("photo-lightbox")) closePhotoLightbox(); });

async function loadMemories() {
  const gallery = byId("uploaded-photo-gallery");
  if (!gallery) return;
  const { data, error } = await supabaseClient.from("memories").select("id,name,message,photo_url,created_at").eq("approved", true).order("created_at", { ascending: false });
  if (error) {
    console.error("Memory load failed:", error);
    gallery.innerHTML = `<p class="gallery-empty">The photographs could not be loaded right now.</p>`;
    return;
  }
  const photos = (data || []).filter(item => item.photo_url);
  if (!photos.length) {
    gallery.innerHTML = `<p class="gallery-empty">No shared photographs have been added yet.</p>`;
    return;
  }
  gallery.innerHTML = photos.map(item => {
    const caption = [item.message, item.name ? `Shared by ${item.name}` : ""].filter(Boolean).join(" — ");
    return `<button class="uploaded-photo-card uploaded-photo-button" type="button" data-photo-url="${escapeHtml(item.photo_url)}" data-caption="${escapeHtml(caption)}">
      <img src="${escapeHtml(item.photo_url)}" alt="${escapeHtml(item.message || `Memory shared by ${item.name}`)}" loading="lazy">
      <span class="uploaded-photo-caption"><strong>${escapeHtml(item.name)}</strong>${item.message ? `<small>${escapeHtml(item.message)}</small>` : ""}</span>
    </button>`;
  }).join("");
  gallery.querySelectorAll("[data-photo-url]").forEach(button => {
    button.addEventListener("click", () => openPhotoLightbox(button.dataset.photoUrl, button.dataset.caption));
  });
}

byId("memory-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");
  const status = byId("form-status");
  const photo = byId("memory-photo").files[0];
  if (!photo) return;
  if (photo.size > 5 * 1024 * 1024) {
    status.textContent = "Please choose an image smaller than 5 MB.";
    return;
  }
  button.disabled = true;
  status.textContent = "Uploading your memory...";
  try {
    const body = new FormData();
    body.append("name", byId("memory-name").value.trim());
    body.append("message", byId("memory-message").value.trim());
    body.append("pin", byId("memory-pin").value.trim());
    body.append("photo", photo);
    const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-memory`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      body
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "The memory could not be uploaded.");
    form.reset();
    status.textContent = "Your memory has been added with love.";
    await loadMemories();
  } catch (error) {
    console.error(error);
    status.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
  }
});

loadMemories();
loadLetters();
setInterval(() => { renderVault(); updateBirthdayLetter(); }, 60000);
