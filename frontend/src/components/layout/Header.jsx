import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, Bell, User } from "lucide-react";

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-500 hover:text-gray-600 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-semibold text-gray-900">PFM Dashboard</h1>

        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's your financial overview
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
