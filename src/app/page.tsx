import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark text-white">
      <header className="container mx-auto p-6 flex justify-between items-center">
        <div className="text-2xl font-bold">Scancontract</div>
        <nav className="space-x-4">
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 rounded-full bg-white text-primary hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              AI-Powered Contract Analysis Made Simple
            </h1>
            <p className="text-xl text-white/80">
              Upload your contracts and let our AI analyze, validate, and suggest improvements instantly. Save time and protect your interests with intelligent contract review.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="px-6 py-3 rounded-full bg-white text-primary hover:bg-gray-100 transition font-semibold"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/about" 
                className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="relative h-[400px] hidden md:block">
            <div className="absolute inset-0 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Analysis",
              description: "Advanced AI algorithms analyze your contracts for potential issues and improvements."
            },
            {
              title: "Easy Sharing",
              description: "Share contracts and analysis reports securely with stakeholders and team members."
            },
            {
              title: "Smart Suggestions",
              description: "Get intelligent suggestions to improve contract terms and protect your interests."
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="container mx-auto p-6 text-center text-white/60">
        <div className="flex justify-center space-x-6">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
      </footer>
    </div>
  );
}