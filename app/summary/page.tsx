"use client";

import { useRouter } from 'next/navigation';

export default function Summary() {
    const router = useRouter();
    const handleLanding = () => {
        router.push("/landing");
    }
    return(
        <main>
            You have completed your interview!
            <button onClick = {handleLanding}>
                Return Home
            </button>
        </main>
    );
}