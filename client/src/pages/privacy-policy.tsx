import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link href="/login">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Privacy Policy
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>

            <CardContent className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Delivery addresses and location data</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Account credentials and preferences</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2">Usage Data</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>App usage patterns and interactions</li>
                  <li>Device information and technical data</li>
                  <li>Order history and service usage</li>
                  <li>Communication records with customer support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Delivery:</strong> Process and fulfill your gas delivery orders</li>
                  <li><strong>Communication:</strong> Send order updates, notifications, and customer support</li>
                  <li><strong>Personalization:</strong> Customize your experience and provide relevant recommendations</li>
                  <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
                  <li><strong>Improvement:</strong> Analyze usage to improve our services and features</li>
                  <li><strong>Legal Compliance:</strong> Meet regulatory requirements and legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
                <p className="mb-3">We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Providers:</strong> With delivery partners and payment processors to fulfill orders</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                <p className="mb-3">We implement robust security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure payment processing through certified providers</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
                <p>
                  We retain your personal information only as long as necessary to provide our services and 
                  comply with legal obligations. Account data is typically retained for the duration of your 
                  account plus 2 years after closure, unless required longer by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Privacy Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Location Data</h2>
                <p>
                  We collect location data to provide accurate delivery services. You can control location 
                  sharing through your device settings. Disabling location services may affect our ability 
                  to deliver to your location.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, and 
                  provide personalized content. You can manage cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Third-Party Services</h2>
                <p>
                  Our app may contain links to third-party services. We are not responsible for the privacy 
                  practices of these services. Please review their privacy policies separately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
                <p>
                  Our services are not intended for children under 13. We do not knowingly collect personal 
                  information from children. If you believe we have collected such information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. International Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your residence. 
                  We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of significant changes 
                  and post the updated policy with a new effective date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p>
                  For questions about this Privacy Policy or to exercise your privacy rights, contact us at:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Email: privacy@gasflow.com</li>
                  <li>Through our app's support feature</li>
                  <li>By mail: GasFlow Privacy Team, [Address]</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}