"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Info,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

interface BOMItem {
  id: string;
  part_name: string;
  part_code?: string;
  quantity_needed: number;
  source: string;
  description?: string;
  unit_cost?: number;
  supplier?: string;
}

interface ExportPreviewItem {
  id: string;
  part_name: string;
  part_code?: string;
  quantity_needed: number;
  source: string;
  exportable: boolean;
  reason?: string;
  mapped_sku?: string;
}

interface ExportResult {
  success: boolean;
  message: string;
  exported_items: number;
  skipped_items: number;
  cart_url?: string;
  details: Array<{
    bom_item_id: string;
    part_name: string;
    sku?: string;
    quantity: number;
    status: string;
    reason?: string;
  }>;
}

interface BOMExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  bomItems: BOMItem[];
  userEmail: string;
}

export default function BOMExportModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  bomItems,
  userEmail,
}: BOMExportModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [exportPreview, setExportPreview] = useState<ExportPreviewItem[]>([]);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "results">("preview");
  const { toast } = useToast();

  // Load export preview when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadExportPreview();
      setSelectedItems(new Set());
      setExportResult(null);
      setActiveTab("preview");
    }
  }, [isOpen, projectId]);

  const loadExportPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const response = await apiService.get(
        `/api/v1/projects/${projectId}/bom/export/preview`,
      );
      setExportPreview(response.items || []);

      // Auto-select exportable items
      const exportableIds = response.items
        .filter((item: ExportPreviewItem) => item.exportable)
        .map((item: ExportPreviewItem) => item.id);
      setSelectedItems(new Set(exportableIds));
    } catch (error) {
      console.error("Failed to load export preview:", error);
      toast({
        title: "Preview Error",
        description: "Failed to load export preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (exportableOnly = false) => {
    if (exportableOnly) {
      const exportableIds = exportPreview
        .filter((item) => item.exportable)
        .map((item) => item.id);
      setSelectedItems(new Set(exportableIds));
    } else {
      const allIds = exportPreview.map((item) => item.id);
      setSelectedItems(new Set(allIds));
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleExport = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportRequest = {
        project_id: projectId,
        selected_items: Array.from(selectedItems),
        target_portal: "store",
        user_email: userEmail,
      };

      const response = await apiService.post(
        `/api/v1/projects/${projectId}/bom/export`,
        exportRequest,
      );

      setExportResult(response);
      setActiveTab("results");

      if (response.success) {
        toast({
          title: "Export Successful",
          description: `${response.exported_items} items added to your Store cart`,
          variant: "default",
        });
      } else {
        toast({
          title: "Export Completed with Issues",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description:
          error.response?.data?.detail || "Failed to export BOM to cart",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportableCount = exportPreview.filter(
    (item) => item.exportable,
  ).length;
  const selectedExportableCount = exportPreview.filter(
    (item) => item.exportable && selectedItems.has(item.id),
  ).length;

  const getStatusIcon = (status: string, exportable: boolean) => {
    if (status === "exported" || status === "mapped_and_exported") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (status === "failed" || status.includes("error")) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    } else if (exportable) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (
    status: string,
    exportable: boolean,
    reason?: string,
  ) => {
    if (status === "exported" || status === "mapped_and_exported") {
      return <Badge variant="success">Exported</Badge>;
    } else if (status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    } else if (exportable) {
      return <Badge variant="success">Ready</Badge>;
    } else {
      return <Badge variant="secondary">Cannot Export</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Export BOM to Store Cart
          </DialogTitle>
          <DialogDescription>
            Export Bill of Materials from "{projectName}" to your MakrX Store
            shopping cart
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "preview" | "results")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Preview & Select
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={!exportResult}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Export Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading export preview...
              </div>
            ) : (
              <>
                {/* Summary */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{exportableCount}</strong> of{" "}
                    <strong>{exportPreview.length}</strong> BOM items can be
                    exported to the Store. Items must have valid SKUs or part
                    codes that match Store products.
                  </AlertDescription>
                </Alert>

                {/* Selection Controls */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <span className="text-sm font-medium">
                    {selectedExportableCount} of {exportableCount} exportable
                    items selected
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(true)}
                    >
                      Select All Exportable
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {exportPreview.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg ${
                          item.exportable
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) =>
                              handleItemSelect(item.id, checked as boolean)
                            }
                            disabled={!item.exportable}
                            className="mt-1"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(
                                item.exportable ? "ready" : "not_exportable",
                                item.exportable,
                              )}
                              <h4 className="font-medium text-sm">
                                {item.part_name}
                              </h4>
                              {getStatusBadge("", item.exportable, item.reason)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">
                                  SKU/Part Code:
                                </span>{" "}
                                {item.mapped_sku ? (
                                  <span className="text-green-600 font-medium">
                                    {item.mapped_sku} (mapped)
                                  </span>
                                ) : item.part_code ? (
                                  item.part_code
                                ) : (
                                  <span className="text-gray-400">
                                    Not specified
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span>{" "}
                                {item.quantity_needed}
                              </div>
                              <div>
                                <span className="font-medium">Source:</span>{" "}
                                {item.source}
                              </div>
                              {!item.exportable && item.reason && (
                                <div className="col-span-2">
                                  <span className="font-medium text-red-600">
                                    Reason:
                                  </span>{" "}
                                  <span className="text-red-600">
                                    {item.reason}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {exportResult && (
              <>
                {/* Results Summary */}
                <Alert
                  className={
                    exportResult.success
                      ? "border-green-200 bg-green-50"
                      : "border-orange-200 bg-orange-50"
                  }
                >
                  {exportResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  )}
                  <AlertDescription>
                    <strong>{exportResult.message}</strong>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>✅ Exported: {exportResult.exported_items}</div>
                      <div>⏭️ Skipped: {exportResult.skipped_items}</div>
                      <div>
                        📦 Total Items:{" "}
                        {exportResult.exported_items +
                          exportResult.skipped_items}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Cart Link */}
                {exportResult.cart_url && exportResult.exported_items > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="flex-1">
                      Items have been added to your Store cart
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={exportResult.cart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Cart <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Detailed Results */}
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {exportResult.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          detail.status === "exported" ||
                          detail.status === "mapped_and_exported"
                            ? "bg-green-50 border-green-200"
                            : detail.status === "failed"
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getStatusIcon(
                            detail.status,
                            detail.status.includes("exported"),
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {detail.part_name}
                              </h4>
                              {getStatusBadge(
                                detail.status,
                                detail.status.includes("exported"),
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              {detail.sku && (
                                <div>
                                  <span className="font-medium">SKU:</span>{" "}
                                  {detail.sku}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Quantity:</span>{" "}
                                {detail.quantity}
                              </div>
                              {detail.reason && (
                                <div className="col-span-2">
                                  <span className="font-medium">Details:</span>{" "}
                                  {detail.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {activeTab === "preview" && (
              <Button
                onClick={handleExport}
                disabled={selectedItems.size === 0 || isExporting}
                className="ml-auto"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Export {selectedExportableCount} Items to Cart
                  </>
                )}
              </Button>
            )}

            {activeTab === "results" && exportResult?.cart_url && (
              <Button asChild className="ml-auto">
                <a
                  href={exportResult.cart_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Store Cart
                </a>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
