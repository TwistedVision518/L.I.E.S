import React from 'react';
import { Activity } from 'lucide-react';
import Card from './Card';

const StatBox = ({ label, value, colorClass }) => (
    <div className="text-center p-3 bg-black/60 rounded border border-white/5 hover:border-green-500/50 transition-colors">
        <div className="text-xs text-gray-400 mb-1 tracking-widest">{label}</div>
        <div className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</div>
    </div>
);

const StatsPanel = ({ stats }) => {
    return (
        <Card>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                <Activity size={18} /> TRAFFIC_STATS
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <StatBox label="TOTAL" value={stats.total} colorClass="text-white" />
                <StatBox label="TCP" value={stats.tcp} colorClass="text-blue-400" />
                <StatBox label="UDP" value={stats.udp} colorClass="text-green-400" />
                <StatBox label="OTHER" value={stats.other} colorClass="text-yellow-400" />
            </div>
        </Card>
    );
};

export default StatsPanel;
