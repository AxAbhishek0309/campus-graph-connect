# Tribe — Campus Talent Graph & Hackathon Network

<p align="center">
  <img src="public/favicon.svg" alt="Tribe Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>The intelligent campus talent graph for builders, competitive programmers, and hackathon contenders.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#security">Security</a>
</p>

---

## 🌟 Overview

**Tribe** connects ambitious student builders, engineers, and designers across campuses. Whether finding a high-caliber hackathon teammate, discovering upcoming flagship competitions from platforms like Unstop, Grad Partners, and Wellfound, or showcasing verified competitive programming ratings (LeetCode, Codeforces, CodeChef), Tribe provides the infrastructure for students to collaborate and ship together.

---

## ✨ Features

- 🎯 **Talent Directory & Smart Filter**: Search peers across campuses, departments, batches, technical skills, and CP ratings.
- 🏆 **Flagship Events & Hackathons Scout**:
  - Live spotlights for national & international flagship hackathons from **Unstop**, **Grad Partners**, and **Wellfound**.
  - Real-time registered participant count tracker.
  - AI-powered event scout via **OpenRouter (Gemini Flash 2.5)** to discover and extract verified eligibility, deadlines, prizes, and direct application links across platforms (Devfolio, MLH, Kaggle, Naukri, Indeed).
  - Multi-platform targeted search shortcuts with full source platform attribution.
- 🤝 **Team Formation & Hackathon Matchmaking**: Form balanced squads combining frontend developers, backend architects, ML engineers, and UI/UX designers.
- ⚡ **Competitive Coding Profiles**: Showcase verified contest ratings, badges, and problem stats across LeetCode, Codeforces, and CodeChef.
- 💬 **Real-time Messaging & Connections**: Peer-to-peer connection requests and instant chat rooms powered by Cloud Firestore reactive listeners (`onSnapshot`).
- 🔐 **Firebase Auth**: Complete sign-in, sign-up, and session management via Google OAuth and email/password authentication.
- 🎨 **Modern Design System**: Sleek dark/light modes, glassmorphic surfaces, responsive layouts, and fluid micro-interactions built with Tailwind CSS and Radix UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (fully type-safe routes) |
| **State & Async Data** | [TanStack Query](https://tanstack.com/query) |
| **Styling & Components** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth) |
| **AI Scouting Engine** | [OpenRouter API](https://openrouter.ai/) (`google/gemini-2.5-flash`) |

---

## 📁 Project Structure

```text
campus-graph-connect/
├── public/
│   ├── favicon.svg          # Official Tribe constellation vector icon
│   ├── favicon.ico          # Multi-resolution fallback icon
│   └── favicon.png          # High-resolution PNG logo
├── src/
│   ├── components/
│   │   ├── cg/              # Tribe core design components (AppShell, Logo, Cards, Badges)
│   │   └── ui/              # shadcn/ui primitives (Button, Dialog, Dropdown, Tabs, etc.)
│   ├── contexts/
│   │   └── auth-context.tsx # Firebase Auth context & reactive user state
│   ├── hooks/               # Custom hooks (Firestore queries, toast notifications, UI helpers)
│   ├── lib/
│   │   ├── firebase.ts      # Firebase app initialization & service bindings
│   │   └── utils.ts         # Class name merging and utility functions
│   ├── routes/              # TanStack type-safe application routes
│   │   ├── __root.tsx       # Root layout, head tags, favicon links, and nav
│   │   ├── index.tsx        # Public landing page & platform showcase
│   │   ├── directory.tsx    # Campus talent directory & peer discovery
│   │   ├── events.tsx       # Flagship competitions, hackathons & AI scout
│   │   ├── messages.tsx     # Direct real-time messaging
│   │   ├── profile.tsx      # Student profile & portfolio management
│   │   ├── settings.tsx     # Account, notifications & privacy settings
│   │   └── auth/            # Sign in & sign up authentication pages
│   ├── services/
│   │   ├── events-service.ts# Flagship competition feeds & OpenRouter AI scouting logic
│   │   └── firestore.ts     # Firestore CRUD, user profiles, connections & messages
│   └── main.tsx             # Application bootstrap & provider wrapping
├── firestore.rules          # Granular Firestore security rules
├── .env.example             # Template for required environment variables
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `bun` / `pnpm`)
- A [Firebase Project](https://console.firebase.google.com/) with:
  - **Authentication** enabled (Google Provider + Email/Password)
  - **Cloud Firestore** created in production mode
- (Optional) An [OpenRouter API Key](https://openrouter.ai/) for real-time AI hackathon scouting

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AxAbhishek0309/campus-graph-connect.git
   cd campus-graph-connect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenRouter AI Engine (Optional - for real-time event discovery)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

> [!IMPORTANT]
> Never commit `.env` or `.env.local` to version control. Keep `.env*` listed in `.gitignore` at all times.

---

## 🔒 Security & Firestore Rules

Tribe enforces strict client authorization policies. Deploy the security rules using the Firebase CLI:

```bash
npx firebase deploy --only firestore:rules
```

Key security principles implemented in [firestore.rules](file:///Users/axabhishek03/Downloads/campus-graph-connect/firestore.rules):
- **User Profiles (`/users/{userId}`)**: Anyone authenticated can read profiles; only the profile owner can create or update their own data.
- **Connections (`/connections/{connId}`)**: Only the sender or receiver can view or update a connection status.
- **Direct Messages (`/conversations/{convId}`)**: Read and write access is restricted solely to the participants of that specific conversation.

---

## 🧪 Build & Quality Verification

To verify TypeScript types and generate an optimized production bundle:

```bash
npm run build
```

To run lint checks:

```bash
npm run lint
```

---

## 🔄 Lovable Integration

This project is connected to [Lovable](https://lovable.dev). Every standard commit pushed to `main` automatically synchronizes with the Lovable workspace. To protect project history integrity:
- Avoid force pushing (`git push --force`).
- Do not rebase, squash, or rewrite published commits.

---

## 📄 License

This project is licensed under the MIT License.
