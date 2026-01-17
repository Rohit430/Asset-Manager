# Asset Manager v2 - Asset Fortress

**Asset Manager v2** is a high-security, personal finance platform designed for ultimate privacy and visual clarity. It implements a "Fortress" architecture where all financial data is encrypted on the client side using AES-GCM before ever touching the backend.

## Key Features

*   **Fortress Security:** End-to-End Encryption (E2EE). Your data is decrypted only in your browser session using a Master Key derived from your password.
*   **Human-Centric UI:** Exact visual and functional parity with the original single-file prototype, including blue/indigo gradients and glassmorphism.
*   **FIFO Capital Gains Engine:** Precise First-In-First-Out calculation for realized profit/loss, automatically handling tax terms (STCG/LTCG) for India and US.
*   **Liquid Assets Separation:** Cash and Fixed Deposits are managed distinctly from investments, with bank-wise breakdowns on the dashboard.
*   **Interactive Dashboard:** Categorized asset cards, real-time portfolio distribution charts, and a comprehensive year-wise financial summary.
*   **Data Portability:** Robust JSON Import/Export system for backups and historical migration.

## Technology Stack

*   **Frontend:** React 19 + TypeScript (Vite).
*   **Styling:** Tailwind CSS v4 + Shadcn/UI.
*   **Backend:** Supabase (Dumb store for encrypted blobs).
*   **Security:** Web Crypto API (AES-GCM + PBKDF2).
*   **Charts:** Recharts (Optimized for responsive glassmorphism).

## Directory Structure

*   `src/lib/`:
    *   `crypto.ts`: **The Core.** Handles Master Key derivation and E2E encryption.
    *   `fifo.ts`: **The Brain.** Implements the FIFO logic and tax calculations.
*   `src/hooks/`:
    *   `useData.ts`: **The Sync.** Handles real-time encryption/decryption sync with Supabase.
*   `src/components/`:
    *   `Dashboard.tsx`: High-level portfolio overview with categorized cards.
    *   `YearlySummary.tsx`: Automated tax-year reporting.
*   `src/pages/`:
    *   `AssetsPage.tsx`: Detailed inventory with category-specific filtering.
    *   `LiquidAssetsPage.tsx`: Specialized views for Cash and FD management.

## Building and Running

1.  **Install Dependencies:** `npm install`
2.  **Start Development:** `npm run dev`
3.  **Deploy:** Pushed to GitHub `master` triggers automated build and deploy to GitHub Pages.

## Environment Configuration

Requires `.env.local` with:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Roadmap Status

*   **Phase 1: Foundation (Complete)** - Project setup, Auth, Fortress Crypto Engine.
*   **Phase 2: Core Logic (Complete)** - FIFO/Tax engine, Supabase Schema, Local Decryption Sync.
*   **Phase 3: UI/UX (Complete)** - Responsive Dashboard, Asset/Liquid pages, Visual Parity.
*   **Phase 4: Functional Polish (Complete)** - Transaction Editing, Category Filtering, Export/Import.
*   **Phase 5: Deployment & Migration (Current)** - GitHub Pages live, JSON Migration Scripting.