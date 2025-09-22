'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function UserSettings() {
    const { user } = useAuth();
    const [priceArea, setPriceArea] = useState<string>('SE3');
    const [isLoading, setIsLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    // Hämta användarens sparade elområde när komponenten laddas
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().priceArea) {
                    setPriceArea(docSnap.data().priceArea);
                }
                setIsLoading(false);
            });
        }
    }, [user]);

    // Funktion för att spara det nya valet
    const handleSave = async (newArea: string) => {
        if (!user) return;
        setPriceArea(newArea);
        const userDocRef = doc(db, 'users', user.uid);
        try {
            // Använd setDoc med merge: true för att uppdatera eller skapa fältet
            await setDoc(userDocRef, { priceArea: newArea }, { merge: true });
            setSaveMessage('Sparat!');
            setTimeout(() => setSaveMessage(''), 2000); // Ta bort meddelandet efter 2 sek
        } catch (error) {
            console.error("Error saving price area: ", error);
            setSaveMessage('Kunde inte spara.');
        }
    };

    if (isLoading) {
        return <div className="bg-white p-6 rounded-lg shadow-md">Laddar inställningar...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Inställningar</h2>
            <div className="flex items-center gap-4">
                <label htmlFor="priceArea" className="font-medium text-gray-700">Ditt elområde:</label>
                <select
                    id="priceArea"
                    value={priceArea}
                    onChange={(e) => handleSave(e.target.value)}
                    className="p-2 border rounded bg-white"
                >
                    <option value="SE1">SE1 (Luleå)</option>
                    <option value="SE2">SE2 (Sundsvall)</option>
                    <option value="SE3">SE3 (Stockholm)</option>
                    <option value="SE4">SE4 (Malmö)</option>
                </select>
                {saveMessage && <span className="text-green-600 font-semibold">{saveMessage}</span>}
            </div>
        </div>
    );
}