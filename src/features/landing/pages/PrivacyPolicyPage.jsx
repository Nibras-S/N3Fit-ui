import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FreeTrialModal from '../components/FreeTrialModal';
import LegalPageLayout from '../components/LegalPageLayout';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';
import '../styles/landing.css';

export default function PrivacyPolicyPage() {
  const [trialOpen, setTrialOpen] = useState(false);

  useDocumentMeta({
    title: 'Privacy Policy — N3FitBook',
    description: 'How N3FitBook collects, uses, and protects your data and your gym members’ data. Last updated May 2026.',
    canonical: 'https://n3fitbook.in/privacy',
    ogType: 'article',
  });

  return (
    <div className="landing-page-wrapper min-h-screen">
      <Navbar onOpenTrial={() => setTrialOpen(true)} />

      <LegalPageLayout
        eyebrow="Legal"
        title="Privacy Policy"
        updatedOn="May 7, 2026"
        intro="At N3FitBook we take your privacy seriously. This policy explains what data we collect when you (or your gym's members) use our platform, why we collect it, how we keep it safe, and the choices you have."
      >
        <h2>1. Information we collect</h2>
        <p>
          We collect information you provide directly to us when you sign up for
          a free trial, register a gym, add staff or members, record payments,
          or contact our support team. This includes:
        </p>
        <ul>
          <li>Account information — name, email, phone, gym name, role.</li>
          <li>Member records — name, contact details, photo, plan, attendance,
              payments and notes that gym staff enter on your behalf.</li>
          <li>Billing data — invoice history and payment metadata.</li>
          <li>Operational data — expenses, transactions, reports and uploaded
              documents.</li>
        </ul>
        <p>
          We also collect technical information automatically: IP address,
          device and browser type, pages viewed, and timestamps. This helps us
          keep the service secure and reliable.
        </p>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To provide, maintain and improve N3FitBook.</li>
          <li>To send transactional messages — invoices, reminders, password
              resets and notifications you have configured.</li>
          <li>To detect and prevent fraud, abuse and security incidents.</li>
          <li>To comply with our legal obligations.</li>
        </ul>
        <p>
          We do not sell your personal data, and we do not share gym member
          data with third parties for advertising.
        </p>

        <h2>3. Data sharing and processors</h2>
        <p>
          We rely on a small number of trusted sub-processors to run the
          platform — cloud hosting, transactional email, SMS/WhatsApp delivery
          and payment processing. These vendors only receive the minimum data
          needed to perform their function and are bound by confidentiality
          obligations.
        </p>

        <h2>4. Data retention</h2>
        <p>
          We retain your data while your account is active. After you cancel,
          we keep records for up to 90 days to allow recovery, then delete or
          anonymize them — except where law requires longer retention (for
          example, financial records).
        </p>

        <h2>5. Your rights</h2>
        <p>
          You can access, export or delete your data from inside the app, or
          by writing to us at <a href="mailto:contact@n3global.tech">contact@n3global.tech</a>.
          Gym admins are the data controller for their members; members should
          contact their gym directly for changes to their own records.
        </p>

        <h2>6. Security</h2>
        <p>
          We use TLS in transit, encryption at rest, role-based access controls
          and routine backups. No system is 100% secure, but we will notify you
          without undue delay if we become aware of an incident affecting your
          data.
        </p>

        <h2>7. Cookies</h2>
        <p>
          N3FitBook uses a single httpOnly session cookie to keep you signed
          in. We do not use third-party advertising cookies.
        </p>

        <h2>8. Children</h2>
        <p>
          N3FitBook is intended for use by gym businesses. We do not knowingly
          collect personal information directly from children under 13.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be
          announced inside the app or by email at least 14 days before they
          take effect.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions or concerns? Reach us at{' '}
          <a href="mailto:contact@n3global.tech">contact@n3global.tech</a>.
        </p>
      </LegalPageLayout>

      <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
      <Footer />
    </div>
  );
}
