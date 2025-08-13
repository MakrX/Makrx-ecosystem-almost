import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Download, FileText, Table, FileSpreadsheet, Calendar,
  CheckCircle, Clock, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ReportRequest {
  id: string;
  report_type: string;
  report_format: string;
  status: string;
  file_url?: string;
  error_message?: string;
  requested_at: string;
  completed_at?: string;
  expires_at?: string;
}

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [reportRequests, setReportRequests] = useState<ReportRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReportRequests();
      // Set default date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      setStartDate(startDate.toISOString().split('T')[0]);
      setEndDate(endDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const fetchReportRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch('/api/analytics/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportRequests(data);
      }
    } catch (error) {
      console.error('Error fetching report requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!reportType || !reportFormat) {
      toast({
        title: "Validation Error",
        description: "Please select both report type and format",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        report_type: reportType,
        report_format: reportFormat,
        filters: {
          start_date: startDate,
          end_date: endDate,
        }
      };

      const response = await fetch('/api/analytics/reports/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Report generation requested successfully",
        });
        
        // Reset form
        setReportType('');
        setReportFormat('');
        
        // Refresh requests list
        fetchReportRequests();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to request report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting report:', error);
      toast({
        title: "Error",
        description: "Failed to request report",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (requestId: string) => {
    try {
      const response = await fetch(`/api/analytics/reports/${requestId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Open download URL in new tab
        window.open(data.download_url, '_blank');
        toast({
          title: "Success",
          description: "Report download started",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to download report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default' as const,
      processing: 'secondary' as const,
      failed: 'destructive' as const,
      pending: 'outline' as const,
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'csv':
        return <Table className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Analytics Report
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Report Request */}
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage">Usage Analytics</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="equipment">Equipment Metrics</SelectItem>
                    <SelectItem value="projects">Project Analytics</SelectItem>
                    <SelectItem value="revenue">Revenue Report</SelectItem>
                    <SelectItem value="members">Member Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Format */}
              <div className="space-y-2">
                <Label htmlFor="reportFormat">Format</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
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
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        PDF (Report Document)
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        Excel (Spreadsheet)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmitRequest} 
                disabled={submitting || !reportType || !reportFormat}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              {/* Info */}
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Report Generation</p>
                <p>Reports are generated in the background. You'll receive a notification when ready for download.</p>
              </div>
            </CardContent>
          </Card>

          {/* Report History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report History</CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchReportRequests}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading reports...</span>
                </div>
              ) : reportRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-sm">Generate your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reportRequests.map((request) => (
                    <div key={request.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(request.report_format)}
                          <span className="font-medium text-sm">
                            {request.report_type.charAt(0).toUpperCase() + request.report_type.slice(1)} Report
                          </span>
                        </div>
                        <Badge variant={getStatusBadge(request.status)} className="text-xs">
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Requested: {new Date(request.requested_at).toLocaleString()}
                        </div>
                        {request.completed_at && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed: {new Date(request.completed_at).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {request.error_message && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded mb-2">
                          Error: {request.error_message}
                        </div>
                      )}

                      {request.status === 'completed' && request.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(request.id)}
                          className="w-full"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}

                      {request.expires_at && request.status === 'completed' && (
                        <p className="text-xs text-orange-600 mt-1">
                          Expires: {new Date(request.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Report Types Info */}
        <Card>
          <CardHeader>
            <CardTitle>Available Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Usage Analytics</h4>
                <p className="text-sm text-blue-800">User activity, logins, project creations, equipment usage</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Inventory Report</h4>
                <p className="text-sm text-green-800">Stock levels, consumption patterns, reorder alerts</p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-1">Equipment Metrics</h4>
                <p className="text-sm text-orange-800">Usage hours, uptime, maintenance schedules</p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-1">Project Analytics</h4>
                <p className="text-sm text-purple-800">Project costs, BOM analysis, collaboration stats</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-1">Revenue Report</h4>
                <p className="text-sm text-red-800">Income breakdown, payment methods, growth trends</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Member Activity</h4>
                <p className="text-sm text-gray-800">Member engagement, project participation, usage patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadReportModal;
