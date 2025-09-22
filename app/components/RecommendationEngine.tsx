'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getScheduleRecommendation } from '@/app/actions';
import { db } from '@/lib/firebaseConfig';
import { collection, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { APPLIANCE_PRESETS, DefaultApplianceIcon } from '@/lib/applianceData';
import { getLocalDateString } from '@/lib/dateUtils';

interface Appliance {
    id: string;
    name: string;
    power: number;
    duration: number;
    earliestStart?: number | null;
    latestFinish?: number | null;
}

interface ScheduleItem {
    applianceName: string;
    startTime: number;
    endTime: number;
    costSEK: number;
}

interface ScheduleResult {
    schedule: ScheduleItem[];
    totalCostSEK: number;
}

export default function RecommendationEngine({ priceArea }: { priceArea: string }) {
    const { user } = useAuth();
    const [savedAppliances, setSavedAppliances] = useState<Appliance[]>([]);
    const [selectedAppliances, setSelectedAppliances] = useState<Map<string, Appliance>>(new Map());
    const [avoidOverlap, setAvoidOverlap] = useState<boolean>(false);
    const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const appliancesColRef = collection(db, 'users', user.uid, 'appliances');
            const unsubscribe = onSnapshot(appliancesColRef, (snapshot) => {
                const userAppliances = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Appliance));
                setSavedAppliances(userAppliances);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleSelectAppliance = (appliance: Appliance, isSelected: boolean) => {
        const newSelection = new Map(selectedAppliances);
        if (isSelected) {
            newSelection.set(appliance.id, appliance);
        } else {
            newSelection.delete(appliance.id);
        }
        setSelectedAppliances(newSelection);
    };

    const handleCalculateSchedule = async () => {
        if (!user || selectedAppliances.size === 0) return;
        setIsLoading(true);
        setScheduleResult(null);

        const appliancesToRun = Array.from(selectedAppliances.values());
        const dateString = getLocalDateString(new Date());
        const startFromHour = new Date().getHours();

        const result = await getScheduleRecommendation(user.uid, priceArea, {
            dateString,
            startFromHour,
            appliancesToRun,
            avoidOverlap: avoidOverlap
        });
        setScheduleResult(result);
        setIsLoading(false);
    };

    const formatTime = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold mb-2">Schemaläggning</h2>
            <p className="mb-4 text-gray-600">Välj de apparater du vill köra, så hittar vi den billigaste tidsperioden för att köra dem (även samtidigt!).</p>
            
            <div className="space-y-2 mb-4 p-4 border rounded-md">
                {savedAppliances.length > 0 ? savedAppliances.map(app => {
                    const preset = APPLIANCE_PRESETS.find(p => p.name === app.name);
                    const IconComponent = preset ? preset.icon : DefaultApplianceIcon;
                    return (
                        <div key={app.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={app.id}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                onChange={(e) => handleSelectAppliance(app, e.target.checked)}
                            />
                            <label htmlFor={app.id} className="ml-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                                <IconComponent className="text-lg" /> {app.name} ({app.duration}h)
                            </label>
                        </div>
                    );
                }) : <p className="text-sm text-gray-500">Du behöver lägga till apparater för att kunna schemalägga dem.</p>}
            </div>

            <div className="flex items-center mb-4">
                <input
                    id="avoid-overlap"
                    type="checkbox"
                    checked={avoidOverlap}
                    onChange={(e) => setAvoidOverlap(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="avoid-overlap" className="ml-3 block text-sm text-gray-700">
                    Undvik att köra apparater samtidigt (säkrare för huvudsäkringen)
                </label>
            </div>

            <button onClick={handleCalculateSchedule} disabled={isLoading || selectedAppliances.size === 0} className="w-full py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400">
                {isLoading ? 'Beräknar schema...' : `Beräkna schema för ${selectedAppliances.size} apparater`}
            </button>

            {scheduleResult && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">Optimalt körschema:</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        {scheduleResult.schedule.length > 0 ? scheduleResult.schedule.map((item, index) => (
                            <div key={index} className="p-2 border-b last:border-b-0">
                                <p className="font-semibold">{formatTime(item.startTime)} - {formatTime(item.endTime)}: <span className="text-blue-700">{item.applianceName}</span></p>
                                <p className="text-sm text-gray-600">Beräknad kostnad: {item.costSEK.toFixed(2)} kr</p>
                            </div>
                        )) : <p>Kunde inte hitta ett giltigt schema för de valda apparaterna och tidsfönstren.</p>}
                        
                        <div className="mt-4 text-right">
                            <p className="text-lg font-bold">Total kostnad: {scheduleResult.totalCostSEK.toFixed(2)} kr</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}