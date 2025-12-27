import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.embraceu.app',
  appName: 'EmbraceU',
  webDir: 'dist',
  // Comment out server block for production builds
  // Uncomment for development with hot reload:
  // server: {
  //   url: 'https://0816a7fb-8552-4706-b687-9a05c857fb20.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f5f7f9",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f5f7f9"
    }
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#f5f7f9"
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f5f7f9"
  }
};

export default config;
