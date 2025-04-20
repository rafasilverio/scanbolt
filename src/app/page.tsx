"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Zap, Brain, Share2, CheckCircle, Star, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractUploader } from "@/components/contracts/upload/ContractUploader";
import { PreviewUploader } from "@/components/home/PreviewUploader";
import { useSession } from "next-auth/react";
import { UploadZone } from "@/components/contracts/upload/UploadZone";

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Contract Review",
      description: "Advanced AI algorithms analyze your contracts for potential issues and provide recommendations in seconds."
    },
    {
      icon: Shield,
      title: "Smart Clause Suggestions",
      description: "Identify risky clauses and get AI-suggested alternatives that protect your interests."
    },
    {
      icon: Zap,
      title: "Comprehensive Analysis Library",
      description: "Access a growing database of contract types and clauses for best-in-class legal protection."
    },
    {
      icon: Share2,
      title: "Export & Share Reports",
      description: "Generate professional reports and securely share contracts with stakeholders."
    }
  ];

  const testimonials = [
    {
      quote: "ScanContract has completely transformed how our legal team handles contract reviews. The AI suggestions are incredibly accurate and helpful.",
      author: "Sarah Johnson",
      role: "Legal Director",
      company: "Tech Solutions Inc."
    },
    {
      quote: "As a small business owner, this tool has saved me countless hours and potential legal headaches. Worth every penny!",
      author: "Michael Chen",
      role: "CEO",
      company: "StartupFlow"
    },
    {
      quote: "The AI suggestions are spot-on and the interface is incredibly intuitive. It's made our contract process so much faster.",
      author: "Jennifer Williams",
      role: "Operations Manager",
      company: "Bright Ideas LLC"
    }
  ];

  const advantageItems = [
    "AI-Powered Contract Review",
    "Legal Clause Identification",
    "Risk Assessment",
    "Secure Data Processing",
    "Smart Clause Suggestions",
    "Easy Export & Sharing"
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar for logged users */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-primary flex items-center">
              <img 
                src="/logo horizontal - black.png" 
                alt="ScanContract Logo" 
                className="h-8" 
              />
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/#" className="text-sm text-slate-600 hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/#" className="text-sm text-slate-600 hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/#" className="text-sm text-slate-600 hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="text-sm text-slate-600 hover:text-primary transition-colors hidden md:block">
                    Dashboard
                  </Link>
                  <Link href="/contracts" className="text-sm text-slate-600 hover:text-primary transition-colors hidden md:block">
                    My Contracts
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm hidden md:block">{session.user.email}</span>
                    </div>
                    <Link href="/api/auth/signout">
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Uploader */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern-light.svg')] [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0.6))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8">

            <div className="flex justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                <span className="text-sm font-medium text-yellow-700">AI-Powered Contract Review</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-green-700">✓ Now 100% Free</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Analyze Any Contract in <br />
              Seconds with <span className="text-yellow-400">AI Precision</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Never sign a bad contract again. Our AI scans, 
              detects risks, and suggests fair clauses – no legal 
              expertise required. <span className="text-green-500 font-medium">And it's completely free!</span>
            </p>

            {session?.user ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Upload Your Contract</h2>
                <p className="text-slate-600">
                  Upload your contract to get started with AI-powered analysis
                </p>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <UploadZone />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <PreviewUploader />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center mt-12 bg-white/60 backdrop-blur-sm py-4 px-6 rounded-xl shadow-sm border border-slate-100 max-w-xl mx-auto">
              <div className="flex -space-x-3 sm:mr-6 mb-4 sm:mb-0">
                <Image src="/testimonial-1.jpeg" alt="" width={44} height={44} className="rounded-full border-2 border-white" />
                <Image src="/testimonial-2.jpeg" alt="" width={44} height={44} className="rounded-full border-2 border-white" />
                <Image src="/testimonial-7.jpeg" alt="" width={44} height={44} className="rounded-full border-2 border-white" />
                <Image src="/testimonial-4.jpeg" alt="" width={44} height={44} className="rounded-full border-2 border-white hidden sm:block" />
                <Image src="/testimonial-5.jpeg" alt="" width={44} height={44} className="rounded-full border-2 border-white hidden sm:block" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-slate-800 text-sm font-medium mb-1">
                  <span className="text-[#5000f7] font-bold">10,000+</span> everyday people, lawyers & businesses trust our AI analysis
                </p>
                <div className="flex items-center justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-slate-600 ml-1">4.9/5 from 800+ reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Clauses Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Fair Clauses for Both Sides</h2>
              
              {/* Contract Analysis Animation */}
              <div className="relative h-32 mb-6 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-md px-4">
                    {/* Scanning line animation */}
                    <div className="h-1 bg-yellow-400 animate-pulse rounded-full absolute left-0 right-0 top-1/2 opacity-70"></div>
                    
                    {/* Contract text that appears to be analyzed */}
                    <div className="space-y-2 relative">
                      <div className="h-2 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-2 bg-slate-200 rounded w-full animate-pulse"></div>
                      <div className="h-2 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                      <div className="h-2 bg-slate-300 rounded w-2/3 animate-pulse"></div>
                      <div className="h-2 bg-red-200 rounded w-full animate-pulse"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* Overlay with scanning effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-[scan_2s_ease-in-out_infinite]"></div>
                
                {/* Status indicators */}
                <div className="absolute bottom-2 right-3 flex items-center gap-2 text-xs font-medium">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    <span className="text-green-600">Analyzing</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 mb-8">
                Our AI doesn't just identify problematic clauses - it suggests balanced alternatives that protect everyone's interests. Get professional-level contract review in seconds.
              </p>
              <div className="space-y-4">
                {advantageItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Original Clause</h3>
                    <p className="text-sm text-slate-700">
                      "The Client waives all rights to pursue legal action against the Company for any reason..."
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">AI Suggestion</h3>
                    <p className="text-sm text-slate-700">
                      "Both parties retain the right to pursue legal action if the other party materially breaches this agreement..."
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Original Clause</h3>
                    <p className="text-sm text-slate-700">
                      "Payment terms may be modified at any time at Company's sole discretion..."
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">AI Suggestion</h3>
                    <p className="text-sm text-slate-700">
                      "Payment terms may be modified with 30 days written notice and mutual agreement of both parties..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Professionals Trust Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Professionals Trust ScanContract</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform helps you analyze contracts faster and more accurately than ever before, with features designed for both legal experts and business professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-white shadow-md border border-slate-200 hover:shadow-lg transition-all"
              >
                <div className="bg-blue-50 p-3 rounded-lg inline-block mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Real testimonials from professionals who have transformed their contract review process with ScanContract.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl bg-white shadow-md border border-slate-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">
              Have questions about ScanContract? We've got answers to help you get started.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-2">How accurate is the AI analysis?</h3>
              <p className="text-slate-600">Our AI has been trained on millions of contracts and legal documents, achieving over 95% accuracy in identifying problematic clauses and providing balanced alternatives.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
              <p className="text-slate-600">Absolutely. We use bank-level encryption for all uploads and never share your contracts with third parties. Your documents are automatically deleted after 30 days.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-2">Can I use this for any contract type?</h3>
              <p className="text-slate-600">Yes, our AI is designed to analyze any type of contract, from employment agreements to NDAs, service agreements, and more. We're constantly improving our models for specialized contract types.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {session?.user 
              ? "Need Help With Your Contracts?"
              : "Ready to Transform Your Contract Analysis? It's Free!"
            }
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {session?.user
              ? "Our support team is here to help you get the most out of ScanContract"
              : "Join thousands of professionals who trust ScanContract for their contract analysis needs."
            }
          </p>
          <Link href={session?.user ? "/support" : "/auth/register"}>
            <Button size="lg" className="rounded-full bg-white text-primary hover:bg-slate-100 font-medium px-8">
              {session?.user ? "Contact Support" : "Get Started For Free"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-blue-200 mt-4 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p>© {new Date().getFullYear()} ScanContract. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}