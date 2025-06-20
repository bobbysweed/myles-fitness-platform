import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-neutral-600">Last updated: June 18, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, register a business, or book fitness sessions.</p>
            
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact information</li>
              <li>Email address and phone number</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Business information for service providers</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our fitness booking services</li>
              <li>Process transactions and send confirmations</li>
              <li>Send administrative information and updates</li>
              <li>Improve our services and user experience</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
            <ul>
              <li>With your consent</li>
              <li>To trusted service providers (Stripe for payments, SendGrid for emails)</li>
              <li>When required by law</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

            <h2>5. Your Rights (GDPR Compliance)</h2>
            <p>If you are a resident of the European Union, you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>

            <h2>6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@mylesfitness.co.uk<br />
            Address: MYLES Fitness Ltd, London, UK</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}