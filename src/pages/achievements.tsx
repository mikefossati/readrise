import React from 'react';
import AchievementsPage from '../components/AchievementsPage';
import AppLayout from '../components/layout/AppLayout';

const Achievements: React.FC = () => {
  return (
    <AppLayout currentPage="dashboard">
      <AchievementsPage />
    </AppLayout>
  );
};

export default Achievements;
