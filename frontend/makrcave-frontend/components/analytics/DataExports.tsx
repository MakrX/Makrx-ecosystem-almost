import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Download, FileText, Table, FileSpreadsheet, Calendar,
  Users, Package, Wrench, FolderOpen, CreditCard,
  CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ExportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'operational' | 'analytics' | 'financial';
  formats: Array<'csv' | 'pdf' | 'xlsx'>;
  fields: string[];
}

const DataExports: React.FC = () => {
  const { toast } = useToast();
  const [exportStartDate, setExportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [exporting, setExporting] = useState<string | null>(null);

  const exportItems: ExportItem[] = [
    {
      id: 'inventory',
      title: 'Inventory Data',
      description: 'Complete inventory list with stock levels, categories, and supplier information',
      icon: <Package className="h-5 w-5" />,
      category: 'operational',
      formats: ['csv', 'xlsx'],
      fields: ['Name', 'Category', 'Quantity', 'Min Threshold', 'Location', 'Status', 'Supplier', 'Price']
    },
    {
      id: 'equipment',
      title: 'Equipment Registry',
      description: 'Equipment details, maintenance schedules, and usage statistics',
      icon: <Wrench className="h-5 w-5" />,
      category: 'operational',
      formats: ['csv', 'xlsx'],
      fields: ['Equipment ID', 'Name', 'Category', 'Status', 'Location', 'Usage Hours', 'Maintenance Due']
    },
    {
      id: 'projects',
      title: 'Projects Data',
      description: 'Project information, collaboration details, and progress tracking',
      icon: <FolderOpen className="h-5 w-5" />,
      category: 'operational',
      formats: ['csv', 'xlsx'],
      fields: ['Project ID', 'Name', 'Status', 'Owner', 'Collaborators', 'BOM Items', 'Progress %']
    },
    {
      id: 'members',
      title: 'Member Directory',
      description: 'Member information, roles, and membership details',
      icon: <Users className="h-5 w-5" />,
      category: 'operational',
      formats: ['csv', 'xlsx'],
      fields: ['Member ID', 'Name', 'Email', 'Role', 'Status', 'Plan', 'Join Date', 'Skills']
    },
    {
      id: 'usage_analytics',
      title: 'Usage Analytics',
      description: 'User activity, login patterns, and system usage metrics',
      icon: <Clock className="h-5 w-5" />,
      category: 'analytics',
      formats: ['csv', 'pdf', 'xlsx'],
      fields: ['Date', 'Event Type', 'User', 'Resource', 'Duration', 'Metadata']
    },
    {
      id: 'equipment_analytics',
      title: 'Equipment Analytics',
      description: 'Equipment utilization, maintenance logs, and performance metrics',
      icon: <Wrench className="h-5 w-5" />,
      category: 'analytics',
      formats: ['csv', 'pdf', 'xlsx'],
      fields: ['Equipment', 'Usage Hours', 'Uptime %', 'Maintenance Events', 'Success Rate']
    },
    {
      id: 'inventory_analytics',
      title: 'Inventory Analytics',
      description: 'Consumption patterns, stock movements, and reorder analytics',
      icon: <Package className="h-5 w-5" />,
      category: 'analytics',
      formats: ['csv', 'pdf', 'xlsx'],
      fields: ['Item', 'Consumed', 'Restocked', 'Consumption Rate', 'Cost Analysis']
    },
    {
      id: 'project_analytics',
      title: 'Project Analytics',
      description: 'Project performance, collaboration stats, and completion analysis',
      icon: <FolderOpen className="h-5 w-5" />,
      category: 'analytics',
      formats: ['csv', 'pdf', 'xlsx'],
      fields: ['Project', 'Completion Rate', 'Collaborators', 'BOM Cost', 'Timeline Analysis']
    },
    {
      id: 'revenue_analytics',
      title: 'Revenue Analytics',
      description: 'Financial performance, payment methods, and revenue trends',
      icon: <CreditCard className="h-5 w-5" />,
      category: 'financial',
      formats: ['csv', 'pdf', 'xlsx'],
      fields: ['Date', 'Revenue Type', 'Amount', 'Payment Method', 'User', 'Transaction ID']
    }
  ];

  const handleExport = async (exportItem: ExportItem) => {
    setExporting(exportItem.id);
    
    try {
      // For operational data, export directly from frontend
      if (exportItem.category === 'operational') {
        await exportOperationalData(exportItem);
      } else {
        // For analytics data, use the backend report generation
        await exportAnalyticsData(exportItem);
      }
      
      toast({
        title: "Export Started",
        description: `${exportItem.title} export has been initiated. Download will start shortly.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export ${exportItem.title}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const exportOperationalData = async (exportItem: ExportItem) => {
    // Mock data generation for operational exports
    let data: any[] = [];
    let headers: string[] = [];

    switch (exportItem.id) {
      case 'inventory':
        headers = ['Name', 'Category', 'Quantity', 'Min Threshold', 'Location', 'Status', 'Supplier', 'Price'];
        data = [
          ['PLA Filament - White', 'Filament', '15.5', '5.0', 'Storage A1', 'Active', 'MakrX Store', '₹2,158'],
          ['ABS Filament - Black', 'Filament', '8.2', '5.0', 'Storage A1', 'Active', 'External', '₹2,366'],
          ['PETG Filament - Clear', 'Filament', '12.1', '3.0', 'Storage A2', 'Active', 'MakrX Store', '₹2,656'],
          ['Arduino Uno R3', 'Electronics', '25', '10', 'Electronics Cabinet', 'Active', 'External', '₹1,909'],
          ['Raspberry Pi 4', 'Electronics', '8', '5', 'Electronics Cabinet', 'Active', 'MakrX Store', '₹6,225']
        ];
        break;
      case 'equipment':
        headers = ['Equipment ID', 'Name', 'Category', 'Status', 'Location', 'Usage Hours', 'Maintenance Due'];
        data = [
          ['PRINTER3D-001', 'Ultimaker S3', 'printer_3d', 'Available', 'Station A1', '247.5', '2024-02-15'],
          ['LASER-001', 'Epilog Zing 16', 'laser_cutter', 'In Use', 'Station B1', '156.2', '2024-03-01'],
          ['CNC-001', 'Shapeoko 3', 'cnc_machine', 'Available', 'Station C1', '89.7', '2024-02-20'],
          ['SOLDER-001', 'Weller Station', 'soldering_station', 'Available', 'Electronics Bench', '45.3', '2024-04-01'],
          ['PRINTER3D-002', 'Prusa i3 MK3S+', 'printer_3d', 'Under Maintenance', 'Station A2', '312.8', 'Overdue']
        ];
        break;
      case 'projects':
        headers = ['Project ID', 'Name', 'Status', 'Owner', 'Collaborators', 'BOM Items', 'Progress %'];
        data = [
          ['proj-1', 'Smart Home Automation', 'In Progress', 'user-1', '3', '12', '40%'],
          ['proj-2', '3D Printed Drone Frame', 'Complete', 'user-2', '1', '8', '100%'],
          ['proj-3', 'Laser Cut Furniture', 'Draft', 'user-3', '2', '5', '0%'],
          ['proj-4', 'Arduino Weather Station', 'On Hold', 'user-4', '2', '10', '16%'],
          ['proj-5', 'CNC Machined Parts', 'In Progress', 'user-5', '1', '6', '25%']
        ];
        break;
      case 'members':
        headers = ['Member ID', 'Name', 'Email', 'Role', 'Status', 'Plan', 'Join Date', 'Skills'];
        data = [
          ['member-1', 'John Smith', 'john@example.com', 'Maker', 'Active', 'Basic', '2024-01-15', '3D Printing; Electronics'],
          ['member-2', 'Sarah Johnson', 'sarah@example.com', 'Service Provider', 'Active', 'Professional', '2024-01-10', 'Laser Cutting; Design'],
          ['member-3', 'Mike Chen', 'mike@example.com', 'Maker', 'Active', 'Basic', '2024-01-20', 'CNC; Woodworking'],
          ['member-4', 'Lisa Wang', 'lisa@example.com', 'Makerspace Admin', 'Active', 'Admin', '2024-01-05', 'All Equipment'],
          ['member-5', 'David Brown', 'david@example.com', 'Maker', 'Expired', 'Basic', '2023-12-15', 'Programming; IoT']
        ];
        break;
    }

    generateCSV(headers, data, `${exportItem.id}_export_${new Date().toISOString().split('T')[0]}`);
  };

  const exportAnalyticsData = async (exportItem: ExportItem) => {
    // Use the backend analytics API for report generation
    const reportData = {
      report_type: exportItem.id.replace('_analytics', ''),
      report_format: exportFormat,
      filters: {
        start_date: exportStartDate,
        end_date: exportEndDate,
      }
    };

    const response = await fetch('/api/analytics/reports/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      // Fallback to mock data if API fails
      const mockData = generateMockAnalyticsData(exportItem);
      generateCSV(mockData.headers, mockData.data, `${exportItem.id}_${new Date().toISOString().split('T')[0]}`);
      return;
    }

    const result = await response.json();
    toast({
      title: "Report Queued",
      description: "Your analytics report is being generated. You'll be notified when it's ready.",
    });
  };

  const generateMockAnalyticsData = (exportItem: ExportItem) => {
    switch (exportItem.id) {
      case 'usage_analytics':
        return {
          headers: ['Date', 'Event Type', 'User', 'Resource', 'Duration'],
          data: [
            ['2024-02-08', 'Login', 'john@example.com', 'System', '0'],
            ['2024-02-08', 'Equipment Reserved', 'sarah@example.com', 'Ultimaker S3', '120'],
            ['2024-02-08', 'Project Created', 'mike@example.com', 'Smart Lamp Project', '0'],
            ['2024-02-08', 'Inventory Consumed', 'lisa@example.com', 'PLA Filament', '15']
          ]
        };
      default:
        return {
          headers: ['Date', 'Metric', 'Value'],
          data: [
            ['2024-02-08', 'Sample Metric', '100'],
            ['2024-02-07', 'Sample Metric', '95'],
            ['2024-02-06', 'Sample Metric', '110']
          ]
        };
    }
  };

  const generateCSV = (headers: string[], data: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'csv':
      default:
        return <Table className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational':
        return 'bg-blue-100 text-blue-800';
      case 'analytics':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="format">Default Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'xlsx') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-blue-600" />
                      CSV (Comma Separated)
                    </div>
                  </SelectItem>
                  <SelectItem value="xlsx">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Excel (Spreadsheet)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      PDF (Report Document)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {exportItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Available Formats:</p>
                    <div className="flex gap-1">
                      {item.formats.map((format) => (
                        <div key={format} className="flex items-center gap-1">
                          {getFormatIcon(format)}
                          <span className="text-xs text-gray-600">{format.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleExport(item)}
                    disabled={exporting === item.id}
                    className="w-full"
                    size="sm"
                  >
                    {exporting === item.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export {exportFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExports;
