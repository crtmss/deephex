document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-button");
  const hostBtn = document.getElementById("host-button");
  const joinBtn = document.getElementById("join-button");

  if (startBtn) {
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
    startBtn.title = "Coming soon!";
  }

  if (hostBtn) {
    hostBtn.addEventListener("click", async () => {
      const roomCode = generateRoomCode();
      const seed = Math.floor(Math.random() * 1000000);
      const { data, error } = await supabase
        .from("lobbies")
        .insert([
          {
            room_code: roomCode,
            player_1: "host",
            seed,
            state: "waiting"
          }
        ])
        .select("id, room_code");

      if (error) {
        console.error("Lobby creation error:", error.message);
        alert("Failed to create lobby. Check console.");
        return;
      }

      window.location.href = `game.html?room=${roomCode}&player=1`;
    });
  }

  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      const roomCode = prompt("Enter room code:");
      if (!roomCode) return;
      window.location.href = `game.html?room=${roomCode}&player=2`;
    });
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
});
