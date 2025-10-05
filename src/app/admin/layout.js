import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error('Error getting session:', error);
    redirect('/auth/login?error=SessionError');
  }
  
  if (!session?.user) {
    console.log('No user session found, redirecting to login');
    redirect('/auth/login?callbackUrl=/admin');
  }
  
  const userEmail = session.user.email?.toLowerCase();
  const userRole = session.user.role?.toLowerCase();
  const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
  
  console.log('Admin Access Check:', {
    userEmail,
    userRole,
    isAdminUser,
    hasSession: !!session,
    hasUser: !!session?.user
  });
  
  if (!isAdminUser) {
    console.log('Access denied - User is not an admin');
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
