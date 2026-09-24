# 🏥 DoctorAtHome

![React](https://img.shields.io/badge/Frontend-React-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)
![License](https://img.shields.io/badge/License-Client%20Project-orange)

DoctorAtHome is a **live home healthcare booking platform for Bhopal and Madhya Pradesh**. Patients can book certified doctors, nurses, physiotherapists and elderly care at their doorstep, available 7 days a week, while administrators manage appointments, assign doctors, and generate invoices and prescriptions.

---

# 🌐 Live

🔗 **Website:** https://doctorathome247.com

🔗 **Vercel deployment:** https://doctor-at-home-pi.vercel.app/

---

# 🚀 Features

## 👨‍⚕️ Patient Features

• Book doctor home visits and nursing care  
• Choose healthcare services  
• Share Google Maps location  
• Describe health issues  
• Track appointment status  
• View assigned doctor  
• Secure login and signup  
• View appointment history (My Appointments)  
• Follow-up bookings linked to the original booking  
• Unique booking ID for every appointment  

---

## 🛠 Admin Features

• Secure admin login  
• View all appointment requests  
• Assign doctors to patients  
• Update appointment status  
• Delete appointments  
• Generate invoices and prescriptions as PDF  
• Export admin reports as PDF  
• Search and filter appointment requests  

---

# 🎨 UI & Design

• Premium, responsive design across all pages  
• Theme: Navy `#0A2558`, Teal `#14B8A6`, Ocean Blue `#0EA5E9`  
• Animated interactions with Framer Motion  
• Services page with accordion layout  
• Fully responsive on mobile, tablet and desktop  
• SEO-optimised page titles, meta descriptions and Open Graph tags for Google and social sharing  

---

# 🧑‍💻 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- React Query
- Framer Motion
- Swiper

### Backend (BaaS)
- Supabase

### Database
- PostgreSQL (Supabase)

### Authentication
- Supabase Auth

### PDF Generation
- jsPDF

### Deployment
- Vercel

### UI
- Lucide Icons

---

# 🏗 System Architecture

```
User Browser
      ↓
React Frontend (Vercel)
      ↓
Supabase API
      ↓
PostgreSQL Database
```

Supabase handles:

• authentication  
• database  
• API layer  
• security rules (RLS)  
• file storage  

---

# 🗄 Database Schema

## Appointments Table

| Field | Type |
|------|------|
| id | uuid |
| booking_code | text (unique, auto-generated) |
| patient_name | text |
| phone | text |
| service | text |
| date | date |
| time | text |
| address | text |
| google_maps_link | text |
| problem | text |
| notes | text |
| status | text |
| assigned_doctor | text |
| is_follow_up | boolean |
| parent_booking_id | uuid (references appointments) |
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

## Invoices Table

| Field | Type |
|------|------|
| id | uuid |
| booking_id | uuid (references appointments) |
| invoice_number | text |
| items | jsonb |
| total_amount | numeric |
| pdf_url | text |
| created_at | timestamp |

---

## Prescriptions Table

| Field | Type |
|------|------|
| id | uuid |
| booking_id | uuid (references appointments) |
| prescription_number | text |
| patient_name | text |
| age_sex | text |
| address | text |
| prescription_date | date |
| chief_complaints | text |
| ... | additional clinical fields |

---

## User Roles

| Field | Type |
|------|------|
| id | uuid |
| user_id | uuid |
| role | enum (admin, user) |

---

## Other Tables

| Table | Purpose |
|------|------|
| patient_profiles | Patient profile details |
| patient_sessions | Patient login sessions |
| otp_requests | OTP verification requests |
| feedback | Patient feedback |
| contact_messages | Messages from the contact form |

---

# 🔢 Booking, Invoice & Prescription Numbering

Every booking gets a unique, sequential ID generated **by the database** (not the frontend), so duplicates are not possible.

| Document | Format | Example |
|------|------|------|
| Booking ID | `DAH-YYYYMM-NNNNN` | `DAH-202609-00069` |
| Invoice number | `INV-YYYYMM-NNNNN` | `INV-202609-00069` |
| Prescription number | `RX-YYYYMM-NNNNN` | `RX-202609-00069` |

• Invoice and prescription numbers are derived from the booking ID, so all three documents match  
• If a booking has more than one invoice or prescription, a suffix is added (`-2`, `-3`)  
• Numbers are assigned by database triggers, and the PDF shows the number stored in the database  

---

# 🔐 Authentication

Authentication is handled using **Supabase Auth**.

Supported authentication methods:

• Email signup  
• Email login  

Each user is assigned a **unique user_id** which is used to track appointments. Admin access is controlled through the `user_roles` table.

---

# 📅 Appointment Flow

```
Patient books appointment
        ↓
Booking ID generated and appointment stored in Supabase
        ↓
Admin reviews request
        ↓
Admin assigns doctor
        ↓
Doctor visits patient
        ↓
Invoice and prescription generated as PDF
```

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

> ⚠️ Never commit your `.env` file, and never put the Supabase `service_role` key in the frontend.

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

# 👨‍💻 Authors

**Dileep Parihar**  
**Shivam Kumar**

---

# 📄 License

This project was developed for client use.
