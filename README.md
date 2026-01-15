# ⚽ Performance Course Manager

A comprehensive course management system for football academies, built with React, Express, and file-based storage.

<div align="center">
  <img src="public/logo.png" alt="Logo" width="200" />
</div>

## Features

- 👥 **Student Management** - Track students, payments, and progress
- 📚 **Course Materials** - Upload and manage course content
- 🎓 **Classroom** - Interactive lessons and assignments
- 💼 **CRM System** - Manage leads and conversions
- 📊 **Analytics** - Financial tracking and reporting
- 🔐 **Role-Based Access** - Admin, Teacher, Sales, and Student roles
- 🎨 **Modern UI** - Red/black/white theme with smooth animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (primary, Railway/Netlify), File-based JSON (fallback)
- **Deployment**: Railway (primary), Netlify (alternative)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Initialize database (optional - auto-initializes in production)
npm run init-db:seed

# Run development servers
npm run dev:all
```

Access the app:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Project Structure

```
src/
├── pages/          # Page components (Login, Dashboard, Admin, etc.)
├── components/     # Reusable components
│   ├── layout/    # Navbar, ProtectedRoute
│   ├── shared/    # Modal, StatCard, etc.
│   └── ui/        # UI primitives (Button, Card, Input)
├── context/       # AppContext for state management
├── hooks/         # Custom hooks (useAuth, useApi)
├── lib/           # Utilities (utils, business-utils)
└── api/           # API client

server/
├── routes/        # API route handlers
├── middleware/    # Auth middleware
└── utils/         # Server utilities

docs/              # Documentation
├── deployment/    # Deployment guides
├── database/      # Database setup
└── troubleshooting/ # Troubleshooting guides
```

For detailed structure, see [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

## Default Accounts

### Staff Accounts
- **Admin**: `admin` / `123`
- **Teacher**: `omar.samy` / `123`
- **Sales**: `sales` / `123`

### Student Login
Students login using their registered phone number.

## Deployment

### Railway (Recommended)

Railway provides persistent storage for the file-based database.

📖 **See**: [docs/deployment/RAILWAY_QUICK_START.md](./docs/deployment/RAILWAY_QUICK_START.md)

Quick steps:
1. Connect repository to Railway
2. Add volume mount: `/data`
3. Set environment variables:
   - `DATA_DIR=/data`
   - `AUTO_INIT_DB=true`
   - `NODE_ENV=production`
4. Deploy

### Netlify

📖 **See**: [docs/deployment/NETLIFY_QUICK_DEPLOY.md](./docs/deployment/NETLIFY_QUICK_DEPLOY.md)

**Note**: Netlify Functions use ephemeral storage. For production, connect to Railway API or use external storage.

## Database

The application uses file-based JSON storage:

- **Railway**: Persistent `/data` directory
- **Auto-initialization**: Set `AUTO_INIT_DB=true` for automatic setup

📖 **See**: [docs/database/DATABASE_INIT.md](./docs/database/DATABASE_INIT.md)

## Documentation

All documentation is organized in the `docs/` directory:

- **Deployment**: [docs/deployment/](./docs/deployment/)
- **Database**: [docs/database/](./docs/database/)
- **Troubleshooting**: [docs/troubleshooting/](./docs/troubleshooting/)

## Scripts

```bash
npm run dev              # Frontend dev server
npm run dev:server       # Backend dev server
npm run dev:all          # Both servers
npm run build            # Production build
npm run init-db:seed    # Initialize database
npm run setup:railway-db # Automated Railway setup
```

## Design

The application features a modern red/black/white theme with:
- Smooth animations and transitions
- Card-based layouts
- Responsive design
- Arabic language support (RTL)

## License

Proprietary - All rights reserved

## Support

For issues and questions, check the [troubleshooting guides](./docs/troubleshooting/) or open an issue.
