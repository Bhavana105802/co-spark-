# CoFoundr — Frontend

Modern React frontend for the Startup Co-Founder Matching Platform.

## Tech Stack
- **React 18** + **Vite 5**
- **Tailwind CSS** with custom brand tokens
- **shadcn/ui** (Radix UI primitives)
- **Axios** for API calls with interceptors
- **React Router v6**
- **Context API** — AuthContext + ToastContext

## Quick Start

```bash
# 1. Install all dependencies
npm install

# 2. Run dev server (backend must be running on port 5000)
npm run dev
# → http://localhost:5173
```

## Folder Structure

```
src/
├── components/
│   ├── ui/           # shadcn: Button, Card, Badge, Dialog, Tabs, Input, Select…
│   ├── layout/       # Navbar, Layout
│   └── shared/       # IdeaCard, SkillBadge, SkillTagInput, FormInput, Loader,
│                     # EmptyState, ProtectedRoute, SkeletonCard
├── context/          # AuthContext, ToastContext
├── hooks/            # useDebounce
├── lib/              # utils (cn, formatDate, skillColor)
├── pages/
│   ├── auth/         # Login, Signup
│   ├── dashboard/    # Dashboard
│   ├── profile/      # Profile
│   ├── ideas/        # CreateIdea, ExploreIdeas, IdeaDetails
│   └── requests/     # Requests
├── services/         # api.js, authService, userService, ideaService, requestService
├── App.jsx
└── main.jsx
```

## Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | JWT stored in localStorage, auto-validated on mount |
| 🛡 Protected routes | Redirect to /login if not authenticated |
| ✨ Skill matching | `GET /ideas?match=true` surfaces best-fit ideas |
| 🔍 Debounced search | 380ms debounce on Explore page search bar |
| 🏷 Skill tag input | Press Enter or comma to add skills |
| 💀 Skeletons | Shimmer loading cards while fetching data |
| 🔔 Toast notifications | Success / error toasts via Radix Toast |
| 📭 Empty states | Illustrated empty states with CTAs |
| 📱 Responsive | Mobile-first, hamburger nav on small screens |
| ↕ Staggered animations | Cards animate in with staggered delays |

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#5B8DEF` |
| Secondary | `#8FD3F4` |
| Accent | `#F9A826` |
| Background | `#F7F9FC` |
| Radius | `12px` |
| Font | Plus Jakarta Sans |

## API Base URL

`http://localhost:5000/api` — configured in `src/services/api.js`.

Change it there if your backend runs on a different port.

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/dashboard` | Dashboard with stat cards + idea grid | ✅ |
| `/profile` | View & edit profile, manage skills | ✅ |
| `/ideas` | Explore + search + filter ideas | ✅ |
| `/ideas/create` | Post a new startup idea | ✅ |
| `/ideas/:id` | Full idea detail + apply dialog | ✅ |
| `/requests` | Sent & received collaboration requests | ✅ |
