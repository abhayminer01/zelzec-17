import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVisitorStats } from "../services/visitor-api";
import jsPDF from "jspdf";
import {
  Users,
  Boxes,
  Shield,
  FolderCog,
  TrendingUp,
  Download,
  Clock,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Dashboard() {
  const navigate = useNavigate();
  /* Dashboard Ref removed */

  const [loading, setLoading] = useState(true);

  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [browserData, setBrowserData] = useState([]);

  const [totalVisitors, setTotalVisitors] = useState(0);

  const cards = [
    {
      title: "Manage Admins",
      icon: <Shield size={26} />,
      color: "bg-indigo-500",
      action: () => navigate("/dashboard/admins"),
    },
    {
      title: "Manage Categories",
      icon: <FolderCog size={26} />,
      color: "bg-blue-500",
      action: () => navigate("/dashboard/categories"),
    },
    {
      title: "Manage Users",
      icon: <Users size={26} />,
      color: "bg-emerald-500",
      action: () => navigate("/dashboard/users"),
    },
    {
      title: "Manage Products",
      icon: <Boxes size={26} />,
      color: "bg-purple-500",
      action: () => navigate("/dashboard/products"),
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getVisitorStats();
    if (data) {
      // Hourly (Today)
      setHourlyData(data.hourly.map(item => ({
        hour: `${item.hour}:00`,
        users: item.count
      })));

      // Daily (Last 30 Days)
      setDailyData(data.daily.map(item => {
        const date = new Date(item._id);
        return {
          date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          users: item.count
        };
      }));

      // Monthly (Last 12 Months)
      setMonthlyData(data.monthly.map(item => {
        // item._id is "YYYY-MM"
        const [year, month] = item._id.split('-');
        const date = new Date(year, month - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          users: item.count
        };
      }));

      // Browser Distribution
      setBrowserData(data.browsers);

      setTotalVisitors(data.total);
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Helper for centering text
    const centerText = (text, y) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Helper to generate the stats content
    const generateRestOfPDF = (currentY) => {
      let yPos = currentY;

      const checkPageBreak = (heightNeeded) => {
        if (yPos + heightNeeded >= doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = 20;
        }
      };

      // 2. Monthly Stats
      checkPageBreak(60);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Overview (Last 12 Months)", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      if (monthlyData.length >= 2) {
        const currentMonth = monthlyData[monthlyData.length - 1];
        const prevMonth = monthlyData[monthlyData.length - 2];
        const growth = prevMonth.users > 0
          ? ((currentMonth.users - prevMonth.users) / prevMonth.users * 100).toFixed(1)
          : 0;

        doc.text(`Latest Month (${currentMonth.month}): ${currentMonth.users} visitors`, margin, yPos);
        yPos += 7;
        doc.text(`Previous Month (${prevMonth.month}): ${prevMonth.users} visitors`, margin, yPos);
        yPos += 7;
        doc.text(`Growth: ${growth}%`, margin, yPos);
        yPos += 10;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Month", margin, yPos);
      doc.text("Visitors", margin + 50, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");

      monthlyData.slice().reverse().forEach(item => {
        checkPageBreak(10);
        doc.text(item.month, margin, yPos);
        doc.text(String(item.users), margin + 50, yPos);
        yPos += 7;
      });
      yPos += 10;

      // 3. Daily Stats
      checkPageBreak(60);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Overview (Last 30 Days)", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Date", margin, yPos);
      doc.text("Visitors", margin + 50, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");

      dailyData.slice().reverse().forEach(item => {
        checkPageBreak(10);
        doc.text(item.date, margin, yPos);
        doc.text(String(item.users), margin + 50, yPos);
        yPos += 7;
      });
      yPos += 10;

      // 4. Hourly Stats
      checkPageBreak(60);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Today's Hourly Traffic", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Hour", margin, yPos);
      doc.text("Visitors", margin + 50, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");

      hourlyData.forEach(item => {
        if (item.users > 0) {
          checkPageBreak(10);
          doc.text(item.hour, margin, yPos);
          doc.text(String(item.users), margin + 50, yPos);
          yPos += 7;
        }
      });

      doc.save("Zelzec_Audit_Report.pdf");
    };

    // Main Execution with Image Loading
    const logoUrl = '/icon.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      let yPos = 20;
      const logoSize = 15;
      doc.addImage(img, 'PNG', margin, yPos, logoSize, logoSize);

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Zelzec Audit Report", margin + logoSize + 5, yPos + 10);

      yPos += 20;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      centerText(`Generated on: ${new Date().toLocaleString()}`, yPos);
      yPos += 20;

      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      generateRestOfPDF(yPos);
    };

    img.onerror = () => {
      let yPos = 20;
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      centerText("Zelzec Audit Report", yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      centerText(`Generated on: ${new Date().toLocaleString()}`, yPos);
      yPos += 20;

      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      generateRestOfPDF(yPos);
    };
  }; // This closes handleDownloadPDF

  return (
    <>
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            ZelZec Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, manage your system efficiently.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Download size={18} />
          Download Report
        </button>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className={`cursor-pointer rounded-xl p-6 shadow-sm hover:shadow-md transition-all bg-white border border-gray-100 flex flex-col items-start gap-3 hover:-translate-y-1`}
          >
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              {card.icon}
            </div>
            <h2 className="text-gray-800 font-semibold text-lg">
              {card.title}
            </h2>
          </div>
        ))}
      </section>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Traffic (Hourly) */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} />
              Today's Hourly Traffic
            </h2>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#8b5cf6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Last 30 Days */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} />
              Last 30 Days
            </h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Total: {totalVisitors}</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Monthly Trend */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} />
              Monthly Trend
            </h2>
            <span className="text-sm text-gray-400">Last 12 Months</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Browser Distribution */}
        <section className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} />
              Visitor Distribution
            </h2>
          </div>
          <div className="w-full h-72 flex justify-center items-center">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">No data available</div>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
