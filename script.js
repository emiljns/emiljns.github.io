// Elements
const btn = document.getElementById("reveal-btn");
const backdrop = document.getElementById("card-backdrop");
const card = document.getElementById("about-card");

const contactBtn = document.getElementById("contact-btn");
const backBtn = document.getElementById("back-btn");

const infoView = document.getElementById("info-view");
const formView = document.getElementById("form-view");

const bgPeely = document.getElementById("bg-peely");
const bgArt = document.getElementById("bg-art");
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

// Toggle to the contact view (messages moved to cookiewarrior.io)
contactBtn.addEventListener("click", () => {
  infoView.classList.add("hidden");
  formView.classList.remove("hidden");
});

// Back button toggles back to intro view
backBtn.addEventListener("click", () => {
  formView.classList.add("hidden");
  infoView.classList.remove("hidden");
});

// Close card helper function
function closeCard() {
  card.classList.add("opacity-0");
  setTimeout(() => {
    backdrop.classList.add("hidden");
    btn.classList.remove("hidden");

    // Reset to the intro view
    infoView.classList.remove("hidden");
    formView.classList.add("hidden");
  }, 400);
}

// --- Lanyard Spotify Background Integration ---

// Peely by default; the album art (blurred, style.css) while a song plays. the layers crossfade
bgPeely.style.backgroundImage = `url(${DEFAULT_BACKGROUND_URL})`;

function setBackground(url) {
  if (url) bgArt.style.backgroundImage = `url(${url})`;
  bgArt.classList.toggle("shown", Boolean(url));
  bgPeely.classList.toggle("shown", !url);
}

// Initialize with default background
setBackground(null);

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
      setBackground(null);
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
