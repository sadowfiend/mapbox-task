"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                Welcome to my Map Application😊
            </h1>

            <Link
                href="/map"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded md:py-3 md:px-6 text-center block"
            >
                Go to Map
            </Link>
        </main>
    );
}
