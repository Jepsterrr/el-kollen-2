"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PriceData } from "@/lib/electricityService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  priceData: PriceData[];
}

export default function PriceChart({ priceData }: PriceChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Vi behöver inte visa "legendan" för ett enskilt dataset
      },
      title: {
        display: true,
        text: 'Timpriser (öre/kWh)',
        font: {
          size: 16,
        }
      },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  const data = {
    // Skapa en etikett för varje timme, t.ex. "00:00", "01:00"
    labels: priceData.map(p => 
      new Date(p.time_start).toLocaleTimeString('sv-SE', { hour: '2-digit' })
    ),
    datasets: [
      {
        label: 'Pris (öre/kWh)',
        // Mappa ut priserna och konvertera från SEK till öre
        data: priceData.map(p => p.SEK_per_kWh * 100),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <Bar options={options} data={data} />
    </div>
  );
}