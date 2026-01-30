/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { AuthContext } from "@/Firebase AuthProvider/AuthProvider";
import {
  FaChartLine,
  FaClipboardList,
  FaUserFriends,
  FaCalendarCheck,
} from "react-icons/fa";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Mock stats for display - could be fetched from API later
  const stats = [
    {
      title: "Total Surveys",
      value: "12",
      icon: FaClipboardList,
      color: "text-brand-500",
      bg: "bg-brand-50",
    },
    {
      title: "Active Responses",
      value: "1,240",
      icon: FaUserFriends,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "Avg. Completion",
      value: "88%",
      icon: FaChartLine,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "Tasks Pending",
      value: "3",
      icon: FaCalendarCheck,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="text-brand-400">
              {user?.displayName?.split(" ")[0] || "Admin"}
            </span>
            ! 👋
          </h1>
          <p className="text-navy-100/90 text-lg max-w-2xl">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-brand-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg ${stat.bg}`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-navy-900">
                  {stat.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholders for recent activity or charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <FaChartLine className="text-4xl mx-auto mb-4 opacity-50" />
            <p>Analytics Chart Placeholder</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-400">
            <FaClipboardList className="text-4xl mx-auto mb-4 opacity-50" />
            <p>Recent Activities Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
