"use client";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import ResumeDisplay from "./ResumeDisplay";

// The URL for the deployed backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResumeBuilder() {
  // State for the user's input
  const { user } = useAuth();
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // State for the API response
  const [tailoredResume, setTailoredResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    if (!user) return;
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTailoredResume(""); // Clear previous results

    // Use FormData because FastAPI endpoint expects Form()
    const formData = new FormData();
    formData.append("base_resume", resume);
    formData.append("job_description", jobDescription);
    formData.append("userId", user.uid);

    try {
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
    } catch (err) {
      console.error("Fetch error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      // Whether it worked or failed, we're done loading
      setIsLoading(false);
    }
  };

  return (
    <form className="flex w-full max-w-4xl flex-col gap-8 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Text Area */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="resume"
            className="text-lg font-semibold text-primary"
          >
            1. Your Base Resume
          </label>
          <textarea
            id="resume"
            rows={10}
            className="rounded-xl border border-secondary/20 bg-surface p-4 text-white shadow-inner focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-secondary/50"
            placeholder="Paste your full resume here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </div>

        {/* Job Description Text Area */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="job-description"
            className="text-lg font-semibold text-primary"
          >
            2. The Job Description
          </label>
          <textarea
            id="job-description"
            rows={10}
            className="rounded-xl border border-secondary/20 bg-surface p-4 text-white shadow-inner focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-secondary/50"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      {!user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-secondary font-medium bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20">
            🔒 Please <strong>Sign In</strong> to generate a tailored resume
          </p>
          <button
            type="button"
            disabled
            className="self-center w-full md:w-1/2 rounded-full bg-brand-gray/50 px-6 py-4 text-lg font-bold text-white cursor-not-allowed"
          >
            ✨ Generate Tailored Resume
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className="self-center w-full md:w-1/2 rounded-full bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 hover:bg-orange-600 hover:scale-[1.02] transition-all focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Tailoring...
            </span>
          ) : (
            "✨ Generate Tailored Resume"
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-500 bg-red-900/20 p-4 text-red-200 text-center">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tailored Resume Output */}
      <ResumeDisplay tailoredResume={tailoredResume} />
    </form>
  );
}
