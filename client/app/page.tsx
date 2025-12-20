import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 animate-in">
      
      <div className="text-center space-y-4">
        {/* The Title - Now using Text-Main or Primary explicitly */}
        <h1 className="text-6xl font-extrabold tracking-tight text-white">
          Apply<span className="text-primary">AI</span>
        </h1>
        <p className="text-secondary text-xl max-w-lg mx-auto">
          Your intelligent career companion. Tailor resumes and practice interviews in seconds.
        </p>
      </div>

      {/* NAVIGATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
        
        {/* Link 1: Chat */}
        <Link 
          href="/chat"
          className="group p-8 bg-surface border border-secondary/20 rounded-2xl hover:border-primary hover:shadow-[0_0_20px_rgba(229,89,52,0.15)] transition-all"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            AI Career Chat
          </h2>
          <p className="text-secondary text-sm">
            Chat with an expert agent about your career goals and interview prep.
          </p>
        </Link>

        {/* Link 2: Resume */}
        <Link 
          href="/resume"
          className="group p-8 bg-surface border border-secondary/20 rounded-2xl hover:border-primary hover:shadow-[0_0_20px_rgba(229,89,52,0.15)] transition-all"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📄</div>
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            Tailor Resume
          </h2>
          <p className="text-secondary text-sm">
            Instant resume rewriting based on job descriptions.
          </p>
        </Link>
      </div>
    </div>
  );
}