
import React from 'react';
import * as dashboardService from '../services/dashboardService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Timer, 
  Trophy, 
  TrendingUp, 
  Plus, 
  Search,
  Library, 
  Clock,
  Target,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import DashboardAchievementsWidget from './achievements/DashboardAchievementsWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Real data state
  const [loading, setLoading] = React.useState(true);
  const [totalBooks, setTotalBooks] = React.useState(0);
  const [todayMinutes, setTodayMinutes] = React.useState(0);
  const [currentStreak, setCurrentStreak] = React.useState(0);
  const [booksThisMonth, setBooksThisMonth] = React.useState(0);
  const weeklyGoal = 150;

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    let sessions: any[] = [];
    let books: any[] = [];
    let today = new Date();
    today.setHours(0,0,0,0);

    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    


    Promise.all([
      import('../lib/supabase').then(m => m.getBooks(user.id)),
      import('../lib/supabase').then(m => m.supabase.from('reading_sessions').select('*').eq('user_id', user.id)),
    ]).then(async ([booksRes, sessionsRes]) => {
      books = booksRes.data || [];
      sessions = (sessionsRes.data as any[]) || [];
      const now = new Date();
      setTotalBooks(dashboardService.getTotalBooks(books));
      setBooksThisMonth(dashboardService.getBooksThisMonth(books, now));
      setTodayMinutes(dashboardService.getTodayMinutes(sessions, now));
      setCurrentStreak(dashboardService.getCurrentStreak(sessions, now));
      setLoading(false);
    });
  }, [user]);

  return (
    <AppLayout currentPage="dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, 
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-2">
            {user?.email?.split('@')[0] || 'Reader'}
          </span>
          ! 📚
        </h1>
        <p className="text-gray-300 text-lg">
          Ready to continue your reading journey?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '...' : todayMinutes + 'm'}</div>
            <div className="text-sm text-gray-400">Today</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-2">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '...' : currentStreak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-2">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '...' : booksThisMonth}</div>
            <div className="text-sm text-gray-400">This Month</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? '...' : totalBooks}</div>
            <div className="text-sm text-gray-400">Total Books</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Dashboard Widget */}
      {user?.id && (
        <div className="mb-8 flex justify-center">
          <DashboardAchievementsWidget userId={user.id} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Start Reading Session */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-purple-600/30 transition-all cursor-pointer group"
              onClick={() => navigate('/timer')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Timer className="w-6 h-6" />
                <span>Start Reading</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Begin a focused reading session with timer
            </p>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {totalBooks === 0 ? 'No books added yet' : `${totalBooks} books available`}
            </Badge>
          </CardContent>
        </Card>

        {/* Add Books */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm hover:from-purple-500/30 hover:to-pink-600/30 transition-all cursor-pointer group"
              onClick={() => navigate('/search')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6" />
                <span>Add Books</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Search and add books to your library
            </p>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Get started
            </Badge>
          </CardContent>
        </Card>

        {/* My Library */}
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30 backdrop-blur-sm hover:from-orange-500/30 hover:to-red-600/30 transition-all cursor-pointer group"
              onClick={() => navigate('/library')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Library className="w-6 h-6" />
                <span>My Library</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Browse your personal book collection
            </p>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {totalBooks} books
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Reading Goal Progress */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-white">
            <Target className="w-6 h-6" />
            <span>Weekly Reading Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">
              {todayMinutes} / {weeklyGoal} minutes this week
            </span>
            <span className="text-sm text-gray-400">
              {Math.round((todayMinutes / weeklyGoal) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((todayMinutes / weeklyGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Set a reading goal to track your weekly progress and build consistent habits.
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-white">
            <TrendingUp className="w-6 h-6" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No reading sessions yet</h3>
            <p className="text-gray-400 mb-6">
              Start your first reading session to see your activity here.
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => navigate('/search')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Book
            </Button>
          </div>
        </CardContent>
      </Card>

    </AppLayout>
  );
};

export default Dashboard;