"use client";
import React, { useState, useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function CustomDatePicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the current value
  const currentDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // adjust for local timezone offset so ISO string matches the selected date
    const offset = selected.getTimezoneOffset() * 60000;
    const localISOTime = new Date(selected.getTime() - offset).toISOString().split("T")[0];
    onChange(localISOTime);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-[var(--c-border)] hover:bg-card-high transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          <span className="text-on-surface text-sm font-medium">
            {value ? new Date(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select Date"}
          </span>
        </div>
        <span className="material-symbols-outlined text-muted text-sm">{isOpen ? "expand_less" : "expand_more"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[320px] bg-surface border border-[var(--c-border)] rounded-3xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/40 z-50">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-highest text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <h3 className="text-on-surface font-bold text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button type="button" onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-highest text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-muted uppercase tracking-widest py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value && new Date(value).getDate() === day && new Date(value).getMonth() === currentMonth.getMonth() && new Date(value).getFullYear() === currentMonth.getFullYear();
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all ${
                    isSelected 
                      ? "bg-primary text-on-primary font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]" 
                      : isToday 
                        ? "border border-primary/50 text-primary font-bold hover:bg-card-high"
                        : "text-on-surface-variant hover:bg-card-highest"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

