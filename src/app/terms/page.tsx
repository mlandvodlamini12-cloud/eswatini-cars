import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Terms & Conditions — Eswatini Cars',
  description: 'The terms and conditions governing the use of Eswatini Cars, a managed vehicle marketplace connecting buyers and sellers across Eswatini.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a1834] text-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <a href="/" className="text-sky-400 hover:text-sky-300 text-sm mb-6 inline-block">← Back to Eswatini Cars</a>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: 30 October 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-slate-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. About Eswatini Cars</h2>
            <p>
              Eswatini Cars (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;the platform&quot;) is a managed vehicle marketplace that
              connects buyers and sellers of vehicles and vehicle parts across the four regions of Eswatini
              (Hhohho, Manzini, Shiselweni, and Lubombo). The platform is operated from within the Kingdom of
              Eswatini and is available to residents of Eswatini and visitors to the Kingdom.
            </p>
            <p className="mt-3">
              Eswatini Cars is a <strong>connection and listing platform</strong>. We help buyers and sellers
              find each other, we verify listings to reduce the risk of fraud, and we may attend viewings to
              help things go smoothly. We are <strong>not</strong> a party to any sale contract between a buyer
              and a seller, and we do not take ownership or possession of any vehicle listed on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Acceptance of these terms</h2>
            <p>
              By creating an account, browsing listings, posting a listing, sending an enquiry, sending a
              message through the platform, or otherwise using Eswatini Cars in any way, you confirm that:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>You are at least 18 years old.</li>
              <li>You are legally able to enter into a binding agreement in the Kingdom of Eswatini.</li>
              <li>You have read, understood, and agree to be bound by these Terms &amp; Conditions and our <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline">Privacy Policy</a>.</li>
            </ul>
            <p className="mt-3">
              If you do not agree with any part of these terms, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Our role in your transaction</h2>
            <p>
              Eswatini Cars facilitates the initial connection between a buyer and a seller. Specifically, we may:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Publish vehicle listings submitted by sellers.</li>
              <li>Receive enquiries from buyers and forward them to the relevant seller.</li>
              <li>Help arrange a viewing between the buyer, the seller, and (where possible) a representative of our team.</li>
              <li>Attend viewings in person where we are able to do so.</li>
            </ul>
            <p className="mt-3">
              We are <strong>not</strong> a party to the contract of sale between a buyer and a seller. The sale,
              the price, the payment method, and the transfer of ownership are all matters that are agreed
              directly between the buyer and the seller. We do not hold any money on behalf of either party,
              we do not process payments between buyer and seller through the platform, and we do not
              guarantee that any sale will be completed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Listing is free; service-related questions</h2>
            <p>
              Posting a vehicle listing on Eswatini Cars is free of charge — there is no upfront cost to the
              seller. The platform does not process any payments between buyers and sellers, and Eswatini Cars
              does not collect any payment through the platform itself.
            </p>
            <p className="mt-3">
              If you have any questions about how the service works, or about any service-related matters,
              you can contact our team directly through the Messages feature inside the app, or by phone on
              +268 76295648.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your responsibilities as a seller</h2>
            <p>By posting a listing on Eswatini Cars, you confirm that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>You are the legal owner of the vehicle or parts, or you have written authority from the owner to list them for sale.</li>
              <li>The vehicle or parts are not stolen, and there is no outstanding finance that would prevent a lawful sale.</li>
              <li>The information in your listing (price, year, mileage, condition, etc.) is accurate to the best of your knowledge.</li>
              <li>The photographs you upload are of the actual vehicle or parts being sold, and have not been altered to misrepresent the condition.</li>
              <li>You will respond promptly to enquiries forwarded to you by our team.</li>
              <li>You will deal honestly and in good faith with any buyer introduced through the platform.</li>
            </ul>
            <p className="mt-3">
              You are solely responsible for the accuracy of your listing. Eswatini Cars does not independently
              verify the technical condition of any vehicle, and we rely on sellers to be truthful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your responsibilities as a buyer</h2>
            <p>By sending an enquiry or arranging a viewing through Eswatini Cars, you confirm that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>You are genuinely interested in purchasing the vehicle or parts you are enquiring about.</li>
              <li>You will deal honestly and in good faith with the seller.</li>
              <li>You understand that Eswatini Cars does not guarantee the condition, roadworthiness, or legal status of any vehicle, and that you are strongly advised to bring your own qualified mechanic or engineer to inspect any vehicle before finalising a purchase.</li>
              <li>You understand that any sale contract is between you and the seller, and that Eswatini Cars is not a party to that contract.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Verification, not a guarantee</h2>
            <p>
              Eswatini Cars takes steps to verify listings and to reduce the risk of fraud on the platform.
              These steps may include checking the seller&apos;s contact details, reviewing listing content, and
              attending viewings where we are able to do so. However, these steps do not constitute a guarantee
              that any listing is accurate, that any vehicle is roadworthy, or that any seller is trustworthy.
            </p>
            <p className="mt-3">
              You acknowledge that Eswatini Cars shall not be held liable for any faults, defects,
              misrepresentations, or damages arising from a sale conducted between a buyer and a seller, whether
              or not a representative of our team attended the viewing. All sales are final between the buyer
              and the seller.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Prohibited conduct</h2>
            <p>You agree that you will not:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Post a listing for a vehicle or parts that you do not own or do not have authority to sell.</li>
              <li>Post a listing for a stolen vehicle, a vehicle with outstanding finance that would prevent a lawful sale, or a vehicle with a tampered VIN.</li>
              <li>Provide false, misleading, or inaccurate information in a listing or enquiry.</li>
              <li>Use the platform to harass, threaten, or defraud any other user.</li>
              <li>Attempt to bypass the platform&apos;s safety features, or to use the platform for any unlawful purpose under the laws of the Kingdom of Eswatini.</li>
              <li>Attempt to access another user&apos;s account, or share your own account credentials with anyone else.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any listing, suspend any account, and report serious misconduct
              to the relevant authorities, including the Royal Eswatini Police Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. User-submitted media</h2>
            <p>
              When you upload photographs or other media to the platform, you grant Eswatini Cars a
              non-exclusive, royalty-free, worldwide licence to host, display, and process that media for the
              purpose of operating the platform (including displaying the listing, cross-posting new listings
              to our Facebook Page, and generating thumbnails).
            </p>
            <p className="mt-3">
              You confirm that you own the media you upload, or that you have the right to grant this licence,
              and that the media does not infringe the rights of any third party. You remain the owner of your
              media at all times. For more detail on how we handle your media and other personal information,
              please see our <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by the laws of the Kingdom of Eswatini, Eswatini Cars shall not
              be liable for any indirect, incidental, special, or consequential damages arising out of or in
              connection with your use of the platform, including (without limitation) any loss arising from a
              sale between a buyer and a seller, any inaccuracy in a listing, or any conduct of another user.
            </p>
            <p className="mt-3">
              This does not affect any rights you may have under the Consumer Protection Act, 2017, or any
              other applicable law in the Kingdom of Eswatini that cannot be excluded by contract.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to these terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page. We encourage you to review these terms
              periodically. Your continued use of the platform after any change constitutes your acceptance of
              the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Governing law</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of the Kingdom of Eswatini. Any dispute
              arising out of or in connection with these terms, or with your use of the platform, shall be
              resolved in accordance with the laws of the Kingdom of Eswatini, and the courts of Eswatini
              shall have jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contacting us</h2>
            <p>If you have any questions about these Terms &amp; Conditions, you can contact us by:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>Phone / WhatsApp: <a href="tel:+26876295648" className="text-sky-400 hover:text-sky-300 underline">+268 7629 5648</a></li>
              <li>Through the Messages feature inside the Eswatini Cars app</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-slate-500">
          <p>
            Eswatini Cars is a managed vehicle marketplace operating in the Kingdom of Eswatini.
            These Terms &amp; Conditions are intended to be read together with our <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
