import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Teacher",
    quote:
      "EmbraceU has transformed my mornings. The breathwork and gratitude practices help me start each day centered and calm.",
    rating: 5,
    avatar: "S",
  },
  {
    id: 2,
    name: "James K.",
    role: "Software Developer",
    quote:
      "As someone who struggles with anxiety, the reframing exercises have been life-changing. I finally have tools that work.",
    rating: 5,
    avatar: "J",
  },
  {
    id: 3,
    name: "Maria L.",
    role: "Healthcare Worker",
    quote:
      "The Duo feature keeps me accountable with my partner. We've built a 45-day streak and it's strengthened our relationship.",
    rating: 5,
    avatar: "M",
  },
  {
    id: 4,
    name: "David R.",
    role: "Entrepreneur",
    quote:
      "Simple, beautiful, and effective. The AI insights helped me recognize patterns I'd been blind to for years.",
    rating: 5,
    avatar: "D",
  },
];

export const TestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="min-w-full px-4 md:px-8"
          >
            <div className="max-w-2xl mx-auto text-center">
              {/* Avatar */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-serif text-primary">
                  {testimonial.avatar}
                </span>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-foreground mb-4 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {testimonial.name}
                </span>
                <span className="mx-2">·</span>
                <span>{testimonial.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
