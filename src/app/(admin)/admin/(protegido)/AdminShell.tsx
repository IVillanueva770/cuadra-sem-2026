'use client';

import {useState} from 'react';
import SidebarAdmin from './SidebarAdmin';

/** Cáscara visual del panel: sidebar colapsable más el área de contenido. */
export default function AdminShell({children}: {children: React.ReactNode}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg)'}}>
      <SidebarAdmin
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main
        className={`min-w-0 overflow-auto transition-[margin,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? 'md:ml-0 md:pl-16' : 'md:ml-[200px] md:pl-0'
        }`}
      >
        <div className="p-4 pt-16 md:p-8 md:pt-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
