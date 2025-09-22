'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import ApplianceManager from '../components/ApplianceManager';
import RecommendationEngine from '../components/RecommendationEngine';
import UserSettings from '../components/UserSettings';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [userPriceArea, setUserPriceArea] = useState<string >('SE3');
    const [isAreaLoading, setIsAreaLoading] = useState(true);

    // Skydda sidan: Om laddning är klar och ingen användare finns, skicka till /login
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }

        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().priceArea) {
                    setUserPriceArea(docSnap.data().priceArea);
                }
                setIsAreaLoading(false);
            });
        }
    }, [user, isLoading, router]);

    // Visa ett laddningsmeddelande medan vi kollar inloggningsstatus
    if (isLoading || isAreaLoading) {
        return <div className="text-center p-10">Laddar...</div>;
    }

    // Om användaren är inloggad, visa innehållet
    return user ? (
        <main className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8 text-center">{user.email} Dashboard</h1>
            <UserSettings />

            <RecommendationEngine priceArea={userPriceArea} />

            <ApplianceManager />
        </main>
    ) : null;
}