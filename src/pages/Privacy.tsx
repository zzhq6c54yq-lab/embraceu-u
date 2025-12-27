import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Privacy Policy"
        description="EmbraceU Privacy Policy. Learn how we collect, use, and protect your personal data. Your privacy and security are our priority."
        path="/privacy"
      />
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              EmbraceU collects information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Email address and nickname when you create an account</li>
              <li>Mood entries and personal reflections you choose to log</li>
              <li>Patterns and insights you record during your journey</li>
              <li>Gratitude entries and challenge progress</li>
              <li>Usage data to improve your experience</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Provide, maintain, and improve the EmbraceU service</li>
              <li>Personalize your experience and provide relevant insights</li>
              <li>Send you weekly summaries and progress updates (if enabled)</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard encryption. We use Supabase as our backend provider, 
              which implements comprehensive security measures including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>End-to-end encryption for data in transit</li>
              <li>Encrypted data at rest</li>
              <li>Row-level security policies to protect your personal data</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">4. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. 
              You may request deletion of your account and associated data at any time through the app settings.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">5. Your Rights (GDPR/CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              EmbraceU may use third-party services for analytics, payment processing, and authentication. 
              These services have their own privacy policies, and we encourage you to review them:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-3 space-y-2">
              <li>Google (for authentication and analytics)</li>
              <li>Apple (for authentication on iOS)</li>
              <li>Payment processors (for premium subscriptions)</li>
            </ul>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              EmbraceU is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="card-embrace">
            <h2 className="font-serif text-xl text-foreground mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;
