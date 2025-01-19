"use client"; // Ensure this is client-side rendered

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Question = {
  text: string; // Define the type for a question object
};

const StartInterview = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId") ?? null; // Extract sessionId from URL query parameters

  const [introMessage, setIntroMessage] = useState(""); // State for intro message
  const [questions, setQuestions] = useState<Question[]>([]); // Explicitly type the state
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    if (!sessionId) return; // Guard clause for undefined sessionId

    console.log("Fetching interview data with sessionId:", sessionId);

    fetch("/api/sessions/start-interview", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to fetch data:", response);
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          console.log("Received data:", data);
          setError(null);
          setIntroMessage(data.introMessage); // Set the introductory message
          setQuestions(data.questions); // Set the questions
        }
      })
      .catch((error) => {
        setError(`Error fetching interview data: ${error.message}`);
      });
  }, [sessionId]);

  return (
    <div>
      <h1>Start Interview</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <h2>{introMessage || "Loading interview data..."}</h2> {/* Display the intro message */}
        <ul>
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <li key={index}>{question.text}</li> // Display each question
            ))
          ) : (
            <p>No questions available.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StartInterview;
