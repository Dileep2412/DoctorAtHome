import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0A2558] via-[#0e3272] to-[#14B8A6] py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.18),transparent_60%)]" />
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] to-[#38bdf8]">Policy</span>
          </h1>
          <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-14 md:py-20 bg-[#f8fafc]">
        <div className="w-full max-w-[860px] mx-auto px-6 md:px-8 space-y-10 text-slate-600 leading-relaxed text-sm md:text-base">

          <div>
            <p>
              DoctorAtHome ("we", "our", "us") operates the doctorathome247.com website and related booking
              services in Bhopal and Madhya Pradesh. This Privacy Policy explains how we collect, use, and
              protect your information when you use our website, book an appointment, or communicate with us,
              including via WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">1. Information We Collect</h2>
            <p className="mb-2">When you book an appointment or contact us, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your name, phone number, and home address</li>
              <li>Appointment details, service requested, and preferred timing</li>
              <li>Location shared for home visits (if provided)</li>
              <li>Communication records, including WhatsApp messages related to your booking, prescriptions, and invoices</li>
              <li>Payment-related information where applicable</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To confirm, manage, and fulfil your booking for doctor visits, nursing care, physiotherapy, or diagnostics</li>
              <li>To send booking confirmations, OTPs for verification, prescriptions, and invoices via WhatsApp, SMS, or email</li>
              <li>To coordinate our medical staff for home visits at your address</li>
              <li>To respond to your queries and provide customer support</li>
              <li>To improve our services and website experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">3. WhatsApp & Messaging Communications</h2>
            <p>
              By providing your phone number and booking a service, you consent to receive booking confirmations,
              appointment reminders, OTPs, prescription documents, and invoices from DoctorAtHome via WhatsApp
              and/or SMS. These messages relate directly to the service you have requested.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share necessary details with our doctors, nurses,
              and healthcare staff solely to fulfil your booked service, and with service providers (such as
              messaging or hosting platforms) that help us operate our website and communications.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">5. Data Security</h2>
            <p>
              We take reasonable technical and organisational measures to protect your personal information from
              unauthorised access, alteration, or disclosure.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">6. Your Choices</h2>
            <p>
              You may contact us at any time to request access to, correction of, or deletion of your personal
              information, or to opt out of non-essential communications.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0A2558] mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <p className="mt-3">
              <strong className="text-[#0A2558]">DoctorAtHome</strong><br />
              Phone: <a href="tel:+919203634407" className="text-[#14B8A6] font-semibold">+91 9203634407</a><br />
              Email: <a href="mailto:doctorathome@gmail.com" className="text-[#14B8A6] font-semibold">doctorathome@gmail.com</a>
            </p>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;