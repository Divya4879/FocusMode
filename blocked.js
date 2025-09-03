async function updateTimer() {
  try {
    const data = await chrome.storage.local.get(['sessionEndTime']);
    if (data.sessionEndTime) {
      const remaining = Math.max(0, data.sessionEndTime - Date.now());
      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      document.getElementById('timer').textContent = 
        remaining > 0 ? `Session ends in ${minutes}:${seconds.toString().padStart(2, '0')}` : 'Session ended';
    }
  } catch (error) {
    document.getElementById('timer').textContent = 'Focus session active';
  }
}

updateTimer();
setInterval(updateTimer, 1000);
