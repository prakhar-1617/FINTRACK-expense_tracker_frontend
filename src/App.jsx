import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import AIInsights from './pages/AIInsights';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-14 md:pt-0"> {/* Add padding top for mobile navbar */}
        <Sidebar className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800" />
        <main className="flex-1 w-full overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute><AppLayout><Transactions /></AppLayout></PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute><AppLayout><Analytics /></AppLayout></PrivateRoute>
            } />
            <Route path="/budget" element={
              <PrivateRoute><AppLayout><Budget /></AppLayout></PrivateRoute>
            } />
            <Route path="/ai-insights" element={
              <PrivateRoute><AppLayout><AIInsights /></AppLayout></PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
