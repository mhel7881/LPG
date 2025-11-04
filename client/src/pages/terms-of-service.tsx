import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfServicePage() {
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
                Terms of Service
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>

            <CardContent className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p>
                  By creating an account and using GasFlow services, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
                <p>
                  GasFlow provides LPG (Liquefied Petroleum Gas) delivery services through our mobile application and website. 
                  We connect customers with reliable gas delivery services in their area.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You must be at least 18 years old to use our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Orders and Deliveries</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>All orders are subject to product availability and delivery area coverage</li>
                  <li>Delivery times are estimates and may vary due to weather, traffic, or other circumstances</li>
                  <li>You must be present or designate someone to receive the delivery</li>
                  <li>Payment is due upon delivery unless otherwise arranged</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Safety and Compliance</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>LPG cylinders must be stored and used according to safety guidelines</li>
                  <li>You must follow all local regulations regarding LPG storage and usage</li>
                  <li>We reserve the right to refuse service if safety requirements cannot be met</li>
                  <li>Report any safety concerns or cylinder defects immediately</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Pricing and Payments</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Prices are subject to change without notice</li>
                  <li>Current prices will be displayed at the time of order</li>
                  <li>We accept cash on delivery and digital payment methods</li>
                  <li>Refunds are processed according to our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cancellations and Refunds</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Orders can be cancelled before dispatch without charge</li>
                  <li>Cancellations after dispatch may incur a fee</li>
                  <li>Refunds for cancelled orders are processed within 5-7 business days</li>
                  <li>Defective products will be replaced at no additional cost</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Data Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                  use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p>
                  GasFlow's liability is limited to the cost of the products purchased. We are not liable for 
                  indirect, incidental, or consequential damages arising from the use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
                <p>
                  We reserve the right to modify these terms at any time. Users will be notified of significant 
                  changes and continued use of the service constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us through our app's support feature 
                  or email us at support@gasflow.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}