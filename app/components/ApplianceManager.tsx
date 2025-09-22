'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/app/context/AuthContext';
import { collection, addDoc, onSnapshot, doc, deleteDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { APPLIANCE_PRESETS, DefaultApplianceIcon } from '@/lib/applianceData';

interface Appliance {
    id: string;
    name: string;
    power: number;
    duration: number;
    earliestStart?: number | null;
    latestFinish?: number | null;
}

export default function ApplianceManager() {
    const { user } = useAuth();
    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newPreset, setNewPreset] = useState('');
    const [newName, setNewName] = useState('');
    const [newPower, setNewPower] = useState('');
    const [newDuration, setNewDuration] = useState('');
    const [newEarliestStart, setNewEarliestStart] = useState('');
    const [newLatestFinish, setNewLatestFinish] = useState('');

    const timeOptions = Array.from({ length: 24 }, (_, i) => i);

    useEffect(() => {
        if (newPreset && newPreset !== 'custom') {
            const preset = APPLIANCE_PRESETS.find(p => p.name === newPreset);
            if (preset) {
                setNewName(preset.name);
                setNewPower(String(preset.power));
                setNewDuration(String(preset.duration));
            }
        } else if (newPreset === 'custom') {
            setNewName(''); setNewPower(''); setNewDuration('');
        }
    }, [newPreset]);

    useEffect(() => {
        if (user) {
            const appliancesColRef = collection(db, 'users', user.uid, 'appliances');
            const unsubscribe = onSnapshot(appliancesColRef, (snapshot) => {
                const userAppliances = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id, ...doc.data(),
                } as Appliance));
                setAppliances(userAppliances);
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newName || !newPower || !newDuration) return;
        try {
            const appliancesColRef = collection(db, 'users', user.uid, 'appliances');
            await addDoc(appliancesColRef, {
                name: newName, power: parseFloat(newPower), duration: parseFloat(newDuration),
                earliestStart: newEarliestStart ? parseInt(newEarliestStart) : null,
                latestFinish: newLatestFinish ? parseInt(newLatestFinish) : null,
            });
            setNewName(''); setNewPower(''); setNewDuration(''); setNewEarliestStart(''); setNewLatestFinish(''); setNewPreset('');
        } catch (error) { console.error("Error adding appliance: ", error); }
    };

    const handleDelete = async (applianceId: string) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'appliances', applianceId);
            await deleteDoc(docRef);
        } catch (error) { console.error("Error deleting appliance: ", error); }
    };

    const selectedPreset = APPLIANCE_PRESETS.find(p => p.name === newPreset);
    const SelectedIcon = selectedPreset ? selectedPreset.icon : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Lägg till apparat</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="preset" className="block text-sm font-medium text-gray-700">Välj förinställning</label>
                        <div className="flex items-center gap-3">
                            <select id="preset" value={newPreset} onChange={(e) => setNewPreset(e.target.value)} className="w-full p-2 border rounded bg-white">
                                <option value="">-- Välj en apparat --</option>
                                {APPLIANCE_PRESETS.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                                <option value="custom">-- Egen anpassad --</option>
                            </select>
                            {SelectedIcon && <span className="text-3xl text-blue-600"><SelectedIcon /></span>}
                        </div>
                    </div>

                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Namn" className="w-full p-2 border rounded" required />
                    <input type="number" value={newPower} onChange={(e) => setNewPower(e.target.value)} placeholder="Förbrukning (kWh per körning)" className="w-full p-2 border rounded" required step="0.1" />
                    <input type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="Körtid (timmar)" className="w-full p-2 border rounded" required step="0.5" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tidigast start</label>
                            <select value={newEarliestStart} onChange={(e) => setNewEarliestStart(e.target.value)} className="w-full p-2 border rounded bg-white">
                                <option value="">När som helst</option>
                                {timeOptions.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Senast klar</label>
                            <select value={newLatestFinish} onChange={(e) => setNewLatestFinish(e.target.value)} className="w-full p-2 border rounded bg-white">
                                <option value="">När som helst</option>
                                {timeOptions.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">Lägg till</button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Mina apparater</h2>
                {isLoading ? <p>Laddar apparater...</p> : (
                    <ul className="space-y-3">
                        {appliances.length > 0 ? appliances.map(app => {
                            const preset = APPLIANCE_PRESETS.find(p => p.name === app.name);
                            const IconComponent = preset ? preset.icon : DefaultApplianceIcon;
                            return (
                                <li key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl text-blue-600"><IconComponent /></span>
                                        <div>
                                            <p className="font-semibold">{app.name}</p>
                                            <p className="text-sm text-gray-600">{app.power} kWh / {app.duration}h</p>
                                            <p className="text-xs text-blue-600">Fönster: {app.earliestStart ?? 'Alla'} - {app.latestFinish ?? 'Alla'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                </li>
                            );
                        }) : <p className="text-gray-500">Du har inte lagt till några apparater än.</p>}
                    </ul>
                )}
            </div>
        </div>
    );
}