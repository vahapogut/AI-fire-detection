"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Stat {
  date: string;
  count: number;
}

const StatsChart = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<Stat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 text-sm gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
        <span>{t.stats.noData}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      <h3 className="text-white text-sm font-semibold mb-4">{t.stats.weeklyActivity}</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#666', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.split('-').slice(1).join('/')}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#888', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;
