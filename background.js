class FocusModeBackground {
  constructor() {
    this.sessionActive = false;
    this.sessionEnd = 0;
    this.whitelist = [];
    this.audioContext = null;
    this.audioSource = null;
    this.tickInterval = null;
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
    
    chrome.runtime.onStartup.addListener(() => this.restoreSession());
    chrome.runtime.onInstalled.addListener(() => this.restoreSession());
    
    // Block extension management during focus
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (this.sessionActive && changeInfo.url && 
          (changeInfo.url.includes('chrome://extensions') || 
           changeInfo.url.includes('chrome://settings'))) {
        chrome.tabs.update(tabId, { url: 'chrome://newtab/' });
      }
    });

    // Warn before uninstall during session
    chrome.management.onUninstalled.addListener((extensionInfo) => {
      if (extensionInfo.id === chrome.runtime.id && this.sessionActive) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Focus Session Broken!',
          message: 'Extension removed during active session. Session data lost.'
        });
      }
    });
    
    this.restoreSession();
  }

  async restoreSession() {
    const data = await chrome.storage.local.get(['sessionActive', 'sessionEnd', 'sessionEndTime', 'whitelist', 'soundEnabled']);
    
    if (data.sessionEndTime && data.sessionEndTime > Date.now()) {
      this.sessionActive = true;
      this.sessionEnd = data.sessionEndTime;
      this.whitelist = data.whitelist || [];
      
      await chrome.storage.local.set({ sessionActive: true });
      
      this.startSessionTimer();
      this.startSessionMonitor();
      
      if (data.soundEnabled) {
        await this.startAudio();
      }
    } else if (data.sessionEndTime) {
      await this.endSession();
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'startSession':
        await this.startSession(message.sessionEnd, message.whitelist, message.soundEnabled);
        break;
      case 'stopSession':
        await this.endSession();
        break;
    }
  }

  async startSession(sessionEnd, whitelist, soundEnabled) {
    this.sessionActive = true;
    this.sessionEnd = sessionEnd;
    this.whitelist = whitelist;
    
    await chrome.storage.local.set({
      sessionLock: Date.now(),
      sessionEndTime: sessionEnd
    });
    
    this.startSessionTimer();
    this.startSessionMonitor();
    
    if (soundEnabled) {
      await this.startAudio();
    }
  }

  async startAudio() {
    try {
      // Check if offscreen document already exists
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });
      
      if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['AUDIO_PLAYBACK'],
          justification: 'Play pomodoro sounds during focus session'
        });
      }
      
      const data = await chrome.storage.local.get(['customSoundData']);
      
      chrome.runtime.sendMessage({
        action: 'startAudio',
        customSoundData: data.customSoundData
      });
      
    } catch (error) {
      console.error('Failed to create audio offscreen:', error);
    }
  }

  async stopAudio() {
    try {
      // Stop audio in offscreen document
      chrome.runtime.sendMessage({ action: 'stopAudio' });
      
      // Close offscreen document
      await chrome.offscreen.closeDocument();
    } catch (error) {
      console.log('Offscreen document cleanup:', error);
    }
  }

  startSessionMonitor() {
    this.monitorInterval = setInterval(async () => {
      const data = await chrome.storage.local.get(['sessionActive', 'sessionEndTime']);
      
      if (data.sessionActive && data.sessionEndTime > Date.now()) {
        this.sessionActive = true;
        this.sessionEnd = data.sessionEndTime;
      } else if (data.sessionEndTime && data.sessionEndTime <= Date.now()) {
        await this.endSession();
      }
    }, 10000);
  }

  async endSession() {
    this.sessionActive = false;
    this.sessionEnd = 0;
    this.whitelist = [];
    
    await chrome.storage.local.set({ 
      sessionActive: false,
      sessionLock: null,
      sessionEndTime: null
    });
    
    await this.stopAudio();
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Focus Mode',
        message: 'Your focus session is complete. You\'re free now 🚀'
      });
    } catch (e) {
      console.log('Session ended');
    }
  }

  startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    const remaining = this.sessionEnd - Date.now();
    if (remaining > 0) {
      this.sessionTimer = setTimeout(() => this.endSession(), remaining);
    }
  }
}

new FocusModeBackground();
