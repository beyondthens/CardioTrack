# CardioTrack ZA - Mobile Heart Health Monitor

Mobile-first heart health tracking app with offline-first capabilities and real-time vitals monitoring.

## Features

- 📱 **Mobile-First Design**: Optimized for smartphones with responsive layouts
- 💾 **Offline-First**: State persists locally using Zustand with localStorage backup
- ❤️ **Vital Tracking**: Heart rate, blood pressure, and health metrics
- 🔔 **Real-Time Updates**: Live monitoring with automatic data syncing
- 📊 **Data Visualization**: Charts and trends for health metrics
- ⚡ **Performance**: PWA with Service Worker for offline functionality
- 🔒 **Privacy**: All data stored locally, no cloud dependencies required

## Tech Stack

- **Next.js 14**: React framework with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Mobile-first styling with responsive design
- **Zustand**: Lightweight state management with persistence
- **PWA**: Progressive Web App for offline functionality
- **micro**: Terminal editor for development

## Specialized Skills Applied

### **Superpowers Skill**
- Advanced Next.js optimization and performance tuning
- Complex state management patterns beyond basic usage
- Advanced TypeScript typing for scalable applications
- Error boundary implementation and advanced debugging

### **UI/UX Pro Skill**
- Professional mobile-first design systems
- Advanced component patterns and composition
- Accessibility compliance (WCAG 2.1 AA)
- Performance-optimized user interfaces
- Cross-platform design consistency

### **Senior Mobile App & App Senior Dev Skill**
- Enterprise-grade mobile application architecture
- Advanced React Native/Next.js hybrid development
- Offline-first application design and implementation
- Performance optimization for mobile devices
- Code quality and maintainability standards

### **AI Model Auto Switch & Rotate Available & Working Models Skill**
- Intelligent model selection based on task requirements
- Automatic fallback mechanisms for model failures
- Real-time model performance monitoring
- Multi-model integration and orchestration
- Adaptive learning from usage patterns

## Quick Start

```bash
# Install dependencies
npm install

# Run development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Development Workflow

### Using micro Editor
```bash
# Open the editor
micro app/page.tsx

# Edit components quickly
micro store/useStore.ts
```

### Using tmux
```bash
# Split terminal for parallel development
# One pane: npm run dev
# Another pane: micro your-file.tsx
```

### JSON Debugging
```bash
# Inspect Zustand state
jq '.' store/useStore.ts
```

## Mobile Development

### For Termux (Android)
```bash
# Install essential tools
pkg install micro jq tmux git

# Clone this repository
.git clone https://github.com/your-repo/cardiotrack-za-local.git
cd cardiotrack-za-local

# Run the app
npm run dev
```

### For iOS with Code-Server
```bash
# Install Code-Server on your server
# Access via phone browser
http://your-server-ip:8080
```

## State Management

The app uses Zustand for state management with localStorage persistence:

```typescript
// Patient data (persisted)
const { patientData, setPatientData } = useStore()

// Reading history (persisted)
const { readingHistory, addReading } = useStore()

// Offline status
const { isOffline, setOfflineStatus } = useStore()
```

## Mobile-First Design

All components use mobile-first principles with:
- Max-width containers (max-w-[430px]) for app-like feel
- Touch-friendly buttons and inputs
- Safe area padding for notches
- Responsive typography

## Offline Capabilities

The app works offline by:
1. Storing all data locally in Zustand with localStorage
2. Using Service Worker for caching
3. Queuing API calls for later sync when online
4. Showing offline status indicators

## Health Tracking

### Supported Metrics
- Heart Rate (BPM)
- Blood Pressure (Systolic/Diastolic)
- Blood Type
- Medication Reminders
- Allergy Tracking

### Data Visualization
- Daily trends
- Weekly averages
- Custom date ranges
- Export functionality

## Privacy & Security

- All data stored locally on device
- No external API calls required for basic functionality
- Encrypted local storage using Zustand middleware
- Offline-first architecture protects data integrity

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

**"Cannot read property of undefined" errors**
```bash
# Check Zustand store initialization
jq '.' store/useStore.ts
```

**Offline issues**
```bash
# Check network status
navigator.onLine
```

**TypeScript errors**
```bash
# Type check
npm run type-check
```

**Performance issues**
```bash
# Optimize images and assets
npm run build
```

## Mobile App Features

### Home Screen
- Patient overview
- Quick vitals display
- Action buttons for common tasks

### Add Reading
- Manual vitals entry
- Voice input support
- Smart defaults based on patient profile

### History
- Date-based reading view
- Interactive charts
- Export to PDF/JSON

### Settings
- Profile management
- Notification preferences
- Data export/import
- Privacy settings

## Future Enhancements

- Integration with wearable devices (Apple Health, Google Fit)
- AI-powered health insights
- Family member sharing
- Emergency SOS feature
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

This project follows mobile-first development principles and offline-first architecture to ensure reliable heart health monitoring even in low-connectivity environments.

---

*Built with ❤️ for heart health monitoring in South Africa*