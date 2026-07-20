const birthday = new Date("2026-07-22T00:00:00+02:00");
const countdown = document.getElementById("countdown");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date();
  const difference = birthday.getTime() - now.getTime();

  if (difference <= 0) {
    countdown.innerHTML = "<div style='grid-column:1/-1'><strong>Happy Birthday!</strong><span>Today we celebrate Desre</span></div>";
    return;
  }

  daysEl.textContent = String(Math.floor(difference / 86400000)).padStart(2, "0");
  hoursEl.textContent = String(Math.floor((difference / 3600000) % 24)).padStart(2, "0");
  minutesEl.textContent = String(Math.floor((difference / 60000) % 60)).padStart(2, "0");
  secondsEl.textContent = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(item => observer.observe(item));

const modal = document.getElementById("birthday-modal");
const celebrateButton = document.getElementById("celebrate-button");
const closeModal = document.getElementById("close-modal");

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
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  launchConfetti();
}
function hideModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
celebrateButton.addEventListener("click", openModal);
closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", event => { if (event.target === modal) hideModal(); });




const SUPABASE_URL = "https://fkmssqbzfsqqonoghmmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nWTkmo1OOY4Y32WZdhdKMw_ZkKaLWO8";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const birthdayUnlockDate = new Date("2026-07-22T00:00:00+02:00");
const birthdayEndDate = new Date("2026-07-23T00:00:00+02:00");

const memoryForm = document.getElementById("memory-form");
const memoryWall = document.getElementById("memory-wall");
const memoryStatus = document.getElementById("form-status");
const uploadedGallery = document.getElementById("uploaded-photo-gallery");
const galleryEmpty = document.getElementById("gallery-empty");

const vaultTimeline = document.getElementById("vault-timeline");
const vaultModal = document.getElementById("vault-modal");
const vaultModalContent = document.getElementById("vault-modal-content");
const closeVaultModalButton = document.getElementById("close-vault-modal");

const birthdayCard = document.getElementById("birthday-message-card");
const birthdayTitle = document.getElementById("birthday-message-title");
const birthdayStatus = document.getElementById("birthday-message-status");
const birthdayButton = document.getElementById("open-birthday-letter");
const birthdaySubtext = document.getElementById("birthday-message-subtext");

const birthdaySurprise = document.getElementById("birthday-surprise");
const closeSurpriseButton = document.getElementById("close-surprise");
const surpriseOpenLetterButton = document.getElementById("surprise-open-letter");

const photoLightbox = document.getElementById("photo-lightbox");
const photoLightboxImage = document.getElementById("photo-lightbox-image");
const photoLightboxCaption = document.getElementById("photo-lightbox-caption");
const closePhotoLightboxButton = document.getElementById("close-photo-lightbox");

const letterForm = document.getElementById("letter-upload-form");
const letterUploadStatus = document.getElementById("letter-upload-status");

let loadedLetters = [];
let birthdayLetter = null;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg"
  });
}

function isBirthdayToday() {
  const now = new Date();
  return now >= birthdayUnlockDate && now < birthdayEndDate;
}

function isUnlocked(dateValue) {
  return new Date() >= new Date(dateValue);
}

function letterHtml(letter) {
  const paragraphs = escapeHtml(letter.content || "")
    .split(/\n{2,}/)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `
    <p class="eyebrow">${formatDate(letter.unlock_date)}</p>
    <h3>${escapeHtml(letter.title)}</h3>
    ${paragraphs}
    <p class="signature">With all my love,<br><strong>Claudia</strong> ❤️</p>
  `;
}

function openLetter(letter) {
  if (!letter || !isUnlocked(letter.unlock_date)) return;
  vaultModalContent.innerHTML = letterHtml(letter);
  vaultModal.classList.add("open");
  vaultModal.setAttribute("aria-hidden", "false");
}

function closeVaultModal() {
  vaultModal.classList.remove("open");
  vaultModal.setAttribute("aria-hidden", "true");
}

closeVaultModalButton?.addEventListener("click", closeVaultModal);
vaultModal?.addEventListener("click", event => {
  if (event.target === vaultModal) closeVaultModal();
});

