import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full bg-gray-50 p-10 overflow-y-auto overflow-x-hidden">
                <div className="pb-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
