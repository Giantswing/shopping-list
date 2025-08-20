// PWA Installation Detection and Management
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isStandalone = false;
    this.isMobile = false;
    this.canInstall = false;
    
    this.init();
  }

  init() {
    // Check if running on mobile
    this.isMobile = this.checkIfMobile();
    
    // Check if app is already installed (standalone mode)
    this.updateStandaloneStatus();
    
    // Check if app can be installed
    this.canInstall = this.isMobile && !this.isStandalone;
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall = true;
    });
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'INSTALL_PROMPT_AVAILABLE') {
          this.canInstall = true;
        }
      });
    }
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.canInstall = false;
      this.deferredPrompt = null;
    });
    
    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.updateStandaloneStatus();
    });
  }

  updateStandaloneStatus() {
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    this.canInstall = this.isMobile && !this.isStandalone;
  }

  checkIfMobile() {
    // Check for mobile device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Mobile detection patterns
    const mobilePatterns = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];
    
    // Check if any mobile pattern matches
    const isMobileDevice = mobilePatterns.some(pattern => pattern.test(userAgent));
    
    // Additional check for touch capability and screen size
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobileDevice || (hasTouchScreen && isSmallScreen);
  }

  async installApp() {
    if (!this.deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  }

  shouldShowInstallPrompt() {
    return this.canInstall && this.deferredPrompt !== null && !this.isStandalone;
  }

  getInstallationStatus() {
    return {
      isMobile: this.isMobile,
      isStandalone: this.isStandalone,
      isInstalled: this.isInstalled,
      canInstall: this.canInstall,
      hasPrompt: this.deferredPrompt !== null
    };
  }

  refreshStatus() {
    this.isMobile = this.checkIfMobile();
    this.updateStandaloneStatus();
    return this.getInstallationStatus();
  }
}

// Create and export a singleton instance
const pwaManager = new PWAManager();
export default pwaManager;
