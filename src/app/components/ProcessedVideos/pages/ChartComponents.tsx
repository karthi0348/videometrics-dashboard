import React from "react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Pie,
  TooltipProps ,
} from "recharts";

// Enhanced Pie Chart Component
export const PieChart: React.FC<{
  data: { value: number[]; category: string[] };
  title: string;
  status: string;
}> = ({ data, title, status }) => {
  const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  // Transform data for Recharts
  const chartData = data.category.map((category, index) => ({
    name: category,
    value: data.value[index],
    percentage: ((data.value[index] / data.value.reduce((sum, val) => sum + val, 0)) * 100).toFixed(1)
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#10b981";
      case "good": return "#3b82f6";
      case "attention_needed": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "#ecfdf5";
      case "good": return "#eff6ff";
      case "attention_needed": return "#fffbeb";
      default: return "#f9fafb";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="font-medium text-gray-900 mb-4 text-center">{title}</h3>
      <div className="flex flex-col items-center">
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 w-full">
          <div className="grid grid-cols-1 gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {item.value.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: getStatusBgColor(status),
              color: getStatusColor(status),
            }}
          >
            {status.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Circular Gauge Component
export const CircularGauge: React.FC<{
  value: number;
  maxValue: number;
  title: string;
  unit?: string;
  status: string;
  size?: number;
}> = ({ value, maxValue, title, unit = "", status, size = 140 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#10b981";
      case "good": return "#3b82f6";
      case "attention_needed": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "#ecfdf5";
      case "good": return "#eff6ff";
      case "attention_needed": return "#fffbeb";
      default: return "#f9fafb";
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative mb-4" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getStatusColor(status)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${getStatusColor(status)}40)`
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </div>
          {unit && (
            <div className="text-sm text-gray-500 mt-1">{unit}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-gray-900 mb-2">{title}</div>
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: getStatusBgColor(status),
            color: getStatusColor(status),
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// Enhanced Bar Chart Component
export const BarChartComponent: React.FC<{
  data: any;
  xAxis: string[];
  title: string;
  status: string;
}> = ({ data, xAxis, title, status }) => {
  // Transform data for Recharts
  const chartData = xAxis.map((label, index) => {
    const dataPoint: any = { name: label };
    Object.keys(data).forEach(seriesName => {
      dataPoint[seriesName] = data[seriesName][index] || 0;
    });
    return dataPoint;
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const seriesKeys = Object.keys(data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#10b981";
      case "good": return "#3b82f6";
      case "attention_needed": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "#ecfdf5";
      case "good": return "#eff6ff";
      case "attention_needed": return "#fffbeb";
      default: return "#f9fafb";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: getStatusBgColor(status),
            color: getStatusColor(status),
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced Line Chart Component
export const LineChartComponent: React.FC<{
  data: any;
  xAxis: string[];
  title: string;
  status: string;
}> = ({ data, xAxis, title, status }) => {
  // Transform data for Recharts
  const chartData = xAxis.map((label, index) => {
    const dataPoint: any = { name: label };
    Object.keys(data).forEach(seriesName => {
      dataPoint[seriesName] = data[seriesName][index] || 0;
    });
    return dataPoint;
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const seriesKeys = Object.keys(data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#10b981";
      case "good": return "#3b82f6";
      case "attention_needed": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "#ecfdf5";
      case "good": return "#eff6ff";
      case "attention_needed": return "#fffbeb";
      default: return "#f9fafb";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: getStatusBgColor(status),
            color: getStatusColor(status),
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Enhanced Area Chart Component
export const AreaChartComponent: React.FC<{
  data: any;
  xAxis: string[];
  title: string;
  status: string;
}> = ({ data, xAxis, title, status }) => {
  // Transform data for Recharts
  const chartData = xAxis.map((label, index) => {
    const dataPoint: any = { name: label };
    Object.keys(data).forEach(seriesName => {
      dataPoint[seriesName] = data[seriesName][index] || 0;
    });
    return dataPoint;
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const seriesKeys = Object.keys(data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#10b981";
      case "good": return "#3b82f6";
      case "attention_needed": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "excellent": return "#ecfdf5";
      case "good": return "#eff6ff";
      case "attention_needed": return "#fffbeb";
      default: return "#f9fafb";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: getStatusBgColor(status),
            color: getStatusColor(status),
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Demo component to show all charts
const ChartDemo = () => {
  // Sample data
  const pieData = {
    value: [300, 150, 100, 50],
    category: ['Desktop', 'Mobile', 'Tablet', 'Other']
  };

  const seriesData = {
    Views: [1000, 1200, 900, 1500, 1800],
    Clicks: [100, 150, 80, 200, 250]
  };

  const xAxisLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Enhanced Chart Components</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <PieChart
          data={pieData}
          title="Traffic Sources"
          status="excellent"
        />
        
        {/* Circular Gauge */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <CircularGauge
            value={85}
            maxValue={100}
            title="Performance Score"
            unit="%"
            status="good"
            size={140}
          />
        </div>
        
        {/* Bar Chart */}
        <BarChartComponent
          data={seriesData}
          xAxis={xAxisLabels}
          title="Monthly Analytics"
          status="excellent"
        />
        
        {/* Line Chart */}
        <LineChartComponent
          data={seriesData}
          xAxis={xAxisLabels}
          title="Trend Analysis"
          status="good"
        />
        
        {/* Area Chart */}
        <AreaChartComponent
          data={seriesData}
          xAxis={xAxisLabels}
          title="Cumulative Data"
          status="attention_needed"
        />
      </div>
    </div>
  );
};

export default ChartDemo;