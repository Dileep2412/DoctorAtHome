import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, MessageCircle, Clock, Shield } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 9203634407",
    href: "tel:+919203634407",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/919203634407",
    color: "bg-accent text-accent-foreground"
  },
  {
    icon: Mail,
    label: "Email",
    value: "doctorathome@gmail.com",
    href: "mailto:doctorathome@gmail.com",
    color: "bg-primary/10 text-primary"
  },
  {
  icon: MapPin,
  label: "Address",
  value: "Doctor at Home – Bhopal, Patel Nagar, Bhopal, Madhya Pradesh",
  href: "https://maps.app.goo.gl/wjN7cM2s2jqfngTx9",
  color: "bg-accent text-accent-foreground"
}
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};

const Contact = () => {

  return (
    <Layout>

      {/* Hero */}

      <section className="relative bg-gradient-hero py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 text-center">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-5">
              We're Here For You
            </span>

            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-5">
              Contact Us
            </h1>

            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
              Reach out to our team through any of the channels below and we’ll assist you as soon as possible.
            </p>

          </motion.div>

        </div>
      </section>


      {/* Trust badges */}

      <section className="relative -mt-8 z-20">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">

            {[
              { icon: Clock, title: "Quick Response", desc: "Within 2 hours" },
              { icon: Shield, title: "100% Confidential", desc: "Your privacy matters" },
              { icon: Phone, title: "24/7 Support", desc: "Always available" }
            ].map((badge, i) => (

              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-elevated text-center border border-border/50"
              >
                <badge.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </motion.div>

            ))}

          </div>

        </div>
      </section>


      {/* Contact options */}

      <section className="py-16">

        <div className="container mx-auto px-4 max-w-4xl">

          <h2 className="font-serif text-3xl font-bold text-center mb-10">
            Get in Touch
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {contactInfo.map((item, i) => (

              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group bg-card rounded-xl p-6 shadow-soft border border-border hover:shadow-card transition"
              >

                <div className="flex items-center gap-4">

                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-5 w-5" />
                  </div>

                  <div>

                    <p className="font-semibold">{item.label}</p>

                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-muted-foreground text-sm hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {item.value}
                      </p>
                    )}

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>


      {/* Map */}

      <section className="pb-20">

        <div className="container mx-auto px-4 max-w-4xl">

          <div className="rounded-xl overflow-hidden shadow-card border border-border">

            <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3664.555422618888!2d77.42349709999999!3d23.2955985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c69347fe59ebd%3A0x3d5533f81e6a9987!2sDoctor_at_Home%20_Bhopal!5e0!3m2!1sen!2sin!4v1773353258744!5m2!1sen!2sin"
  width="100%"
  height="350"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Doctor at Home Bhopal Location"
/>

          </div>

        </div>

      </section>

    </Layout>
  );
};

export default Contact;