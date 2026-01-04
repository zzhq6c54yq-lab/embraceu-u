import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PremiumProvider } from "@/hooks/usePremium";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AppTracking } from "@/components/AppTracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProCelebration from "@/components/ProCelebration";
import ProWelcomeScreen from "@/components/ProWelcomeScreen";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const Intro = lazy(() => import("./pages/Intro"));
const Auth = lazy(() => import("./pages/Auth"));
const Daily = lazy(() => import("./pages/Daily"));
const Space = lazy(() => import("./pages/Space"));
const Breath = lazy(() => import("./pages/Breath"));
const Reframe = lazy(() => import("./pages/Reframe"));
const Explore = lazy(() => import("./pages/Explore"));
const Library = lazy(() => import("./pages/Library"));
const Progress = lazy(() => import("./pages/Progress"));
const Gratitude = lazy(() => import("./pages/Gratitude"));
const Duo = lazy(() => import("./pages/Duo"));
const Rituals = lazy(() => import("./pages/Rituals"));
const Install = lazy(() => import("./pages/Install"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const ProFeatures = lazy(() => import("./pages/ProFeatures"));
const Profile = lazy(() => import("./pages/Profile"));
const ChallengeLibrary = lazy(() => import("./pages/ChallengeLibrary"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));

// Exclusive content pages
const GuidedMeditations = lazy(() => import("./pages/exclusive/GuidedMeditations"));
const AffirmationPacks = lazy(() => import("./pages/exclusive/AffirmationPacks"));
const AdvancedBreathwork = lazy(() => import("./pages/exclusive/AdvancedBreathwork"));
const SelfLoveRituals = lazy(() => import("./pages/exclusive/SelfLoveRituals"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PremiumProvider>
        <TooltipProvider>
          <OfflineIndicator />
          <AppTracking />
          <Toaster position="top-center" />
          <ProCelebration />
          <ProWelcomeScreen />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/intro" element={<Intro />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/daily" element={<ProtectedRoute><Daily /></ProtectedRoute>} />
                <Route path="/space" element={<ProtectedRoute><Space /></ProtectedRoute>} />
                <Route path="/breath" element={<ProtectedRoute><Breath /></ProtectedRoute>} />
                <Route path="/reframe" element={<ProtectedRoute><Reframe /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/gratitude" element={<ProtectedRoute><Gratitude /></ProtectedRoute>} />
                <Route path="/duo" element={<ProtectedRoute><Duo /></ProtectedRoute>} />
                <Route path="/rituals" element={<ProtectedRoute><Rituals /></ProtectedRoute>} />
                <Route path="/pro" element={<ProtectedRoute><ProFeatures /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/challenges" element={<ProtectedRoute><ChallengeLibrary /></ProtectedRoute>} />
                <Route path="/challenges/:slug" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
                <Route path="/challenge" element={<Navigate to="/challenges" replace />} />
                
                {/* Exclusive content routes - require premium */}
                <Route path="/exclusive/meditations" element={<ProtectedRoute><GuidedMeditations /></ProtectedRoute>} />
                <Route path="/exclusive/affirmations" element={<ProtectedRoute><AffirmationPacks /></ProtectedRoute>} />
                <Route path="/exclusive/breathwork" element={<ProtectedRoute><AdvancedBreathwork /></ProtectedRoute>} />
                <Route path="/exclusive/rituals" element={<ProtectedRoute><SelfLoveRituals /></ProtectedRoute>} />
                
                {/* Admin route - has its own auth check */}
                <Route path="/admin" element={<Admin />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </PremiumProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
