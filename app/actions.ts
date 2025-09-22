'use server';

import { getElectricityPrices } from "@/lib/electricityService";
import { scheduleAppliancesSequentially, scheduleAppliancesInParallel } from "@/lib/optimizer";
import { getLocalDateString } from "@/lib/dateUtils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface ApplianceData {
    name: string;
    power: number;
    duration: number;
    earliestStart?: number | null;
    latestFinish?: number | null;
}

interface RecommendationOptions {
    dateString: string;
    startFromHour?: number;
}

export async function fetchPricesForDate(date: string, priceArea: string) {
    const prices = await getElectricityPrices(date, priceArea);
    return prices;
}

export async function getScheduleRecommendation(uid: string, priceArea: string, options: {
    dateString: string;
    startFromHour?: number;
    appliancesToRun: { id: string, name: string, power: number, duration: number, earliestStart?: number | null, latestFinish?: number | null }[];
    avoidOverlap: boolean;
}) {
    const prices = await getElectricityPrices(options.dateString, priceArea);
    if (prices.length === 0) return null;

    const generalConstraints = {
        earliestStart: options.startFromHour,
        latestFinish: null,
    };

    const scheduleResult = options.avoidOverlap
        ? scheduleAppliancesSequentially(prices, options.appliancesToRun, generalConstraints)
        : scheduleAppliancesInParallel(prices, options.appliancesToRun, generalConstraints);

    return scheduleResult;
}