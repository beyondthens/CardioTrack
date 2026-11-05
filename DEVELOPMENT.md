# CardioTrack ZA Development Guide

## Overview

Mobile-first heart health tracking app with offline-first capabilities, following industry best practices for health monitoring applications.

## Project Structure

```
cardiotrack-za-local/
├── app/                    # Next.js pages and components
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── ...                # Additional pages
├── store/                 # Zustand state management
│   └── useStore.ts       # Main store with persistence
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions and error handling
├── styles/                # Global styles
│   └── globals.css       # Tailwind CSS and custom styles
├── components/           # Reusable UI components
├── public/               # Static assets
│   └── manifest.json     # PWA manifest
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## Essential Development Tools

### 1. Core Development Tools

**micro** (Recommended Terminal Editor)
- Install: `pkg install micro`
- Features:
  - Full touch/mouse support
  - Syntax highlighting for TypeScript/Tailwind
  - Standard copy/paste shortcuts (Ctrl+C, Ctrl+V)
  - Seamless integration with Next.js

**jq** (JSON Processor)
- Install: `pkg install jq`
- Use cases:
  - Inspect Zustand store state
  - Format API responses
  - Debug JSON payloads

**tmux** (Terminal Multiplexer)
- Install: `pkg install tmux`
- Benefits:
  - Split screen for parallel development
  - One pane: `npm run dev`
  - Another pane: `micro your-file.tsx`

### 2. Mobile App Development Tools

**For Termux (Android)**:
```bash
# Install all essential tools
pkg install micro jq tmux git

# Clone project
cd ~
git clone https://github.com/your-repo/cardiotrack-za-local.git
cd cardiotrack-za-local

# Run development server (access via phone browser)
npm run dev
```

**For iOS with Code-Server**:
- Install Code-Server on your server
- Access via phone: `http://your-server-ip:8080`
- Full VS Code experience with extensions

## Local Error Debugging

### Automatic Error Parsing

When you encounter errors, the app automatically:

1. **Parses Next.js/Turbopack errors**:
   ```bash
   # Check for build errors
   npm run dev
   ```

2. **Parses Zustand state errors**:
   ```bash
   # Inspect current state
   jq '.' store/useStore.ts
   ```

3. **Provides single-line terminal fixes**:
   - Type import issues
   - State management problems
   - Component rendering errors

### Example Error Flow:

```bash
# In one tmux pane: npm run dev
# In another tmux pane: micro app/page.tsx
# Error appears: "Cannot read property of undefined"
# Auto-fix suggestion: "Check useStore import or initialization"
```

## Mobile-First Design Principles

### 1. Container Constraints

All components use mobile-first layouts:

```tsx
<div className="mobile-container">
  {/* Content limited to 430px for optimal mobile viewing */}
</div>
```

### 2. Touch-Friendly Interfaces

```tsx
<button className="btn-primary">
  <span className="text-base">Add Reading</span>
  <span className="text-lg">❤️</span>
</button>
```

### 3. Responsive Typography

```css
/* globals.css */
@layer base {
  body {
    @apply text-base sm:text-lg md:text-xl;
  }
}
```

### 4. Safe Area Padding

```css
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Zustand State Management

### Store Structure

```typescript
interface AppStore {
  patientData: PatientData                    // Persisted
  readingHistory: Reading[]                   // Persisted  
  isOffline: boolean                          // Not persisted
  isLoading: boolean                          // Not persisted
}
```

### Key Features

1. **Offline-First**: All data stored locally with localStorage backup
2. **Automatic Persistence**: Zustand middleware handles persistence
3. **Real-time Status**: Network status monitoring
4. **Reading Management**: CRUD operations for vitals

### Store Usage Example

```tsx
import useStore from '@/store/useStore'

const MyComponent = () => {
  const { patientData, setPatientData, isOffline } = useStore()
  
  return (
    <div>
      <p>Offline: {isOffline ? '⚠️' : '✅'}</p>
      <input 
        value={patientData.name || ''}
        onChange={(e) => setPatientData({ name: e.target.value })}
      />
    </div>
  )
}
```

## Utility Functions

### Error Handling

```typescript
import { generateErrorMessage, handleApiError } from '@/lib/utils'

// Handle API errors gracefully
try {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error(response.statusText)
  return parseApiResponse(response)
} catch (error) {
  console.error('API Error:', error)
  throw handleApiError(error)
}
```

### Data Formatting

```typescript
import { formatDate, formatHeartRate, formatBloodPressure } from '@/lib/utils'

