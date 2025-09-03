(function() {
  // Block keyboard shortcuts to extensions during focus
  document.addEventListener('keydown', (e) => {
    chrome.storage.local.get(['sessionActive'], (result) => {
      if (result.sessionActive) {
        // Block Ctrl+Shift+E (extensions), Ctrl+Shift+Delete (settings)
        if ((e.ctrlKey && e.shiftKey && e.key === 'E') ||
            (e.ctrlKey && e.shiftKey && e.key === 'Delete')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }, true);

  // Hide extension icons during strict mode
  chrome.storage.local.get(['sessionActive', 'strictMode'], (result) => {
    if (result.sessionActive && result.strictMode) {
      const style = document.createElement('style');
      style.textContent = `
        extensions-toolbar, 
        .extensions-toolbar,
        [data-extension-id],
        chrome-extension-toolbar {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  });

  // Run immediately when script loads
  checkAndBlock();
  
  async function checkAndBlock() {
    try {
      const data = await chrome.storage.local.get(['sessionEndTime', 'whitelist']);
      
      // No active session
      if (!data.sessionEndTime || data.sessionEndTime <= Date.now()) return;
      
      const currentUrl = window.location.href.toLowerCase();
      const currentDomain = window.location.hostname.toLowerCase();
      const whitelist = data.whitelist || [];
      
      // Always block chrome:// URLs during session (especially extensions)
      if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://')) {
        blockPage();
        return;
      }
      
      // Block chrome://extensions specifically
      if (currentUrl.includes('chrome://extensions')) {
        blockPage();
        return;
      }
      
      // Check if current site is whitelisted
      const isAllowed = whitelist.some(site => {
        const cleanSite = site.trim().toLowerCase();
        
        if (cleanSite.includes('/')) {
          return currentUrl.includes(cleanSite);
        }
        
        const cleanDomain = currentDomain.replace('www.', '');
        const siteWithoutWww = cleanSite.replace('www.', '');
        return cleanDomain === siteWithoutWww;
      });
      
      // Block if not allowed
      if (!isAllowed) {
        blockPage();
      }
    } catch (error) {
      console.log('Focus Mode: Could not check session status');
    }
  }
  
  function blockPage() {
    // Stop page loading immediately
    if (window.stop) window.stop();
    
    // Block chrome://extensions page during session
    if (window.location.href.includes('chrome://extensions')) {
      document.documentElement.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>Extensions Blocked - Focus Mode</title></head>
        <body style="margin:0;padding:40px;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e3c72,#2a5298);color:white;font-family:system-ui;text-align:center;">
          <div style="padding:40px;background:rgba(255,255,255,0.1);border-radius:20px;">
            <div style="font-size:64px;margin-bottom:20px;">⚠️</div>
            <h1 style="font-size:28px;margin-bottom:15px;">Extensions Page Blocked</h1>
            <p style="font-size:16px;opacity:0.9;">Cannot access extensions during focus session.<br>Complete your session first!</p>
          </div>
        </body>
        </html>
      `;
      return;
    }
    
    // Replace entire page content
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Site Blocked - Focus Mode</title>
        <style>
          body {
            margin: 0; padding: 0; height: 100vh;
            display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white; font-family: system-ui; text-align: center;
          }
          .container {
            padding: 40px; background: rgba(255,255,255,0.1);
            border-radius: 20px; backdrop-filter: blur(10px);
          }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { font-size: 28px; margin-bottom: 15px; }
          p { font-size: 16px; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🔒</div>
          <h1>Site Blocked During Focus Session</h1>
          <p>This website is not whitelisted. Stay focused!</p>
        </div>
      </body>
      </html>
    `;
  }
})();
