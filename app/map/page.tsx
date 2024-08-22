"use client";

import MapComponent from "../components/MapComponent";

export default function MapPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full h-full">
                <MapComponent />
            </div>
        </main>
    );
}
