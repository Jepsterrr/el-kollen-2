'use client';

import { useState, useEffect, useRef, use } from 'react';
import { PriceData } from '@/lib/electricityService';
import { getLocalDateString } from '@/lib/dateUtils';
import { fetchPricesForDate } from '@/app/actions';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import PriceChart from './PriceChart';

function formatHour(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(priceInSek: number): string {
  const priceInOre = priceInSek * 100;
  return priceInOre.toFixed(2);
}

interface PriceDisplayProps {
  initialPrices: PriceData[];
  initialDate: string;
  initialPriceArea: string;
}

export default function PriceDisplay({
  initialPrices,
  initialDate,
  initialPriceArea,
}: PriceDisplayProps) {
  const { user } = useAuth();
  const [prices, setPrices] = useState<PriceData[]>(initialPrices);
  const [displayDate, setDisplayDate] = useState<string>(initialDate);
  const [priceArea, setPriceArea] = useState<string>(initialPriceArea);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasCorrectedForUser = useRef(false);

  useEffect(() => {
    if (user && !hasCorrectedForUser.current) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().priceArea) {
          const userArea = docSnap.data().priceArea;
          if (userArea !== priceArea) {
            hasCorrectedForUser.current = true;
            fetchAndSetPrices(displayDate, userArea);
          }
        }
      });
    }
  }, [user, priceArea, displayDate]);

  const fetchAndSetPrices = async (date: string, area: string) => {
    setIsLoading(true);
    const newPrices = await fetchPricesForDate(date, area);
    setPrices(newPrices);
    setDisplayDate(date);
    setPriceArea(area);
    setIsLoading(false);
  };

  const handleDateChange = async (dateType: "today" | "tomorrow") => {
    const dateObj = new Date();
    if (dateType === "tomorrow") {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const dateString = getLocalDateString(dateObj);
    fetchAndSetPrices(dateString, priceArea);
  };

  const todayString = getLocalDateString(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowString = getLocalDateString(tomorrowDate);

  return (
    <div className="w-full">
        <p className="text-lg text-gray-600 mb-4 text-center">
            Visar elpriser för {displayDate} ({priceArea})
        </p>

        <div className="flex justify-center gap-4 mb-6">
            <button
            onClick={() => handleDateChange("today")}
            className={`px-4 py-2 rounded-md transition-colors disabled:bg-gray-400 cursor-pointer ${
                displayDate === todayString
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
            disabled={isLoading}
            >
            Dagens priser
            </button>
            <button
            onClick={() => handleDateChange("tomorrow")}
            className={`px-4 py-2 rounded-md transition-colors disabled:bg-gray-400 cursor-pointer ${
                displayDate === tomorrowString
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
            }`}
            disabled={isLoading}
            >
            Morgondagens priser
            </button>
        </div>

      {isLoading ? (
        <div className="text-center py-20">Laddar priser...</div>
      ) : (
        <>
          {prices.length > 0 ? (
            <>
              <div className="mb-8">
                <PriceChart priceData={prices} />
              </div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tid
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Pris (öre/kWh)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((priceData) => (
                      <tr key={priceData.time_start}>
                        <td className="px-5 py-4 border-b border-gray-200 text-sm text-gray-800">
                          {formatHour(priceData.time_start)}
                        </td>
                        <td className="px-5 py-4 border-b border-gray-200 text-sm text-right font-medium text-gray-800">
                          {formatPrice(priceData.SEK_per_kWh)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Kunde inte hitta några priser för {displayDate}.
            </div>
          )}
        </>
      )}
    </div>
  );
}
