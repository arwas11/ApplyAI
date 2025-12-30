"use client";

import ReactMarkdown from "react-markdown";

// 1. Define the "Shape" of the props object using an interface
// This acts as the contract for this component.
interface ResumeDisplayProps {
  tailoredResume: string;
}

// 2. Use destructuring { tailoredResume } to pull the string out of the props object
// We tell TypeScript that 'props' matches the 'ResumeDisplayProps' interface
// "This function takes an object that matches the ResumeDisplayProps shape"
export default function ResumeDisplay({ tailoredResume }: ResumeDisplayProps) {
  
  // 3. Conditional Rendering: Return null early if there's no content
  if (!tailoredResume) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-8 animate-in">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        <span className="text-2xl">✨</span> Your Tailored Resume
      </h2>
      
      {/* 4. The Styled Container */}
      <div className="rounded-xl border border-secondary/20 bg-surface p-6 shadow-2xl">
        
        {/* Prose Invert: Makes markdown look good on dark mode */}
        {/* We override specific colors to match our theme */}
        <div className="prose prose-invert max-w-none 
          prose-headings:text-white 
          prose-p:text-gray-300 
          prose-strong:text-primary 
          prose-li:text-gray-300">
          <ReactMarkdown>{tailoredResume}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}