import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Feed } from './pages/Feed';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreatePostModal } from './components/CreatePostModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex gap-8">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

        <div className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
          {currentPage === 'feed' && (
            <Feed
              searchQuery={searchQuery}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          )}

          {currentPage === 'profile' && <Profile />}
          {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
          {currentPage === 'register' && <Register onNavigate={setCurrentPage} />}

          {(currentPage === 'explore' || currentPage === 'trending' || currentPage === 'saved') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <h3 className="text-xl font-bold capitalize text-slate-900 dark:text-slate-100">
                {currentPage} Section
              </h3>
              <p className="text-slate-500 text-sm">
                Discover trending topics and saved posts coming soon!
              </p>
              <button
                onClick={() => setCurrentPage('feed')}
                className="px-5 py-2 bg-indigo-600 text-white font-medium text-sm rounded-full"
              >
                Back to Feed
              </button>
            </div>
          )}
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
