"use client";

import { useRouter } from 'next/navigation';

export default function Interview () {
    const router = useRouter();
    const handleSummary = () => {
        router.push("/summary");
    }

    return(
        <main>
            This is the interview stage
            <button onClick = {handleSummary}>
                Complete Interview
            </button>
        </main>
    );
}