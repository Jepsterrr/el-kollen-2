"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";

export default function Navbar() {
    const { user, isLoading } = useAuth();

    const handleSignOut = async () => {
        await signOut(auth);
    };

  return (
    <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
            El-Kollen 2.0
            </Link>
            <div>
                {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                ) : user ? (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 font-semibold bg-blue-500 rounded-md text-white hover:bg-blue-400"
                        >
                            Dashboard
                        </Link>
                        <span className="text-gray-700">{user.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
                        >
                            Logga ut
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
                    >
                        Logga in
                    </Link>
                )}
            </div>
        </div>
    </nav>
  );
}
