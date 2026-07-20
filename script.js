import { firebaseConfig } from "./firebase-config.js";

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

const isConfigured = !Object.values(firebaseConfig).some(value => value.includes("PASTE_YOUR"));
const form = document.getElementById("memory-form");
const wall = document.getElementById("memory-wall");
const status = document.getElementById("form-status");
const setupNote = document.getElementById("firebase-note");

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function renderMemory(memory) {
  const card = document.createElement("article");
  card.className = "memory-card";
  const image = memory.photoUrl ? `<img src="${escapeHtml(memory.photoUrl)}" alt="Photograph shared by ${escapeHtml(memory.name)}">` : "";
  const date = memory.createdAt?.toDate ? memory.createdAt.toDate() : new Date(memory.createdAt || Date.now());

  card.innerHTML = `
    ${image}
    <p class="memory-message">${escapeHtml(memory.message)}</p>
    <p class="memory-author">— ${escapeHtml(memory.name)}</p>
    <p class="memory-date">${date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</p>
  `;
  wall.appendChild(card);
}

if (!isConfigured) {
  setupNote.style.display = "block";
  form.addEventListener("submit", event => {
    event.preventDefault();
    status.textContent = "Firebase still needs to be connected before memories can be shared between visitors.";
  });
} else {
  setupNote.style.display = "none";

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const { getFirestore, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } =
    await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  const { getStorage, ref, uploadBytes, getDownloadURL } =
    await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const memoriesRef = collection(db, "memories");

  onSnapshot(query(memoriesRef, orderBy("createdAt", "desc")), snapshot => {
    wall.querySelectorAll(".memory-card:not(.featured)").forEach(card => card.remove());
    snapshot.forEach(document => renderMemory(document.data()));
  }, error => {
    console.error(error);
    setupNote.style.display = "block";
    setupNote.textContent = "The memory wall could not be loaded. Please check the Firebase security rules.";
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "Adding your memory...";
    const submitButton = form.querySelector("button");
    submitButton.disabled = true;

    try {
      const name = document.getElementById("memory-name").value.trim();
      const message = document.getElementById("memory-message").value.trim();
      const file = document.getElementById("memory-photo").files[0];
      let photoUrl = "";

      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Please choose an image smaller than 5 MB.");
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const photoRef = ref(storage, `memory-photos/${Date.now()}-${safeName}`);
        await uploadBytes(photoRef, file);
        photoUrl = await getDownloadURL(photoRef);
      }

      await addDoc(memoriesRef, {
        name,
        message,
        photoUrl,
        createdAt: serverTimestamp()
      });

      form.reset();
      status.textContent = "Your memory has been added with love.";
      launchConfetti();
    } catch (error) {
      console.error(error);
      status.textContent = error.message || "Something went wrong. Please try again.";
    } finally {
      submitButton.disabled = false;
    }
  });
}


const vaultCards = document.querySelectorAll(".vault-card");
const vaultModal = document.getElementById("vault-modal");
const vaultModalContent = document.getElementById("vault-modal-content");
const closeVaultModalButton = document.getElementById("close-vault-modal");

function formatUnlockDate(date) {
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function updateVaultStatus() {
  const now = new Date();

  vaultCards.forEach(card => {
    const unlockDate = new Date(card.dataset.unlock);
    const button = card.querySelector(".vault-button");
    const unlocked = now >= unlockDate;

    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("locked", !unlocked);

    if (unlocked) {
      button.textContent = "Open Letter";
      button.disabled = false;
      button.title = "Open this month's letter";
    } else {
      button.textContent = `Locked until ${formatUnlockDate(unlockDate)}`;
      button.disabled = true;
      button.title = `This letter unlocks on ${formatUnlockDate(unlockDate)}`;
    }
  });
}

vaultCards.forEach(card => {
  const button = card.querySelector(".vault-button");
  button.addEventListener("click", () => {
    if (card.classList.contains("locked")) return;

    const letter = card.querySelector(".vault-letter");
    vaultModalContent.innerHTML = letter.innerHTML;
    vaultModal.classList.add("open");
    vaultModal.setAttribute("aria-hidden", "false");
  });
});

function closeVaultModal() {
  vaultModal.classList.remove("open");
  vaultModal.setAttribute("aria-hidden", "true");
}

closeVaultModalButton.addEventListener("click", closeVaultModal);
vaultModal.addEventListener("click", event => {
  if (event.target === vaultModal) closeVaultModal();
});

updateVaultStatus();
setInterval(updateVaultStatus, 60000);
