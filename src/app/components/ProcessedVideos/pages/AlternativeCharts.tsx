import React from 'react';
import { ChartSeries } from '../types/types';

interface ChartProps {
  data: ChartSeries;
  title?: string;
  status?: string;
  size?: number;
}

// Helper function to get colors based on status
const getStatusColors = (status?: string) => {
  const baseColors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', 
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6'
  ];
  
  switch (status) {
    case 'excellent':
      return ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'];
    case 'good':
      return ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'];
    case 'poor':
      return ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];
    default:
      return baseColors;
  }
};

// 1. Horizontal Bar Chart Component
export const HorizontalBarChart: React.FC<ChartProps> = ({ data, title, status, size = 300 }) => {
  const categories = data?.label || data?.category || [];
  const values = data?.values || data?.value || [];
  
  if (!Array.isArray(categories) || !Array.isArray(values) || categories.length === 0) {
    return <div className="text-gray-400 text-sm">No data available</div>;
  }

  const maxValue = Math.max(...(values as number[]));
  const colors = getStatusColors(status);

  return (
    <div className="w-full" style={{ maxWidth: `${size}px` }}>
      <div className="space-y-3">
        {categories.map((category, index) => {
          const value = Array.isArray(values) ? values[index] : values;
          const percentage = ((value as number) / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-xs text-gray-600 text-right truncate" title={String(category)}>
                {String(category)}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                  style={{
                    width: `${Math.max(percentage, 8)}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                >
                  {percentage > 15 && <span>{value}</span>}
                </div>
                {percentage <= 15 && (
                  <span className="absolute right-2 top-0 h-full flex items-center text-xs text-gray-700">
                    {value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Vertical Bar Chart Component
export const VerticalBarChart: React.FC<ChartProps> = ({ data, title, status, size = 300 }) => {
  const categories = data?.label || data?.category || [];
  const values = data?.values || data?.value || [];
  
  if (!Array.isArray(categories) || !Array.isArray(values) || categories.length === 0) {
    return <div className="text-gray-400 text-sm">No data available</div>;
  }

  const maxValue = Math.max(...(values as number[]));
  const colors = getStatusColors(status);

  return (
    <div className="w-full" style={{ maxWidth: `${size}px`, height: `${size * 0.8}px` }}>
      <div className="h-full flex items-end justify-center space-x-2 pb-12 relative">
        {categories.map((category, index) => {
          const value = Array.isArray(values) ? values[index] : values;
          const percentage = ((value as number) / maxValue) * 100;
          const barHeight = (percentage / 100) * (size * 0.5);
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="relative group">
                <div
                  className="w-12 rounded-t-md transition-all duration-500 hover:opacity-80 flex flex-col justify-end items-center"
                  style={{
                    height: `${Math.max(barHeight, 8)}px`,
                    backgroundColor: colors[index % colors.length],
                  }}
                >
                  <span className="text-white text-xs font-medium pb-1">
                    {barHeight > 20 && value}
                  </span>
                </div>
                {barHeight <= 20 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-medium">
                    {value}
                  </div>
                )}
              </div>
              <div 
                className="mt-2 text-xs text-gray-600 text-center leading-tight transform -rotate-45 origin-center"
                style={{ 
                  width: '60px',
                  marginTop: '20px'
                }}
                title={String(category)}
              >
                {String(category).length > 8 ? `${String(category).substring(0, 8)}...` : String(category)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Donut Chart Component
export const DonutChart: React.FC<ChartProps> = ({ data, title, status, size = 200 }) => {
  const categories = data?.label || data?.category || [];
  const values = data?.values || data?.value || [];
  
  if (!Array.isArray(categories) || !Array.isArray(values) || categories.length === 0) {
    return <div className="text-gray-400 text-sm">No data available</div>;
  }

  const total = (values as number[]).reduce((sum, value) => sum + value, 0);
  const colors = getStatusColors(status);
  
  let cumulativeAngle = 0;
  const segments = categories.map((category, index) => {
    const value = Array.isArray(values) ? values[index] : values;
    const percentage = (value as number) / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    // Calculate path for donut segment
    const radius = size / 2 - 20;
    const innerRadius = radius * 0.6;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    return {
      path: pathData,
      color: colors[index % colors.length],
      category: String(category),
      value: value as number,
      percentage: Math.round(percentage * 100)
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform rotate-0">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity duration-200"
                strokeWidth="2"
                stroke="white"
              />
            </g>
          ))}
        </svg>
        
        {/* Center content */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          style={{
            width: `${size * 0.4}px`,
            height: `${size * 0.4}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 gap-1 text-xs max-w-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-700 truncate flex-1">
              {segment.category}
            </span>
            <span className="text-gray-500 font-medium">
              {segment.value} ({segment.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Enhanced Pie Chart with better styling (alternative to your existing one)
export const EnhancedPieChart: React.FC<ChartProps> = ({ data, title, status, size = 200 }) => {
  const categories = data?.label || data?.category || [];
  const values = data?.values || data?.value || [];
  
  if (!Array.isArray(categories) || !Array.isArray(values) || categories.length === 0) {
    return <div className="text-gray-400 text-sm">No data available</div>;
  }

  const total = (values as number[]).reduce((sum, value) => sum + value, 0);
  const colors = getStatusColors(status);
  
  let cumulativeAngle = 0;
  const segments = categories.map((category, index) => {
    const value = Array.isArray(values) ? values[index] : values;
    const percentage = (value as number) / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    const radius = size / 2 - 10;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return {
      path: pathData,
      color: colors[index % colors.length],
      category: String(category),
      value: value as number,
      percentage: Math.round(percentage * 100)
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="drop-shadow-sm">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            className="hover:opacity-80 transition-all duration-200 hover:scale-105"
            strokeWidth="2"
            stroke="white"
            style={{ transformOrigin: `${size/2}px ${size/2}px` }}
          />
        ))}
      </svg>
      
      {/* Compact Legend */}
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs max-w-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-600 truncate text-xs">
              {segment.category} ({segment.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};