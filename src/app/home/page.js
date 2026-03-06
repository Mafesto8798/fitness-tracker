"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TabNavigation from "../components/TabNavigation";
import BottomTabBar from "../components/BottomTabBar";
import DashboardView from "../components/DashboardView";
import WorkoutsView from "../components/WorkoutsView";
import ExerciseTemplatesView from "../components/ExerciseTemplatesView";
import { useWorkouts } from "../context/WorkoutContext";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";

function HomeContent() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('dashboard');
  const { clearWorkouts } = useWorkouts();
  const { signOut, userProfile } = useAuth();

  const handleLogout = async () => {
    clearWorkouts();
    await signOut();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} title="Logout" className="bg-transparent border-none p-1.5 cursor-pointer rounded-lg hover:bg-black/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{color: 'var(--text-secondary)'}}>
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <h1 className="text-lg font-extrabold" style={{color: 'var(--text-primary)'}}>Fitness Tracker</h1>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => router.push('/profile')}
            title="My Profile"
            className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2" style={{background: 'var(--input-background)', borderColor: 'var(--border-accent)'}}>
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{color: 'var(--text-light)'}}>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <span className="hidden md:inline text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
              Profile
            </span>
          </button>
        </div>

        {/* Tab Navigation (Desktop) */}
        <TabNavigation activeView={activeView} onViewChange={setActiveView} />

        {/* Content Area */}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'workouts' && <WorkoutsView />}
        {activeView === 'exerciseTemplates' && <ExerciseTemplatesView />}

        {/* Bottom Tab Bar (Mobile) */}
        <BottomTabBar activeView={activeView} onViewChange={setActiveView} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
