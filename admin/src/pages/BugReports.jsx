import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BugReportCard from '../components/BugReportCard';
import { Loader2, Bug } from 'lucide-react';

export default function BugReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBugReports();
    }, []);

    const fetchBugReports = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bug`,
                { withCredentials: true }
            );
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching bug reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (updatedReport) => {
        setReports(prev => prev.map(report =>
            report._id === updatedReport._id ? updatedReport : report
        ));
    };

    const handleDelete = (reportId) => {
        setReports(prev => prev.filter(report => report._id !== reportId));
    };

    const activeReports = reports.filter(r => r.status === 'Pending');
    const fixedReports = reports.filter(r => r.status === 'Fixed');

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bug className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg w-9 h-9" />
                    Bug Reports
                </h1>
                <p className="text-gray-500 mt-1">Manage and track user reported issues.</p>
            </div>

            <div className="space-y-8">
                {/* Active Reports Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Active Reports</h2>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {activeReports.length}
                        </span>
                    </div>
                    <div className="p-6">
                        {activeReports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeReports.map(report => (
                                    <BugReportCard
                                        key={report._id}
                                        report={report}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check size={24} className="text-green-500" />
                                </div>
                                <p>No active bugs to report!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Reports Section */}
                {fixedReports.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Resolved Issues</h2>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {fixedReports.length}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {fixedReports.map(report => (
                                    <BugReportCard
                                        key={report._id}
                                        report={report}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// Import Check icon which was used but not imported
import { Check } from 'lucide-react';
