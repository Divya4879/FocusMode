# Focus Mode - Chrome Extension

A powerful Chrome extension designed to eliminate distractions and boost productivity during focused work sessions. Block websites, play ambient sounds, and maintain strict focus with customizable session controls.

## 🚀 Features

### Core Functionality
- **Timed Focus Sessions**: Set custom session durations with automatic end notifications
- **Website Blocking**: Block distracting websites during active sessions
- **Whitelist Management**: Allow specific sites even during focus mode
- **Strict Mode**: Enhanced blocking that prevents extension tampering and hides extension icons
- **Emergency Stop**: Quick session termination with customizable emergency phrase

### Audio & Notifications
- **Ambient Sounds**: Built-in focus sounds or upload custom audio files
- **Session Notifications**: Desktop notifications for session start/end
- **Audio Controls**: Toggle sound on/off during sessions

### Security & Protection
- **Extension Protection**: Prevents access to chrome://extensions during sessions
- **Keyboard Shortcut Blocking**: Blocks extension management shortcuts
- **Session Persistence**: Sessions survive browser restarts
- **Tamper Prevention**: Strict mode prevents mid-session modifications

## 📦 Installation

### Local Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/yourusername/focus-mode-extension.git
   cd focus-mode-extension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension folder
   - The Focus Mode icon will appear in your toolbar

3. **Pin the Extension** (Recommended)
   - Click the puzzle piece icon in Chrome toolbar
   - Pin Focus Mode for easy access

## 🎯 Usage

### Starting a Focus Session

1. **Click the Focus Mode icon** in your Chrome toolbar
2. **Set session duration** using the time controls
3. **Configure options**:
   - Toggle **Strict Mode** for maximum protection
   - Enable **Sound** for ambient audio
   - Set **Emergency Phrase** for quick exits
4. **Add websites to whitelist** (optional)
5. **Click "Start Focus Session"**

### During a Session

- **Blocked sites** show a custom blocked page
- **Whitelisted sites** remain accessible
- **Extension management** is blocked in strict mode
- **Session timer** counts down in the popup
- **Emergency stop** available with your custom phrase

### Ending a Session

- Sessions **end automatically** when timer expires
- **Manual stop** using emergency phrase
- **Desktop notification** confirms session completion

## ⚙️ Configuration

### Whitelist Management
- Add trusted websites that remain accessible during focus
- Supports full domains (e.g., `github.com`)
- Remove sites by clicking the X button

### Strict Mode
- **Hides extension icons** from Chrome toolbar
- **Blocks chrome://extensions** page access
- **Prevents keyboard shortcuts** to extension management
- **Disables session modifications** once started

### Custom Audio
- Upload your own focus sounds (MP3, WAV)
- Built-in ambient sounds available
- Audio plays continuously during sessions

### Emergency Controls
- Set a **custom emergency phrase** for quick exits
- Useful for urgent interruptions
- Bypasses strict mode restrictions

## 🛠️ Technical Details

### Permissions Required
- `storage` - Save settings and session data
- `notifications` - Desktop notifications
- `activeTab` - Monitor current tab for blocking
- `tabs` - Manage tab navigation
- `offscreen` - Audio playback functionality
- `management` - Extension protection features

### Browser Compatibility
- **Chrome**: Version 88+ (Manifest V3)
- **Chromium-based browsers**: Edge, Brave, Opera

### File Structure
```
focus-mode-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for session management
├── content.js            # Website blocking logic
├── popup.html/js         # Extension popup interface
├── blocked.html/js       # Blocked page template
├── offscreen.html/js     # Audio playback handler
├── sounds/               # Built-in audio files
└── icons/               # Extension icons
```

## 🎨 Screenshots

### Main Interface
- Clean, intuitive popup design
- Easy session controls
- Real-time session status

### Blocked Page
- Professional blocked page design
- Clear session information
- Emergency exit option

### Settings Panel
- Whitelist management
- Audio controls
- Strict mode toggle

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/focus-mode-extension/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/focus-mode-extension/discussions)
- **Documentation**: Check the [Wiki](https://github.com/yourusername/focus-mode-extension/wiki)

## 🌟 Why Focus Mode?

In today's digital world, maintaining focus is increasingly challenging. Focus Mode provides:

- **Proven productivity boost** through controlled website access
- **Customizable experience** tailored to your workflow
- **Professional-grade blocking** that can't be easily bypassed
- **Ambient audio support** for enhanced concentration
- **Session persistence** that survives browser crashes

Perfect for students, professionals, and anyone looking to reclaim their digital focus.

---

**Made with ❤️ for productivity enthusiasts**

*Star ⭐ this repo if Focus Mode helps you stay focused!*