const formattedDate = formatDate(new Date())
const heartRateText = formatHeartRate(75) // "75 bpm"
const bpText = formatBloodPressure(120, 80) // "120/80 mmHg"
```

## Development Workflow

### 1. Daily Development Routine

```bash
# Terminal setup
tmux new-session -s cardio

# Split pane A (development)
split-window -h "npm run dev"

# Split pane B (editing)
split-window -v "micro app/page.tsx"

# Split pane C (debugging)
split-window -v "jq '.' store/useStore.ts"
```

### 2. Testing Workflow

```bash
# Test Zustand persistence
npm run test:zustand

# Test mobile layout
npm run test:mobile

# Test error handling
npm run test:errors

# Test offline functionality
npm run test:offline
```

### 3. Component Development

```bash
# Create new component
micro components/HeartRateInput.tsx

# Test in development
npm run dev
```

## Mobile Development Tips

### For Termux Users

1. **Use micro for editing**:
   ```bash
   micro store/useStore.ts
   ```

2. **Monitor Zustand state**:
   ```bash
   # In one terminal: npm run dev
   # In another: jq '.' store/useStore.ts
   ```

3. **Test offline functionality**:
   ```bash
   # Toggle airplane mode
   # Check if app still works
   ```

### Performance Optimization

1. **Code splitting**: Use dynamic imports for heavy components
2. **Tree shaking**: Remove unused code from bundles
3. **Caching**: Service Worker for offline support
4. **Lazy loading**: Load components on demand

## Common Issues and Solutions

### Issue: "Cannot read property of undefined"
**Solution**: Check Zustand store initialization
```bash
# Verify store file exists
ls -la store/useStore.ts

# Check imports in components
micro app/page.tsx
```

### Issue: TypeScript errors
**Solution**: Type check before building
```bash
npm run type-check
```

### Issue: Offline functionality not working
**Solution**: Check network status and localStorage
```bash
# Check localStorage usage
navigator.onLine
localStorage.getItem('cardiotrack-storage')
```

### Issue: Mobile layout issues
**Solution**: Verify Tailwind classes
```bash
# Check responsive classes
micro styles/globals.css
```

## Build Process

### Development
```bash
npm run dev
# Access at: http://localhost:3000
```

### Production Build
```bash
npm run build
# Build artifacts in .next/
```

### Production Start
```bash
npm start
# Static server at: http://localhost:3000
```

### Linting and Formatting
```bash
npm run lint
npm run type-check
```

## Testing and Validation

### Local Testing
```bash
# Run development server
npm run dev

# Test mobile layout
# Open in mobile browser: http://localhost:3000

# Test offline functionality
# Enable airplane mode
# Refresh page
```

### API Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/health

# Test Zustand state
jq '.' store/useStore.ts
```

## Deployment

### For Production

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to hosting service** (Vercel, Netlify, AWS Amplify)

3. **Set up custom domain** and SSL certificates

4. **Configure environment variables**

### Mobile App Deployment

- **Android**: Use Capacitor or Cordova to wrap the web app
- **iOS**: Use Capacitor or Cordova for hybrid app
- **Progressive Web App**: Deploy as PWA with Service Worker

## Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "preserve"
  },
  "include": ["app/", "store/", "lib/", "components/"]
}
```

### Next.js Configuration

```javascript
{
  "reactStrictMode": true,
  "swcMinify": true,
  "compiler": { "styledComponents": true }
}
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Test mobile layout**: Open in phone browser
4. **Test offline functionality**: Disable network
5. **Explore Zustand store**: Check local state management
6. **Build production**: `npm run build`
7. **Deploy**: Choose hosting platform

## Troubleshooting

### Terminal Issues (Termux)

If you encounter terminal issues:

1. **Check permissions**: `chmod +x micro`
2. **Verify dependencies**: `pkg install micro jq tmux`
3. **Restart Termux**: Fully close and reopen
4. **Use SSH**: `ssh user@localhost -p 8080`

### Mobile Browser Issues

1. **Clear cache**: Settings → Privacy → Clear cache
2. **Enable JavaScript**: Settings → Advanced → Enable JavaScript
3. **Zoom to desktop view**: Favicon zoom icon
4. **Check Progressive Web App**: Add to home screen

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following mobile-first principles
4. Test thoroughly on mobile devices
5. Submit a pull request

## License

This project is licensed under the MIT License. Feel free to contribute and improve the heart health monitoring experience for mobile users.

---

*Built with ❤️ for mobile-first heart health tracking*
*Following offline-first principles for reliable vitals monitoring*