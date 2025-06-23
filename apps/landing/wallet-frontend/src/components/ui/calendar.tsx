import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: string;
  selected?: Date;
  className?: string;
}

export function Calendar({ mode, selected, className }: CalendarProps) {
  const currentDate = selected || new Date();
  const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();
  const day = currentDate.getDate();

  return (
    <div className={cn("p-4 bg-white dark:bg-gray-800 rounded-lg border", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">{month} {year}</h3>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="p-2 font-medium text-gray-500">{d}</div>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const date = i - 6; // Rough approximation
          const isSelected = date === day;
          const isCurrentMonth = date > 0 && date <= 31;
          
          return (
            <div
              key={i}
              className={cn(
                "p-2 text-center rounded-md",
                isSelected && isCurrentMonth && "bg-blue-500 text-white",
                isCurrentMonth && !isSelected && "hover:bg-gray-100 dark:hover:bg-gray-700",
                !isCurrentMonth && "text-gray-400"
              )}
            >
              {isCurrentMonth ? date : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
} 