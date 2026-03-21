import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {

 const navigate = useNavigate();

 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");
 const [loading,setLoading] = useState(false);

   useEffect(() => {
      const checkSession = async () => {
         const { data } = await supabase.auth.getSession();

         if (data.session) {
            const redirect = localStorage.getItem("redirect_after_login");

            if (redirect) {
      navigate(redirect);

      setTimeout(() => {
         localStorage.removeItem("redirect_after_login");
         }, 1000);
         } else {
               navigate("/my-appointments");
               }
            }
         };

      checkSession();
   }, [navigate]);

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

  const redirect = localStorage.getItem("redirect_after_login");

   if (redirect) {
      localStorage.removeItem("redirect_after_login");
      navigate(redirect);
   } else {
      navigate("/my-appointments");
   }
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
  const redirect = localStorage.getItem("redirect_after_login");

   if (redirect) {
      localStorage.removeItem("redirect_after_login");
      navigate(redirect);
   } else {
      navigate("/my-appointments");
   }
   };

 const signInWithGoogle = async () => {

  const { error } = await supabase.auth.signInWithOAuth({
   provider: "google",
   options:{
    redirectTo: `${window.location.origin}/login`
   }
  });

  if(error){
   alert(error.message);
  }

 };

 return(

  <div className="min-h-screen bg-gray-100 flex items-center justify-center">

   <div className="bg-white shadow-xl rounded-2xl p-8 w-[360px]">

    <h1 className="text-3xl font-bold text-center mb-2">
     Welcome Back
    </h1>

    <p className="text-gray-500 text-center mb-6">
     Login to your account
    </p>

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

    <div className="flex items-center my-6">
     <div className="flex-grow border-t"></div>
     <span className="mx-3 text-sm text-gray-400">OR</span>
     <div className="flex-grow border-t"></div>
    </div>

    <Button
 className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium"
 onClick={signInWithGoogle}
>
 <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 48 48"
  width="20"
  height="20"
 >
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.35 1.53 7.81 2.82l5.76-5.76C34.14 3.44 29.46 1.5 24 1.5 14.73 1.5 6.79 6.98 3.29 14.44l6.88 5.34C12.06 13.39 17.57 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.72H24v9h12.63c-.54 2.9-2.18 5.36-4.66 7.02l7.19 5.59C43.74 37.26 46.5 31.37 46.5 24.5z"/>
  <path fill="#FBBC05" d="M10.17 28.28a14.5 14.5 0 010-8.56l-6.88-5.34A23.94 23.94 0 000 24c0 3.85.92 7.5 2.55 10.62l7.62-6.34z"/>
  <path fill="#34A853" d="M24 46.5c6.48 0 11.92-2.14 15.89-5.82l-7.19-5.59c-2 1.35-4.56 2.16-8.7 2.16-6.43 0-11.94-3.89-13.83-9.28l-7.62 6.34C6.79 41.02 14.73 46.5 24 46.5z"/>
 </svg>

 Continue with Google
</Button>

   </div>

  </div>

 )
}