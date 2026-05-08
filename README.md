# TrackDaily

A modern activity tracking application that helps you monitor, analyze, and improve your daily activities. Built with Next.js and featuring real-time analytics, session management, and a beautiful dark-themed interface.

## Features

### Activity Tracking
- **Comprehensive Logging**: Track activities with names, categories, durations, and optional notes
- **Session-Based Tracking**: Unique session management with guest access and authentication
- **Real-time Updates**: Instant activity logging and immediate reflection in analytics

### Analytics & Visualization
- **Interactive Charts**: Dynamic visualizations showing activity trends and patterns over time
- **Statistical Insights**: Comprehensive metrics including total activities, duration averages, and frequency analysis
- **Time-based Analysis**: View activities by weekly, monthly, or yearly time ranges
- **Category Distribution**: Visual breakdown of time spent across different activity types

### User Experience
- **Dark Theme Interface**: Modern dark mode design with smooth animations and transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, organized interface with multiple view options

### Data Management
- **Activity History**: Complete log of all tracked activities with timestamps
- **Import/Export**: Backup and restore your activity data
- **Session Persistence**: Maintains your data across browser sessions
- **Flexible Updates**: Edit and modify existing activities with ease

## Technology Stack

- **Framework**: Next.js 16 with App Router for modern React development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS v4 for responsive, utility-first styling
- **Charts**: Recharts for interactive data visualizations
- **Icons**: Lucide React for consistent, modern iconography
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Hooks and Context API
- **Type Safety**: TypeScript for enhanced development experience
- **Package Manager**: pnpm for efficient dependency management

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm package manager
- Modern web browser with JavaScript enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TrackDaily
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage Guide

**First Time Setup**
- The app will generate a unique guest session for you
- Your session data persists across browser sessions
- No registration required - start tracking immediately

**Daily Activity Tracking**
- Navigate to the activity logging section
- Enter activity details including name, category, and duration
- Add optional notes for context
- Activities are instantly saved and reflected in your analytics

**Analytics & Insights**
- View comprehensive statistics on your dashboard
- Explore interactive charts showing trends over time
- Filter data by different time ranges (weekly, monthly, yearly)
- Analyze category distribution to understand your activity patterns

**Data Management**
- Export your complete activity history as JSON
- Import previous backups to restore data
- Edit existing activities to correct mistakes
- Clear all data when needed with confirmation

## Browser Support

TrackDaily works on all modern browsers that support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with localStorage and ES6+ support

## Data Storage

Your activity data is stored locally in your browser for privacy and instant access. Session information and activity logs are maintained across browser sessions, ensuring your tracking history is always available.

## Development

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Lint Code
```bash
pnpm lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

---

Built with modern web technologies to provide a seamless activity tracking experience.
