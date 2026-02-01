
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: February 1, 2026</p>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Pong.1337. We are dedicated to safeguarding your privacy.
              This Privacy Policy explains our practices regarding the collection, 
              use, disclosure, and protection of personal information in connection 
              with our online ping pong gaming platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.1 Personal Information</h3>
            <p className="mb-3">When you register for an account, we collect:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Username and display name</li>
              <li>Email address</li>
              <li>Password (encrypted and securely stored)</li>
              <li>Profile picture (optional and safely stored)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Game Data</h3>
            <p className="mb-3">During gameplay, we collect:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Game statistics (wins, losses, scores) for personnal statistics.</li>
              <li>Tournament participation and results.</li>
              <li>Match history and replays.</li>
              <li>Player rankings and achievements.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.3 Technical Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and device informations.</li>
              <li>Browser type and version.</li>
              <li>Operating system.</li>
              <li>Gameplay session data.</li>
              <li>Connection quality metrics.</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use your informations in order :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain the game services.</li>
              <li>Create and manage your account.</li>
              <li>Facilitate online matches and tournaments.</li>
              <li>Calculate rankings and leaderboards.</li>
              <li>Improve game performance and user experience.</li>
              <li>Detect and prevent cheating or abuse.</li>
              <li>Send important updates and notifications.</li>
              <li>Respond to support requests.</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell your personal information. We may share data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>With Other Players:</strong> Your username, ranking, and game statistics are publicly visible.</li>
              <li><strong>For Legal Compliance:</strong> When required by law or to protect our rights.</li>
              <li><strong>Service Providers:</strong> With trusted third parties who help operate our platform.</li>
              <li><strong>In Case of Merger:</strong> If our company is acquired or merged.</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Encryption of sensitive data (passwords, payment information)</li>
              <li>Secure WebSocket connections for real-time gameplay</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication protocols</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your 
              preferences, and analyze platform usage. You can control cookie settings through 
              your browser, but disabling cookies may affect functionality.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Privacy Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at privacy@pingponggame.dev.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe we have 
              collected such information, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and stored on servers located outside your 
              country of residence. By using our service, you consent to such transfers. We ensure 
              appropriate safeguards are in place to protect your data.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes by email or through a prominent notice on our platform. Continued use of the 
              service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p className="mb-3">If you have questions about this Privacy Policy, please contact us:</p>
            <ul className="space-y-2 ml-4">
              <li><strong>Email:</strong> privacy@pingponggame.dev.</li>
              <li><strong>Support:</strong> support@pingponggame.dev.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

