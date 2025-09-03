class FocusModePopup {
  constructor() {
    this.whitelist = [];
    this.isSessionActive = false;
    this.strictMode = false;
    this.soundEnabled = false;
    this.emergencyPhrase = '';
    this.currentChallenge = null;
    this.logicProblems = [
      {
        question: "If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?",
        answer: "no"
      },
      {
        question: "If it's raining, then the ground is wet. The ground is wet. Is it definitely raining?",
        answer: "no"
      },
      {
        question: "All cats are mammals. Fluffy is a cat. Is Fluffy a mammal?",
        answer: "yes"
      },
      {
        question: "If you study hard, you will pass. You passed the exam. Did you definitely study hard?",
        answer: "no"
      },
      {
        question: "No birds are mammals. Penguins are birds. Are penguins mammals?",
        answer: "no"
      },
      {
        question: "All squares are rectangles. This shape is a square. Is it a rectangle?",
        answer: "yes"
      },
      {
        question: "If someone is a doctor, they went to medical school. John went to medical school. Is John a doctor?",
        answer: "no"
      },
      {
        question: "All prime numbers greater than 2 are odd. 17 is prime and greater than 2. Is 17 odd?",
        answer: "yes"
      },
      {
        question: "If all A are B, and all B are C, then all A are C. Is this reasoning valid?",
        answer: "yes"
      },
      {
        question: "Some politicians are honest. All honest people tell the truth. Do some politicians tell the truth?",
        answer: "yes"
      },
      {
        question: "If it's sunny, I wear sunglasses. I'm wearing sunglasses. Is it sunny?",
        answer: "no"
      },
      {
        question: "All fish live in water. Sharks are fish. Do sharks live in water?",
        answer: "yes"
      },
      {
        question: "No reptiles are warm-blooded. Snakes are reptiles. Are snakes warm-blooded?",
        answer: "no"
      },
      {
        question: "If the store is closed, then the lights are off. The lights are off. Is the store closed?",
        answer: "no"
      },
      {
        question: "All diamonds are valuable. This gem is valuable. Is it a diamond?",
        answer: "no"
      },
      {
        question: "Some students are athletes. All athletes exercise regularly. Do some students exercise regularly?",
        answer: "yes"
      },
      {
        question: "If you're human, you need oxygen. Plants need oxygen. Are plants human?",
        answer: "no"
      },
      {
        question: "All circles are round. This shape is round. Is it a circle?",
        answer: "no"
      },
      {
        question: "No insects have backbones. Ants are insects. Do ants have backbones?",
        answer: "no"
      },
      {
        question: "If today is Monday, then tomorrow is Tuesday. Tomorrow is Tuesday. Is today Monday?",
        answer: "no"
      },
      {
        question: "All metals conduct electricity. Copper is a metal. Does copper conduct electricity?",
        answer: "yes"
      },
      {
        question: "Some books are fiction. All fiction contains imagination. Do some books contain imagination?",
        answer: "yes"
      },
      {
        question: "If you're tired, you should sleep. You should sleep. Are you tired?",
        answer: "no"
      },
      {
        question: "All triangles have three sides. This shape has three sides. Is it a triangle?",
        answer: "no"
      }
    ];
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.renderWhitelist();
    this.updateUI();
    this.checkSessionStatus();
  }

  async loadSettings() {
    const data = await chrome.storage.local.get([
      'whitelist', 'strictMode', 'soundEnabled', 'emergencyPhrase', 
      'sessionActive', 'sessionStart', 'sessionEnd', 'customSoundData'
    ]);
    
    this.whitelist = data.whitelist || [];
    this.strictMode = data.strictMode || false;
    this.soundEnabled = data.soundEnabled || false;
    this.emergencyPhrase = data.emergencyPhrase || '';
    this.isSessionActive = data.sessionActive || false;
    this.sessionStart = data.sessionStart || 0;
    this.sessionEnd = data.sessionEnd || 0;
    
    document.getElementById('strictModeToggle').classList.toggle('active', this.strictMode);
    document.getElementById('soundToggle').classList.toggle('active', this.soundEnabled);
    document.getElementById('emergencyPhraseSet').value = this.emergencyPhrase;
    
    if (this.soundEnabled) {
      document.getElementById('soundControls').style.display = 'flex';
      if (data.customSoundData) {
        document.getElementById('customSound').checked = true;
        document.getElementById('customSoundUpload').style.display = 'block';
      }
    }
  }

  setupEventListeners() {
    document.getElementById('addSiteBtn').addEventListener('click', () => this.addSite());
    document.getElementById('mainButton').addEventListener('click', () => this.toggleSession());
    document.getElementById('strictModeToggle').addEventListener('click', () => this.toggleStrict());
    document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    document.getElementById('emergencyStopBtn').addEventListener('click', () => this.emergencyStop());
    document.getElementById('emergencyPhraseSet').addEventListener('input', (e) => this.setEmergencyPhrase(e.target.value));
    
    document.querySelectorAll('input[name="soundType"]').forEach(radio => {
      radio.addEventListener('change', () => this.handleSoundTypeChange());
    });
    
    document.getElementById('soundFile').addEventListener('change', (e) => this.handleSoundUpload(e));
  }

  addSite() {
    if (this.whitelist.length >= 10) return;
    
    this.whitelist.push('');
    this.renderWhitelist();
    this.saveSettings();
  }

  removeSite(index) {
    this.whitelist.splice(index, 1);
    this.renderWhitelist();
    this.saveSettings();
  }

  updateSite(index, value) {
    this.whitelist[index] = value.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    this.saveSettings();
  }

  renderWhitelist() {
    const container = document.getElementById('whitelistContainer');
    container.innerHTML = '';
    
    this.whitelist.forEach((site, index) => {
      const div = document.createElement('div');
      div.className = 'site-input';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.value = site;
      input.placeholder = 'example.com';
      input.addEventListener('input', (e) => this.updateSite(index, e.target.value));
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => this.removeSite(index));
      
      div.appendChild(input);
      div.appendChild(removeBtn);
      container.appendChild(div);
    });
    
    document.getElementById('addSiteBtn').disabled = this.whitelist.length >= 10;
  }

  toggleStrict() {
    this.strictMode = !this.strictMode;
    document.getElementById('strictModeToggle').classList.toggle('active', this.strictMode);
    this.saveSettings();
    this.updateUI();
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    document.getElementById('soundToggle').classList.toggle('active', this.soundEnabled);
    document.getElementById('soundControls').style.display = this.soundEnabled ? 'flex' : 'none';
    this.saveSettings();
  }

  handleSoundTypeChange() {
    const isCustom = document.getElementById('customSound').checked;
    document.getElementById('customSoundUpload').style.display = isCustom ? 'block' : 'none';
  }

  async handleSoundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      await chrome.storage.local.set({ customSoundData: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  setEmergencyPhrase(phrase) {
    this.emergencyPhrase = phrase;
    this.saveSettings();
  }

  async toggleSession() {
    if (this.isSessionActive) {
      await this.stopSession();
    } else {
      await this.startSession();
    }
  }

  async startSession() {
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const validSites = this.whitelist.filter(site => site.trim());
    
    if (validSites.length === 0) {
      alert('Please add at least one website to your whitelist');
      return;
    }
    
    const sessionStart = Date.now();
    const sessionEnd = sessionStart + (duration * 60 * 1000);
    
    await chrome.storage.local.set({
      sessionActive: true,
      sessionStart: sessionStart,
      sessionEnd: sessionEnd,
      sessionEndTime: sessionEnd,
      whitelist: validSites,
      strictMode: this.strictMode,
      soundEnabled: this.soundEnabled,
      emergencyPhrase: this.emergencyPhrase
    });
    
    chrome.runtime.sendMessage({ 
      action: 'startSession', 
      sessionEnd, 
      whitelist: validSites,
      soundEnabled: this.soundEnabled
    });
    
    this.isSessionActive = true;
    this.sessionStart = sessionStart;
    this.sessionEnd = sessionEnd;
    this.updateUI();
    this.startTimer();
  }

  startAudio() {
    if (!this.soundEnabled) return;
    
    try {
      // Force new audio context
      if (this.audioContext) {
        this.audioContext.close();
      }
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // User interaction required - create click handler
      const startSound = () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().then(() => {
            this.createPomodoroSound();
            console.log('Pomodoro sound started');
          });
        } else {
          this.createPomodoroSound();
          console.log('Pomodoro sound started');
        }
        document.removeEventListener('click', startSound);
      };
      
      // Try to start immediately, fallback to click
      if (this.audioContext.state === 'running') {
        this.createPomodoroSound();
        console.log('Pomodoro sound started immediately');
      } else {
        document.addEventListener('click', startSound);
        console.log('Click anywhere to start pomodoro sound');
      }
      
    } catch (error) {
      console.error('Audio setup failed:', error);
    }
  }

  createPomodoroSound() {
    // Create a gentle ticking sound every second
    this.tickInterval = setInterval(() => {
      if (!this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    }, 1000);
    
    // Background ambient tone
    const ambientOsc = this.audioContext.createOscillator();
    const ambientGain = this.audioContext.createGain();
    
    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);
    ambientGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    
    ambientOsc.connect(ambientGain);
    ambientGain.connect(this.audioContext.destination);
    ambientOsc.start();
    
    this.audioSource = ambientOsc;
  }

  stopAudio() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    
    if (this.audioSource) {
      try {
        if (Array.isArray(this.audioSource)) {
          this.audioSource.forEach(osc => osc.stop());
        } else {
          this.audioSource.stop();
        }
      } catch (e) {}
      this.audioSource = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  async stopSession() {
    await chrome.storage.local.set({ sessionActive: false });
    chrome.runtime.sendMessage({ action: 'stopSession' });
    
    this.isSessionActive = false;
    this.updateUI();
  }

  async emergencyStop() {
    const phrase = document.getElementById('emergencyPhrase').value.trim();
    const logicAnswer = document.getElementById('logicAnswer').value.toLowerCase().trim();
    
    console.log('Emergency stop attempt:', { phrase, logicAnswer, expectedPhrase: this.emergencyPhrase, expectedAnswer: this.currentChallenge?.answer });
    
    if (phrase === this.emergencyPhrase && phrase && 
        this.currentChallenge && logicAnswer === this.currentChallenge.answer) {
      await this.stopSession();
      document.getElementById('emergencyPhrase').value = '';
      document.getElementById('logicAnswer').value = '';
    } else {
      alert(`Incorrect! Expected phrase: "${this.emergencyPhrase}" and answer: "${this.currentChallenge?.answer}"`);
      this.generateLogicChallenge();
    }
  }

  updateUI() {
    const button = document.getElementById('mainButton');
    const statusSection = document.getElementById('sessionStatusSection');
    const emergencyStop = document.getElementById('emergencyStop');
    
    if (this.isSessionActive) {
      statusSection.style.display = 'block';
      
      if (this.strictMode) {
        button.textContent = 'Session Active (Strict Mode)';
        button.className = 'main-button disabled-btn';
        button.disabled = true;
        emergencyStop.style.display = 'block';
        this.generateLogicChallenge();
      } else {
        button.textContent = 'Stop Session';
        button.className = 'main-button stop-btn';
        button.disabled = false;
        emergencyStop.style.display = 'none';
      }
    } else {
      button.textContent = 'Start Focus Session';
      button.className = 'main-button start-btn';
      button.disabled = false;
      statusSection.style.display = 'none';
    }
  }

  generateLogicChallenge() {
    this.currentChallenge = this.logicProblems[Math.floor(Math.random() * this.logicProblems.length)];
    document.getElementById('emergencyQuestion').textContent = 
      `Enter your phrase, then solve: ${this.currentChallenge.question}`;
  }

  async checkSessionStatus() {
    if (this.isSessionActive && this.sessionEnd) {
      if (Date.now() >= this.sessionEnd) {
        await this.stopSession();
      } else {
        this.startTimer();
      }
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const totalDuration = this.sessionEnd - this.sessionStart;
    const circumference = 2 * Math.PI * 85; // radius = 85
    
    this.timerInterval = setInterval(() => {
      const remaining = Math.max(0, this.sessionEnd - Date.now());
      const elapsed = Date.now() - this.sessionStart;
      
      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      // Update circular progress
      const progress = elapsed / totalDuration;
      const offset = circumference - (progress * circumference);
      const progressCircle = document.getElementById('progressCircle');
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
      }
      
      // Update timer text with mm:ss format
      const timerText = document.getElementById('timerText');
      if (timerText) {
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerText.textContent = remaining > 0 ? formattedTime : '00:00';
      }
      
      document.getElementById('sessionStatus').textContent = 
        remaining > 0 ? `Focus session active` : 'Session completed';
      
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.stopSession();
      }
    }, 1000);
  }

  async saveSettings() {
    await chrome.storage.local.set({
      whitelist: this.whitelist,
      strictMode: this.strictMode,
      soundEnabled: this.soundEnabled,
      emergencyPhrase: this.emergencyPhrase
    });
  }
}

const popup = new FocusModePopup();
window.popup = popup;
