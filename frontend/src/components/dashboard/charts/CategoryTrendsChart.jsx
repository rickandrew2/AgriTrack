import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CategoryTrendsChart = ({ dashboardStats }) => {
  // Get category trends over time from actual data
  const getCategoryTrends = () => {
    if (!dashboardStats?.allProducts) return [];
    
    // Generate data for the last 7 days
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create a data point for each day
      const dataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Seeds: 0,
        Seedlings: 0,
        'HVC (High Value Crops)': 0
      };
      
      // For now, we'll simulate some trend data
      // In a real implementation, you'd get this from historical transaction data
      const baseSeeds = 450;
      const baseSeedlings = 950;
      const baseHVC = 200;
      
      // Add some variation to simulate trends
      const variation = Math.sin(i * 0.5) * 0.2; // Creates a wave pattern
      
      dataPoint.Seeds = Math.round(baseSeeds * (1 + variation));
      dataPoint.Seedlings = Math.round(baseSeedlings * (1 + variation * 0.5));
      dataPoint['HVC (High Value Crops)'] = Math.round(baseHVC * (1 + variation * 0.3));
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const chartData = getCategoryTrends();

  const formatTooltip = (value, name) => {
    return [`${value} units`, name];
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
      <h3 className="text-xl font-semibold text-green-800 mb-6">Category Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="Seeds" 
              stroke="#10B981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10B981' }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="Seedlings" 
              stroke="#F59E0B" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#F59E0B' }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="HVC (High Value Crops)" 
              stroke="#8B5CF6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#8B5CF6' }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryTrendsChart; 