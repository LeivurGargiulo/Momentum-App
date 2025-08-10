# Activity Tracker - Mental Health & Therapy App

A mobile-first React web application designed for tracking daily activities to support mental health and therapy goals. Built with modern web technologies and optimized for mobile devices.

## 🌟 Features

### Core Functionality
- **Onboarding Experience**: Easy setup with customizable activity list
- **Daily Tracking**: Mark activities as complete/incomplete with smooth animations
- **Date Navigation**: Navigate between days to view historical data
- **Notes System**: Add daily reflections and thoughts
- **Automatic Data Persistence**: All data saved locally in browser storage

### Analytics & Insights
- **Completion Statistics**: Track daily, weekly, and monthly completion rates
- **Activity Analytics**: See most and least completed activities
- **Visual Charts**: Beautiful charts using Recharts library
- **Progress Tracking**: Visual progress indicators and completion percentages

### User Experience
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interface
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Responsive Layout**: Works perfectly on all screen sizes

### Data Management
- **Export Data**: Download all your data as JSON backup
- **Import Data**: Restore from backup files
- **Clear Data**: Option to reset all data when needed
- **Local Storage**: All data stored securely in your browser

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd activity-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## 📱 Usage Guide

### First Time Setup
1. **Welcome Screen**: Choose to use default activities or create your own
2. **Add Activities**: Enter activities that support your mental health goals
3. **Get Started**: Begin tracking your daily progress

### Daily Tracking
1. **Mark Activities**: Tap activities to mark them as complete
2. **Add Notes**: Write daily reflections in the notes section
3. **Navigate Dates**: Use arrow buttons to view different days
4. **View Progress**: See your completion percentage for the day

### Analytics
1. **Statistics Tab**: View your overall progress and patterns
2. **Time Periods**: Switch between daily, weekly, and monthly views
3. **Activity Insights**: See which activities you complete most/least often

### Settings
1. **Theme Toggle**: Switch between light and dark modes
2. **Data Export**: Download your data for backup
3. **Data Import**: Restore from a previous backup
4. **Data Reset**: Clear all data if needed

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: LocalStorage with IndexedDB support

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Onboarding.jsx   # Initial setup screen
│   ├── Today.jsx        # Daily activity tracking
│   ├── Statistics.jsx   # Analytics and charts
│   ├── Settings.jsx     # App settings and data management
│   └── Navigation.jsx   # Bottom navigation bar
├── store/               # State management
│   └── useStore.js      # Zustand store configuration
├── utils/               # Utility functions
│   └── storage.js       # LocalStorage operations
├── strings.js           # Localization strings
├── App.jsx              # Main app component
└── index.css            # Global styles and Tailwind
```

## 🎨 Design Features

- **Mobile-First**: Designed primarily for mobile devices
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Accessibility**: High contrast and readable typography
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Responsive**: Adapts to different screen sizes
- **Dark Mode**: Complete dark theme support

## 🔧 Customization

### Adding New Activities
Activities can be added through the onboarding screen or settings. Each activity is stored with a unique ID and can be edited or deleted.

### Styling
The app uses Tailwind CSS for styling. Custom styles can be added in `src/index.css` or by modifying the Tailwind configuration.

### Localization
All text strings are stored in `src/strings.js` for easy localization. Simply update the strings object to change the language.

## 📊 Data Structure

The app stores data in the following format:

```javascript
// Activities
[
  { id: "unique-id", name: "Activity Name" }
]

// Daily Data
{
  "2024-01-15": {
    completed: ["activity-id-1", "activity-id-2"],
    notes: "Daily reflection text"
  }
}

// Settings
{
  darkMode: true/false
}
```

## 🚀 Deployment

The app can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Use the `gh-pages` package
- **Firebase Hosting**: Use Firebase CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 💡 Future Enhancements

- [ ] Push notifications for daily reminders
- [ ] Cloud sync across devices
- [ ] Advanced analytics and insights
- [ ] Activity categories and tags
- [ ] Mood tracking integration
- [ ] Export to PDF/CSV formats
- [ ] Offline support with service workers
- [ ] Multi-language support

## 🆘 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure you're using a modern browser
3. Try clearing your browser's local storage
4. Check that all dependencies are properly installed

---

**Made with ❤️ for better mental health**