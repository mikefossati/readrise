import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';

interface TimerStatsProps {
  todayMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
  weeklyGoal?: number;
  averageSessionLength: number;
  totalSessions: number;
}

export const TimerStats: React.FC<TimerStatsProps> = ({
  todayMinutes,
  weeklyMinutes,
  currentStreak,
  weeklyGoal = 150,
  averageSessionLength,

}) => {
  const weeklyProgress = Math.min((weeklyMinutes / weeklyGoal) * 100, 100);

  return (
    <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/30">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">Your Reading Progress</h3>
          <p className="text-gray-400 text-sm">Stay motivated with your reading journey</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Today's Progress */}
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{todayMinutes}m</div>
            <div className="text-xs text-blue-300">Today</div>
          </div>
          
          {/* Current Streak */}
          <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{currentStreak}</div>
            <div className="text-xs text-orange-300">Day Streak</div>
          </div>
          
          {/* Weekly Goal */}
          <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Target className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{Math.round(weeklyProgress)}%</div>
            <div className="text-xs text-purple-300">Weekly Goal</div>
            <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
              <div 
                className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Average Session */}
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{averageSessionLength}m</div>
            <div className="text-xs text-green-300">Avg Session</div>
          </div>
        </div>
        
        {/* Motivational Message */}
        <div className="mt-4 text-center">
          {currentStreak >= 7 && (
            <Badge variant="outline" className="border-orange-500/30 text-orange-300">
              🔥 You're on fire! {currentStreak} day streak
            </Badge>
          )}
          {todayMinutes >= 60 && (
            <Badge variant="outline" className="border-green-500/30 text-green-300 ml-2">
              💪 Over 1 hour today!
            </Badge>
          )}
          {weeklyProgress >= 100 && (
            <Badge variant="outline" className="border-purple-500/30 text-purple-300 ml-2">
              🎯 Weekly goal achieved!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
