import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import Link from "next/link";
import Image from "next/image";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  // Get current date for greeting
  const today = new Date();
  const hour = today.getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  if (hour >= 17) greeting = "Good evening";

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT - Main Content */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">{greeting}, Admin!</h1>
          <p className="text-purple-100 mt-2">
            Here's what's happening at Flood of Life Embassy today.
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Link href="/list/events/new" 
                  className="bg-white text-purple-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors">
              + Schedule Event
            </Link>
            <Link href="/list/announcements/new" 
                  className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-400 transition-colors">
              + New Announcement
            </Link>
          </div>
        </div>

        {/* USER CARDS - Church Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UserCard type="admin" />
          <UserCard type="pastor" />
          <UserCard type="member" />
          <UserCard type="familyHead" />
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UserCard type="cellGroup" />
          <UserCard type="ministry" />
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Contributions (MTD)</p>
              <p className="text-2xl font-bold text-green-600">₵45.2K</p>
              <p className="text-xs text-gray-400">↑ 12% from last month</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance (Sun)</p>
              <p className="text-2xl font-bold text-blue-600">328</p>
              <p className="text-xs text-gray-400">78% of members</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg">⛪</span>
            </div>
          </div>
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART - Demographics */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* BOTTOM CHART - Finance */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Activities</h2>
            <Link href="/reports" className="text-sm text-purple-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium">New tithe recorded</p>
                <p className="text-xs text-gray-400">5 minutes ago • Member #1234</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🙏</span>
              </div>
              <div>
                <p className="text-sm font-medium">New prayer request</p>
                <p className="text-xs text-gray-400">15 minutes ago • Sister Mary</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium">New member registered</p>
                <p className="text-xs text-gray-400">1 hour ago • John Doe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - Sidebar */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">QUICK STATS</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-xs text-gray-500">Services This Week</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">8</p>
              <p className="text-xs text-gray-500">Prayer Meetings</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600">5</p>
              <p className="text-xs text-gray-500">Outreach Programs</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-xs text-gray-500">Baptisms</p>
            </div>
          </div>
        </div>

        {/* Event Calendar */}
        <EventCalendarContainer searchParams={searchParams} />

        {/* Upcoming Birthdays */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">🎂 UPCOMING BIRTHDAYS</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sarah Johnson</span>
              <span className="text-xs text-gray-400">Tomorrow</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pastor Michael</span>
              <span className="text-xs text-gray-400">May 15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Esther Williams</span>
              <span className="text-xs text-gray-400">May 18</span>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
