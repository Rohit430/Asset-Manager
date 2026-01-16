# Asset Manager - Project Overview

This directory contains a standalone, single-file Personal Asset Manager web application. It is designed to track investments across various categories, manage liquid assets, and calculate capital gains taxes based on FIFO (First-In-First-Out) logic.

## Technology Stack

*   **Core:** Vanilla JavaScript (ES6+), HTML5.
*   **Styling:** Tailwind CSS (via CDN).
*   **Visualization:** Chart.js (via CDN) with `chartjs-plugin-datalabels`.
*   **Persistence:** Browser `localStorage`. No backend is currently required.

## Application Architecture

The entire application resides in `Asset Manager.html`. It functions as a Single Page Application (SPA) by toggling the visibility of different view sections (DOM elements with class `.app-view`).

### Key Components

1.  **Authentication:** Currently uses a simple client-side check against hardcoded credentials. Session state is stored in `sessionStorage`.
2.  **Data Models (in-memory & localStorage):**
    *   `allAssets`: Aggregated asset data (Portfolio).
    *   `allTransactions`: Ledger of all Buy/Sell actions.
    *   `allLiquidCash` & `allLiquidFDs`: Cash and Fixed Deposit entries.
    *   `globalSettings`: User-configurable tax rates (India/US), asset categories, and fee structures.
3.  **Logic Engine:**
    *   **FIFO Calculation:** Automatically calculates realized profit/loss and holding periods when selling assets.
    *   **Taxation:** Configurable Short Term vs. Long Term Capital Gains logic.
    *   **Import/Export:** Full data backup and restoration using JSON files.

## Running the Application

1.  **Prerequisites:** A modern web browser (Chrome, Firefox, Edge, Safari) with an active internet connection (required to load CDN resources for Tailwind and Chart.js).
2.  **Execution:** Double-click `Asset Manager.html` or open it directly in your browser.

## Development Conventions

*   **Single File Structure:** HTML structure, CSS (in `<style>` block), and JavaScript (in `<script type="module">` block) are all contained within the one file.
*   **Event Handling:** Global functions (e.g., `openTransactionModal`, `confirmDelete`) are exposed to the `window` object to support inline HTML `onclick` attributes.
*   **State Management:** Global variables manage the runtime state, which is hydrated from `localStorage` upon initialization.
*   **UI/UX:** Uses Tailwind utility classes for layout and styling. Features "blurred card" effects and responsive grids.

## Migration Context

**Current Status:** Prototype / Personal Tool.
**Goal:** Migrate to a professional, secure, synchronized web application.

**Target Stack (Planned):**
*   **Frontend:** React.js + TypeScript (Vite).
*   **UI Library:** Tailwind CSS + Shadcn/UI.
*   **Backend/DB:** Supabase (PostgreSQL, Auth, Realtime).
*   **Security:** Client-side End-to-End Encryption (AES-GCM).
*   **Features:** Offline Support (PWA), Local "Smart Mapper" for CSV imports, Automated Backups.
