import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0816a7fb85524706b6879a05c857fb20',
  appName: 'EmbraceU',
  webDir: 'dist',
  server: {
    url: 'https://0816a7fb-8552-4706-b687-9a05c857fb20.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
    }
  },
  ios: {
    contentInset: "automatic"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
