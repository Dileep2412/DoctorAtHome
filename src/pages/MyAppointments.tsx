import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MyAppointments(){

 const [user,setUser] = useState<any>(null);
 const [checking,setChecking] = useState(true);

 useEffect(()=>{

  const getUser = async () => {
   const { data:{ user } } = await supabase.auth.getUser();
   setUser(user);
   setChecking(false);
  };

  getUser();

 },[]);

 const { data: appointments } = useQuery({

  queryKey:["myAppointments"],

  enabled: !!user,

  queryFn: async () => {

   const { data, error } = await (supabase as any)
    .from("appointments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at",{ascending:false});

   if(error) throw error;

   return data;

  }

 });

 if(checking){
  return (
   <Layout>
    <div className="container mx-auto p-6 text-center">
     <p>Loading...</p>
    </div>
   </Layout>
  );
 }

 if(!user){
  return (
   <Layout>

    <div className="container mx-auto p-6 text-center">

     <h1 className="text-2xl font-bold mb-4">
      My Appointments
     </h1>

     <p className="text-muted-foreground mb-6">
      Sign in to see your appointments
     </p>

     <Link to="/login">
      <Button>
       Sign In
      </Button>
     </Link>

    </div>

   </Layout>
  );
 }

 return(

  <Layout>

   <div className="container mx-auto p-6">

    <h1 className="text-2xl font-bold mb-6">
     My Appointments
    </h1>

    {appointments?.length === 0 && (
     <p className="text-muted-foreground">
      You have no appointments yet.
     </p>
    )}

    {appointments?.map((a:any)=>(
     <div key={a.id} className="border p-4 mb-3 rounded">

      <p><b>Service:</b> {a.service}</p>

      <p><b>Date:</b> {a.date} {a.time}</p>

      <p><b>Status:</b> {a.status}</p>

      <p><b>Doctor:</b> {a.assigned_doctor}</p>

     </div>
    ))}

   </div>

  </Layout>

 )
}