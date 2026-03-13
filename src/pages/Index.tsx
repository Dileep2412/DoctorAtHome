import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Home, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-homecare.jpg";
import { services } from "@/lib/services-data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const testimonials = [
  {
    name: "Rohit Sharma",
    text: "CareNest arranged a doctor visit for my father at home. The service was very professional and the doctor explained everything clearly. It saved us a lot of time and hassle.",
    rating: 5
  },
  {
    name: "Anjali Verma",
    text: "The physiotherapy sessions at home were extremely helpful after my knee surgery. The therapist was punctual, patient, and very knowledgeable. Highly recommended service.",
    rating: 5
  },
  {
    name: "Priya Mehta",
    text: "Booking a home visit for my mother was very easy. The doctor was kind and attentive, and the entire process from appointment to treatment was smooth.",
    rating: 5
  }
];

const whyUs = [
  { icon: Home, title: "Care at Your Doorstep", desc: "No need to travel. Our doctors come to you for a comfortable healing experience." },
  { icon: Shield, title: "Certified Professionals", desc: "All our doctors are board-certified with years of homecare experience." },
  { icon: Clock, title: "24/7 Availability", desc: "Round-the-clock support. Emergency services available anytime you need them." },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Caring nurse visiting patient at home" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.h1 variants={fadeUp} custom={0} className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Professional Healthcare,{" "}
              <span className="text-accent">Right at Home</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg">
              CareNest brings certified doctors, nurses, and therapists to your doorstep. Experience compassionate, personalized homecare services.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4">
              <Link to="/appointment">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+919203634407">
  <Button
    size="lg"
    variant="outline"
    className="border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors opacity-100"
  >
    <Phone className="mr-2 h-4 w-4" />
    Call Now
  </Button>
</a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CareNest?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-xl mx-auto">
              We combine medical expertise with genuine compassion to deliver healthcare that feels like family.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card rounded-xl p-8 shadow-card text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive homecare services tailored to your needs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 4).map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-shadow group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{s.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline" size="lg">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Patients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card rounded-xl p-8 shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 italic">"{t.text}"</p>
                <p className="font-semibold text-sm">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-gradient-hero py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-2">Need Urgent Care?</h3>
            <p className="text-primary-foreground/80">Our emergency homecare team is available 24/7. Call us now.</p>
          </div>
          <div className="flex gap-4">
            <a href="tel:+919203634407">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                <Phone className="mr-2 h-4 w-4" /> Call Emergency
              </Button>
            </a>
            <a href="https://wa.me/919203634407" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10">
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
