import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { 
  Check, 
  Wind, 
  RefreshCw, 
  Compass, 
  Heart,
  Sparkles,
} from "lucide-react";
import thriveMtIcon from "@/assets/thrive-mt-icon.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const navSlides = [
  [
    { path: "/daily", label: "Daily", icon: Check },
    { path: "/breath", label: "Breath", icon: Wind },
    { path: "/reframe", label: "Reframe", icon: RefreshCw },
    { path: "/explore", label: "Explore", icon: Compass },
  ],
  [
    { path: "/gratitude", label: "Gratitude", icon: Sparkles },
    { path: "/challenge", label: "Challenge", icon: Heart },
    { path: "/about", label: "About", icon: null, isLogo: true },
  ],
];

const BottomNav = () => {
  const location = useLocation();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Determine which slide the current route belongs to
  const getSlideForRoute = useCallback((pathname: string) => {
    const slide2Paths = ["/gratitude", "/challenge", "/about"];
    return slide2Paths.includes(pathname) ? 1 : 0;
  }, []);

  // Scroll to correct slide when route changes
  useEffect(() => {
    if (api) {
      const targetSlide = getSlideForRoute(location.pathname);
      if (api.selectedScrollSnap() !== targetSlide) {
        api.scrollTo(targetSlide);
      }
    }
  }, [api, location.pathname, getSlideForRoute]);

  // Update current slide state when carousel changes
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="max-w-lg mx-auto">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {navSlides.map((slide, slideIndex) => (
              <CarouselItem key={slideIndex} className="pl-0 basis-full">
                <div className="flex items-center justify-around py-1.5 sm:py-2 px-1 sm:px-2">
                  {slide.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                      <RouterNavLink
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200",
                          "hover:bg-secondary/50 min-w-0",
                          isActive && "text-primary"
                        )}
                      >
                        {item.isLogo ? (
                          <img 
                            src={thriveMtIcon} 
                            alt="ThriveMT"
                            className={cn(
                              "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 flex-shrink-0 object-contain",
                              isActive ? "opacity-100" : "opacity-60"
                            )}
                          />
                        ) : (
                          Icon && (
                            <Icon 
                              className={cn(
                                "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 flex-shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} 
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                          )
                        )}
                        <span 
                          className={cn(
                            "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200 truncate",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      </RouterNavLink>
                    );
                  })}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 pb-1">
          {navSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                currentSlide === index ? "bg-primary" : "bg-border"
              )}
              aria-label={`Go to nav slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      {/* iOS safe area bottom padding */}
      <div className="h-safe-area-inset-bottom bg-card/95" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
};

export default BottomNav;
