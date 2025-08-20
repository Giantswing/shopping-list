// PWA Installation Detection and Management
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isStandalone = false;
    this.isMobile = false;
    this.canInstall = false;
    this.hasValidManifest = false;
    this.hasServiceWorker = false;
    
    this.init();
  }

  init() {
    // Check if running on mobile
    this.isMobile = this.checkIfMobile();
    
    // Check if app is already installed (standalone mode)
    this.updateStandaloneStatus();
    
    // Check if app has valid manifest
    this.checkManifest();
    
    // Check if service worker is registered
    this.checkServiceWorker();
    
    // Check if app can be installed
    this.canInstall = this.isMobile && !this.isStandalone && this.hasValidManifest && this.hasServiceWorker;
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall = true;
      console.log('PWA: beforeinstallprompt event fired');
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
      console.log('PWA: App installed');
    });
    
    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.updateStandaloneStatus();
    });
  }

  updateStandaloneStatus() {
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    this.canInstall = this.isMobile && !this.isStandalone && this.hasValidManifest && this.hasServiceWorker;
  }

  async checkManifest() {
    try {
      // Check if manifest exists
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        console.log('PWA: No manifest link found');
        this.hasValidManifest = false;
        return;
      }

      // Fetch and validate manifest
      const response = await fetch(manifestLink.href);
      if (!response.ok) {
        console.log('PWA: Manifest not accessible');
        this.hasValidManifest = false;
        return;
      }

      const manifest = await response.json();
      
      // Basic PWA criteria check
      const hasName = manifest.name || manifest.short_name;
      const hasIcons = manifest.icons && manifest.icons.length > 0;
      const hasStartUrl = manifest.start_url;
      const hasDisplay = manifest.display === 'standalone' || manifest.display === 'fullscreen';
      
      this.hasValidManifest = hasName && hasIcons && hasStartUrl && hasDisplay;
      
      console.log('PWA: Manifest check result:', {
        hasName,
        hasIcons,
        hasStartUrl,
        hasDisplay,
        isValid: this.hasValidManifest
      });
      
    } catch (error) {
      console.error('PWA: Error checking manifest:', error);
      this.hasValidManifest = false;
    }
  }

  async checkServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        this.hasServiceWorker = registration !== undefined;
        console.log('PWA: Service worker check result:', {
          hasServiceWorker: this.hasServiceWorker,
          registration: registration ? 'found' : 'not found'
        });
      } else {
        this.hasServiceWorker = false;
        console.log('PWA: Service worker not supported');
      }
    } catch (error) {
      console.error('PWA: Error checking service worker:', error);
      this.hasServiceWorker = false;
    }
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
    // If we have a deferred prompt, use it
    if (this.deferredPrompt) {
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
    
    // Fallback: Try to trigger installation manually
    // This works on some browsers even without beforeinstallprompt
    if (this.isMobile && !this.isStandalone && this.hasValidManifest) {
      try {
        // Try to show the native install prompt
        if ('getInstalledRelatedApps' in navigator) {
          const relatedApps = await navigator.getInstalledRelatedApps();
          if (relatedApps.length === 0) {
            // App is not installed, try to show install prompt
            console.log('PWA: Attempting manual install prompt');
            // Note: This is a fallback and may not work on all browsers
            return false; // For now, return false as manual prompt is not widely supported
          }
        }
      } catch (error) {
        console.error('PWA: Error in fallback install:', error);
      }
    }
    
    throw new Error('Install prompt not available');
  }

  shouldShowInstallPrompt() {
    // Show install button if:
    // 1. It's a mobile device
    // 2. Not already in standalone mode
    // 3. Either has a deferred prompt OR meets PWA criteria
    const shouldShow = this.isMobile && !this.isStandalone && (this.deferredPrompt !== null || this.canInstall);
    
    console.log('PWA: shouldShowInstallPrompt check:', {
      isMobile: this.isMobile,
      isStandalone: this.isStandalone,
      hasDeferredPrompt: this.deferredPrompt !== null,
      canInstall: this.canInstall,
      hasValidManifest: this.hasValidManifest,
      shouldShow
    });
    
    return shouldShow;
  }

  getInstallationStatus() {
    return {
      isMobile: this.isMobile,
      isStandalone: this.isStandalone,
      isInstalled: this.isInstalled,
      canInstall: this.canInstall,
      hasPrompt: this.deferredPrompt !== null,
      hasValidManifest: this.hasValidManifest,
      hasServiceWorker: this.hasServiceWorker
    };
  }

  refreshStatus() {
    this.isMobile = this.checkIfMobile();
    this.updateStandaloneStatus();
    this.checkManifest();
    return this.getInstallationStatus();
  }

  // Force check all PWA criteria
  async forceCheck() {
    await this.checkManifest();
    await this.checkServiceWorker();
    this.updateStandaloneStatus();
    console.log('PWA: Force check completed:', this.getInstallationStatus());
    return this.getInstallationStatus();
  }
}

// Create and export a singleton instance
const pwaManager = new PWAManager();
export default pwaManager;
