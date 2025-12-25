import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

const Space = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  // Simulated activity data
  const moodDays = [3, 7, 12, 18, 24];
  const ritualDays = [5, 10, 15, 20, 25];

  return (
    <AppLayout>
      {/* Month header */}
      <div className="flex items-center justify-between mt-2 mb-8">
        <div>
          <h1 className="font-serif italic text-3xl text-foreground">{month}</h1>
          <span className="text-label">{year}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card-embrace">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div 
              key={i}
              className="text-center text-xs font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for alignment */}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {/* Day cells */}
          {days.map((day) => {
            const hasMood = moodDays.includes(day);
            const hasRitual = ritualDays.includes(day);
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <button
                key={day}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                  "border border-border hover:border-primary/50",
                  isToday && "border-primary bg-primary/5"
                )}
              >
                <span className={cn(
                  "text-sm",
                  isToday ? "font-semibold text-primary" : "text-foreground"
                )}>
                  {day}
                </span>
                {/* Activity indicators */}
                <div className="flex gap-0.5 mt-1">
                  {hasMood && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {hasRitual && <div className="w-1.5 h-1.5 rounded-full bg-success-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-label mb-4">ACTIVITY LEGEND</h2>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              MOOD CAPTURED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-foreground" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              RITUAL COMPLETED
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Space;
