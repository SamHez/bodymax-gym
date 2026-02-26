import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Login } from './components/Login';
import { Sidebar, MobileHeader, TopNav } from './components/Navigation';
import { BottomNav } from './components/BottomNav';
import { DashboardSnapshot } from './components/DashboardSnapshot';
import { MembershipRegistration } from './components/MembershipRegistration';
import { MemberList } from './components/MemberList';
import { AttendanceTracking } from './components/AttendanceTracking';
import { FinanceReports } from './components/FinanceReports';
import ExpenseManagement from './components/ExpenseManagement';
import { ExpiryMonitoring } from './components/ExpiryMonitoring';
import { TrainersSchedules } from './components/TrainersSchedules';
import { FrontDeskDashboard } from './components/FrontDeskDashboard';
import { useTheme } from './lib/useTheme';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    setUser({ email: authUser.email, role: profile?.role?.toLowerCase() || 'receptionist', id: authUser.id });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRegister = async (formData) => {
    try {
      // 1. Generate Unique Member Code
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const memberCode = `BM-${formData.branchCode}-${year}-${random}`;

      // 2. Create Member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([{
          member_code: memberCode,
          branch_code: formData.branchCode,
          full_name: formData.fullName,
          phone: formData.phone,
          category: formData.category,
          duration: formData.duration,
          picture_url: formData.picture,
          start_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Active'
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      setShowRegistration(false);
      navigate('/members');

      // 3. Create initial payment
      const basePrice = 30000;
      await supabase
        .from('payments')
        .insert([{
          member_id: member.id,
          amount: basePrice,
          payment_method: formData.paymentMethod
        }]);

    } catch (error) {
      console.error("Registration Error:", error.message);
      alert("Failed to register member: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-accent text-[10px] font-black uppercase tracking-[1em] animate-pulse">Initializing System...</div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="min-h-screen bg-surface text-text transition-colors duration-500">
      {user && (
        <>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => navigate(`/${tab}`)}
            user={user}
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <div className={cn(
            "flex flex-col min-h-screen relative transition-all duration-300 gap-6",
            isSidebarCollapsed ? "lg:pl-28" : "lg:pl-72"
          )}>
            <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] bg-primary/[0.08] dark:bg-primary/[0.15] rounded-full blur-[120px] pointer-events-none transition-all animate-pulse duration-[10s]" />
            <div className="fixed bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-accent/[0.1] dark:bg-accent/[0.2] rounded-full blur-[100px] pointer-events-none transition-all animate-pulse duration-[8s]" />
            <MobileHeader user={user} onLogout={handleLogout} />
            <div className="hidden lg:block">
              <TopNav user={user} onLogout={handleLogout} />
            </div>
            <main className={cn(
              "flex-1 px-10 md:px-16 lg:px-20 pt-32 pb-40 lg:pt-10 lg:pb-16 max-w-[1800px] w-full relative z-10",
              "animate-in fade-in duration-700"
            )}>
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
                <Route path="/dashboard" element={
                  user.role === 'manager' ? <DashboardSnapshot /> : <FrontDeskDashboard onNavigate={(tab, subAction) => {
                    navigate(`/${tab}`);
                    if (subAction === 'register') setShowRegistration(true);
                  }} />
                } />
                <Route path="/members" element={
                  showRegistration ? (
                    <MembershipRegistration onComplete={handleRegister} onCancel={() => setShowRegistration(false)} />
                  ) : (
                    <MemberList onAddMember={() => setShowRegistration(true)} />
                  )
                } />
                <Route path="/attendance" element={<AttendanceTracking />} />
                <Route path="/finance" element={<FinanceReports />} />
                <Route path="/expenses" element={<ExpenseManagement user={user} />} />
                <Route path="/expiry" element={user.role === 'manager' ? <ExpiryMonitoring /> : <Navigate to="/dashboard" />} />
                <Route path="/trainers" element={user.role === 'manager' ? <TrainersSchedules /> : <Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <BottomNav activeTab={activeTab} onTabChange={(tab) => navigate(`/${tab}`)} user={user} />
          </div>
        </>
      )}
      {!user && <Routes><Route path="*" element={<Login onLogin={setUser} />} /></Routes>}
    </div>
  );
}

export default App;
