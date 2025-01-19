"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
};

const StartInterview = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");

  const [introMessage, setIntroMessage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is missing or invalid.");
      return;
    }

    setLoading(true);
    fetch("/api/sessions/start-interview", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setIntroMessage(data.introMessage);
          setQuestions(data.questions);
          setError(null);
        }
      })
      .catch((error) => setError(`Error fetching data: ${error.message}`))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (error) {
    return (
      <div>
        <h1>Start Interview</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Start Interview</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>{introMessage || "Welcome!"}</h2>
          <ul>
            {questions.map((question) => (
              <li key={question.id}>{question.text.replace(/^-\s*/, "")}</li>
            ))}
          </ul>
          {questions.length === 0 && !loading && <p>No questions available at this time.</p>}
        </div>
      )}
    </div>
  );
};

export default StartInterview;
