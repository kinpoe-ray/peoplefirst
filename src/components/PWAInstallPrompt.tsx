import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { X, Download, Share } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, isStandalone, promptInstall, dismissPrompt } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt recently (within 7 days)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    // Show prompt if installable or if on iOS and not installed
    if ((isInstallable || (isIOS && !isStandalone)) && !isInstalled) {
      // Delay showing the prompt to avoid interrupting the user
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIOS, isStandalone]);

  const handleInstall = async () => {
    await promptInstall();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    dismissPrompt();
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  // iOS-specific instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-graphite border border-slate rounded-xl p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ember rounded-lg flex items-center justify-center">
                <Share className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-textPrimary font-semibold">Install PeopleFirst</h3>
                <p className="text-textSecondary text-sm">Add to your home screen</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-textTertiary hover:text-textSecondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-textSecondary text-sm space-y-2">
            <p>To install this app on your iOS device:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Tap the <Share className="inline w-4 h-4" /> Share button in Safari
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt for other browsers
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-graphite border border-slate rounded-xl p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-ember rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-textPrimary font-semibold">Install PeopleFirst</h3>
              <p className="text-textSecondary text-sm">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-textTertiary hover:text-textSecondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-ember hover:bg-ember-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="border border-slate text-textSecondary hover:text-textPrimary font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
