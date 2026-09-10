# 👞 Luxe Sole — Luxury Footwear E-Commerce

A modern, full-stack e-commerce platform for handcrafted luxury footwear, built with Next.js 14, TypeScript, Prisma, and Supabase.

![Luxe Sole](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

---

## 🌟 Features

### 🛍️ Customer Storefront
- **Homepage** with dynamic hero carousel (auto-slides every 3s)
- **Product catalog** with search, filtering, and categories
- **Product detail pages** with image magnifier and size selector
- **Shopping cart** with localStorage persistence
- **Guest checkout** and registered user checkout
- **Order confirmation** with WhatsApp integration
- **Responsive design** — mobile-first, works on all devices
- **Premium theme** — beige, brown, espresso, and gold color palette

### 🔐 Admin Dashboard
- **Secure authentication** with NextAuth (role-based)
- **Product management** (CRUD, image upload, sizes, stock)
- **Category management** (dynamic — updates navbar, sidebar, footer)
- **Hero section management** (editable slides + background image)
- **Order management** (status updates, customer details)
- **Sales reports** with PDF export
- **Settings** (delivery charge, tax rate, WhatsApp number)

### ⚡ Performance
- **85+ Lighthouse score** on mobile, **100 on desktop**
- **Image optimization** (WebP/AVIF, lazy loading, responsive)
- **Server-side rendering** (SSR) with Next.js App Router
- **API caching** with proper Cache-Control headers
- **Code splitting** and dynamic imports
- **Database indexing** (34+ indexes for fast queries)

### 🔒 Security
- **Row Level Security (RLS)** enabled on all Supabase tables
- **Optimized RLS policies** (no "Always True" warnings)
- **bcrypt password hashing**
- **Protected admin routes** via middleware
- **Zod validation** on all inputs

---

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 5.22 |
| **Authentication** | NextAuth v4 |
| **Image Storage** | Cloudinary |
| **Charts** | Recharts |
| **PDF Generation** | PDFKit |
| **Icons** | Heroicons |
| **Deployment** | Vercel |

---

## 📁 Project Structure
luxe-sole/
├── prisma/
│ ├── schema.prisma # Database schema
│ ├── seed.ts # Default data seeding
│ └── migrations/ # Database migrations
├── public/
│ ├── favicon.ico
│ ├── robots.txt
│ └── sitemap.xml
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── admin/ # Admin dashboard pages
│ │ ├── api/ # API routes
│ │ ├── cart/ # Cart page
│ │ ├── checkout/ # Checkout page
│ │ ├── login/ # Login page
│ │ ├── products/ # Product pages
│ │ ├── signup/ # Signup page
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Homepage
│ ├── components/
│ │ ├── admin/ # Admin components
│ │ ├── cart/ # Cart components
│ │ ├── checkout/ # Checkout components
│ │ ├── icons/ # Custom SVG icons
│ │ ├── layout/ # Navbar, Footer, SidePanel
│ │ ├── product/ # Product components
│ │ └── ui/ # Reusable UI components
│ ├── context/ # React contexts
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Utilities (prisma, auth, seo, etc.)
│ ├── services/ # Business logic
│ ├── styles/ # Global CSS
│ └── types/ # TypeScript types
├── .env # Environment variables
├── .env.example # Example env file
├── next.config.js # Next.js configuration
├── tailwind.config.ts # Tailwind configuration
├── tsconfig.json # TypeScript configuration
└── package.json


---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18.18.0 or higher
- **npm** or **yarn**
- **PostgreSQL database** (Supabase account recommended)
- **Cloudinary account** (for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/luxe-sole.git
cd luxe-sole

npm install

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="+923001234567"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed default data (hero slides, settings)
npx prisma db seed

npm run dev

Open http://localhost:3000 in your browser.

🎨 Theme Colors
Color	Hex	Usage
Beige	#F5E6D3	Background
Brown	#6B4226	Primary text, accents
Espresso	#3E2723	Dark elements, footer
Gold	#C9A227	CTA buttons, highlights
📊 Performance Optimizations
✅ Image optimization (WebP/AVIF, responsive sizes)

✅ Font optimization (next/font with preload)

✅ Code splitting (dynamic imports)

✅ API caching (Cache-Control headers)

✅ Database indexing (34+ indexes)

✅ RLS policies optimized with (select auth.uid())

✅ CDN delivery via Vercel Edge Network

🔒 Security Features
✅ Row Level Security (RLS) on all Supabase tables

✅ Role-based access control (customer/admin)

✅ Password hashing with bcrypt

✅ Input validation with Zod

✅ Protected API routes with session checks

✅ Environment variables for secrets

✅ CORS and CSP headers