import { Link } from "react-router-dom";
import { Heart, Phone, Mail, MapPin } from "lucide-react";
import logo from "../assets/doctor-home-logo.png";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
                src={logo}
                alt="Doctor at Home"
                className="h-10 w-auto"
              />
            <span className="font-serif text-xl font-bold">DoctorAtHome</span>
          </div>
          <p className="text-sm opacity-70">
            Professional homecare services delivered with compassion. Your health, our priority.
          </p>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <Link to="/services" className="hover:opacity-100 transition-opacity">Services</Link>
            <Link to="/doctors" className="hover:opacity-100 transition-opacity">Our Doctors</Link>
            <Link to="/appointment" className="hover:opacity-100 transition-opacity">Book Appointment</Link>
            <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link>
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4">Services</h4>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <span>Doctor Home Visit</span>
            <span>Nursing Care</span>
            <span>Injection / IV Drip</span>
            <span>Elderly Care</span>
            <span>Medicine Delivery</span>
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold mb-4">Contact Info</h4>
          <div className="flex flex-col gap-3 text-sm opacity-70">
            <a href="tel:+919203634407" className="flex items-center gap-2 hover:opacity-100">
              <Phone className="h-4 w-4" /> +91 9203634407
            </a>
            <a href="mailto:doctorathome@gmail.com" className="flex items-center gap-2 hover:opacity-100">
              <Mail className="h-4 w-4" /> doctorathome@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Shop no. 1, Chandan Nagar, Bhopal
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-50">
        © {new Date().getFullYear()} DoctorAtHome. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
