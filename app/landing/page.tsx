"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Landing() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch userId on component mount with enhanced error handling
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store", // Prevent caching
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to fetch userId:", errorData.error);
          setUserId(null);
          return;
        }

        const data = await res.json();
        if (data.userId) {
          setUserId(data.userId);
          console.log("Fetched userId:", data.userId);
        } else {
          console.error("Invalid userId response:", data);
          setUserId(null);
        }
      } catch (error) {
        console.error("Error fetching userId:", error);
        setUserId(null);
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (query.trim() === "") {
      alert("Please enter a topic or query.");
      return;
    }
  
    if (!userId) {
      alert("User not authenticated. Please log in.");
      router.push("/auth/login");
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("Submitting query:", query);
  
      const response = await fetch("/api/queries/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          query: query.trim(),
        }),
      });
  
      const data = await response.json();
      console.log("Received data from /api/queries/save:", data);
  
      if (response.ok && data.sessionId) {
        // Include the query parameter in the URL
        router.push(`/start-interview?sessionId=${data.sessionId}&query=${encodeURIComponent(query.trim())}`);
      } else {
        console.error("Error details:", data);
        alert(data.error || "Failed to save query");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#474973";
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.target as HTMLButtonElement).style.backgroundColor = "#161B33";
  };

  return (
    <main
      className="gradient-background flex justify-center items-center"
      style={{ height: "100vh", width: "100%" }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: "24px",
          padding: "3rem",
          textAlign: "center",
          width: "90%",
          maxWidth: "700px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25)",
          transform: "translateY(-20px)",
        }}
      >
        <h1
          style={{
            color: "#F1DAC4",
            fontSize: "2.5rem",
            marginBottom: "1.5rem",
          }}
        >
          Your Personalized Interview Coach
        </h1>
        <p
          style={{
            color: "#A69CAC",
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
          disabled={loading}
          style={{
            backgroundColor: "#161B33",
            color: "#F1DAC4",
            padding: "1rem 2rem",
            borderRadius: "12px",
            border: "none",
            fontSize: "1.2rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Processing..." : "Start Now!"}
        </button>
      </div>
    </main>
  );
}
