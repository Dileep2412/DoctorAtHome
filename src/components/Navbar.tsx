import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/doctor-home-logo.png";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/appointment", label: "Book Appointment" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

    return () => subscription.unsubscribe();

  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = user
    ? [...baseLinks, { to: "/my-appointments", label: "My Appointments" }]
    : baseLinks;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">

      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* Logo */}

        <Link to="/" className="flex items-center gap-2">
          <img
                src={logo}
                alt="Doctor at Home"
                className="h-10 w-auto opacity-90"
              />
          <span className="font-serif text-xl font-bold text-foreground">
            DoctorAtHome
          </span>
        </Link>

        {/* Center Navigation */}

        <nav className="hidden md:flex items-center gap-1">

          {!loading && navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}

        </nav>

        {/* Right Side Buttons */}

        <div className="hidden md:flex items-center gap-3">

          <a
            href="tel:+919203634407"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Phone className="h-4 w-4" />
            Emergency
          </a>

          {!loading && (
            user ? (
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )
          )}

          <Link to="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>

        </div>

        {/* Mobile Menu Button */}

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

      </div>

      {/* Mobile Navigation */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >

            <nav className="flex flex-col p-4 gap-1">

              {!loading && navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!loading && (
                user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Sign In
                    </Button>
                  </Link>
                )
              )}

              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Admin Panel
                </Button>
              </Link>

            </nav>

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Navbar;