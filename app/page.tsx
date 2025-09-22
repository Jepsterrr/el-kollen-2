import { getElectricityPrices } from "@/lib/electricityService";
import PriceDisplay from "./components/PriceDisplay";
import { getLocalDateString } from "@/lib/dateUtils";

export default async function Home() {
  const priceArea = "SE3";
  const todayString = getLocalDateString(new Date());
  const initialPrices = await getElectricityPrices(todayString, priceArea);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">El-Kollen 2.0</h1>

        <PriceDisplay 
          initialPrices={initialPrices} 
          initialDate={todayString} 
          initialPriceArea={priceArea} 
        />
      </div>
    </main>
  );
}