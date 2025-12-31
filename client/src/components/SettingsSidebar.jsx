import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { X, User, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsSidebar() {
    const { isSettingsOpen, closeSettings } = useSettings();
    const navigate = useNavigate();

    return (
        <div
            className={`fixed inset-0 z-50 transform pointer-events-none transition-all duration-300 ease-in-out`}
        >
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeSettings}
            />
            <div
                className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out pointer-events-auto ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                        <button
                            onClick={closeSettings}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                        <div
                            onClick={() => {
                                navigate('/account');
                                closeSettings();
                            }}
                            className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-all group"
                        >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <User size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Account</span>
                                <span className="text-sm text-gray-500">Manage your account details</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg opacity-50 cursor-not-allowed flex items-center gap-4 transition-all group">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg transition-colors">
                                <Crown size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">Premium</span>
                                <span className="text-sm text-gray-500">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
