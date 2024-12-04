import React, { useState, useRef } from 'react';
import { AlertTriangle, Hexagon, FileText, AlertOctagon } from 'lucide-react';

const MenuButton = ({ icon: Icon, count, label, isActive, type, onClick }) => {
  // Color schemes for different types
  const colors = {
    warning: {
      base: 'border-yellow-200 hover:border-yellow-300',
      active: 'bg-yellow-50 border-yellow-300',
      text: 'text-yellow-700',
      hover: 'hover:bg-yellow-50',
      icon: 'text-yellow-500'
    },
    critical: {
      base: 'border-red-200 hover:border-red-300',
      active: 'bg-red-50 border-red-300',
      text: 'text-red-700',
      hover: 'hover:bg-red-50',
      icon: 'text-red-500'
    }
  };

  const colorScheme = colors[type];

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center px-4 py-2 rounded-lg border
        transition-all duration-200 ease-in-out
        ${colorScheme.base}
        ${colorScheme.hover}
        ${isActive ? colorScheme.active : 'bg-white'}
        group
      `}
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-2 ${colorScheme.icon}`} />
        <span className={`font-medium ${colorScheme.text}`}>{count}</span>
      </div>
      <span className={`ml-2 ${colorScheme.text}`}>{label}</span>
    </button>
  );
};

const App = () => {
  const [currentDialog, setCurrentDialog] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const warningRef = useRef(null);
  const criticalRef = useRef(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-rose-600 mr-2" />
              <span className="font-semibold text-gray-900">Scancontract</span>
            </div>

            {/* Issue Filters */}
            <div className="flex items-center space-x-3">
              <MenuButton
                icon={AlertTriangle}
                count="2"
                label="Warnings"
                type="warning"
                isActive={activeFilter === 'warning'}
                onClick={() => setActiveFilter(activeFilter === 'warning' ? null : 'warning')}
              />
              <MenuButton
                icon={AlertOctagon}
                count="1"
                label="Critical Issues"
                type="critical"
                isActive={activeFilter === 'critical'}
                onClick={() => setActiveFilter(activeFilter === 'critical' ? null : 'critical')}
              />
            </div>
          </div>

          {/* Optional: Active Filter Indicator */}
          {activeFilter && (
            <div className="mt-2 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
              Showing {activeFilter === 'warning' ? 'warnings' : 'critical issues'} only
            </div>
          )}
        </div>
      </div>

      {/* Rest of your existing content... */}
    </div>
  );
};

export default App;