function renderVault() {
  const monthlyLetters = loadedLetters.filter(letter => {
    const d = new Date(letter.unlock_date);
    return !(d.getFullYear() === 2026 && d.getMonth() === 6 && d.getDate() === 22);
  });

  if (!monthlyLetters.length) {
    vaultTimeline.innerHTML = `
      <div class="vault-empty">
        <div class="vault-empty-icon">✉</div>
        <h3>The vault is waiting</h3>
        <p>New monthly letters will appear here as Claudia adds them.</p>
      </div>`;
    return;
  }

  vaultTimeline.innerHTML = monthlyLetters.map(letter => {
    const unlocked = isUnlocked(letter.unlock_date);
    return `
      <article class="timeline-letter ${unlocked ? "unlocked" : "locked"}" data-letter-id="${letter.id}">
        <div class="timeline-dot">${unlocked ? "✓" : "🔒"}</div>
        <div class="timeline-content">
          <p class="vault-month">${formatDate(letter.unlock_date)}</p>
          <h3>${unlocked ? escapeHtml(letter.title) : "A Sealed Letter"}</h3>
          <p>${unlocked ? "This letter is ready for you." : "This letter remains sealed until its opening date."}</p>
          <button class="vault-button" type="button" ${unlocked ? "" : "disabled"}>
            ${unlocked ? "Open Letter" : `Locked until ${formatDate(letter.unlock_date)}`}
          </button>
        </div>
      </article>`;
  }).join("");

  vaultTimeline.querySelectorAll(".timeline-letter.unlocked").forEach(card => {
    card.querySelector("button")?.addEventListener("click", () => {
      const letter = loadedLetters.find(item => item.id === card.dataset.letterId);
      openLetter(letter);
    });
  });
}

function updateBirthdayLetter() {
  const now = new Date();
  const unlocked = now >= birthdayUnlockDate;
  birthdayLetter = loadedLetters.find(letter => {
    const d = new Date(letter.unlock_date);
    return d.getFullYear() === 2026 && d.getMonth() === 6 && d.getDate() === 22;
  }) || null;

  birthdayCard.classList.toggle("locked", !unlocked);
  birthdayCard.classList.toggle("unlocked", unlocked);

  if (!unlocked) {
    birthdayTitle.textContent = "A Sealed Birthday Letter";
    birthdayStatus.textContent = "Your birthday message is safely sealed until your special day.";
    birthdayButton.disabled = true;
    birthdayButton.textContent = "Locked until 22 July 2026";
    birthdaySubtext.textContent = "This special letter will unlock on 22 July 2026.";
    return;
  }

  if (!birthdayLetter) {
    birthdayTitle.textContent = "Your Birthday Letter";
    birthdayStatus.textContent = "Your letter has not been added yet.";
    birthdayButton.disabled = true;
    birthdayButton.textContent = "Letter Coming Soon";
    return;
  }

  birthdayTitle.textContent = birthdayLetter.title;
  birthdayStatus.textContent = "Your birthday message is ready to open.";
  birthdayButton.disabled = false;
  birthdayButton.textContent = "Open My Birthday Message";
  birthdaySubtext.textContent = "Your special birthday letter is ready.";
}

birthdayButton?.addEventListener("click", () => openLetter(birthdayLetter));
surpriseOpenLetterButton?.addEventListener("click", () => {
  birthdaySurprise.classList.remove("open");
  openLetter(birthdayLetter);
});

function showBirthdaySurprise() {
  if (!isBirthdayToday()) return;
  const storageKey = "desreBirthdaySurpriseSeen-2026";
  if (sessionStorage.getItem(storageKey)) return;
  sessionStorage.setItem(storageKey, "yes");
  birthdaySurprise.classList.add("open");
  birthdaySurprise.setAttribute("aria-hidden", "false");
  if (typeof launchConfetti === "function") launchConfetti();
}

closeSurpriseButton?.addEventListener("click", () => {
  birthdaySurprise.classList.remove("open");
  birthdaySurprise.setAttribute("aria-hidden", "true");
});

async function loadLetters() {
  const { data, error } = await supabaseClient
    .from("letters")
    .select("id,title,content,unlock_date,created_at")
    .order("unlock_date", { ascending: true });

  if (error) {
    console.error("Could not load letters:", error);
    vaultTimeline.innerHTML = `
      <div class="vault-empty">
        <h3>The vault could not be opened</h3>
        <p>Please check the Supabase setup.</p>
      </div>`;
    return;
  }

  loadedLetters = data || [];
  renderVault();
  updateBirthdayLetter();
  showBirthdaySurprise();
}

function openPhotoLightbox(src, caption) {
  photoLightboxImage.src = src;
  photoLightboxImage.alt = caption || "Memory photograph";
  photoLightboxCaption.textContent = caption || "";
  photoLightbox.classList.add("open");
  photoLightbox.setAttribute("aria-hidden", "false");
}

