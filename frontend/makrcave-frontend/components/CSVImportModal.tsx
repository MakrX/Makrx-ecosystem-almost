import { useState, useRef } from 'react';
import { X, Upload, Download, AlertTriangle, CheckCircle, FileText, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validItems, setValidItems] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const csvTemplate = [
    ['name', 'category', 'subcategory', 'quantity', 'unit', 'minThreshold', 'location', 'supplierType', 'productCode', 'price', 'supplier', 'description', 'status', 'restrictedAccessLevel'],
    ['PLA Filament - Red', 'filament', 'PLA', '5', 'kg', '2', 'Shelf A-1', 'makrx', 'MKX-FIL-PLA-RED-001', '25.99', 'MakrX Store', 'High-quality PLA filament', 'active', 'basic'],
    ['Arduino Uno R3', 'electronics', 'Microcontroller', '10', 'pcs', '3', 'Drawer B-2', 'external', '', '28.50', 'Arduino Official', 'Arduino Uno microcontroller board', 'active', 'basic'],
    ['Digital Calipers', 'tools', 'Measuring', '2', 'pcs', '1', 'Tool Cabinet A', 'makrx', 'MKX-TOL-CAL-DIG-001', '45.99', 'MakrX Store', 'Digital precision calipers', 'active', 'certified']
  ];

  const requiredFields = ['name', 'category', 'quantity', 'unit', 'minThreshold', 'location', 'supplierType'];
  const validCategories = ['filament', 'resin', 'tools', 'electronics', 'materials', 'machines', 'sensors', 'components', 'consumables'];
  const validSupplierTypes = ['makrx', 'external'];
  const validStatuses = ['active', 'in_use', 'damaged', 'reserved', 'discontinued'];
  const validAccessLevels = ['basic', 'certified', 'admin_only'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    setCsvData(data);
    validateData(data);
    setIsProcessing(false);
  };

  const validateData = (data: any[]) => {
    const errors: ValidationError[] = [];
    const valid: any[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because we skip header and use 1-based indexing
      let hasErrors = false;

      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `${field} is required`
          });
          hasErrors = true;
        }
      });

      // Validate category
      if (row.category && !validCategories.includes(row.category)) {
        errors.push({
          row: rowNumber,
          field: 'category',
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
        hasErrors = true;
      }

      // Validate supplier type
      if (row.supplierType && !validSupplierTypes.includes(row.supplierType)) {
        errors.push({
          row: rowNumber,
          field: 'supplierType',
          message: `Invalid supplier type. Must be 'makrx' or 'external'`
        });
        hasErrors = true;
      }

      // Validate status
      if (row.status && !validStatuses.includes(row.status)) {
        errors.push({
          row: rowNumber,
          field: 'status',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        hasErrors = true;
      }

      // Validate access level
      if (row.restrictedAccessLevel && !validAccessLevels.includes(row.restrictedAccessLevel)) {
        errors.push({
          row: rowNumber,
          field: 'restrictedAccessLevel',
          message: `Invalid access level. Must be one of: ${validAccessLevels.join(', ')}`
        });
        hasErrors = true;
      }

      // Validate numeric fields
      if (row.quantity && isNaN(parseFloat(row.quantity))) {
        errors.push({
          row: rowNumber,
          field: 'quantity',
          message: 'Quantity must be a valid number'
        });
        hasErrors = true;
      }

      if (row.minThreshold && isNaN(parseInt(row.minThreshold))) {
        errors.push({
          row: rowNumber,
          field: 'minThreshold',
          message: 'Min threshold must be a valid integer'
        });
        hasErrors = true;
      }

      if (row.price && row.price !== '' && isNaN(parseFloat(row.price))) {
        errors.push({
          row: rowNumber,
          field: 'price',
          message: 'Price must be a valid number'
        });
        hasErrors = true;
      }

      // Validate MakrX items have product codes
      if (row.supplierType === 'makrx' && (!row.productCode || row.productCode.trim() === '')) {
        errors.push({
          row: rowNumber,
          field: 'productCode',
          message: 'MakrX items must have a product code'
        });
        hasErrors = true;
      }

      if (!hasErrors) {
        // Transform the row for our data structure
        const transformedRow = {
          ...row,
          quantity: parseFloat(row.quantity),
          minThreshold: parseInt(row.minThreshold),
          price: row.price ? parseFloat(row.price) : undefined,
          status: row.status || 'active',
          restrictedAccessLevel: row.restrictedAccessLevel || 'basic',
          makerspaceId: user?.assignedMakerspaces?.[0] || 'ms-1',
          history: [{
            id: `log-${Date.now()}-${index}`,
            timestamp: new Date().toISOString(),
            userId: user?.id || '',
            userName: `${user?.firstName} ${user?.lastName}` || 'Unknown User',
            action: 'add',
            quantityBefore: 0,
            quantityAfter: parseFloat(row.quantity),
            reason: 'Bulk CSV import'
          }]
        };
        valid.push(transformedRow);
      }
    });

    setValidationErrors(errors);
    setValidItems(valid);
    setShowPreview(true);
  };

  const downloadTemplate = () => {
    const csvContent = csvTemplate.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (validItems.length === 0) {
      alert('No valid items to import');
      return;
    }

    onImport(validItems);
    setShowPreview(false);
    setFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setValidItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bulk Import Inventory</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Import Instructions</h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Download the CSV template below</li>
                <li>Fill in your inventory data following the column headers</li>
                <li>Upload the completed CSV file</li>
                <li>Review and confirm the import</li>
              </ol>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-medium">CSV Template</h3>
                <p className="text-sm text-muted-foreground">
                  Download the template with sample data and required column headers
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="makrcave-btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-makrx-teal bg-makrx-teal/5' 
                  : 'border-border hover:border-makrx-teal/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="makrcave-btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Select File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {file && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-makrx-teal" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Import Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Total Rows</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{csvData.length}</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">Valid Items</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{validItems.length}</p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800 dark:text-red-200">Errors</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{validationErrors.length}</p>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-3">
                  Validation Errors ({validationErrors.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-red-700 dark:text-red-300">
                        Row {error.row}, {error.field}:
                      </span>
                      <span className="text-red-600 dark:text-red-400 ml-2">
                        {error.message}
                      </span>
                    </div>
                  ))}
                  {validationErrors.length > 10 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      +{validationErrors.length - 10} more errors...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Valid Items Preview */}
            {validItems.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-3">
                  Items Ready for Import ({validItems.length})
                </h3>
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {validItems.slice(0, 6).map((item, index) => (
                      <div key={index} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">
                          {item.quantity} {item.unit} • {item.category}
                        </div>
                      </div>
                    ))}
                  </div>
                  {validItems.length > 6 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +{validItems.length - 6} more items ready for import...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setFile(null);
                  setCsvData([]);
                  setValidationErrors([]);
                  setValidItems([]);
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Start Over
              </button>
              
              <button
                onClick={handleImport}
                disabled={validItems.length === 0}
                className="flex-1 makrcave-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import {validItems.length} Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
