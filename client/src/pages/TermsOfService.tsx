import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-neutral-600">Last updated: June 18, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using MYLES, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h2>2. Description of Service</h2>
            <p>MYLES is a platform that connects fitness enthusiasts with local exercise sessions and fitness businesses.</p>

            <h3>For Users:</h3>
            <ul>
              <li>Search and book fitness sessions</li>
              <li>Make secure payments through our platform</li>
              <li>Access session information and business profiles</li>
            </ul>

            <h3>For Businesses:</h3>
            <ul>
              <li>Free business listing and profile</li>
              <li>Paid subscription for online booking functionality</li>
              <li>Session management and customer communication</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>You are responsible for safeguarding your account information and for all activities under your account.</p>

            <h2>4. Payment Terms</h2>
            <ul>
              <li>Session payments are processed securely through Stripe</li>
              <li>Business subscriptions: Basic (£29/month), Premium (£79/month)</li>
              <li>Refunds are subject to individual business policies</li>
              <li>We reserve the right to modify pricing with 30 days notice</li>
            </ul>

            <h2>5. Business Responsibilities</h2>
            <p>Fitness businesses using our platform agree to:</p>
            <ul>
              <li>Provide accurate business and session information</li>
              <li>Maintain appropriate insurance and certifications</li>
              <li>Honor bookings made through the platform</li>
              <li>Comply with health and safety regulations</li>
            </ul>

            <h2>6. Prohibited Uses</h2>
            <p>You may not use our service to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Transmit harmful or offensive content</li>
              <li>Interfere with the platform's operation</li>
              <li>Impersonate others or provide false information</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p>MYLES acts as a platform connecting users with fitness providers. We are not responsible for the quality, safety, or legality of sessions, the truth or accuracy of listings, or the ability of users to pay.</p>

            <h2>8. Termination</h2>
            <p>We may terminate or suspend your account and access to the service at our sole discretion, without prior notice, for conduct that we believe violates these Terms.</p>

            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.</p>

            <h2>10. Contact Information</h2>
            <p>For questions about these Terms of Service, contact us at:</p>
            <p>Email: legal@mylesfitness.co.uk<br />
            Address: MYLES Fitness Ltd, London, UK</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}