import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Eswatini Cars',
  description: 'How Eswatini Cars collects, uses, and protects your personal information, in line with the Constitution of Eswatini and the Data Protection Act, 2022.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a1834] text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm mb-6 inline-block">← Back to Eswatini Cars</Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: 30 October 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Our commitment to your privacy</h2>
            <p>
              Eswatini Cars respects your privacy. This Privacy Policy explains what personal information we
              collect, why we collect it, how we use it, who we share it with, and the choices you have. It
              applies to the Eswatini Cars website, the Android app, and any other way you interact with us.
            </p>
            <p className="mt-3">
              We are committed to handling your personal information in line with:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li><strong>Section 22 of the Constitution of the Kingdom of Eswatini (2005)</strong>, which protects the right to privacy of the person, the home, and the communication of every person in Eswatini.</li>
              <li><strong>The Data Protection Act, 2022</strong> of the Kingdom of Eswatini, which governs the collection, processing, and storage of personal data.</li>
              <li>Generally accepted best practice for online platforms of this kind.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. What information we collect</h2>
            <p>We collect the following types of information:</p>

            <p className="mt-4 font-semibold text-white">2.1 Information you give us when you register</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li><strong>Name</strong> — so we can address you properly and so the admin team knows who they are talking to.</li>
              <li><strong>Username</strong> — a short identifier (3-20 characters) so we can identify you in messages to admin. If you don&apos;t choose one, we generate one automatically from the first part of your email address.</li>
              <li><strong>Email address</strong> — used to log in, to recover your account, and to send you notifications about your enquiries and listings.</li>
              <li><strong>Phone number</strong> — used for phone verification (where enabled), and so our team can call you back when you enquire about a vehicle. Your phone number is <strong>never published</strong> on any listing — buyers reach you through us first.</li>
              <li><strong>Password</strong> — stored as a one-way hash (bcrypt) so that even we cannot see the plain-text version. We can never send you your password; we can only help you reset it.</li>
            </ul>

            <p className="mt-4 font-semibold text-white">2.2 Information you give us when you post a listing</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li><strong>Seller name and seller phone</strong> — shown only to the admin team, never published on the listing.</li>
              <li><strong>Seller email</strong> (optional) — used to attribute the listing to your account so you can edit or delete it later.</li>
              <li><strong>Vehicle details</strong> — make, model, year, price, mileage, colour, region, fuel type, transmission, and description. These are publicly visible on the listing.</li>
              <li><strong>Vehicle photographs</strong> — uploaded to our cloud image service (Cloudinary) and displayed on the listing. For more detail, see Section 5 below.</li>
            </ul>

            <p className="mt-4 font-semibold text-white">2.3 Information you give us when you message admin</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li><strong>Subject and message text</strong> — the content of messages you send to the admin team through the Messages feature. This is visible to the admin team and to you, and is stored so that you can see the full conversation thread.</li>
            </ul>

            <p className="mt-4 font-semibold text-white">2.4 Information we collect automatically</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li><strong>Session cookie</strong> — a small, httpOnly cookie that keeps you logged in between page loads. It does not track you across other websites. It expires after 30 days of inactivity.</li>
              <li><strong>Listing view counts</strong> — every time someone views a listing, we increment a counter. This is just a number, not linked to any individual user.</li>
              <li><strong>Technical logs</strong> — server logs that include the time of a request, the type of device, and the country the request came from. These are used for security and to fix bugs. They are kept for a maximum of 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Why we collect each piece of information</h2>
            <p>We only collect information that we genuinely need to operate the platform. Specifically:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li><strong>To connect buyers and sellers</strong> — we need your contact details so we can forward enquiries and arrange viewings.</li>
              <li><strong>To verify listings and reduce fraud</strong> — we use your phone number and listing details to check that listings are genuine.</li>
              <li><strong>To let you manage your listings and messages</strong> — we link listings and messages to your account so you can edit, delete, or reply to them.</li>
              <li><strong>To notify you</strong> — we send you email notifications when someone enquires about your listing, when the admin team replies to your message, and (for buyers) when a viewing is arranged.</li>
              <li><strong>To keep the platform secure</strong> — we use session cookies and technical logs to detect and prevent abuse.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> collect your location via GPS, we do <strong>not</strong> read your contacts or
              messages, and we do <strong>not</strong> build a profile of you for advertising. We do not sell your
              personal information to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Phone number verification</h2>
            <p>
              When you register, we may send a one-time code (OTP) to your phone number via SMS to verify
              that the number belongs to you. This service is provided by Google Firebase Phone Authentication.
              The phone number is passed to Firebase for the sole purpose of sending the SMS, and Firebase
              stores a hashed token (not your plain phone number) to prevent abuse.
            </p>
            <p className="mt-3">
              You can choose to skip phone verification — you will still be able to register, list vehicles,
              and message admin, but your account will not be marked as phone-verified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. How we handle your photographs and other media</h2>
            <p>
              When you upload photographs of a vehicle, those photographs are:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Compressed and resized in your browser before upload, so that they load quickly.</li>
              <li>Uploaded to <strong>Cloudinary</strong>, a cloud-based image service. Cloudinary stores the photographs on its servers and delivers them to viewers via its global CDN.</li>
              <li>Displayed on your listing, and (for new listings) cross-posted to the <strong>Eswatini Cars Facebook Page</strong> along with the vehicle details.</li>
              <li>Deleted from Cloudinary when you delete the corresponding listing from the platform.</li>
            </ul>
            <p className="mt-3">
              You grant Eswatini Cars a non-exclusive, royalty-free, worldwide licence to host and display
              your media for the purpose of operating the platform. You remain the owner of your media at all
              times, and you can remove it at any time by deleting the listing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Who we share your information with</h2>
            <p>We share your information only with the following service providers, and only as needed to operate the platform:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li><strong>Turso (database hosting)</strong> — stores your account, listings, enquiries, and messages. Hosted in the EU (Ireland). Turso does not access your data for its own purposes.</li>
              <li><strong>Vercel (web hosting)</strong> — hosts the Eswatini Cars website and API. Vercel may process technical logs for security, but does not access your personal data.</li>
              <li><strong>Cloudinary (image hosting)</strong> — stores and serves the photographs you upload. Cloudinary is based in the USA.</li>
              <li><strong>Google Firebase (phone verification)</strong> — used only for sending OTP SMS during registration. Firebase receives your phone number for that purpose only.</li>
              <li><strong>Resend (email notifications)</strong> — used to send you enquiry and message notifications. Resend sees the email address and the content of the notification email.</li>
              <li><strong>Meta / Facebook (cross-posting)</strong> — when a new listing is created, the listing details and main photograph are posted to the Eswatini Cars Facebook Page via the Facebook Graph API.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> share your information with any other third party, except where required
              by law (for example, a lawful request from the Royal Eswatini Police Service or a court order
              from the courts of Eswatini), or where we believe in good faith that disclosure is necessary to
              prevent fraud, protect the safety of any person, or comply with a legal obligation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your phone number is never published</h2>
            <p>
              One of the most important privacy protections on Eswatini Cars is that your phone number is
              <strong> never published</strong> on any listing. When a buyer is interested in a vehicle, they send
              an enquiry to the admin team (not to the seller directly). The admin team then contacts the
              seller to arrange a viewing. This means buyers never see the seller&apos;s phone number until a
              viewing has been arranged, and sellers never receive unsolicited calls from strangers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. How long we keep your information</h2>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li><strong>Account information</strong> — kept for as long as your account is active. If you delete your account, your information is removed within 30 days.</li>
              <li><strong>Listings</strong> — kept for as long as the listing is active. When you delete a listing, it is removed from the database, and the associated photographs are deleted from Cloudinary.</li>
              <li><strong>Enquiries and messages</strong> — kept for as long as the related listing exists, and for 90 days afterwards in case of a dispute. After that, they are automatically deleted.</li>
              <li><strong>Technical logs</strong> — kept for a maximum of 30 days, then automatically deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Your rights under Eswatini law</h2>
            <p>
              Under Section 22 of the Constitution of the Kingdom of Eswatini (2005) and the Data Protection
              Act, 2022, you have the right to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li><strong>Access</strong> — request a copy of the personal information we hold about you.</li>
              <li><strong>Correction</strong> — ask us to correct any information that is inaccurate or out of date.</li>
              <li><strong>Deletion</strong> — ask us to delete your personal information (for example, by deleting your account through the Profile Settings page).</li>
              <li><strong>Withdrawal of consent</strong> — withdraw your consent to our processing of your information at any time (this may mean we can no longer provide the service to you).</li>
              <li><strong>Lodge a complaint</strong> — with the relevant data protection authority in Eswatini if you believe we have mishandled your information.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us through the Messages feature in the app, or by
              phone on <a href="tel:+26876295648" className="text-sky-400 hover:text-sky-300 underline">+268 7629 5648</a>.
              We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Security</h2>
            <p>
              We take reasonable technical and organisational measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Storing passwords as one-way hashes (bcrypt) so that even we cannot see them.</li>
              <li>Using encrypted (HTTPS) connections for all data in transit.</li>
              <li>Using httpOnly session cookies so they cannot be read by JavaScript.</li>
              <li>Restricting database access to the application only.</li>
              <li>Not collecting sensitive information we do not need (for example, we do not collect ID numbers, banking details, or home addresses).</li>
            </ul>
            <p className="mt-3">
              No system is 100% secure. If we ever become aware of a data breach affecting your personal
              information, we will notify you and the relevant authorities as required by the Data Protection
              Act, 2022.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Children&apos;s privacy</h2>
            <p>
              Eswatini Cars is not directed at children under 18, and we do not knowingly collect personal
              information from anyone under 18. If you believe we have collected information from a person
              under 18, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy
              periodically. If we make a material change to how we handle your information, we will notify you
              through the app or by email before the change takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contacting us</h2>
            <p>If you have any questions about this Privacy Policy, or about your personal information, you can contact us by:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Phone / WhatsApp: <a href="tel:+26876295648" className="text-sky-400 hover:text-sky-300 underline">+268 7629 5648</a></li>
              <li>Through the Messages feature inside the Eswatini Cars app</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-slate-500">
          <p>
            This Privacy Policy is intended to be read together with our <Link href="/terms" className="text-sky-400 hover:text-sky-300 underline">Terms &amp; Conditions</Link>.
            Both documents reflect our commitment to handling your information in line with the Constitution
            of the Kingdom of Eswatini (2005) and the Data Protection Act, 2022.
          </p>
        </div>
      </div>
    </div>
  )
}
