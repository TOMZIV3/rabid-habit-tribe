import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, subDays, isToday, isSameDay } from "date-fns";

interface DaySelectorProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  completionData?: Record<string, number>; // date string -> completion percentage
}

const DaySelector = ({ onDateSelect, selectedDate, completionData = {} }: DaySelectorProps) => {
  const days = Array.from({ length: 8 }, (_, i) => subDays(new Date(), 7 - i));

  const getCompletionPercentage = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return completionData[dateString] || 0;
  };

  return (
    <div className="flex items-center justify-between space-x-1 py-4">
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayIsToday = isToday(day);
        const completionPercentage = getCompletionPercentage(day);
        const dayLetter = format(day, 'EEEEE'); // First letter of weekday
        const dayNumber = format(day, 'd');

        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onDateSelect(day)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-16 rounded-lg transition-all duration-200 relative overflow-hidden",
              isSelected && "bg-primary/20 text-primary border-primary",
              dayIsToday && !isSelected && "bg-accent/50 border-accent"
            )}
          >
            {/* Progress ring background */}
            <div className="absolute inset-1 rounded-md">
              <svg
                width="100%"
                height="100%"
                className="absolute inset-0"
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke={completionPercentage === 100 ? "hsl(var(--success))" : "hsl(var(--primary))"}
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={`${(completionPercentage / 100) * 113} 113`}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-xs font-medium opacity-70">
                {dayLetter}
              </div>
              <div className="text-sm font-bold">
                {dayNumber}
              </div>
              {dayIsToday && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default DaySelector;