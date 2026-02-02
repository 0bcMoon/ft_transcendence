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
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: February 1, 2026</p>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to Pong.1337. By accessing or using our online ping pong game platform 
              ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do 
              not agree to these Terms, please do not use the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.1 Eligibility</h3>
            <p>
              You must be at least 13 years old to create an account. Users under 18 should have 
              parental consent before using the Service.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.2 Account Security</h3>
            <p className="mb-3">You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and up-to-date information</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">2.3 Account Restrictions</h3>
            <p>You may not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Create multiple accounts to manipulate rankings</li>
              <li>Share or sell your account to others</li>
              <li>Use automated bots or scripts</li>
              <li>Impersonate other users or entities</li>
            </ul>
          </section>

          {/* Game Rules */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Game Rules and Conduct</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.1 Fair Play</h3>
            <p className="mb-3">All users must:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Play fairly and honestly</li>
              <li>Not use cheats, hacks, or exploits</li>
              <li>Not intentionally disconnect to avoid losses</li>
              <li>Respect tournament rules and schedules</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">3.2 Prohibited Conduct</h3>
            <p className="mb-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Harass, bully, or threaten other players</li>
              <li>Use offensive, abusive, or discriminatory language</li>
              <li>Spam chat or matchmaking systems</li>
              <li>Share inappropriate content</li>
              <li>Attempt to hack or disrupt the Service</li>
              <li>Engage in match-fixing or collusion</li>
            </ul>
          </section>

          {/* Game Modes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Game Modes</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.1 Remote Games</h3>
            <p>
              Online multiplayer matches require a stable internet connection. We are not 
              responsible for connection issues or lag that may affect gameplay.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.2 Tournaments</h3>
            <p>
              Tournament participants must adhere to specific rules, schedules, and formats. 
              Missing scheduled matches may result in forfeiture. Prize distribution is at our 
              sole discretion.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">4.3 Local Games</h3>
            <p>
              Local multiplayer is provided "as is" for casual play between players sharing the 
              same device.
            </p>
          </section>

          {/* Rankings and Rewards */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Rankings and Rewards</h2>
            <p>
              Rankings, leaderboards, and rewards are calculated based on game performance. We 
              reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Adjust ranking algorithms</li>
              <li>Reset rankings seasonally</li>
              <li>Revoke rewards obtained through cheating</li>
              <li>Modify or discontinue reward programs</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
            <p>
              All content, features, and functionality of Pong.1337, including but not limited to 
              game mechanics, graphics, code, and trademarks, are owned by us and protected by 
              international copyright and intellectual property laws.
            </p>
            <p className="mt-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Copy, modify, or reverse engineer the game</li>
              <li>Use our trademarks without permission</li>
              <li>Create derivative works</li>
              <li>Extract or reuse any game assets</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. User-Generated Content</h2>
            <p>
              If you upload profile pictures or other content, you grant us a non-exclusive, 
              worldwide license to use, display, and distribute that content within the Service.
            </p>
            <p className="mt-3">
              You represent that you own or have rights to any content you submit and that it 
              does not violate any laws or third-party rights.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-4">8.1 By You</h3>
            <p>
              You may terminate your account at any time by contacting support or using the 
              account deletion feature.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-4">8.2 By Us</h3>
            <p className="mb-3">We may suspend or terminate your account if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You violate these Terms</li>
              <li>You engage in cheating or abuse</li>
              <li>Your account is inactive for an extended period</li>
              <li>Required by law or for safety reasons</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. 
              WE DO NOT GUARANTEE:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of rankings or statistics</li>
              <li>Availability of specific features</li>
              <li>Compatibility with all devices</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, 
              DATA LOSS, OR SERVICE INTERRUPTION.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or use of the Service shall be resolved 
              through binding arbitration, except where prohibited by law. You waive the right 
              to participate in class action lawsuits.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes via email or in-app notification. Continued use after changes 
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
            <p className="mb-3">For questions about these Terms, contact us:</p>
            <ul className="space-y-2 ml-4">
              <li><strong>Email:</strong> legal@pong1337.com</li>
              <li><strong>Support:</strong> support@pong1337.com</li>
            </ul>
          </section>

          {/* Acknowledgment */}
          <section className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
            <p className="text-center">
              <strong>By using Pong.1337, you acknowledge that you have read, understood, and 
              agree to be bound by these Terms of Service.</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
