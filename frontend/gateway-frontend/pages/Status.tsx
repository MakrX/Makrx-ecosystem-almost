import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, XCircle, Clock,
  TrendingUp, Activity, Server, Globe, Database,
  Zap, Shield, RefreshCw
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  description: string;
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  startTime: string;
  resolvedTime?: string;
  updates: IncidentUpdate[];
}

interface IncidentUpdate {
  time: string;
  message: string;
  status: string;
}

export default function Status() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Simulate real-time status updates
    const fetchStatus = () => {
      setServices([
        {
          name: 'MakrX Gateway',
          status: 'operational',
          description: 'Main website and authentication',
          uptime: 99.97,
          responseTime: 156,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'MakrCave Platform',
          status: 'operational',
          description: 'Makerspace management system',
          uptime: 99.94,
          responseTime: 203,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'MakrX Store',
          status: 'operational',
          description: 'E-commerce and ordering platform',
          uptime: 99.99,
          responseTime: 145,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Learning Platform',
          status: 'operational',
          description: 'Course delivery and certification',
          uptime: 99.91,
          responseTime: 189,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Authentication (SSO)',
          status: 'operational',
          description: 'User authentication and authorization',
          uptime: 99.98,
          responseTime: 98,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'Payment Processing',
          status: 'operational',
          description: 'Payment gateway and billing',
          uptime: 99.96,
          responseTime: 234,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'File Storage',
          status: 'operational',
          description: 'Document and media storage',
          uptime: 99.92,
          responseTime: 176,
          lastChecked: new Date().toISOString()
        },
        {
          name: 'API Gateway',
          status: 'operational',
          description: 'RESTful API endpoints',
          uptime: 99.95,
          responseTime: 167,
          lastChecked: new Date().toISOString()
        }
      ]);

      setIncidents([
        {
          id: '1',
          title: 'Scheduled Maintenance - Database Optimization',
          status: 'resolved',
          severity: 'minor',
          description: 'Planned database maintenance to improve performance.',
          startTime: '2024-02-10T02:00:00Z',
          resolvedTime: '2024-02-10T04:30:00Z',
          updates: [
            {
              time: '2024-02-10T04:30:00Z',
              message: 'Maintenance completed successfully. All services are fully operational.',
              status: 'resolved'
            },
            {
              time: '2024-02-10T03:15:00Z',
              message: 'Database optimization in progress. Services may experience slightly slower response times.',
              status: 'monitoring'
            },
            {
              time: '2024-02-10T02:00:00Z',
              message: 'Scheduled maintenance has begun.',
              status: 'identified'
            }
          ]
        }
      ]);

      setLastUpdated(new Date().toLocaleString());
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'partial_outage':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'major_outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'partial_outage':
        return 'text-orange-600 bg-orange-50';
      case 'major_outage':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-blue-100 text-blue-700';
      case 'major':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'All Systems Operational' 
    : 'Some Systems Experiencing Issues';

  const overallUptime = services.length > 0 
    ? (services.reduce((acc, service) => acc + service.uptime, 0) / services.length).toFixed(2)
    : '0';

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            <span className="text-makrx-blue">System</span> Status
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time status and uptime monitoring for all MakrX services and platforms.
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{overallStatus}</h2>
              <p className="text-gray-600">
                Last updated: {lastUpdated}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">{overallUptime}%</div>
              <div className="text-sm text-gray-600">Overall Uptime (30 days)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Activity className="w-8 h-8 text-makrx-blue mx-auto mb-2" />
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-gray-600">Services Monitored</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {services.filter(s => s.status === 'operational').length}
              </div>
              <div className="text-sm text-gray-600">Services Online</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {services.length > 0 
                  ? Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)
                  : 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-makrx-brown mx-auto mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-600">Active Incidents</div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Service Status</h2>
            <p className="text-gray-600">Current status of all MakrX services</p>
          </div>
          <div className="divide-y divide-gray-100">
            {services.map((service, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                      {service.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {service.uptime}% uptime • {service.responseTime}ms
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        {incidents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">Recent Incidents</h2>
              <p className="text-gray-600">Latest incident reports and updates</p>
            </div>
            <div className="divide-y divide-gray-100">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{incident.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getIncidentSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {incident.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{incident.description}</p>
                      <div className="text-sm text-gray-500">
                        Started: {new Date(incident.startTime).toLocaleString()}
                        {incident.resolvedTime && (
                          <> • Resolved: {new Date(incident.resolvedTime).toLocaleString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {incident.updates.map((update, updateIndex) => (
                      <div key={updateIndex} className="border-l-2 border-gray-200 pl-4 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {new Date(update.time).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            {update.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Data */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Uptime History</h2>
                <p className="text-gray-600">90-day uptime history for all services</p>
              </div>
              <button className="flex items-center gap-2 text-makrx-blue hover:text-makrx-blue/80">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.slice(0, 4).map((service, index) => (
                <div key={index} className="text-center">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {service.uptime}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${service.uptime}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">90 days</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>
            For real-time updates, follow us on{' '}
            <a href="#" className="text-makrx-blue hover:underline">Twitter</a> or 
            subscribe to our{' '}
            <a href="#" className="text-makrx-blue hover:underline">status page updates</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
