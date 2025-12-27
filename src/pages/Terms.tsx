import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-warm opacity-30 pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-label">BACK</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <Logo size="md" />
          <h1 className="font-serif italic text-3xl md:text-4xl text-foreground mt-6 mb-2">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using EmbraceU, you agree to be bound by these Terms of Service and all applicable laws 
              and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              EmbraceU is a personal wellness application designed to help users:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Track and understand their emotional patterns</li>
              <li>Practice mindfulness and gratitude</li>
              <li>Set and achieve personal growth goals</li>
              <li>Access guided breathing and meditation exercises</li>
              <li>Gain insights into their mental wellness journey</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a user of EmbraceU, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account with others</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to interfere with the proper functioning of the service</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">4. Premium Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              EmbraceU offers premium features through subscription plans:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Subscriptions are billed on a recurring basis (monthly or annually)</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Refunds are subject to the refund policies of Apple App Store or Google Play Store</li>
              <li>Premium features will remain accessible until the end of your billing period</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The EmbraceU service, including its original content, features, and functionality, is owned by EmbraceU 
              and is protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws. You may not reproduce, distribute, modify, or create derivative works without our express 
              written permission.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">6. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to EmbraceU (such as journal entries, mood logs, and reflections). 
              By submitting content, you grant us a limited license to store and process this information solely for the 
              purpose of providing the service to you. We do not share or sell your personal content to third parties.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">7. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>EmbraceU is not a substitute for professional medical advice, diagnosis, or treatment.</strong> 
              The service is intended for general wellness purposes only. If you are experiencing mental health issues, 
              please consult a qualified healthcare professional. Never disregard professional medical advice or delay 
              seeking it because of something you have read or experienced through this app.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall EmbraceU, its directors, employees, partners, agents, suppliers, or affiliates be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
              loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Your access to or use of (or inability to use) the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your data</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
              including without limitation if you breach these Terms. Upon termination, your right to use the service 
              will immediately cease. You may also delete your account at any time through the app settings.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
              try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material 
              change will be determined at our sole discretion.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
              EmbraceU operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-primary mt-2">
              support@embraceu.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
