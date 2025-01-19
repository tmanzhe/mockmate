"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Question = {
  text: string;
};

const StartInterview = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId") ?? null;
  const userQuery = searchParams?.get("query") ?? null; // Add this line to get query parameter

  const [introMessage, setIntroMessage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !userQuery) return; // Check for both sessionId and userQuery

    console.log("Fetching interview data with:", { sessionId, userQuery });

    fetch("/api/sessions/start-interview", {
      method: "POST",
      body: JSON.stringify({ sessionId, userQuery }), // Include userQuery in the request
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
          setIntroMessage(data.introMessage);
          setQuestions(data.questions);
        }
      })
      .catch((error) => {
        setError(`Error fetching interview data: ${error.message}`);
      });
  }, [sessionId, userQuery]); // Add userQuery to dependency array

  return (
    <div>
      <h1>Start Interview</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <h2>{introMessage || "Loading interview data..."}</h2>
        <ul>
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <li key={index}>{question.text}</li>
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