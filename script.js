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



loadMemories();
loadLetters();
setInterval(() => {
  renderVault();
  updateBirthdayLetter();
}, 60000);
