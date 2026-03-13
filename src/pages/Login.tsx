import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login(){

 const navigate = useNavigate();

 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");
 const [loading,setLoading] = useState(false);

 const login = async ()=>{

  if(!email || !password){
   alert("Please enter email and password");
   return;
  }

  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
   email,
   password
  });

  setLoading(false);

  if(error){
   alert(error.message);
   return;
  }

  navigate("/my-appointments");
 };

 const signup = async ()=>{

  if(!email || !password){
   alert("Please enter email and password");
   return;
  }

  setLoading(true);

  const { error } = await supabase.auth.signUp({
   email,
   password
  });

  setLoading(false);

  if(error){
   alert(error.message);
   return;
  }

  alert("Account created successfully!");

  navigate("/my-appointments");
 };

 return(

  <div className="min-h-screen flex items-center justify-center">

   <div className="w-80">

    <h1 className="text-2xl font-bold mb-6 text-center">
     Sign In
    </h1>

    <Input
     placeholder="Email"
     value={email}
     onChange={(e)=>setEmail(e.target.value)}
    />

    <Input
     className="mt-3"
     type="password"
     placeholder="Password"
     value={password}
     onChange={(e)=>setPassword(e.target.value)}
    />

    <Button
     className="mt-4 w-full"
     onClick={login}
     disabled={loading}
    >
     {loading ? "Signing in..." : "Login"}
    </Button>

    <Button
     className="mt-2 w-full"
     variant="outline"
     onClick={signup}
     disabled={loading}
    >
     {loading ? "Creating..." : "Sign Up"}
    </Button>

   </div>

  </div>

 )
}