"use client";

import { useRouter } from 'next/navigation';
 
export default function Setup() {
    const router = useRouter();

    const handleInterview = () => {
        router.push("/interview");
    }

    return(
        <main>
            Set up your interview settings here
            <button onClick = {handleInterview}>
                Start Interview!
            </button>
        </main>
    );
}