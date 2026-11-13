# Circuit Serve Technologies — Official Startup Website

> **"Engineering the Future of Hardware — From Concept to Silicon"**  
> Concept to Hardware • Electronics Engineering Solutions  
> Headquarters: **Surampalem, Andhra Pradesh, India**  
> Phone / WhatsApp: **+91 8985043496**  
> Email: **circuitservetechnologies@gmail.com**  
> Instagram: [@circuitserve_technologies](https://instagram.com/circuitserve_technologies)

---

## ⚡ Overview

This is the production-ready official website and portfolio platform for **Circuit Serve Technologies (CST)**, engineered with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**.

It is fully optimized for one-click deployment on **Vercel** with a zero-maintenance database hosted on **Supabase**.

### 🌟 Key Features
- **Official Brand Aesthetics**: Modern dark hardware & semiconductor design with responsive layout, custom circuit loop SVG branding, and smooth animations.
- **Complete Startup Sections**:
  - **Hero**: Core value proposition, tagline, and quick capability tags.
  - **About Circuit Serve Technologies**: Comprehensive background, mission statement (*"From Concept to Silicon"*), and technological focus.
  - **Core Capabilities (6 detailed cards)**:
    1. PCB Design & Layout (High-speed, multi-layer & HDI, SI/PI analysis, DFM/DFA/DFT)
    2. Embedded Systems (RTOS, Bare-Metal, ARM Cortex, RISC-V, low-power optimization)
    3. IoT Product Development (Connected devices, Wi-Fi, BLE, LoRaWAN, Cellular edge)
    4. Rapid Hardware Prototyping (Quick-turn assembly, bench validation, fast iterations)
    5. Testing & Validation (Stress testing, environmental checks, pre-compliance)
    6. Manufacturing Support (Prototype to mass production, BOM optimization, EMS tech transfer)
  - **Who We Serve**: Universities & Research Labs, Tech Startups/SMEs, Government & Defence R&D, and Global Hardware Partners.
  - **Why Choose Circuit Serve?**: 6 value pillars detailing our competitive advantages.
  - **Semiconductor Roadmap**: 3-Phase progression from board-level mastery to ASIC RTL-to-GDSII silicon design.
  - **Projects Showcase (`/projects`)**: Filterable, searchable portfolio. Strictly zero demo projects as requested; ready for real project uploads via the Admin Backend.
  - **Direct Contact Section**: Surampalem location, direct phone call, WhatsApp messaging, official email, Instagram links, and an interactive contact inquiry form.
  - **Admin CMS Portal (`/admin`)**: Secure portal with PIN authentication to create, edit, delete, and feature projects, plus inspect customer inquiries.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The website has a resilient built-in storage layer. Even before you configure Supabase, you can immediately test the site, access the Admin Portal (`/admin`), and upload projects right in your browser!

---

## 🗄️ Supabase Database Setup

To store your projects and inquiries persistently in the cloud:

1. Create a free account and new project on [Supabase](https://supabase.com).
2. In your Supabase Dashboard, go to **SQL Editor** > **New Query**.
3. Open the file `supabase-schema.sql` included in this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
4. In Supabase, go to **Project Settings** > **API**.
5. Copy your **Project URL** and **anon public key**.
6. Create or update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_ADMIN_PIN=CST@2026
   ```

---

## 🌐 Deploying to Vercel

1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Circuit Serve Technologies website"
   git remote add origin https://github.com/your-username/circuit-serve-technologies.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - `NEXT_PUBLIC_ADMIN_PIN` = your chosen Admin PIN (e.g., `CST@2026`)
5. Click **Deploy**. Your site will be live worldwide in less than 60 seconds!

---

## 🔐 Admin Portal (`/admin`)

- **URL**: `https://your-domain.vercel.app/admin` (or `http://localhost:3000/admin` locally)
- **Default PIN**: `CST@2026` *(You can change this in your `.env.local` or Vercel Environment Variables via `NEXT_PUBLIC_ADMIN_PIN`)*
- **Capabilities**:
  - Upload hardware projects with images, specifications, technologies, and client details.
  - Edit or delete projects with immediate sync.
  - View client inquiries and messages sent via the contact form.
  - Review Supabase integration status and deployment guides.

---

## 📄 License & Credits
© Circuit Serve Technologies, Surampalem, Andhra Pradesh. All rights reserved.
