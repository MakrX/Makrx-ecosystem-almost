'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';

interface TrackingUpdate {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  completed: boolean;
}

interface OrderStatus {
  orderId: string;
  status: 'processing' | 'manufacturing' | 'shipped' | 'delivered';
  estimatedDelivery: string;
  trackingNumber?: string;
  carrier?: string;
  updates: TrackingUpdate[];
  products: Array<{
    name: string;
    quantity: number;
    image: string;
  }>;
}

const mockOrderStatus: OrderStatus = {
  orderId: 'MX-2024-001234',
  status: 'shipped',
  estimatedDelivery: '2024-01-25',
  trackingNumber: '1Z9999W99999999999',
  carrier: 'UPS',
  updates: [
    {
      timestamp: '2024-01-20T09:00:00Z',
      status: 'Order Placed',
      location: 'Online',
      description: 'Your order has been received and is being processed.',
      completed: true
    },
    {
      timestamp: '2024-01-21T14:30:00Z',
      status: 'In Production',
      location: 'Austin, TX Facility',
      description: '3D printing started for custom parts.',
      completed: true
    },
    {
      timestamp: '2024-01-22T16:45:00Z',
      status: 'Quality Check',
      location: 'Austin, TX Facility',
      description: 'Parts completed and passed quality inspection.',
      completed: true
    },
    {
      timestamp: '2024-01-23T10:20:00Z',
      status: 'Shipped',
      location: 'Austin, TX',
      description: 'Package has been picked up by carrier and is in transit.',
      completed: true
    },
    {
      timestamp: '2024-01-24T08:15:00Z',
      status: 'In Transit',
      location: 'Dallas, TX',
      description: 'Package is on its way to the destination.',
      completed: true
    },
    {
      timestamp: '2024-01-25T12:00:00Z',
      status: 'Out for Delivery',
      location: 'Houston, TX',
      description: 'Package is out for delivery and will arrive today.',
      completed: false
    }
  ],
  products: [
    {
      name: 'Custom Phone Case - iPhone 15 Pro',
      quantity: 2,
      image: 'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Product'
    },
    {
      name: 'Precision Bracket - Aluminum',
      quantity: 1,
      image: 'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Product'
    }
  ]
};

export default function TrackOrderPage() {
  const [trackingInput, setTrackingInput] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (trackingInput.toLowerCase().includes('mx-2024-001234') || 
          trackingInput.toLowerCase().includes('1z9999w99999999999')) {
        setOrderStatus(mockOrderStatus);
      } else {
        setError('Order not found. Please check your order number or tracking number and try again.');
        setOrderStatus(null);
      }
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'manufacturing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return <Clock className="w-5 h-5" />;
      case 'manufacturing': return <Package className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Track Your Order
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Enter your order number or tracking number to get real-time updates on your shipment.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tracking Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order Number or Tracking Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="tracking"
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter MX-XXXX-XXXXXX or tracking number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Demo Tracking Numbers:</h3>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>Order Number: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">MX-2024-001234</code></p>
              <p>Tracking Number: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">1Z9999W99999999999</code></p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Order Status */}
        {orderStatus && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order {orderStatus.orderId}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus.status)}`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(orderStatus.status)}
                    {orderStatus.status.charAt(0).toUpperCase() + orderStatus.status.slice(1)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(orderStatus.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
                {orderStatus.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {orderStatus.trackingNumber}
                    </p>
                  </div>
                )}
                {orderStatus.carrier && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Carrier</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {orderStatus.carrier}
                    </p>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="border-t dark:border-gray-600 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items in this order:</h3>
                <div className="space-y-3">
                  {orderStatus.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tracking History</h3>
              
              <div className="space-y-4">
                {orderStatus.updates.map((update, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        update.completed ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                      {index < orderStatus.updates.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          update.completed ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${
                          update.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {update.status}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {update.location}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {update.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                Need Help with Your Order?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-300">Call Us</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-300">Email Support</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">support@makrx.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                How long does manufacturing take?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                3D printing typically takes 1-3 business days, while CNC machining takes 3-7 business days. 
                Complex orders may take longer.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I modify my order after it's placed?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Orders can be modified within 2 hours of placement if manufacturing hasn't started. 
                Contact our support team immediately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What if my tracking shows no updates?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Tracking information may take 24-48 hours to appear after shipping. If you don't see updates 
                after this time, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
