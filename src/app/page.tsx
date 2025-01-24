"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Brain, Share2, CheckCircle, Star, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractUploader } from "@/components/contracts/upload/ContractUploader";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Advanced AI algorithms analyze your contracts for potential issues and improvements in seconds."
    },
    {
      icon: Shield,
      title: "Legal Protection",
      description: "Identify and fix potential legal issues before they become problems."
    },
    {
      icon: Zap,
      title: "Smart Suggestions",
      description: "Get intelligent suggestions to improve contract terms and protect your interests."
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share contracts and analysis reports securely with stakeholders and team members."
    }
  ];

  const testimonials = [
    {
      quote: "Scancontract has revolutionized how we handle contracts. The AI suggestions are incredibly accurate.",
      author: "Sarah Johnson",
      role: "Legal Consultant",
      company: "Tech Solutions Inc."
    },
    {
      quote: "As a small business owner, this tool has saved me countless hours and potential legal headaches.",
      author: "Michael Chen",
      role: "CEO",
      company: "StartupFlow"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-primary text-white">
      {/* Navbar for logged users */}
      {session?.user && (
        <nav className="bg-white/10 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="font-bold text-xl">
                Scancontract
              </Link>
              
              <div className="flex items-center gap-6">
                <Link 
                  href="/contracts" 
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  My Contracts
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{session.user.email}</span>
                  </div>
                  <Link href="/api/auth/signout">
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section with Uploader */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#2563EB]/20 px-4 py-2 rounded-full mb-8">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-white">Trusted by 10,000+ users worldwide</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 text-white">
            Review Any Contract in Minutes
          </h1>
          <p className="text-xl text-[#BFDBFE] mb-12 max-w-3xl mx-auto">
            Never miss hidden clauses or unfair terms. Get instant analysis and fair versions for both parties - no legal expertise needed.
          </p>

          <ContractUploader />
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Scancontract?</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Our AI-powered platform helps you analyze contracts faster and more accurately than ever before.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all"
            >
              <feature.icon className="w-8 h-8 text-[#2563EB] mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-white/60">{testimonial.role}, {testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Contract Analysis?</h2>
          <p className="text-white/80 mb-8">
            Join thousands of professionals who trust Scancontract for their contract analysis needs.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="rounded-full bg-white text-primary hover:bg-gray-100">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="container mx-auto p-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-white">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/compliance" className="hover:text-white">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Scancontract. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}