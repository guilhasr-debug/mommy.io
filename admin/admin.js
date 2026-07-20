const SUPABASE_URL = "https://fkmssqbzfsqqonoghmmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nWTkmo1OOY4Y32WZdhdKMw_ZkKaLWO8";

const form = document.getElementById("letter-upload-form");
const status = document.getElementById("letter-upload-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  status.textContent = "Saving and sealing the letter...";

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
    if (!response.ok) throw new Error(result.error || "The letter could not be saved.");

    form.reset();
    status.textContent = result.emailed
      ? "The letter is sealed and Desre has been emailed."
      : (result.warning || "The letter is sealed in the vault.");
  } catch (error) {
    console.error(error);
    status.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    button.disabled = false;
  }
});
