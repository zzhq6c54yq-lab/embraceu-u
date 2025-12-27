import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PremiumProvider } from "@/hooks/usePremium";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Intro from "./pages/Intro";
import Auth from "./pages/Auth";
import Daily from "./pages/Daily";
import Space from "./pages/Space";
import Breath from "./pages/Breath";
import Reframe from "./pages/Reframe";
import Explore from "./pages/Explore";
import Library from "./pages/Library";
import Progress from "./pages/Progress";
import Challenge from "./pages/Challenge";
import Gratitude from "./pages/Gratitude";
import Install from "./pages/Install";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
const queryClient = new QueryClient();

import ProCelebration from "@/components/ProCelebration";
import ProWelcomeScreen from "@/components/ProWelcomeScreen";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PremiumProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <ProCelebration />
          <ProWelcomeScreen />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/intro" element={<Intro />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/space" element={<Space />} />
              <Route path="/breath" element={<Breath />} />
              <Route path="/reframe" element={<Reframe />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/library" element={<Library />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/gratitude" element={<Gratitude />} />
              <Route path="/install" element={<Install />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PremiumProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
