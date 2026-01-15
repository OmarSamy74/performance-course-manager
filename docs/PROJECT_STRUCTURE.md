# Project Structure

This document describes the organization of the Performance Course Manager project.

## Directory Structure

```
performance-course-manager/
├── docs/                          # Documentation
│   ├── deployment/                # Deployment guides (Railway, Netlify)
│   ├── database/                  # Database setup and initialization
│   ├── troubleshooting/          # Troubleshooting guides
│   └── setup/                    # Setup scripts documentation
│
├── public/                        # Static assets
│   ├── _redirects                # Netlify SPA routing
│   ├── logo.png                  # Application logo
│   └── soccer-bg.jpg             # Background images
│
├── scripts/                       # Automation scripts
│   ├── init-database.ts          # Database initialization script
│   ├── README.md                 # Scripts documentation
│   └── setup/                    # Setup automation scripts
│       ├── setup-railway.sh
│       ├── setup-railway-database.sh
│       ├── setup-railway-database.js
│       └── setup-netlify.sh
│
├── server/                        # Backend Express server
│   ├── middleware/
│   │   └── auth.ts              # Authentication middleware
│   ├── routes/                   # API route handlers
│   │   ├── auth.ts
│   │   ├── students.ts
│   │   ├── leads.ts
│   │   ├── materials.ts
│   │   ├── lessons.ts
│   │   └── ...
│   └── utils/
│       ├── auth.ts              # Auth utilities
│       ├── storage.ts           # File-based storage
│       └── validation.ts       # Input validation
│
├── src/                          # Frontend React application
│   ├── api/
│   │   └── client.ts            # API client
│   ├── components/
│   │   ├── classroom/           # Classroom-specific components
│   │   ├── layout/             # Layout components (Navbar, ProtectedRoute)
│   │   ├── shared/             # Shared/reusable components
│   │   └── ui/                 # UI primitives (Button, Card, Input, Label)
│   ├── context/
│   │   └── AppContext.tsx      # Global state management
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication hook
│   │   └── useApi.ts           # API hook
│   ├── lib/
│   │   ├── utils.ts            # General utilities (cn, generateUUID)
│   │   └── business-utils.ts   # Business logic utilities
│   ├── pages/                   # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── TeacherPage.tsx
│   │   ├── SalesPage.tsx
│   │   └── StudentPage.tsx
│   └── App.tsx                  # Main app with routing
│
├── netlify/                      # Netlify Functions (legacy)
│   └── functions/               # Serverless functions
│
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── index.tsx                    # React entry point
├── index.css                    # Global styles
├── server.ts                    # Express server entry point
├── types.ts                     # TypeScript type definitions
├── utils.ts                     # Root-level utilities (legacy, use src/lib/)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── netlify.toml                # Netlify configuration
└── README.md                   # Main project documentation
```

## Key Files

### Frontend Entry Points
- `index.tsx` - React app entry point
- `src/App.tsx` - Main app component with React Router
- `index.html` - HTML template

### Backend Entry Point
- `server.ts` - Express server entry point

### Configuration Files
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS theme
- `netlify.toml` - Netlify deployment configuration

### Type Definitions
- `types.ts` - Shared TypeScript types

## Component Organization

### Pages (`src/pages/`)
Each page is a separate route:
- `LoginPage.tsx` - Authentication page
- `DashboardPage.tsx` - Role-based redirect page
- `AdminPage.tsx` - Admin dashboard
- `TeacherPage.tsx` - Teacher dashboard
- `SalesPage.tsx` - Sales/CRM dashboard
- `StudentPage.tsx` - Student portal

### Components (`src/components/`)
- `layout/` - Layout components (Navbar, ProtectedRoute)
- `shared/` - Reusable components (Modal, StatCard, SecureMaterialViewer)
- `ui/` - UI primitives (Button, Card, Input, Label)
- `classroom/` - Classroom-specific components

### Utilities (`src/lib/`)
- `utils.ts` - General utilities (cn, generateUUID)
- `business-utils.ts` - Business logic (calculateFinancials, formatCurrency, etc.)

## Data Storage

The application uses file-based JSON storage:
- **Railway**: `/data` directory (persistent volume)
- **Netlify Functions**: `/tmp/data` (ephemeral, not recommended for production)

All data files are stored as JSON:
- `users.json` - User accounts
- `students.json` - Student records
- `leads.json` - CRM leads
- `materials.json` - Course materials
- `lessons.json` - Lessons
- And more...

## Scripts

- `npm run dev` - Start frontend dev server
- `npm run dev:server` - Start backend dev server
- `npm run dev:all` - Run both concurrently
- `npm run build` - Build for production
- `npm run init-db:seed` - Initialize database with seed data
- `npm run setup:railway-db` - Automated Railway database setup

## Documentation

All documentation is organized in `docs/`:
- `deployment/` - Railway and Netlify deployment guides
- `database/` - Database setup and initialization
- `troubleshooting/` - Common issues and fixes
- `setup/` - Setup script documentation
