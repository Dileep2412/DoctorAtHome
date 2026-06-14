import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "../assets/doctor-home-logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#0A2558] text-white">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white rounded-xl p-1.5">
                <img src={logo} alt="DoctorAtHome" className="h-10 w-auto" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-[#14B8A6] bg-clip-text text-transparent">
                DoctorAtHome
              </span>
            </div>
            <p className="text-sm text-white/60 leading-7 max-w-[260px]">
              Bringing trusted healthcare services to your doorstep. Our experienced doctors and caregivers ensure quality treatment, comfort, and peace of mind.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="https://www.facebook.com/people/Doctor-At-Home-Bhopal/61589456907901/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Facebook size={16} />
              </a>
              <a href="https://www.instagram.com/doctor_at_home_bhopal/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Instagram size={16} />
              </a>
              <a href="https://www.linkedin.com/company/doctorathome-bhopal?trk=feed-detail_main-feed-card_feed-actor-name" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-500 flex items-center justify-center transition-all duration-200 hover:scale-110">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#14B8A6] mb-5">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/doctors", label: "Our Doctors" },
                { to: "/appointment", label: "Book Appointment" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 w-fit">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#14B8A6] mb-5">Services</h4>
            <div className="flex flex-col gap-3">
              {[
                "Doctor Home Visit",
                "Elder Care",
                "Nursing Care",
                "Post Operative Care",
                "ECG & X-Ray at Home",
                "Physiotherapy Care",
                "Lab Tests at Home",
                "Medicine Delivery",
              ].map((service) => (
                <span key={service} className="text-sm text-white/60">{service}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#14B8A6] mb-5">Contact Info</h4>
            <div className="flex flex-col gap-4">

              <a href="tel:+919203634407" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#14B8A6]/30 flex items-center justify-center transition-colors flex-shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                +91 9203634407
              </a>

              <a href="mailto:doctorathome@gmail.com" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#14B8A6]/30 flex items-center justify-center transition-colors flex-shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                doctorathome@gmail.com
              </a>

              {/* Address 1 */}
              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>
                  Shop no. 1, Chandan Nagar,<br />
                  Bhopal, Madhya Pradesh
                </span>
              </div>

              {/* Address 2 */}
              <div className="flex items-start gap-3 text-sm text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>
                  MP Nagar,<br />
                  Bhopal, Madhya Pradesh
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 py-5 text-center text-xs text-white/40">
          © {new Date().getFullYear()} DoctorAtHome. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;