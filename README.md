# ReadRise 📚

**Transform your reading habit with gamified focus sessions, progress tracking, and achievements that make every book an adventure.**

ReadRise is a modern web application that helps users build consistent reading habits through focused reading sessions, comprehensive progress tracking, and an engaging achievement system.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)

## ✨ Features

### 🎯 **Focus Sessions**
- **Pomodoro-style timers** with customizable durations (5-120 minutes)
- **Distraction-free reading** with pause/resume functionality
- **Session tracking** with mood, notes, and pages read
- **Keyboard shortcuts** (Space to pause/resume, Esc to stop)
- **Background persistence** - sessions survive page refreshes

### 📚 **Smart Library Management**
- **Google Books integration** for easy book discovery
- **Multiple reading statuses** (Want to Read, Currently Reading, Finished)
- **Star ratings** and personal book reviews
- **Book cover display** with fallback color themes
- **Advanced search and filtering** by title, author, and genre

### 🏆 **Achievement System**
- **30+ achievements** across multiple categories:
  - Session milestones (first session, 10 sessions, 100 sessions)
  - Time-based achievements (15 minutes, 1 hour, 100+ hours total)
  - Streak rewards (3, 7, 30, 100 consecutive days)
  - Book completion goals (1, 5, 10, 50+ books)
- **Progress tracking** with beautiful progress bars
- **Real-time notifications** with confetti celebrations
- **Achievement insights** showing your reading personality

### 📊 **Analytics & Insights**
- **Reading streaks** with intelligent calculation
- **Session statistics** (total time, average length, completion rates)
- **Weekly/monthly goals** with progress tracking
- **Reading patterns** analysis (best times, focus quality)
- **Personal dashboards** with motivational insights

### 🎨 **Modern User Experience**
- **Dark theme** optimized for reading
- **Responsive design** for desktop, tablet, and mobile
- **Smooth animations** and micro-interactions
- **Accessibility features** with keyboard navigation
- **Offline-ready** with service worker caching

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** for backend services

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/readrise.git
cd readrise
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Error Reporting
VITE_ERROR_ENDPOINT=your-error-reporting-endpoint

# Development
VITE_APP_ENV=development
```

4. **Set up Supabase database**

Run the SQL migrations in your Supabase dashboard:
```sql
-- See database/migrations/ for complete schema
-- Key tables: users, books, reading_sessions, achievements, user_achievements
```

5. **Start development server**
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see the application.

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (buttons, cards, etc.)
│   ├── layout/         # Layout components (header, navigation)
│   ├── timer/          # Reading timer components
│   ├── library/        # Book library components
│   ├── search/         # Book search components
│   ├── achievements/   # Achievement system components
│   └── common/         # Shared components (error boundaries, etc.)
├── hooks/              # Custom React hooks
│   ├── useTimer.ts     # Timer functionality
│   ├── useBookLibrary.ts # Library management
│   ├── useAchievements.ts # Achievement tracking
│   └── useAuth.ts      # Authentication
├── services/           # Business logic and API calls
│   ├── achievementService.ts # Achievement calculations
│   ├── errorService.ts # Error reporting and logging
│   └── dashboardService.ts # Dashboard analytics
├── lib/                # External service integrations
│   └── supabase.ts     # Supabase client and database functions
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── pages/              # Route components
└── styles/             # Global styles and themes
```

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - UI framework with hooks and concurrent features
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Secure data access
- **Real-time subscriptions** - Live data updates
- **Authentication** - Email/password and OAuth (Google)

### **State Management**
- **React Context** - Global state (auth, achievements)
- **Custom hooks** - Component-level state management
- **LocalStorage** - Offline persistence and session recovery

### **Development Tools**
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing utilities

## 🧪 Development Guidelines

### **Code Style**
- Use **TypeScript** for all new code
- Follow **React hooks patterns** for state management
- Implement **error boundaries** for component isolation
- Use **custom hooks** for reusable logic
- Write **comprehensive JSDoc** comments for public APIs

### **Component Structure**
```typescript
interface ComponentProps {
  // Always define props interface
  required: string;
  optional?: number;
  onAction: (data: ActionData) => void;
}

export const Component: React.FC<ComponentProps> = ({
  required,
  optional = 0,
  onAction,
}) => {
  // Hooks first
  const [state, setState] = useState();
  const { data, loading, error } = useCustomHook();
  
  // Event handlers
  const handleClick = useCallback(() => {
    onAction({ type: 'click' });
  }, [onAction]);
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  // Main render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
```

### **Error Handling**
- Wrap components in **error boundaries**
- Use the **error service** for logging
- Provide **recovery actions** for users
- Handle **offline scenarios** gracefully

### **Testing**
- Write **unit tests** for utilities and hooks
- Create **integration tests** for user workflows
- Use **React Testing Library** for component tests
- Aim for **>80% code coverage**

## 📡 API Documentation

