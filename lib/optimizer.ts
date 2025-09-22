import { PriceData } from './electricityService';

interface Appliance {
    power: number;
    duration: number;
}

interface Constraints {
    earliestStart?: number | null;
    latestFinish?: number | null;
}

export interface OptimizationResult {
    optimalStartHour: number;
    totalCostSEK: number;
    averagePriceOre: number;
    hoursInSlot: PriceData[];
    peakPriceSEK: number;
}

export function findOptimalTimeSlot(
    priceData: PriceData[],
    appliance: Appliance,
    constraints: Constraints
): OptimizationResult | null {
    const durationInHours = Math.ceil(appliance.duration);
    if (priceData.length < durationInHours) return null;

    let bestStartHour = -1;
    let minCost = Infinity;
    let bestSlotPrices: PriceData[] = [];

    for (let i = 0; i < priceData.length; i++) {
        const startHour = new Date(priceData[i].time_start).getHours();
        const endHour = (startHour + durationInHours);

        if (constraints.earliestStart != null && startHour < constraints.earliestStart) {
            continue;
        }
        
        if (constraints.latestFinish != null) {
            const latest = constraints.latestFinish;
            if (constraints.earliestStart == null || constraints.earliestStart <= latest) {
                if (endHour > latest) continue;
            } else {
                if (endHour > latest && endHour <= constraints.earliestStart) continue;
            }
        }
        
        if (i + durationInHours > priceData.length) {
            continue; 
        }

        let currentCost = 0;
        const currentSlotPrices = priceData.slice(i, i + durationInHours);
        currentSlotPrices.forEach(pricePoint => {
            currentCost += pricePoint.SEK_per_kWh;
        });

        if (currentCost < minCost) {
            minCost = currentCost;
            bestStartHour = new Date(currentSlotPrices[0].time_start).getHours();
            bestSlotPrices = currentSlotPrices;
        }
    }

    if (bestStartHour === -1) return null;

    const peakPrice = Math.max(...priceData.map(p => p.SEK_per_kWh));
    const costPerHour = appliance.power / appliance.duration;
    const totalCost = costPerHour * minCost;
    const averagePriceSEK = minCost / durationInHours;

    return {
        optimalStartHour: bestStartHour,
        totalCostSEK: totalCost,
        averagePriceOre: averagePriceSEK * 100,
        hoursInSlot: bestSlotPrices,
        peakPriceSEK: peakPrice
    };
}

export function scheduleAppliancesInParallel(
    priceData: PriceData[],
    appliancesToRun: { id: string, name: string, power: number, duration: number, earliestStart?: number | null, latestFinish?: number | null }[],
    constraints: Constraints
) {
    const finalSchedule: { applianceName: string; startTime: number; endTime: number; costSEK: number; }[] = [];

    for (const app of appliancesToRun) {
        const effectiveConstraints: Constraints = {
            earliestStart: constraints.earliestStart ?? app.earliestStart,
            latestFinish: constraints.latestFinish ?? app.latestFinish,
        };
        const result = findOptimalTimeSlot(priceData, app, effectiveConstraints);
        if (result) {
            finalSchedule.push({
                applianceName: app.name,
                startTime: result.optimalStartHour,
                endTime: result.optimalStartHour + Math.ceil(app.duration),
                costSEK: result.totalCostSEK,
            });
        }
    }
    finalSchedule.sort((a, b) => a.startTime - b.startTime);
    const totalCostSEK = finalSchedule.reduce((sum, item) => sum + item.costSEK, 0);
    return { schedule: finalSchedule, totalCostSEK };
}

export function scheduleAppliancesSequentially(
    priceData: PriceData[],
    appliancesToRun: { id: string, name: string, power: number, duration: number, earliestStart?: number | null, latestFinish?: number | null }[],
    constraints: Constraints
) {
    if (appliancesToRun.length === 0) return null;

    const sortedAppliances = [...appliancesToRun].sort((a, b) => b.power - a.power);

    let availablePrices = priceData.map(p => ({ ...p }));
    const finalSchedule: { applianceName: string; startTime: number; endTime: number; costSEK: number; }[] = [];

    for (const app of sortedAppliances) {
        const effectiveConstraints: Constraints = {
            earliestStart: constraints.earliestStart ?? app.earliestStart,
            latestFinish: constraints.latestFinish ?? app.latestFinish,
        };

        const result = findOptimalTimeSlot(availablePrices, app, effectiveConstraints);

        if (!result) {
            continue; 
        }

        finalSchedule.push({
            applianceName: app.name,
            startTime: result.optimalStartHour,
            endTime: result.optimalStartHour + Math.ceil(app.duration),
            costSEK: result.totalCostSEK,
        });

        const usedHours = result.hoursInSlot.map(p => new Date(p.time_start).getHours());
        availablePrices = availablePrices.map(p => {
            const hour = new Date(p.time_start).getHours();
            if (usedHours.includes(hour)) {
                return { ...p, SEK_per_kWh: Infinity };
            }
            return p;
        });
    }

    finalSchedule.sort((a, b) => a.startTime - b.startTime);
    const totalCostSEK = finalSchedule.reduce((sum, item) => sum + item.costSEK, 0);

    return { schedule: finalSchedule, totalCostSEK };
}