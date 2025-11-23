import React from 'react';
import { AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
import Card from './Card';

const ThreatPanel = ({ alerts }) => {
    // Get the highest severity level
    const severity = alerts.length > 0 ? alerts[0].level : 'SAFE';

    const borderColor =
        severity === 'CRITICAL' ? 'border-red-500 animate-pulse' :
            severity === 'HIGH' ? 'border-orange-500' :
                severity === 'MEDIUM' ? 'border-yellow-500' :
                    'border-green-500/30';

    const statusColor =
        severity === 'CRITICAL' ? 'text-red-500' :
            severity === 'HIGH' ? 'text-orange-500' :
                severity === 'MEDIUM' ? 'text-yellow-500' :
                    'text-green-500';

    return (
        <Card className={`h-full flex flex-col ${borderColor} transition-colors duration-500`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${statusColor}`}>
                {severity === 'SAFE' ? <Lock size={18} /> : <ShieldAlert size={18} />}
                AI_SENTINEL_STATUS: {severity}
            </h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {alerts.length === 0 ? (
                    <div className="text-gray-600 text-xs text-center mt-10 font-mono">
                        NO THREATS DETECTED
                        <br />
                        SYSTEM SECURE
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map((alert, i) => (
                            <div key={i} className={`p-2 rounded border text-xs font-mono ${alert.level === 'CRITICAL' ? 'bg-red-900/20 border-red-500/50 text-red-200' :
                                    alert.level === 'HIGH' ? 'bg-orange-900/20 border-orange-500/50 text-orange-200' :
                                        'bg-yellow-900/20 border-yellow-500/50 text-yellow-200'
                                }`}>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold">[{alert.type}]</span>
                                    <span>{new Date().toLocaleTimeString()}</span>
                                </div>
                                <div className="opacity-80">{alert.message}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ThreatPanel;
