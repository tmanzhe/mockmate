"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function Landing() {
  const [query, setQuery] = useState(""); // State to handle user input
  const router = useRouter();

  const handleSubmit = () => {
    if (query.trim() === "") {
      alert("Please enter a topic or query.");
      return;
    }
    router.push("/interview");
    console.log("User query:", query);
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#474973"; // Change color on hover
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#161B33"; // Revert color on mouse out
  };

  return (
    <main
      className="gradient-background flex justify-center items-center"
      style={{ height: "100vh", width: "100%" }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Slightly darker semi-transparent background
          borderRadius: "24px",
          padding: "3rem",
          textAlign: "center",
          width: "90%",
          maxWidth: "700px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25)", // Floating shadow effect
          transform: "translateY(-20px)", // Floating effect
        }}
      >
        <h1
          style={{
            color: "#F1DAC4", // Matches Almond
            fontSize: "2.5rem",
            marginBottom: "1.5rem",
          }}
        >
          Your Personalized Interview Coach
        </h1>
        <p
          style={{
            color: "#A69CAC", // Matches Rose Quartz
            marginBottom: "2rem",
            fontSize: "1.1rem",
            lineHeight: "1.5",
          }}
        >
          Get tailored questions and feedback from the interviewer's perspective
          to sharpen your skills and ace your next interview.
        </p>
        <input
          type="text"
          placeholder="Enter a topic, e.g., Leadership"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "12px",
            border: "none",
            marginBottom: "1.5rem",
            fontSize: "1.2rem",
          }}
        />
        <button
          onClick={handleSubmit}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          style={{
            backgroundColor: "#161B33", // Matches Oxford Blue
            color: "#F1DAC4", // Matches Almond
            padding: "1rem 2rem",
            borderRadius: "12px",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          Start Now!
        </button>
      </div>
    </main>
  );
}
