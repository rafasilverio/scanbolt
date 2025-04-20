'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-primary flex items-center">
              <Image 
                src="/logo horizontal purple big.png" 
                alt="ScanContract Logo" 
                width={180}
                height={45}
              />
            </Link>
            <Link href="/" className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold mb-8 text-slate-900">Terms of Service</h1>
          
          <p className="text-slate-600 mb-6">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
              <p className="text-slate-600">Welcome to ScanContract ("we," "our," or "us"). By accessing or using our website, services, applications, and tools (collectively, the "Services"), you agree to these Terms of Service. Please read these terms carefully before using our Services.</p>
              <p className="text-slate-600">By using our Services, you agree to these terms. If you do not agree to these terms, you must not use our Services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">2. Use of Services</h2>
              <p className="text-slate-600">Our Services provide AI-powered contract analysis tools designed to help identify potential issues and provide suggestions. By using our Services, you understand and acknowledge that:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Our AI analysis is provided for informational purposes only and does not constitute legal advice.</li>
                <li>We do not guarantee the accuracy, completeness, or reliability of our analysis.</li>
                <li>You are responsible for reviewing and verifying any contract analysis results before making decisions.</li>
                <li>You should consult with qualified legal professionals before making important legal decisions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">3. User Accounts</h2>
              <p className="text-slate-600">To use certain features of our Services, you may need to create an account. When you create an account, you agree to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide accurate and complete information.</li>
                <li>Maintain the security of your account credentials.</li>
                <li>Notify us immediately of any unauthorized access to your account.</li>
                <li>Be responsible for all activities that occur under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">4. User Content</h2>
              <p className="text-slate-600">Our Services allow you to upload, submit, and share content, including contracts and related documents ("User Content"). With respect to User Content:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>You retain all ownership rights to your User Content.</li>
                <li>You grant us a non-exclusive, worldwide, royalty-free license to use, store, and process your User Content solely for the purpose of providing and improving our Services.</li>
                <li>You are solely responsible for your User Content and the consequences of uploading or sharing it.</li>
                <li>You represent and warrant that you have all necessary rights to upload and share your User Content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">5. Data Usage and AI Training</h2>
              <p className="text-slate-600">We use advanced artificial intelligence to analyze contracts and provide recommendations. To improve our Services:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>We may use anonymized and aggregated data derived from User Content to train and improve our AI models.</li>
                <li>We implement strict security measures to protect the confidentiality of your information.</li>
                <li>We do not sell or share your specific User Content with third parties except as described in our Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">6. Subscription Plans and Payments</h2>
              <p className="text-slate-600">We offer various subscription plans for our Services. By subscribing to a paid plan:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>You agree to pay all fees associated with your selected plan.</li>
                <li>Subscription fees are billed in advance on a recurring basis based on your selected billing cycle.</li>
                <li>You authorize us to charge your designated payment method for these fees.</li>
                <li>Subscription plans automatically renew unless canceled before the renewal date.</li>
                <li>Refunds are provided in accordance with applicable law and our refund policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">7. Intellectual Property Rights</h2>
              <p className="text-slate-600">All intellectual property rights in our Services, including but not limited to software, designs, logos, text, and graphics, are owned by or licensed to us. You may not:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Copy, modify, distribute, sell, or lease any part of our Services.</li>
                <li>Reverse engineer or attempt to extract the source code of our software.</li>
                <li>Remove any copyright, trademark, or other proprietary notices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">8. Limitation of Liability</h2>
              <p className="text-slate-600">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages.</li>
                <li>Our total liability for any claims related to these terms or our Services shall not exceed the amount you paid us in the six months preceding the claim.</li>
                <li>We specifically disclaim liability for any decisions made based on our AI analysis and recommendations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">9. Changes to Terms</h2>
              <p className="text-slate-600">We may modify these terms from time to time. We will notify you of significant changes by posting a notice on our website or sending an email. Your continued use of our Services after such modifications constitutes your acceptance of the updated terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">10. Governing Law</h2>
              <p className="text-slate-600">These terms are governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law principles.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">11. Contact Information</h2>
              <p className="text-slate-600">If you have any questions about these Terms of Service, please contact us at:</p>
              <p className="text-slate-600">legal@scancontract.com</p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} ScanContract. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 