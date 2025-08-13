import { Clock, User, Package, AlertTriangle, RotateCcw, Plus, Minus, Edit, ArrowRight } from 'lucide-react';

interface InventoryUsageLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'add' | 'issue' | 'restock' | 'adjust' | 'damage' | 'transfer';
  quantityBefore: number;
  quantityAfter: number;
  reason?: string;
  linkedProjectId?: string;
  linkedJobId?: string;
}

interface UsageTimelineProps {
  logs: InventoryUsageLog[];
  itemName: string;
  unit: string;
  maxItems?: number;
  showFilters?: boolean;
}

export default function UsageTimeline({ 
  logs, 
  itemName, 
  unit, 
  maxItems = 10,
  showFilters = false 
}: UsageTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'issue':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'restock':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'adjust':
        return <Edit className="w-4 h-4 text-purple-600" />;
      case 'damage':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'transfer':
        return <ArrowRight className="w-4 h-4 text-indigo-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'issue':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'restock':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'adjust':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
      case 'damage':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'transfer':
        return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'add':
        return 'Added to inventory';
      case 'issue':
        return 'Issued from inventory';
      case 'restock':
        return 'Restocked';
      case 'adjust':
        return 'Quantity adjusted';
      case 'damage':
        return 'Marked as damaged';
      case 'transfer':
        return 'Transferred';
      default:
        return 'Updated';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatQuantityChange = (log: InventoryUsageLog) => {
    const change = log.quantityAfter - log.quantityBefore;
    if (change > 0) {
      return `+${change} ${unit}`;
    } else if (change < 0) {
      return `${change} ${unit}`;
    } else {
      return `No change`;
    }
  };

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const displayLogs = maxItems ? sortedLogs.slice(0, maxItems) : sortedLogs;

  if (logs.length === 0) {
    return (
      <div className="makrcave-card text-center py-8">
        <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h3 className="font-medium text-muted-foreground mb-1">No Usage History</h3>
        <p className="text-sm text-muted-foreground">
          Activity for {itemName} will appear here once actions are performed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Usage Timeline for {itemName}
        </h3>
        {logs.length > maxItems && (
          <span className="text-sm text-muted-foreground">
            Showing {displayLogs.length} of {logs.length} activities
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayLogs.map((log, index) => (
          <div
            key={log.id}
            className={`relative p-4 border rounded-lg transition-colors hover:shadow-sm ${getActionColor(log.action)}`}
          >
            {/* Timeline connector */}
            {index < displayLogs.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-6 bg-border"></div>
            )}

            <div className="flex items-start gap-3">
              {/* Action Icon */}
              <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full border">
                {getActionIcon(log.action)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{getActionText(log.action)}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{log.userName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {log.quantityBefore} {unit}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">
                      {log.quantityAfter} {unit}
                    </span>
                    <span className={`font-medium ${
                      log.quantityAfter > log.quantityBefore ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({formatQuantityChange(log)})
                    </span>
                  </div>
                </div>

                {log.reason && (
                  <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs">
                    <span className="font-medium">Reason:</span> {log.reason}
                  </div>
                )}

                {(log.linkedProjectId || log.linkedJobId) && (
                  <div className="mt-2 flex gap-2">
                    {log.linkedProjectId && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                        Project: {log.linkedProjectId}
                      </span>
                    )}
                    {log.linkedJobId && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                        Job: {log.linkedJobId}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {logs.length > maxItems && (
        <div className="text-center">
          <button className="makrcave-btn-secondary text-sm">
            View All {logs.length} Activities
          </button>
        </div>
      )}
    </div>
  );
}
