# 🏥 DoctorAtHome

![React](https://img.shields.io/badge/Frontend-React-blue)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)
![License](https://img.shields.io/badge/License-Client%20Project-orange)

DoctorAtHome is a **home healthcare booking platform** that allows patients to request doctor home visits while administrators manage appointments and assign doctors.

The platform simplifies healthcare access by allowing patients to **book doctor visits directly from home**.

---

# 🌐 Live Demo

🔗 **Frontend:**  
https://doctor-at-home-pi.vercel.app/

---

# 🚀 Features

## 👨‍⚕️ Patient Features

• Book doctor home visits  
• Choose healthcare services  
• Select preferred date and time  
• Share Google Maps location  
• Describe health issues  
• Track appointment status  
• View assigned doctor  
• Secure login and signup  
• View appointment history  

---

## 🛠 Admin Features

• Secure admin login  
• View all appointment requests  
• Assign doctors to patients  
• Update appointment status  
• Delete appointments  
• Share appointment details via WhatsApp  
• Search and filter appointment requests  

---

# 🧑‍💻 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- React Query
- Framer Motion

### Backend (BaaS)
- Supabase

### Database
- PostgreSQL (Supabase)

### Authentication
- Supabase Auth

### Deployment
- Vercel

### UI
- Lucide Icons

---

# 🏗 System Architecture

User Browser
↓
React Frontend (Vercel)
↓
Supabase API
↓
PostgreSQL Database


Supabase handles:

• authentication  
• database  
• API layer  
• security rules  

---

# 🗄 Database Schema

# Appointments Table

| Field | Type |
|------|------|
| id | uuid |
| patient_name | text |
| phone | text |
| email | text |
| service | text |
| date | date |
| time | text |
| address | text |
| google_maps_link | text |
| problem | text |
| status | text |
| assigned_doctor | text |
| user_id | uuid |
| created_at | timestamp |

---

## Doctors Table

| Field | Type |
|------|------|
| id | uuid |
| name | text |
| specialization | text |
| experience | number |
| bio | text |
| image | text |
| created_at | timestamp |

---

## User Roles

| Field | Type |
|------|------|
| id | uuid |
| user_id | uuid |
| role | enum (admin, user) |

---

# 🔐 Authentication

Authentication is handled using **Supabase Auth**.

Supported authentication methods:

• Email signup  
• Email login  

Each user is assigned a **unique user_id** which is used to track appointments.

---

# 📅 Appointment Flow

Patient books appointment
↓
Appointment stored in Supabase
↓
Admin reviews request
↓
Admin assigns doctor
↓
Doctor receives appointment details
↓
Doctor visits patient


---

# 📱 WhatsApp Sharing

Admin can share appointment details with doctors using WhatsApp.

Shared information includes:

• patient name  
• phone number  
• service requested  
• appointment date  
• appointment time  
• patient address  
• Google Maps location  
• health issue description  

---

# 🧑‍💻 Local Development

Clone repository
```bash
git clone https://github.com/shivamsrc/DoctorAtHome.git
```
Go to the project directory
```bash
cd DoctorAtHome
```

Install dependencies
```bash
npm install
```

Create a `.env` file in the root directory and add:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Run the development server
```bash
npm run dev
```

Open the app in your browser
```bash
http://localhost:5173
```


---

# 🚀 Deployment

The project is deployed using **Vercel**.

Deployment steps:

1. Push project to GitHub
2. Import project into Vercel
3. Add environment variables
4. Deploy

---

# 🔮 Future Improvements

• Doctor dashboard  
• SMS notifications  
• Online payments  
• Doctor availability scheduling  
• Multi-city support  
• Real-time appointment updates  

---

# 👨‍💻 Author


**Dileep Parihar**
**Shivam Kumar**

---

# 📄 License

This project was developed for client use.
