import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import AchievementProgressBar from './achievements/AchievementProgressBar';
import AchievementBadge from './achievements/AchievementBadge';
import AchievementStatsWidget from './achievements/AchievementStatsWidget';
import AchievementNotification, { type AchievementToast } from './achievements/AchievementNotification';
import { useAuth } from '../context/AuthContext';

type Tier = 'bronze' | 'silver' | 'gold' | undefined;
function safeTier(tier: string | undefined): Tier {
  if (tier === 'bronze' || tier === 'silver' || tier === 'gold') return tier;
  return undefined;
}

const OrbsBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-700 opacity-30 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-fuchsia-500 opacity-20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400 opacity-10 rounded-full blur-2xl animate-pulse" />
  </div>
);

const AchievementsPage = () => {
  // Auth
  const { user } = useAuth();
  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAchievement, setModalAchievement] = useState<any>(null);

  // Notification state
  const [notifications, setNotifications] = useState<AchievementToast[]>([]);
  // Track unlocked achievement ids to detect new unlocks
  const unlockedIdsRef = useRef<Set<string>>(new Set());

  // Data
  const { achievements, loading, error } = useAchievements(user?.id);

  // Detect new unlocks and show notification
  useEffect(() => {
    if (!achievements?.length) return;
    const prev = unlockedIdsRef.current;
    const current = new Set(achievements.filter(a => a.unlocked).map(a => a.id));
    // Find newly unlocked achievements
    achievements.forEach(a => {
      if (a.unlocked && !prev.has(a.id)) {
        setNotifications(n => [
          ...n,
          {
            id: a.id + '-' + Date.now(),
            title: 'Achievement Unlocked!',
            icon: a.icon,
            description: a.title,
            unlockedAt: a.unlocked_at,
          },
        ]);
      }
    });
    unlockedIdsRef.current = current;
  }, [achievements]);

  const removeNotification = (id: string) => {
    setNotifications(n => n.filter(noti => noti.id !== id));
  };

  // Filtering/search logic
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    if (selectedTier !== 'all') {
      filtered = filtered.filter(a => a.tier === selectedTier);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [achievements, selectedCategory, selectedTier, searchQuery]);

  // Stats (stub)
  const totalPoints = useMemo(() => filteredAchievements.reduce((sum, a) => sum + (a.points || 0), 0), [filteredAchievements]);
  const completion = useMemo(() => achievements.length ? Math.round(100 * achievements.filter(a => a.unlocked).length / achievements.length) : 0, [achievements]);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center pb-8">
      <OrbsBackground />
      {/* Header */}
      <header className="w-full max-w-5xl px-4 pt-8 flex flex-col gap-2 items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">Achievements</h1>
        <p className="text-slate-300 text-lg">Track your reading journey and unlock milestones!</p>
      </header>

      {/* Stats Overview */}
      <section className="w-full max-w-5xl mt-8 px-4 flex flex-wrap gap-4 justify-center">
        <AchievementStatsWidget
          unlocked={unlockedCount}
          total={achievements.length}
          percent={completion}
          points={totalPoints}
        />
      </section>

      {/* Filters */}
      <section className="w-full max-w-5xl mt-8 px-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded-lg ${selectedCategory==='all' ? 'bg-purple-700 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedCategory('all')}>All</button>
          <button className={`px-3 py-1 rounded-lg ${selectedCategory==='sessions' ? 'bg-purple-700 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedCategory('sessions')}>Sessions</button>
          <button className={`px-3 py-1 rounded-lg ${selectedCategory==='time' ? 'bg-purple-700 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedCategory('time')}>Time</button>
          <button className={`px-3 py-1 rounded-lg ${selectedCategory==='streaks' ? 'bg-purple-700 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedCategory('streaks')}>Streaks</button>
          <button className={`px-3 py-1 rounded-lg ${selectedCategory==='books' ? 'bg-purple-700 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedCategory('books')}>Books</button>
        </div>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded-lg ${selectedTier==='all' ? 'bg-yellow-500 text-slate-900' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedTier('all')}>All Tiers</button>
          <button className={`px-3 py-1 rounded-lg ${selectedTier==='bronze' ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedTier('bronze')}>Bronze</button>
          <button className={`px-3 py-1 rounded-lg ${selectedTier==='silver' ? 'bg-slate-400 text-slate-900' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedTier('silver')}>Silver</button>
          <button className={`px-3 py-1 rounded-lg ${selectedTier==='gold' ? 'bg-yellow-400 text-slate-900' : 'bg-white/10 text-slate-300'}`} onClick={()=>setSelectedTier('gold')}>Gold</button>
        </div>
        <input className="ml-2 px-3 py-1 rounded-lg bg-white/10 text-white placeholder:text-slate-400 outline-none" placeholder="Search achievements..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
      </section>

      {/* Loading/Error States */}
      {loading && <div className="mt-12 text-center text-white">Loading achievements...</div>}
      {error && <div className="mt-12 text-center text-red-400">{error}</div>}

      {/* Achievements Grid */}
      <main className="w-full max-w-5xl mt-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading && !error && filteredAchievements.map((achv) => (
          <div
            key={achv.id}
            className={`rounded-xl p-5 shadow-xl backdrop-blur-sm border border-white/10 transition-transform duration-300 hover:scale-105 cursor-pointer ${achv.unlocked ? 'bg-gradient-to-br from-purple-700/80 to-slate-800/80' : 'bg-white/10 grayscale'}`}
            onClick={()=>{ setShowModal(true); setModalAchievement(achv); }}
          >
            <div className="flex justify-center mb-2">
              <AchievementBadge icon={achv.icon} tier={safeTier(achv.tier)} unlocked={achv.unlocked} size={48} />
            </div>
            <div className="font-bold text-xl text-white mb-1 text-center">{achv.title}</div>
            <div className="text-slate-300 text-sm mb-2 text-center">{achv.description}</div>
            {achv.progress && (
              <AchievementProgressBar
                current={achv.progress.current}
                target={achv.progress.target}
                tier={safeTier(achv.tier)}
                unlocked={achv.unlocked}
              />
            )}
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${achv.tier==='bronze' ? 'bg-amber-700 text-amber-100' : achv.tier==='silver' ? 'bg-slate-500 text-slate-100' : 'bg-yellow-500 text-yellow-900'}`}>{achv.tier?.toUpperCase?.() ?? ''}</span>
              {achv.unlocked ? <span className="ml-2 text-green-400 font-semibold">Unlocked</span> : <span className="ml-2 text-slate-400">Locked</span>}
            </div>
          </div>
        ))}
      </main>

      {/* Modal */}
      {showModal && modalAchievement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full text-white relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-white" onClick={()=>setShowModal(false)}>&times;</button>
            <div className="flex flex-col items-center gap-2">
              <AchievementBadge icon={modalAchievement.icon} tier={safeTier(modalAchievement.tier)} unlocked={modalAchievement.unlocked} size={64} />
              <h2 className="text-2xl font-bold mb-2 text-center">{modalAchievement.title}</h2>
            </div>
            <p className="mb-4 text-center">{modalAchievement.description}</p>
            {modalAchievement.progress && (
              <div className="mb-2">
                <AchievementProgressBar
                  current={modalAchievement.progress.current}
                  target={modalAchievement.progress.target}
                  tier={safeTier(modalAchievement.tier)}
                  unlocked={modalAchievement.unlocked}
                />
              </div>
            )}
            {modalAchievement.unlocked && <div className="mt-2 text-green-400 font-semibold text-center">Unlocked on {modalAchievement.unlocked_at?.slice(0,10)}</div>}
            <button className="mt-4 px-4 py-2 bg-purple-700 rounded-lg text-white font-semibold hover:bg-purple-800 transition w-full" onClick={()=>setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Achievement Notifications */}
      <AchievementNotification notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default AchievementsPage;
