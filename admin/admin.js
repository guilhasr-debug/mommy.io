const SUPABASE_URL = "https://fkmssqbzfsqqonoghmmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nWTkmo1OOY4Y32WZdhdKMw_ZkKaLWO8";

const ADMIN_PIN_HASH = "c838df5335c1eba2532f32090cd555d17c9e218289d99ecaf55525d7b199aa88";

const loginCard = document.getElementById("admin-login-card");
const adminCard = document.getElementById("admin-page-card");
const loginForm = document.getElementById("admin-login-form");
const loginPin = document.getElementById("admin-login-pin");
const loginStatus = document.getElementById("admin-login-status");
const lockButton = document.getElementById("admin-lock-button");

const letterForm = document.getElementById("letter-upload-form");
const letterStatus = document.getElementById("letter-upload-status");

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockAdmin() {
  loginCard.hidden = true;
  adminCard.hidden = false;
  sessionStorage.setItem("desre-admin-unlocked", "yes");
}

function lockAdmin() {
  sessionStorage.removeItem("desre-admin-unlocked");
  adminCard.hidden = true;
  loginCard.hidden = false;
  loginForm.reset();
  letterForm.reset();
  loginStatus.textContent = "";
  letterStatus.textContent = "";
}

if (sessionStorage.getItem("desre-admin-unlocked") === "yes") {
  unlockAdmin();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "Checking PIN...";

  const enteredHash = await sha256(loginPin.value.trim());

  if (enteredHash !== ADMIN_PIN_HASH) {
    loginStatus.textContent = "Incorrect PIN.";
    loginPin.select();
    return;
  }

  loginStatus.textContent = "";
  unlockAdmin();
});

lockButton.addEventListener("click", lockAdmin);

letterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = letterForm.querySelector("button[type='submit']");
  button.disabled = true;
  letterStatus.textContent = "Saving and sealing the letter...";

  try {
    const unlockDate = document.getElementById("letter-unlock-date").value;

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
        unlock_date: `${unlockDate}T00:00:00+02:00`,
        pin: document.getElementById("letter-pin").value.trim()
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "The letter could not be saved.");
    }

    letterForm.reset();

    if (result.emailed) {
      letterStatus.textContent = "The letter is sealed and an email was sent to desreclaase@gmail.com.";
    } else {
      letterStatus.textContent = result.warning || "The letter is sealed in the vault.";
    }
  } catch (error) {
    console.error(error);
    letterStatus.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
  }
});
