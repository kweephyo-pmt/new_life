import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 28, 2025</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using New Life, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              New Life provides AI-powered travel planning services. You agree to use the service only for lawful purposes and in accordance with these Terms.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You must be at least 13 years old to use this service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the service for any illegal or unauthorized purpose</li>
              <li>You will not transmit any malicious code or interfere with the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you post on New Life. By posting content, you grant us a worldwide, 
              non-exclusive, royalty-free license to use, reproduce, and display your content in connection with the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service uses AI to generate travel recommendations and itineraries. While we strive for accuracy, 
              AI-generated content may not always be perfect. You should verify important information independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              New Life is provided "as is" without warranties of any kind. We are not liable for any damages arising 
              from your use of the service, including but not limited to travel disruptions, financial losses, or 
              inaccurate information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes 
              via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account at any time for violations of these terms. You may also 
              terminate your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@newlife.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