### **Authentication**
```typescript
// Sign up new user
const { user, error } = await signup(email, password, { username });

// Sign in existing user  
const { user, error } = await login(email, password);

// Google OAuth
const { user, error } = await googleSignIn();

// Sign out
await logout();
```

### **Book Management**
```typescript
// Get user's books
const books = await getBooks(userId);

// Add book to library
const book = await addBook({
  user_id: userId,
  title: "Book Title", 
  author: "Author Name",
  cover_url: "https://...",
  reading_status: "want_to_read"
});

// Update reading status
await updateBookStatus(bookId, "currently_reading");

// Rate a book
await updateBookRating(bookId, 5);
```

### **Reading Sessions**
```typescript
// Start reading session
const session = await startSession({
  user_id: userId,
  book_id: bookId,
  planned_duration: 1500, // 25 minutes in seconds
  session_type: "focused"
});

// Complete session
await endSession(
  sessionId,
  endTime,
  actualDuration,
  true, // completed
  "great", // mood
  "Loved this chapter!" // notes
);

// Get recent sessions
const sessions = await getRecentSessions(userId, 10);
```

### **Achievements**
```typescript
// Get all achievements
const achievements = await getAchievements();

// Check user achievements
const userAchievements = await getUserAchievements(userId);

// Unlock achievement
const unlocked = await unlockAchievement(userId, achievementId);

// Update progress
await updateAchievementProgress(userId, "session_count", {
  current_progress: 5,
  target_progress: 10
});
```

## 🚀 Deployment

### **Environment Configuration**

**Staging:**
```env
VITE_SUPABASE_URL=your-staging-supabase-url
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_APP_ENV=staging
```

**Production:**
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_ENV=production
VITE_ERROR_ENDPOINT=your-error-reporting-service
```

### **Build & Deploy**

1. **Build for production**
```bash
npm run build
# or
yarn build
```

2. **Preview production build**
```bash
npm run preview
# or  
yarn preview
```

3. **Deploy to Vercel** (recommended)
```bash
vercel --prod
```

4. **Deploy to Netlify**
```bash
netlify deploy --prod --dir dist
```

### **Performance Optimization**
- **Code splitting** - Routes are lazy loaded
- **Image optimization** - Book covers are optimized
- **Bundle analysis** - Use `npm run build:analyze`
- **Service worker** - Offline caching enabled
- **Preloading** - Critical resources preloaded

## 🔧 Configuration

### **Supabase Setup**

1. **Create new project** at [supabase.com](https://supabase.com)

2. **Run database migrations:**
```sql
-- Create tables (see database/schema.sql)
-- Set up Row Level Security policies
-- Configure authentication providers
```

3. **Configure authentication:**
   - Enable email/password authentication
   - Set up Google OAuth (optional)
   - Configure redirect URLs

4. **Set up storage buckets:**
   - `book-covers` - For uploaded book cover images
   - `user-avatars` - For user profile pictures

### **Google Books API** (Optional)
For enhanced book search:

1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable Books API
3. Add to environment variables:
```env
VITE_GOOGLE_BOOKS_API_KEY=your-api-key
```

## 🐛 Troubleshooting

### **Common Issues**

**Build fails with TypeScript errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update dependencies
npm update
```

**Supabase connection issues:**
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Check Supabase dashboard for project status
```

**Timer not working:**
- Check if Web Workers are supported
- Verify timer worker script is accessible
- Check browser console for errors

**Achievement notifications not showing:**
- Verify achievement service is initialized
- Check browser notification permissions
- Ensure confetti library is loaded

### **Performance Issues**

**Slow page loads:**
- Run `npm run build:analyze` to check bundle size
- Enable network throttling in DevTools
- Check for memory leaks in timer components

**Memory leaks:**
- Monitor memory usage in DevTools
- Check for uncleared intervals/timeouts
- Verify Web Workers are properly terminated

### **Mobile Issues**

**Touch targets too small:**
- Ensure minimum 44px touch targets
- Test on actual devices, not just browser DevTools
- Check hover states work properly on touch devices

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the code style guidelines
4. Write tests for new features
5. Submit a pull request

### **Development Workflow**
1. **Pick an issue** from the GitHub issues
2. **Create a branch** with descriptive name
3. **Write code** following our style guide
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Submit pull request** with clear description

### **Code Review Process**
- All PRs require at least one approval
- Automated tests must pass
- Code coverage should not decrease
- Performance impact should be considered

### **Reporting Bugs**
- Use the bug report template
- Include steps to reproduce
- Provide browser/device information
- Include relevant console errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Books API** - Book metadata and covers
- **Supabase** - Backend infrastructure and database
- **React Team** - Amazing framework and developer experience
- **Tailwind CSS** - Beautiful utility-first styling
- **Open Source Community** - Countless helpful libraries

---

## 📞 Support

- **Documentation:** [ReadRise Wiki](https://github.com/your-org/readrise/wiki)
- **Issues:** [GitHub Issues](https://github.com/your-org/readrise/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/readrise/discussions)
- **Email:** support@readrise.app

**Made with ❤️ for book lovers everywhere.**