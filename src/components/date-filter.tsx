"use client";

import { useQueryState } from "nuqs";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon, X, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "./ui/separator";

type DateFilterProps = {
  title: string;
  queryKey: string;
};

export default function DateFilter({ title, queryKey }: DateFilterProps) {
  const [date, setDate] = useQueryState<Date | null>(queryKey, {
    parse: (value) => {
      if (value === null || value === "null") return null;
      try {
        return new Date(value);
      } catch {
        return null;
      }
    },
    serialize: (value) => {
      return value ? value.toISOString() : "null";
    },
    defaultValue: null,
    shallow: false,
  });

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate || null);
  };

  const handleClearDate = () => {
    setDate(null);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"} className="border-dashed">
            {date ? (
              <div
                role="button"
                aria-label={`Clear ${title} filter`}
                tabIndex={0}
                onClick={handleClearDate}
                className="rounded-sm opacity-70 border-r transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <XCircle />
              </div>
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4" />
            )}

            {title}

            {date && (
              <>
                <Separator
                  orientation="vertical"
                  className="mx-0.5 data-[orientation=vertical]:h-4"
                />
                <h1>{format(date, "PPP")}</h1>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
