import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, CalendarDays, Stethoscope, MapPin } from "lucide-react";
import { services } from "@/lib/services-data";

const schema = z.object({
  patient_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  service: z.string().min(1, "Select a service"),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a time"),
  address: z.string().trim().min(5, "Address is required").max(500),
  google_maps_link: z.string().trim().min(5, "Google Maps location link is required").max(500)
});

type FormData = z.infer<typeof schema>;

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
];

const Appointment = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_name: "", phone: "", service: "",
      date: "", time: "", address: "", google_maps_link: "",
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem("appointment_form");

    if (savedData) {
      const parsed = JSON.parse(savedData);

      (Object.keys(parsed) as (keyof FormData)[]).forEach((key) => {
        form.setValue(key, parsed[key]);
      });

      localStorage.removeItem("appointment_form");
    }
  }, [form]);

  const detectLocation = () => {
  if (!navigator.geolocation) {
    toast({
      title: "Location not supported",
      description: "Your browser does not support location detection"
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const googleLink = `https://www.google.com/maps?q=${lat},${lng}`;

      form.setValue("google_maps_link", googleLink);

      toast({
        title: "Location detected",
        description: "You can still edit it if needed"
      });
    },
    () => {
      toast({
        title: "Location access denied",
        description: "Please allow location access or paste manually"
      });
    }
  );
};

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem("appointment_form", JSON.stringify(data));

      localStorage.setItem("redirect_after_login", "/appointment");

      toast({
        title: "Login required",
        description: "Please sign in to book an appointment"
      });

      setLoading(false); // ✅ FIX

      navigate("/login");
      return;
    }

  //@ts-ignore
  const { error } = await supabase.from("appointments").insert([
  {
    user_id: user?.id,
    patient_name: data.patient_name,
    phone: data.phone,
    service: data.service,
    date: data.date,
    time: data.time,
    address: data.address,
    google_maps_link: data.google_maps_link
  }
  ]);
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit. Please try again." });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-bold mb-4">Request Received!</h2>
            <p className="text-muted-foreground">
              Your appointment request has been received. Our team will assign a doctor and contact you shortly.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Book an Appointment</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Fill in the details below and our team will get back to you promptly.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 shadow-card"
          >
            <div className="flex items-center gap-3 mb-8">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold">Appointment Details</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="patient_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl><Input className="placeholder:text-muted-foreground/40" placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input className="placeholder:text-muted-foreground/40" placeholder="+91 1234 567 890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="service" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Service</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="data-[placeholder]:text-muted-foreground/40"><SelectValue placeholder="Choose a service" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.title} value={s.title}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="time" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="data-[placeholder]:text-muted-foreground/40"><SelectValue placeholder="Select time" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Textarea className="placeholder:text-muted-foreground/40" placeholder="Your full address for the home visit" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField
                  control={form.control}
                  name="google_maps_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Share Your Location
                      </FormLabel>

                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            className="placeholder:text-muted-foreground/40"
                            placeholder="Paste Google Maps link or use auto detect"
                            {...field}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={detectLocation}
                        >
                          Detect
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Click "Detect" to auto fill your location or paste a Google Maps link manually.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Appointment Request"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Appointment;
