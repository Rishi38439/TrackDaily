# Personal Activity Tracker

A premium fitness and wellness activity tracking application built with Next.js, React, and Tailwind CSS. Track your exercises, analyze trends, and maintain a comprehensive activity log with beautiful analytics.

## Features

### Core Functionality
- **Activity Logging**: Log exercises with name, category, duration, calories, and notes
- **7 Activity Categories**: Cardio, Strength, Flexibility, Sports, Outdoor, Mind & Wellness, Other
- **Session Management**: Unique session IDs to track usage across browser sessions
- **Data Persistence**: All activities automatically saved to browser localStorage

### Analytics & Insights
- **Summary Cards**: Quick stats including total activities, duration, calories, and averages
- **Duration Trends**: 7-day line chart showing activity duration patterns
- **Calorie Tracking**: 30-day bar chart of calories burned
- **Category Breakdown**: Pie chart visualizing time spent in each activity category

### Activity Management
- **Activity Table**: Browse all logged activities with timestamps and notes
- **Quick Delete**: Remove individual activities with one click
- **Export/Import**: Download activities as JSON and import from backup files
- **Clear All**: Reset all activities with confirmation

### Design
- **Dark Mode**: Premium dark theme with glassmorphism effects
- **Responsive Layout**: Mobile-first design that scales to all screen sizes
- **Real-time Updates**: Instant UI updates as you log activities
- **Smooth Animations**: 300ms transitions for a polished feel

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: Browser localStorage
- **State Management**: React Hooks

## Project Structure

```
├── app/
│   ├── page.tsx              # Main application entry point
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles
├── components/
│   ├── Dashboard.tsx         # Main dashboard container
│   ├── ActivityForm.tsx      # Form for logging activities
│   ├── ActivityTable.tsx     # Table of logged activities
│   ├── SummaryCards.tsx      # Statistics summary cards
│   ├── ChartsPanel.tsx       # Analytics charts
│   └── ui/                   # shadcn/ui components
├── hooks/
│   └── useActivityTracker.ts # Custom hook for activity management
├── lib/
│   └── activityUtils.ts      # Utility functions and calculations
├── types/
│   └── activity.ts           # TypeScript interfaces
└── package.json              # Dependencies
```

## Data Model

### Activity
```typescript
interface Activity {
  id: string;                  // Unique identifier
  sessionId: string;           // Session identifier
  name: string;               // Activity name
  category: string;           // Activity category
  duration: number;           // Duration in minutes
  calories: number;           // Estimated calories burned
  timestamp: number;          // Creation timestamp (ms)
  notes?: string;             // Optional notes
}
```

## Getting Started

### Installation

1. Clone the repository or download the project
2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Logging an Activity**:
   - Fill in the activity form with name, category, duration, and calories
   - Add optional notes
   - Click "Log Activity"

2. **Viewing Analytics**:
   - Summary cards show key metrics at a glance
   - Switch between chart tabs to view duration trends, calorie trends, and category breakdown

3. **Managing Activities**:
   - View all activities in the table below the charts
   - Click the trash icon to delete individual activities
   - Use export to download your data as JSON

4. **Backing Up Data**:
   - Click "Export" to download activities as a JSON file
   - Click "Import" to restore from a backup JSON file
   - Use "Clear All" to delete all activities (with confirmation)

## Local Storage

Activities are stored in the browser's localStorage with the key `activities`. The session ID is stored with the key `sessionId`. Clearing browser data will delete your activity history.

## Export Format

Exported activities are stored as JSON in the following format:
```json
[
  {
    "id": "uuid",
    "sessionId": "uuid",
    "name": "Morning Run",
    "category": "cardio",
    "duration": 30,
    "calories": 300,
    "timestamp": 1704067200000,
    "notes": "Great weather today"
  }
]
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with localStorage support

## Color Scheme

- **Primary**: Blue (#3b82f6) - Used for duration metrics
- **Secondary**: Purple (#8b5cf6) - Used in gradients
- **Accent**: Orange (#f59e0b) - Used for calories
- **Success**: Green (#10b981) - Used for outdoor activities
- **Background**: Dark slate (#0f172a to #1e293b) - Premium dark theme

## Future Enhancements

- Cloud synchronization across devices
- Social sharing of achievements
- Goal setting and progress tracking
- Custom category creation
- Advanced filtering and sorting
- Mobile app version
- Wearable device integration

## License

Created with v0.app
