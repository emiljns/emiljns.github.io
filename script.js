// Set background
document.getElementById("background").style.backgroundImage = `url(${BACKGROUND_IMAGE_URL})`;

// Set description
document.getElementById("funny-description").textContent = FUNNY_DESCRIPTION;

// Elements
const btn = document.getElementById("reveal-btn");
const backdrop = document.getElementById("card-backdrop");
const card = document.getElementById("about-card");

// Show card, hide button
btn.addEventListener("click", () => {
  btn.classList.add("hidden");
  backdrop.classList.remove("hidden");
});

// Hide card & show button when clicking outside card
backdrop.addEventListener("click", (e) => {
  if (!card.contains(e.target)) {
    backdrop.classList.add("hidden");
    btn.classList.remove("hidden");
  }
});
