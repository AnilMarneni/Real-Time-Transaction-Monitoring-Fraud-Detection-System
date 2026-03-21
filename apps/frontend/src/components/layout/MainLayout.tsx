import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 font-sans">
      <Sidebar />
      <div className="pl-[260px] flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
