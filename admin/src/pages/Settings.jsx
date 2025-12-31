import React from 'react';

export default function Settings() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">Settings configuration will appear here.</p>

                {/* Example sections placeholder */}
                <div className="mt-6 space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="font-medium text-gray-700">General Settings</h3>
                        <p className="text-sm text-gray-400">Manage general application preferences.</p>
                    </div>

                    <div className="border-b border-gray-100 pb-4">
                        <h3 className="font-medium text-gray-700">Account</h3>
                        <p className="text-sm text-gray-400">Update admin account details.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
