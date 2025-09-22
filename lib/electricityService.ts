export interface PriceData {
  SEK_per_kWh: number;
  time_start: string;
}

export async function getElectricityPrices(
  date: string, // Format: "YYYY-MM-DD"
  priceArea: string // t.ex. "SE3"
): Promise<PriceData[]> {
  try {
    const [year, month, day] = date.split('-');
    const url = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;

    const response = await fetch(url, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log(`Could not fetch prices for ${date}, server responded with status: ${response.status}`);
      return []; 
    }

    const data = await response.json();
    return data as PriceData[];

  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return [];
  }
}