class FocusAudio {
  constructor() {
    this.audioContext = null;
    this.audioSource = null;
    this.tickInterval = null;
    this.isPlaying = false;
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
    });
  }

  handleMessage(message) {
    switch (message.action) {
      case 'startAudio':
        this.startAudio(message.customSoundData);
        break;
      case 'stopAudio':
        this.stopAudio();
        break;
    }
  }

  async startAudio(customSoundData) {
    if (this.isPlaying) return;
    
    try {
      this.audioContext = new AudioContext();
      this.isPlaying = true;
      
      if (customSoundData) {
        await this.playCustomSound(customSoundData);
      } else {
        this.playDefaultSound();
      }
      
      console.log('Pomodoro audio started in offscreen');
    } catch (error) {
      console.error('Audio failed:', error);
    }
  }

  async playCustomSound(soundData) {
    try {
      const response = await fetch(soundData);
      const audioData = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      const playLoop = () => {
        if (!this.isPlaying) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start();
        
        source.onended = () => {
          if (this.isPlaying) {
            setTimeout(playLoop, 100);
          }
        };
      };
      
      playLoop();
    } catch (error) {
      console.error('Custom sound failed, using default:', error);
      this.playDefaultSound();
    }
  }

  playDefaultSound() {
    // Gentle ticking every second
    this.tickInterval = setInterval(() => {
      if (!this.audioContext || !this.isPlaying) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.15);
    }, 1000);

    // Background ambient tone
    const ambientOsc = this.audioContext.createOscillator();
    const ambientGain = this.audioContext.createGain();
    
    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);
    ambientGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(this.audioContext.destination);
    ambientOsc.start();
    
    this.audioSource = ambientOsc;
  }

  stopAudio() {
    this.isPlaying = false;
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    
    if (this.audioSource) {
      try {
        this.audioSource.stop();
      } catch (e) {}
      this.audioSource = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('Pomodoro audio stopped');
  }
}

new FocusAudio();
