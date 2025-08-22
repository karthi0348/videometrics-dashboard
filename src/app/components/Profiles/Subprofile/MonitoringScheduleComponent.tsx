import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Code, Edit, Eye, Copy, RotateCcw, AlertCircle, Calendar, Clock, Globe, Flag, Play } from 'lucide-react';

const MonitoringScheduleEditor = () => {
  const [monitoringSchedules, setMonitoringSchedules] = useState([]);
  const [configurationMode, setConfigurationMode] = useState('form');
  const [jsonValue, setJsonValue] = useState('[]');
  const [jsonError, setJsonError] = useState('');
  const [expandedSchedules, setExpandedSchedules] = useState(new Set(['root']));

  // Days of the week options
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const priorityOptions = ['low', 'medium', 'high'];
  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai'
  ];

  // Initialize with sample data
  useEffect(() => {
    const sampleSchedules = [
      {
        name: "Weekday Business Hours",
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isActive: true,
        priority: 'high'
      },
      {
        name: "Weekend Monitoring",
        days: ['saturday', 'sunday'],
        startTime: '10:00',
        endTime: '16:00',
        timezone: 'America/New_York',
        isActive: false,
        priority: 'medium'
      }
    ];
    setMonitoringSchedules(sampleSchedules);
    updateJsonFromSchedules(sampleSchedules);
  }, []);

  const updateJsonFromSchedules = (schedules) => {
    setJsonValue(JSON.stringify(schedules, null, 2));
  };

  const updateSchedulesFromJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        setMonitoringSchedules(parsed);
        setJsonError('');
      } else {
        setJsonError('Data must be an array of monitoring schedules');
      }
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const addMonitoringSchedule = () => {
    const newSchedule = {
      name: `New Schedule ${monitoringSchedules.length + 1}`,
      days: ['monday'],
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
      isActive: true,
      priority: 'medium'
    };
    const newSchedules = [...monitoringSchedules, newSchedule];
    setMonitoringSchedules(newSchedules);
    updateJsonFromSchedules(newSchedules);
  };

  const updateMonitoringSchedule = (index, field, value) => {
    const newSchedules = monitoringSchedules.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    );
    setMonitoringSchedules(newSchedules);
    updateJsonFromSchedules(newSchedules);
  };

  const removeMonitoringSchedule = (index) => {
    const newSchedules = monitoringSchedules.filter((_, i) => i !== index);
    setMonitoringSchedules(newSchedules);
    updateJsonFromSchedules(newSchedules);
  };

  const toggleScheduleExpansion = (index) => {
    const key = `schedule-${index}`;
    const newExpanded = new Set(expandedSchedules);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSchedules(newExpanded);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(JSON.stringify(parsed));
      setJsonError('');
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const clearJson = () => {
    setJsonValue('[]');
    setMonitoringSchedules([]);
    setJsonError('');
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonValue);
  };

  const resetToFormData = () => {
    updateJsonFromSchedules(monitoringSchedules);
  };

  const applyJsonChanges = () => {
    updateSchedulesFromJson();
    setConfigurationMode('form');
  };

  const isValidJson = !jsonError && jsonValue.trim() !== '';
  const schedulesCount = monitoringSchedules.length;
  const activeSchedules = monitoringSchedules.filter(s => s.isActive).length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderFormField = (schedule, index) => {
    return (
      <div key={index} className="border rounded-lg p-6 bg-white shadow-sm">
        {/* Schedule Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <h4 className="text-lg font-medium text-gray-900">{schedule.name || `Schedule ${index + 1}`}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
              {schedule.priority}
            </span>
          </div>
          <button
            onClick={() => removeMonitoringSchedule(index)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Name */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Edit className="w-4 h-4" />
              Schedule Name
            </label>
            <input
              type="text"
              value={schedule.name}
              onChange={(e) => updateMonitoringSchedule(index, 'name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter schedule name"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4" />
              Priority
            </label>
            <select
              value={schedule.priority}
              onChange={(e) => updateMonitoringSchedule(index, 'priority', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Play className="w-4 h-4" />
              Status
            </label>
            <select
              value={schedule.isActive.toString()}
              onChange={(e) => updateMonitoringSchedule(index, 'isActive', e.target.value === 'true')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Start Time
            </label>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => updateMonitoringSchedule(index, 'startTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              End Time
            </label>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => updateMonitoringSchedule(index, 'endTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Timezone */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4" />
              Timezone
            </label>
            <select
              value={schedule.timezone}
              onChange={(e) => updateMonitoringSchedule(index, 'timezone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              Active Days
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schedule.days.includes(day)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...schedule.days, day]
                        : schedule.days.filter(d => d !== day);
                      updateMonitoringSchedule(index, 'days', newDays);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {day.substring(0, 3)}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Selected: {schedule.days.length} day{schedule.days.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTreeView = () => {
    return (
      <div className="space-y-4">
        {monitoringSchedules.map((schedule, index) => {
          const scheduleKey = `schedule-${index}`;
          const isExpanded = expandedSchedules.has(scheduleKey);
          
          return (
            <div key={index} className="border rounded-lg overflow-hidden bg-white">
              <div 
                className="px-4 py-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
                onClick={() => toggleScheduleExpansion(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    <div className={`w-3 h-3 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium text-gray-900">{schedule.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                      {schedule.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{schedule.days.length} days</span>
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                    <span>{schedule.timezone}</span>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 font-medium ${schedule.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priority:</span>
                      <span className="ml-2 font-medium">{schedule.priority}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <span className="ml-2 font-medium">{schedule.startTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>
                      <span className="ml-2 font-medium">{schedule.endTime}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Days:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {schedule.days.map(day => (
                        <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Timezone:</span>
                    <span className="ml-2 font-medium text-sm">{schedule.timezone}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Monitoring Schedule Editor</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isValidJson ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isValidJson ? 'Valid JSON' : 'Invalid JSON'}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {schedulesCount} schedule{schedulesCount !== 1 ? 's' : ''}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {activeSchedules} active
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Create and manage monitoring schedules with flexible time ranges and day selections.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setConfigurationMode('json')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'json'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Editor
          </button>
          <button
            onClick={() => setConfigurationMode('form')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'form'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit className="w-4 h-4" />
            Form Editor
          </button>
          <button
            onClick={() => setConfigurationMode('tree')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              configurationMode === 'tree'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            Tree View
          </button>
        </nav>
      </div>

      {/* JSON Editor Mode */}
      {configurationMode === 'json' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">JSON Configuration Editor</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyJson}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={resetToFormData}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Reset to Form Data"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={formatJson}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Format
              </button>
              <button
                onClick={minifyJson}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Minify
              </button>
              <button
                onClick={clearJson}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white">
              <textarea
                value={jsonValue}
                onChange={(e) => {
                  setJsonValue(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) {
                      setJsonError('');
                    } else {
                      setJsonError('Data must be an array of monitoring schedules');
                    }
                  } catch (error) {
                    setJsonError('Invalid JSON format');
                  }
                }}
                className="w-full h-80 p-4 font-mono text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter monitoring schedule JSON configuration..."
              />
            </div>

            {jsonError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
                <AlertCircle className="w-4 h-4" />
                {jsonError}
              </div>
            )}

            {isValidJson && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={applyJsonChanges}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Changes
                </button>
                <span className="text-sm text-gray-600">
                  Changes will be applied to the form editor
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Editor Mode */}
      {configurationMode === 'form' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Interactive Schedule Editor</h4>
            </div>
            <button
              onClick={addMonitoringSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </button>
          </div>

          <div className="space-y-6">
            {monitoringSchedules.map((schedule, index) => 
              renderFormField(schedule, index)
            )}

            {monitoringSchedules.length === 0 && (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Monitoring Schedules</h3>
                <p className="mb-6">Create your first monitoring schedule to get started.</p>
                <button
                  onClick={addMonitoringSchedule}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tree View Mode */}
      {configurationMode === 'tree' && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Schedule Tree View</h3>
            <span className="text-sm text-gray-500">
              Expandable view of all monitoring schedules
            </span>
          </div>
          
          {monitoringSchedules.length > 0 ? (
            renderTreeView()
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Schedules to Display</p>
              <p className="text-sm">Switch to Form Editor to create schedules</p>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-50 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span>Total: <span className="text-blue-600 font-medium">{schedulesCount} schedule{schedulesCount !== 1 ? 's' : ''}</span></span>
            <span>Active: <span className="text-green-600 font-medium">{activeSchedules}</span></span>
            <span>Inactive: <span className="text-gray-600 font-medium">{schedulesCount - activeSchedules}</span></span>
          </div>
          <span className="text-gray-500">{JSON.stringify(monitoringSchedules).length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScheduleEditor;