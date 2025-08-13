import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  X,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface InventoryReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const InventoryReorderModal: React.FC<InventoryReorderModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [orderData, setOrderData] = useState({
    productId: '',
    productName: '',
    category: '',
    quantity: '',
    unitPrice: '',
    supplier: 'makrx',
    priority: 'normal',
    notes: '',
    estimatedDelivery: ''
  });

  const [loading, setLoading] = useState(false);

  // Mock inventory items that can be reordered
  const availableProducts = [
    { id: 'pla-red-1kg', name: 'PLA Filament - Red (1kg)', price: 25, category: 'filament' },
    { id: 'abs-black-1kg', name: 'ABS Filament - Black (1kg)', price: 30, category: 'filament' },
    { id: 'resin-clear-1l', name: 'Clear Resin (1L)', price: 45, category: 'resin' },
    { id: 'sandpaper-set', name: 'Sandpaper Assortment Set', price: 15, category: 'tools' },
    { id: 'screws-m3', name: 'M3 Screws Pack (100pcs)', price: 8, category: 'hardware' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      setOrderData(prev => ({
        ...prev,
        productId,
        productName: product.name,
        category: product.category,
        unitPrice: product.price.toString()
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalCost = parseFloat(orderData.unitPrice) * parseInt(orderData.quantity);
      const submitData = {
        ...orderData,
        quantity: parseInt(orderData.quantity),
        unitPrice: parseFloat(orderData.unitPrice),
        totalCost,
        orderId: `RO-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting reorder:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = orderData.quantity && orderData.unitPrice 
    ? parseFloat(orderData.unitPrice) * parseInt(orderData.quantity) 
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Inventory Reorder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select product to reorder" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-sm text-gray-500 ml-2">${product.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {orderData.productId && (
            <>
              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={orderData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price ($)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={orderData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    placeholder="Price per unit"
                    required
                  />
                </div>
              </div>

              {/* Supplier and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select 
                    value={orderData.supplier} 
                    onValueChange={(value) => handleInputChange('supplier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="makrx">MakrX Store</SelectItem>
                      <SelectItem value="external">External Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={orderData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={orderData.estimatedDelivery}
                  onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={orderData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span>{orderData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{orderData.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span>${orderData.unitPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total Cost:</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning for external suppliers */}
              {orderData.supplier === 'external' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">External Supplier</p>
                      <p className="text-yellow-700">Orders from external suppliers may require additional approval and have longer delivery times.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!orderData.productId || !orderData.quantity || loading}
          >
            {loading ? 'Submitting...' : 'Submit Reorder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryReorderModal;