function closePhotoLightbox() {
  photoLightbox.classList.remove("open");
  photoLightbox.setAttribute("aria-hidden", "true");
  photoLightboxImage.src = "";
}

closePhotoLightboxButton?.addEventListener("click", closePhotoLightbox);
photoLightbox?.addEventListener("click", event => {
  if (event.target === photoLightbox) closePhotoLightbox();
});

function renderMemory(memory) {
  const card = document.createElement("article");
  card.className = "memory-card";
  const date = new Date(memory.created_at || Date.now());
  const safeName = escapeHtml(memory.name);
  const safeMessage = escapeHtml(memory.message || "");

  card.innerHTML = `
    ${memory.photo_url ? `<button class="memory-photo-button" type="button"><img src="${escapeHtml(memory.photo_url)}" alt="Photograph shared by ${safeName}" loading="lazy"></button>` : ""}
    ${safeMessage ? `<p class="memory-message">${safeMessage}</p>` : ""}
    <p class="memory-author">— ${safeName}</p>
    <p class="memory-date">${date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</p>
  `;
  memoryWall.appendChild(card);

  if (memory.photo_url) {
    const photoCard = document.createElement("article");
    photoCard.className = "uploaded-photo-card";
    const caption = `${memory.name}${memory.message ? ` — ${memory.message}` : ""}`;
    photoCard.innerHTML = `
      <button class="uploaded-photo-button" type="button">
        <img src="${escapeHtml(memory.photo_url)}" alt="Memory photograph shared by ${safeName}" loading="lazy">
        <span class="uploaded-photo-caption">${escapeHtml(caption)}</span>
      </button>
    `;
    photoCard.querySelector("button").addEventListener("click", () => openPhotoLightbox(memory.photo_url, caption));
    uploadedGallery.appendChild(photoCard);
  }

  card.querySelector(".memory-photo-button")?.addEventListener("click", () => {
    openPhotoLightbox(memory.photo_url, `${memory.name}${memory.message ? ` — ${memory.message}` : ""}`);
  });
}

async function loadMemories() {
  const { data, error } = await supabaseClient
    .from("memories")
    .select("id,name,message,photo_url,created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    memoryStatus.textContent = "The permanent memory collection could not be loaded.";
    return;
  }

  memoryWall.innerHTML = "";
  uploadedGallery.querySelectorAll(".uploaded-photo-card").forEach(card => card.remove());

  const items = data || [];
  galleryEmpty.style.display = items.some(item => item.photo_url) ? "none" : "block";
  items.forEach(renderMemory);
}

memoryForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = memoryForm.querySelector("button[type='submit']");
  const photo = document.getElementById("memory-photo").files[0];

  if (photo && photo.size > 5 * 1024 * 1024) {
    memoryStatus.textContent = "Please choose a photograph smaller than 5 MB.";
    return;
  }

  submitButton.disabled = true;
  memoryStatus.textContent = "Saving this memory permanently…";

  try {
    const payload = new FormData();
    payload.append("name", document.getElementById("memory-name").value.trim());
    payload.append("message", document.getElementById("memory-message").value.trim());
    payload.append("pin", document.getElementById("memory-pin").value.trim());
    if (photo) payload.append("photo", photo);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-memory`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
      body: payload
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The memory could not be saved.");

    memoryForm.reset();
    memoryStatus.textContent = "Your memory and photograph have been saved permanently.";
    if (typeof launchConfetti === "function") launchConfetti();
    await loadMemories();
  } catch (error) {
    console.error(error);
    memoryStatus.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

letterForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = letterForm.querySelector("button[type='submit']");
  button.disabled = true;
  letterUploadStatus.textContent = "Saving and sealing the letter…";

  try {
    const unlockDateValue = document.getElementById("letter-unlock-date").value;
    const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({
        title: document.getElementById("letter-title").value.trim(),
        content: document.getElementById("letter-content").value.trim(),
        unlock_date: `${unlockDateValue}T00:00:00+02:00`,
        pin: document.getElementById("letter-pin").value.trim()
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The letter could not be saved.");

    letterForm.reset();
    letterUploadStatus.textContent = result.emailed
      ? "The letter is sealed and Desre has been emailed."
      : (result.warning || "The letter is sealed in the vault.");
    await loadLetters();
  } catch (error) {
    console.error(error);
    letterUploadStatus.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
  }
});

loadMemories();
loadLetters();
setInterval(() => {
  renderVault();
  updateBirthdayLetter();
}, 60000);
