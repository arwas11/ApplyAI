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
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-200">
        Your Tailored Resume:
      </h2>
      
      {/* 4. The Styled Container */}
      <div className="rounded-md border border-gray-600 bg-gray-800 p-4 text-gray-100">
        
        {/* 5. React Markdown renders the text as real HTML */}
        {/* 'prose' and 'prose-invert' are Tailwind plugins for nice text formatting */}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{tailoredResume}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}