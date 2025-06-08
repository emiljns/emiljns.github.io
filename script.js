// Elements
const btn = document.getElementById("reveal-btn");
const backdrop = document.getElementById("card-backdrop");
const card = document.getElementById("about-card");

const contactBtn = document.getElementById("contact-btn");
const backBtn = document.getElementById("back-btn");

const infoView = document.getElementById("info-view");
const formView = document.getElementById("form-view");

const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("form-status");

const background = document.getElementById("background");
const spotifyStatus = document.getElementById("spotify-status");

// Show card on main button click
btn.addEventListener("click", () => {
  btn.classList.add("hidden");
  backdrop.classList.remove("hidden");
  card.classList.remove("opacity-0");
  card.classList.add("animate-fade");
});

// Hide card when clicking outside the card
backdrop.addEventListener("click", (e) => {
  if (!card.contains(e.target)) {
    closeCard();
  }
});

// Toggle to contact form view
contactBtn.addEventListener("click", () => {
  infoView.classList.add("hidden");
  formView.classList.remove("hidden");
  hideStatus();
  form.reset();
});

// Back button toggles back to intro view
backBtn.addEventListener("click", () => {
  formView.classList.add("hidden");
  infoView.classList.remove("hidden");
  hideStatus();
  form.reset();
});

// Close card helper function
function closeCard() {
  card.classList.add("opacity-0");
  setTimeout(() => {
    backdrop.classList.add("hidden");
    btn.classList.remove("hidden");

    // Reset views and form
    infoView.classList.remove("hidden");
    formView.classList.add("hidden");
    hideStatus();
    form.reset();
  }, 400);
}

// Hide status message
function hideStatus() {
  statusMessage.classList.add("hidden");
  statusMessage.textContent = "";
  statusMessage.classList.remove("text-red-400", "text-green-400");
}

// Show success message
function showSuccess(msg) {
  statusMessage.textContent = msg;
  statusMessage.classList.remove("hidden", "text-red-400");
  statusMessage.classList.add("text-green-400");
}

// Show error message
function showError(msg) {
  statusMessage.textContent = msg;
  statusMessage.classList.remove("hidden", "text-green-400");
  statusMessage.classList.add("text-red-400");
}

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim() || "Anonymous";
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!message) {
    showError("Message cannot be empty.");
    return;
  }

  if (!email || !validateEmail(email)) {
    showError("Please enter a valid email.");
    return;
  }

  const content = `**📩 New Contact Form Submission**
**Name:** ${name}
**Email:** ${email}
**Message:** ${message}`;

  const payload = { content };

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      form.reset();
      showSuccess("Message sent! ✅");
    } else {
      throw new Error("Failed to send");
    }
  })
  .catch(() => {
    showError("Failed to send. ❌");
  });
});

function validateEmail(email) {
  // Simple regex email validation
  return /\S+@\S+\.\S+/.test(email);
}

// --- Lanyard Spotify Background Integration ---

function setBackground(url) {
  background.style.backgroundImage = url
    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${url})`
    : `url(${DEFAULT_BACKGROUND_URL})`;
  background.style.backgroundSize = "cover";
  background.style.backgroundPosition = "center";
  background.style.backgroundRepeat = "no-repeat";
}

// Initialize with default background
setBackground(DEFAULT_BACKGROUND_URL);

// Setup Lanyard websocket for Spotify presence updates
const ws = new WebSocket("wss://api.lanyard.rest/socket");

ws.onopen = () => {
  ws.send(JSON.stringify({
    op: 2,
    d: { subscribe_to_id: DISCORD_USER_ID }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
    const activities = message.d.activities || [];
    const spotify = activities.find(act => act.type === 2 && act.name === "Spotify");

    if (spotify) {
      // Parse album art url
      let albumArtUrl = spotify.assets.large_image;
      if (albumArtUrl && albumArtUrl.startsWith("spotify:")) {
        const albumId = albumArtUrl.split(":").pop();
        albumArtUrl = `https://i.scdn.co/image/${albumId}`;
      }
      setBackground(albumArtUrl);

      // Update spotify status text
      const song = spotify.details || "Unknown song";
      const artist = spotify.state || "Unknown artist";
      spotifyStatus.textContent = `🎵 Currently listening to "${song}" by ${artist}`;
    } else {
      // No Spotify activity
      setBackground(DEFAULT_BACKGROUND_URL);
      spotifyStatus.textContent = "Currently not listening to anything 🎧";
    }
  }
};

ws.onclose = () => {
  console.log("Lanyard WebSocket disconnected");
  // Optionally retry connection here
};

ws.onerror = (e) => {
  console.error("Lanyard WebSocket error:", e);
};
