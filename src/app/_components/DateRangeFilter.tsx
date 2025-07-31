"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Column } from "@tanstack/react-table";

interface DateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export function DateRangeFilter<TData, TValue>({
  column,
  title = "Deadline",
}: DateRangeFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const columnFilterValue = column?.getFilterValue() as
    | { from: string; to: string }
    | undefined;

  React.useEffect(() => {
    if (columnFilterValue) {
      setDateRange({
        from: columnFilterValue.from
          ? new Date(columnFilterValue.from)
          : undefined,
        to: columnFilterValue.to ? new Date(columnFilterValue.to) : undefined,
      });
    }
  }, [columnFilterValue]);

  const onApply = () => {
    if (!column) return;

    if (dateRange?.from && dateRange?.to) {
      column.setFilterValue({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
    } else {
      column.setFilterValue(undefined);
    }
    setOpen(false);
  };

  const onReset = () => {
    setDateRange(undefined);
    column?.setFilterValue(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("border-dashed", dateRange && "border-solid bg-accent")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM dd")} -{" "}
                {format(dateRange.to, "MMM dd")}
              </>
            ) : (
              format(dateRange.from, "MMM dd")
            )
          ) : (
            <span>{title}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
            <Button size="sm" onClick={onApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
