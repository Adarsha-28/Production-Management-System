import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

export default function Layout() {
  const { dark } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen" style={{ background: dark ? '#12162a' : '#f9fafb' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }}>
        <Navbar sidebarWidth={sidebarWidth} />
        <main className="pt-16 min-h-screen">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
