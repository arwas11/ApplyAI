import ResumeBuilder from "@/components/ResumeBuilder";
import Link from "next/link";

export default function ResumePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 animate-in">
      {/* Navigation Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link 
          href="/" 
          className="text-secondary hover:text-primary transition-colors flex items-center gap-2"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-primary">Resume Tailor</h1>
      </div>

      <ResumeBuilder />
    </div>
  );
}