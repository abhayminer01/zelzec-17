import React, { useState } from 'react';
import axios from 'axios';
import { Check, Trash2, Mail, Calendar, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const BugReportCard = ({ report, onStatusChange, onDelete }) => {
    const [loading, setLoading] = useState(false);

    const handleFix = async () => {
        setLoading(true);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bug/${report._id}/status`,
                { status: 'Fixed' },
                { withCredentials: true }
            );
            onStatusChange(response.data.bugReport);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, dismiss it!'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/bug/${report._id}`,
                    { withCredentials: true }
                );
                onDelete(report._id);
                Swal.fire(
                    'Dismissed!',
                    'The bug report has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error('Error deleting report:', error);
                Swal.fire(
                    'Error!',
                    'Failed to dismiss the report.',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={`border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow ${report.status === 'Fixed' ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${report.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                        {report.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex gap-2">
                    {report.status === 'Pending' && (
                        <button
                            onClick={handleFix}
                            disabled={loading}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                            title="Mark as Fixed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        disabled={loading}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Dismiss Report"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                </div>
            </div>

            <p className="text-gray-800 mb-4 whitespace-pre-wrap">{report.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500 border-t pt-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                    {report.reporter?.full_name?.[0] || 'U'}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{report.reporter?.full_name || 'Unknown User'}</p>
                    <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <p>{report.reporter?.email || 'No Email'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BugReportCard;
