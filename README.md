# Momentum - Activity Tracker

A beautiful, mobile-first activity tracking app built with React, Tailwind CSS, and Zustand. Build momentum, one day at a time.

## Features

### 🎯 **Activity Management**
- **Add, Edit, Remove Activities**: Full CRUD operations for your daily activities
- **Drag & Drop Reordering**: Reorder activities with up/down buttons
- **Persistent Storage**: All changes saved to localStorage automatically
- **Historical Data Preservation**: Deleting activities keeps historical data intact

### 📱 **Mobile-First Design**
- Responsive design that works perfectly on mobile devices
- Floating action button for quick activity management
- Swipe-friendly interface with touch-optimized controls
- Dark mode support for better user experience

### 📊 **Progress Tracking**
- Daily activity completion tracking
- Visual progress indicators and completion rates
- Comprehensive statistics and charts
- Notes and reflections for each day

### 🔄 **Data Management**
- Export/Import functionality for data backup
- Clear all data option with confirmation
- Graceful error handling and data recovery

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Recharts** - Beautiful charts and visualizations
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation utilities
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd momentum-activity-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## App Structure

```
src/
├── components/
│   ├── ActivityManager.jsx    # Activity CRUD operations
│   ├── Navigation.jsx         # Bottom navigation
│   ├── Onboarding.jsx         # First-time setup
│   ├── Settings.jsx           # App settings
│   ├── Statistics.jsx         # Charts and analytics
│   └── Today.jsx              # Daily activity tracking
├── store/
│   └── useStore.js            # Zustand state management
├── utils/
│   └── storage.js             # localStorage utilities
├── App.jsx                    # Main app component
├── main.jsx                   # App entry point
├── index.css                  # Global styles
└── strings.js                 # Internationalization
```

## Key Features Explained

### Activity Management
The app uses a centralized state management system with Zustand. Activities are stored with an `order` property to maintain their sequence. The `ActivityManager` component provides a modal interface for managing activities with:

- **Add**: Quick form to add new activities
- **Edit**: Inline editing with save/cancel options
- **Delete**: Confirmation dialog with historical data preservation
- **Reorder**: Up/down buttons for reordering activities

### Data Persistence
All data is automatically saved to localStorage:
- **Activities**: List of activity definitions with order
- **Daily Data**: Completion status and notes per day
- **Settings**: User preferences like dark mode

### Mobile-First Design
The app is designed with mobile users in mind:
- Bottom navigation for easy thumb access
- Floating action button for quick access to activity management
- Touch-friendly button sizes and spacing
- Responsive design that works on all screen sizes

## Customization

### Adding New Features
The modular architecture makes it easy to add new features:

1. **New Components**: Add to `src/components/`
2. **State Management**: Extend `useStore.js` with new actions
3. **Storage**: Add new storage functions in `storage.js`
4. **Styling**: Use Tailwind CSS classes for consistent design

### Theming
The app uses Tailwind CSS with a custom color scheme. To modify the theme:

1. Update `tailwind.config.js` for color changes
2. Modify `src/index.css` for component styles
3. Update dark mode classes throughout components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue on GitHub.

---

**Momentum** - Build momentum, one day at a time. ✨