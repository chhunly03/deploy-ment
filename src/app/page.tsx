"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const KHMER_WEEKDAYS = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const KHMER_MONTHS: Record<number, string> = {
  1: "មករា",
  2: "កុម្ភៈ",
  3: "មីនា",
  4: "មេសា",
  5: "ឧសភា",
  6: "មិថុនា",
  7: "កក្កដា",
  8: "សីហា",
  9: "កញ្ញា",
  10: "តុលា",
  11: "វិច្ឆិកា",
  12: "ធ្នូ",
};

interface Day {
  date: string;
  day: number;
  isHoliday: boolean;
  holidayName?: string;
}

export default function Page() {
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [days, setDays] = useState<Day[]>([]);
  const [activeDay, setActiveDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDays = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/khmer-calendar?year=${year}&month=${month + 1}`);
      if (!res.ok) throw new Error("Failed to fetch calendar data");
      const data: Day[] = await res.json();
      setDays(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDays();
  }, [month, year]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const getDayColor = (day: Day) => {
    const d = new Date(day.date);
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "bg-blue-500 text-white font-bold";
    if (day.isHoliday || d.getDay() === 0) return "bg-red-400 text-white";
    if (d.getDay() === 6) return "bg-yellow-300 text-black";
    return "bg-gray-100 text-black";
  };

  const getDayType = (day: Day) => {
    const d = new Date(day.date);
    if (day.isHoliday) return `Holiday: ${day.holidayName}`;
    if (d.getDay() === 0) return "Sunday";
    if (d.getDay() === 6) return "Saturday";
    return "Normal Day";
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalCells = 42;
  const emptyCellsBefore = Array(firstDayOfMonth).fill(null);
  const emptyCellsAfter = Array(totalCells - (emptyCellsBefore.length + days.length)).fill(null);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="px-2 sm:px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 disabled:opacity-50"
            disabled={loading}
          >
            ◀
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-orange-600 text-center flex-1">
            {KHMER_MONTHS[month + 1] ?? "Unknown Month"} {year}
          </h1>
          <button
            onClick={nextMonth}
            className="px-2 sm:px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 disabled:opacity-50"
            disabled={loading}
          >
            ▶
          </button>
        </div>

        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
              {KHMER_WEEKDAYS.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {emptyCellsBefore.map((_, i) => (
                <div key={`empty-before-${i}`} className="h-12 sm:h-16" />
              ))}

              {days.map((day) => {
                const isActive = activeDay?.date === day.date;
                return (
                  <motion.div
                    key={day.date}
                    whileHover={{ scale: 1.05 }}
                    className={`relative flex items-center justify-center h-12 sm:h-16 rounded-lg cursor-pointer ${getDayColor(day)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDay((prev) => (prev?.date === day.date ? null : day));
                    }}
                  >
                    {day.day}

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-16 sm:bottom-20 p-2 w-40 sm:w-44 bg-black text-white text-xs sm:text-sm rounded-lg shadow-lg z-10"
                      >
                        <div className="font-semibold text-orange-400 text-xs sm:text-sm">
                          {KHMER_WEEKDAYS[new Date(day.date).getDay()]}
                        </div>
                        <div>{getDayType(day)}</div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {emptyCellsAfter.map((_, i) => (
                <div key={`empty-after-${i}`} className="h-12 sm:h-16" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
