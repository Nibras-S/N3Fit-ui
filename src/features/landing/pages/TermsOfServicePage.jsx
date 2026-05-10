import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FreeTrialModal from '../components/FreeTrialModal';
import LegalPageLayout from '../components/LegalPageLayout';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import '../styles/landing.css';

export default function TermsOfServicePage() {
  const [trialOpen, setTrialOpen] = useState(false);

  useDocumentMeta({
    title: 'Terms of Service — N3FitBook',
    description: 'Terms governing your access to and use of the N3FitBook gym management platform. Last updated May 2026.',
    canonical: 'https://www.n3fitbook.in/terms',
    ogType: 'article',
  });

  return (
    <div className="landing-page-wrapper min-h-screen">
      <Navbar onOpenTrial={() => setTrialOpen(true)} />

      <LegalPageLayout
        eyebrow="Legal"
        title="Terms of Service"
        updatedOn="May 7, 2026"
        intro="These terms govern your access to and use of the N3FitBook platform. By creating an account or using the service you agree to be bound by them."
      >
        <h2>1. Who these terms apply to</h2>
        <p>
          “N3FitBook”, “we” or “us” refers to N3 Global Tech (Kannur, Kerala,
          India), the operator of the N3FitBook platform. “You” means the gym, account owner, or
          authorised user accessing the service.
        </p>

        <h2>2. Your account</h2>
        <ul>
          <li>You must be at least 18 years old and authorised to bind your
              business to these terms.</li>
          <li>You are responsible for keeping your login credentials safe and
              for all activity under your account.</li>
          <li>You agree to provide accurate, current information and to keep
              it updated.</li>
        </ul>

        <h2>3. Subscription and billing</h2>
        <p>
          N3FitBook is sold as a yearly subscription. Fees are listed on the
          pricing page and are charged in advance for the upcoming term.
          Subscriptions renew automatically unless cancelled at least 7 days
          before the renewal date. Fees are non-refundable except where
          required by law.
        </p>

        <h2>4. Free trial</h2>
        <p>
          We may offer a 14-day free trial. We may modify or discontinue the
          trial at any time without notice and without liability.
        </p>

        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use N3FitBook for any unlawful purpose or to violate someone
              else's rights.</li>
          <li>Reverse engineer, decompile or otherwise attempt to extract the
              source code of the platform.</li>
          <li>Resell, sublicense or commercially exploit the service in a way
              not permitted by your subscription.</li>
          <li>Interfere with the security or integrity of the platform —
              including probing, scanning, or attempting to gain unauthorised
              access.</li>
          <li>Send spam, phishing or harassing messages through any built-in
              messaging features.</li>
        </ul>

        <h2>6. Your content</h2>
        <p>
          You retain ownership of all data you upload to N3FitBook — including
          member records, photos and documents. You grant us a limited licence
          to host, process and display this content solely to provide the
          service to you. You are responsible for ensuring you have the right
          to upload anything you store on the platform.
        </p>

        <h2>7. Privacy</h2>
        <p>
          Our handling of personal data is described in our{' '}
          <a href="/privacy">Privacy Policy</a>. By using N3FitBook you agree
          to that policy.
        </p>

        <h2>8. Service availability</h2>
        <p>
          We work hard to keep N3FitBook fast and reliable, and we target a
          monthly uptime of 99.9% for the production service. Scheduled
          maintenance, third-party outages and force-majeure events may cause
          brief interruptions. We do not provide a uptime credit unless your
          plan explicitly includes one.
        </p>

        <h2>9. Suspension and termination</h2>
        <p>
          We may suspend or terminate your account if you breach these terms,
          fail to pay, or use the service in a way that harms us or other
          customers. You can cancel at any time from the in-app settings or by
          writing to us. On termination we will retain your data for up to 90
          days to allow export, after which it will be deleted.
        </p>

        <h2>10. Disclaimer of warranties</h2>
        <p>
          The service is provided “as is” and “as available”. To the maximum
          extent permitted by law we disclaim all warranties, express or
          implied, including merchantability, fitness for a particular
          purpose, and non-infringement.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, N3FitBook's total aggregate
          liability under these terms will not exceed the amount you paid us
          in the 12 months preceding the event giving rise to the claim. We
          are not liable for any indirect, incidental, special or
          consequential damages.
        </p>

        <h2>12. Changes to the service or terms</h2>
        <p>
          We may modify the service or these terms from time to time. Material
          changes will be communicated via the app or email at least 14 days
          before they take effect. Continued use after that date constitutes
          acceptance.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These terms are governed by the laws of India. Any dispute will be
          subject to the exclusive jurisdiction of the courts located in
          Kerala, India.
        </p>

        <h2>14. Contact</h2>
        <p>
          For any questions about these terms, write to{' '}
          <a href="mailto:contact@n3global.tech">contact@n3global.tech</a>.
        </p>
      </LegalPageLayout>

      <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
      <Footer />
    </div>
  );
}
