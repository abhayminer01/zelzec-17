import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  UserCog,
  Folder,
  Activity,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const mainMenu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Users", icon: <Users size={20} />, path: "/dashboard/users" },
    { name: "Products", icon: <Package size={20} />, path: "/dashboard/products" },
    { name: "Admins", icon: <UserCog size={20} />, path: "/dashboard/admins" },
    { name: "Categories", icon: <Folder size={20} />, path: "/dashboard/categories" },
    { name: "Settings", icon: <Settings size={20} />, path: "/dashboard/settings" },
  ];

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`h-screen bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out z-50 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Logo */}
      <div>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} py-5 border-b border-gray-100`}>
          <div className="flex items-center gap-2">
            <img className="size-8" src="/icon.png" alt="Logo" />
            {!isCollapsed && (
              <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap overflow-hidden">
                ZelZec Admin
              </h1>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <nav className="mt-6 flex flex-col gap-1 px-3">
          {mainMenu.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              end={item.path === "/dashboard"}
              title={isCollapsed ? item.name : ""}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-3 rounded-lg text-sm transition-all duration-300 ${isActive
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`${isActive ? "text-indigo-600" : "text-gray-500"} min-w-[20px] text-center`}>
                    {item.icon}
                  </div>
                  <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <span>{item.name}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
