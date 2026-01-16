# Asset Manager v2 - Project Overview

**Asset Manager v2** is a professional-grade, personal finance application designed for security, privacy, and ease of use. It features a "Fortress" architecture with client-side End-to-End Encryption (E2E), ensuring that financial data is never exposed in plain text to the backend provider.

## Technology Stack

*   **Frontend:** React 19 + TypeScript (via Vite).
*   **Styling:** Tailwind CSS v4 + Shadcn/UI (Radix Primitives).
*   **Backend:** Supabase (PostgreSQL + Auth).
*   **Security:** Web Crypto API (AES-GCM) for client-side encryption.
*   **State Management:** React Hooks (Migration to TanStack Query planned).

## Directory Structure

*   `src/lib/`: Core utilities.
    *   `crypto.ts`: **Critical.** Handles PBKDF2 key derivation and AES-GCM encryption/decryption.
    *   `supabase.ts`: Supabase client initialization.
    *   `utils.ts`: Shadcn UI helper functions (cn).
*   `src/components/`: React components.
    *   `ui/`: Reusable Shadcn UI primitives (Button, Input, Card, etc.).
    *   `Auth.tsx`: Authentication logic (Login/Signup).
*   `src/App.tsx`: Main application entry point handling Auth state and Dashboard rendering.
*   `backup/`: Contains the original `Asset Manager.html` prototype.

## Building and Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

## Environment Configuration

The application requires a `.env.local` file in the root directory with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Conventions

*   **Security First:** Never send plain-text financial data to the database. Always use `encryptData()` from `@/lib/crypto` before `supabase.from(...).insert()`.
*   **UI Components:** Use Shadcn/UI components from `@/components/ui`. If a new component is needed, add it via `npx shadcn@latest add <component-name>`.
*   **Typing:** Maintain strict TypeScript types. Avoid `any`.
*   **Path Aliases:** Use `@/` to import from `src/` (e.g., `import { Button } from '@/components/ui/button'`).

## Roadmap Status

*   **Phase 1: Foundation (Complete)** - Project setup, Auth, Crypto Engine.
*   **Phase 2: Core Logic (Next)** - Porting FIFO/Tax logic, DB Schema, Offline Sync.
*   **Phase 3: UI/UX** - Dashboard, Charts, Interactive Modes.
*   **Phase 4: Automation** - Stock API, Currency conversion, CSV Import.
*   **Phase 5: Release** - Testing, CI/CD, Audits.
