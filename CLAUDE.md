# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm lint`

Note: Testing is not currently configured in this project.

## Project Architecture

### High-Level Structure

- **app/**: Next.js App Router directory
  - `layout.tsx`: Root layout with global styles and metadata
  - `page.tsx`: Entry point that wraps the app in an authentication wrapper
- **components/**: Reusable UI components and feature-specific components
  - `Dashboard.tsx`: Main dashboard container with view switching
  - `ActivityForm.tsx`: Form for logging new activities
  - `ActivityTable.tsx`: Table displaying logged activities
  - `SummaryCards.tsx`: Statistics summary cards
  - `ChartsPanel.tsx`: Container for analytics charts
  - `ActivityInput.tsx`: Quick input for logging activities (untracked)
  - `Layout.tsx`: Dashboard layout with header and navigation
  - `SessionManager.tsx`: Session management dialog
  - `auth/`: Authentication components (LoginForm, RegisterForm, AuthWrapper)
- **hooks/**: Custom React hooks
  - `useActivityTracker.ts`: Hook managing activities and session state with localStorage persistence
- **lib/**: Utility functions and helpers
  - `activityUtils.ts`: Activity ID generation, statistics calculation, chart data formatting, export/import helpers
  - `sessionUtils.ts`: Session creation logic (not shown in status but referenced)
- **types/**: TypeScript interfaces and types
  - `activity.ts`: Core interfaces (Activity, Session, ActivityStats, ChartData, etc.)

### State Management & Data Flow

- **Client-Side State**: All activity data is stored in the browser's `localStorage`
  - Key `activities`: Array of activity objects
  - Key `session`: Session object containing session ID and 5-digit code
- **State Synchronization**: 
  - `useActivityTracker` hook initializes state from localStorage on load
  - Activities are saved to localStorage whenever they change (via useEffect)
  - Session is created or retrieved from localStorage on initial load
- **Data Model**:
  - `Activity`: Includes id, sessionId, name, category, duration (minutes), timestamp, optional notes
  - `Session`: Includes id, 5-digit code, startDate, optional logCode (for MongoDB integration)
- **Utilities**:
  - `activityUtils` provides functions for:
    - Generating UUIDs for activity and session IDs
    - Calculating statistics (total activities, duration, average, most common category)
    - Formatting chart data for Recharts (duration trends over time)
    - Exporting/importing activities to/from JSON
    - Formatting duration display (minutes to hours/minutes)
    - Mapping categories to colors and icons

### Key Features Implemented

1. **Activity Logging**: Form-based input with validation (duration 0-1440 minutes)
2. **Session Management**: Automatic session generation with 5-digit shareable code
3. **Analytics Dashboard**: 
   - Summary cards (total activities, duration, calories, averages)
   - Duration trends (7-day line chart)
   - Calorie tracking (30-day bar chart)
   - Category breakdown (pie chart)
4. **Activity Management**: 
   - Table view of all activities with timestamps
   - Quick delete functionality
   - Export/Import as JSON backup
   - Clear all activities (with confirmation)
5. **UI/UX**:
   - Dark mode with glassmorphism effects
   - Responsive design (mobile-first)
   - Real-time UI updates
   - Smooth animations and transitions
   - Authentication wrappers (login/register flows)

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **State**: React Hooks (useState, useEffect, useCallback)
- **Persistence**: Browser localStorage
- **Utilities**: date-fns, framer-motion, sonner, uuid, zod

### Development Guidelines

- Follow the existing component structure: feature components in `components/`, shared UI in `components/ui/`
- Use the `useActivityTracker` hook for accessing and modifying activity state
- Utility functions in `lib/activityUtils.ts` should be used for calculations and formatting
- Add new types to `types/activity.ts` as needed
- When adding new features, consider updating the Dashboard view switching mechanism
- All client-side data persistence should use the established localStorage keys via the hook