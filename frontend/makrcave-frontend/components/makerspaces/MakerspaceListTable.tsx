import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  Power,
  PowerOff,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Makerspace {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  admins?: Array<{
    firstName: string;
    lastName: string;
  }>;
  stats?: {
    totalUsers: number;
    monthlyRevenue: number;
  };
}

interface MakerspaceListTableProps {
  makerspaces: Makerspace[];
  loading: boolean;
  onView: (makerspace: Makerspace) => void;
  onEdit: (makerspace: Makerspace) => void;
  onStatusChange: (makerspaceId: string, newStatus: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const MakerspaceListTable: React.FC<MakerspaceListTableProps> = ({
  makerspaces,
  loading,
  onView,
  onEdit,
  onStatusChange,
  getStatusBadge
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading makerspaces...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (makerspaces.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No makerspaces found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Makerspace</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Admin(s)</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Users</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Revenue</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-900">Created</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {makerspaces.map((makerspace) => (
                <tr key={makerspace.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{makerspace.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {makerspace.location}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(makerspace.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {makerspace.admins && makerspace.admins.length > 0 ? (
                        <div>
                          {makerspace.admins.slice(0, 2).map((admin, index) => (
                            <div key={index} className="text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                          ))}
                          {makerspace.admins.length > 2 && (
                            <div className="text-gray-600">
                              +{makerspace.admins.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No admin assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {makerspace.stats?.totalUsers || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-green-600">
                      ${(makerspace.stats?.monthlyRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">monthly</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(makerspace.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(makerspace)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(makerspace)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(makerspace)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(makerspace)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {makerspace.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(makerspace.id, 'suspended')}
                              className="text-red-600"
                            >
                              <PowerOff className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : makerspace.status === 'suspended' ? (
                            <DropdownMenuItem 
                              onClick={() => onStatusChange(makerspace.id, 'active')}
                              className="text-green-600"
                            >
                              <Power className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          ) : makerspace.status === 'pending' ? (
                            <>
                              <DropdownMenuItem 
                                onClick={() => onStatusChange(makerspace.id, 'active')}
                                className="text-green-600"
                              >
                                <Power className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onStatusChange(makerspace.id, 'suspended')}
                                className="text-red-600"
                              >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MakerspaceListTable;
