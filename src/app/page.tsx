"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const KHMER_WEEKDAYS = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const KHMER_MONTHS = {
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

export default function Page() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [days, setDays] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDays = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/khmer-calendar?year=${year}&month=${month + 1}`);
      if (!res.ok) {
        throw new Error("Failed to fetch calendar data");
      }
      const data = await res.json();
      console.log("Fetched days:", data); // Debug the API response
      setDays(data);
    } catch (err) {
      setError(err.message);
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
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const getDayColor = (day) => {
    const d = new Date(day.date);
    if (day.isHoliday || d.getDay() === 0) return "bg-red-400 text-white"; // Holiday or Sunday
    if (d.getDay() === 6) return "bg-yellow-300 text-black"; // Saturday
    return "bg-gray-100 text-black"; // Normal day
  };

  const getDayType = (day) => {
    const d = new Date(day.date);
    if (day.isHoliday) return `Holiday: ${day.holidayName}`;
    if (d.getDay() === 0) return "Sunday";
    if (d.getDay() === 6) return "Saturday";
    return "Normal Day";
  };

  // Calculate empty cells for the full 6x7 grid
  const firstDay = new Date(year, month, 1);
  const firstDayOfMonth = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  const lastDay = new Date(year, month + 1, 0);
  const lastDayOfMonth = lastDay.getDay();
  const totalCells = 42; // 6 rows x 7 columns
  const daysInMonth = new Date(year, month, 0).getDate();
  const emptyCellsBefore = Array(firstDayOfMonth).fill(null);
  const emptyCellsAfter = Array(totalCells - (emptyCellsBefore.length + days.length)).fill(null);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 disabled:opacity-50"
            disabled={loading}
          >
            ◀
          </button>
          <h1 className="text-2xl font-bold text-orange-600">
            {KHMER_MONTHS[month + 1]} {year}
          </h1>
          <button
            onClick={nextMonth}
            className="px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 disabled:opacity-50"
            disabled={loading}
          >
            ▶
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-center mb-4">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-600">
              {KHMER_WEEKDAYS.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptyCellsBefore.map((_, i) => (
                <div key={`empty-before-${i}`} className="h-16" />
              ))}
              {days.map((day) => (
                <motion.div
                  key={day.date}
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center h-16 rounded-lg cursor-pointer ${getDayColor(day)}`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {day.day}
                  {hoveredDay?.date === day.date && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-20 p-2 w-44 bg-black text-white text-sm rounded-lg shadow-lg z-10"
                    >
                      <div className="font-semibold text-orange-400">
                        {KHMER_WEEKDAYS[new Date(day.date).getDay()]}
                      </div>
                      <div>{getDayType(day)}</div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              {emptyCellsAfter.map((_, i) => (
                <div key={`empty-after-${i}`} className="h-16" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}