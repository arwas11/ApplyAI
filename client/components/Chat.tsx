"use client";
import { useState } from "react";
import type { MouseEvent } from "react";
import ResumeDisplay from "./ResumeDisplay"

// The URL for the deployed backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Chat() {
  // State for the user's input
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // State for the API response
  const [tailoredResume, setTailoredResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e : MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTailoredResume(""); // Clear previous results

    // Use FormData because FastAPI endpoint expects Form()
    const formData = new FormData();
    formData.append("base_resume", resume);
    formData.append("job_description", jobDescription);

    try{
      // Make the API call to /resumes endpoint
      const response = await fetch(`${API_URL}/resumes`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 500 from the server)
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update state with the AI's response
      setTailoredResume(data.tailored_resume);
    } catch (err){
      console.error("Fetch error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      // Whether it worked or failed, we're done loading
      setIsLoading(false);
    };

  };

  return (
    <form className="flex w-full max-w-2xl flex-col gap-4 p-4">
      {/* Resume Text Area */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="resume"
          className="text-lg font-semibold text-gray-200"
        >
          Your Base Resume
        </label>
        <textarea
          id="resume"
          rows={10}
          className="rounded-md border border-gray-600 bg-gray-800 p-3 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Paste your full resume here..."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
        />
      </div>

      {/* Job Description Text Area */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="job-description"
          className="text-lg font-semibold text-gray-200"
        >
          The Job Description
        </label>
        <textarea
          id="job-description"
          rows={10}
          className="rounded-md border border-gray-600 bg-gray-800 p-3 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? "Tailoring..." : "Tailor My Resume"}
      </button>

      {/* --- UI FOR THE RESPONSE --- */}

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-500 bg-red-900/20 p-4 text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tailored Resume Output */}
      <ResumeDisplay tailoredResume={tailoredResume}  />
    </form>
  );
}
