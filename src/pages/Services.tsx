import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { services } from "@/lib/services-data";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, HeartHandshake, Clock, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const highlights = [
  { icon: HeartHandshake, title: "Certified Professionals", desc: "Verified & experienced doctors" },
  { icon: Clock, title: "Flexible Scheduling", desc: "Book at your convenience" },
  { icon: ShieldCheck, title: "Trusted Care", desc: "100% safe & reliable" },
];

const Services = () => (
  <Layout>
    {/* Hero */}
    <section className="relative bg-gradient-hero py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-5 backdrop-blur-sm">
            What We Offer
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-5 leading-tight">
            Our Services
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Comprehensive homecare services delivered by certified professionals, right at your doorstep.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Highlights */}
    <section className="relative -mt-8 z-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="bg-card rounded-xl p-4 shadow-elevated text-center border border-border/50"
            >
              <h.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm text-foreground">{h.title}</p>
              <p className="text-xs text-muted-foreground">{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Services Grid */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From routine checkups to specialized care — all delivered at your home with utmost professionalism.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="group bg-card rounded-xl p-6 shadow-soft border border-border/40 hover:shadow-elevated hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <s.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.description}</p>
              <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn more <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="py-16 bg-accent/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Why Choose CareNest?</h2>
          <p className="text-muted-foreground">We go beyond just healthcare — we bring comfort, trust, and expertise to your home.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            "Certified & experienced medical professionals",
            "No advance payment — pay after service",
            "Available 7 days a week",
            "Transparent pricing, no hidden charges",
            "Quick response within 2 hours",
            "Personalized care plans for every patient",
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-3 bg-card rounded-lg p-4 shadow-soft border border-border/40"
            >
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-hero rounded-2xl p-10 md:p-14 text-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              Ready to Book a Home Visit?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Schedule an appointment with one of our specialists today and experience healthcare at your comfort.
            </p>
            <Link to="/appointment">
              <Button size="lg" className="font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-8 text-base shadow-elevated">
                Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default Services;
