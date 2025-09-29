import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ba3420004402492b9155784b306f9670',
  appName: 'iron-mind-sync',
  webDir: 'dist',
  server: {
    url: 'https://ba342000-4402-492b-9155-784b306f9670.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;