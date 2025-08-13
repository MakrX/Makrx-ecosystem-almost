import React from 'react';
import { ExternalLink, Upload, FileText, Calculator, Printer } from 'lucide-react';

export default function ThreeDStore() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Printer className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            3D.MakrX.Store
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Upload your 3D files and get instant quotes for custom fabrication. 
            From rapid prototyping to production runs, we've got you covered.
          </p>
          <a
            href="https://3d.makrx.store/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Upload a File
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Upload to Quote Workflow */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Simple Upload-to-Quote Process
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload File</h3>
              <p className="text-gray-600">Drop your STL, OBJ, or other 3D files directly into our platform.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Specify Details</h3>
              <p className="text-gray-600">Choose materials, quality settings, quantity, and delivery options.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Quote</h3>
              <p className="text-gray-600">Receive instant pricing from verified service providers.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Order & Receive</h3>
              <p className="text-gray-600">Place your order and receive high-quality prints at your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported File Formats */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Supported File Formats</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {['STL', 'OBJ', '3MF', 'PLY', 'AMF', 'STEP'].map((format) => (
              <div key={format} className="text-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="font-semibold text-gray-900">.{format.toLowerCase()}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload files up to 100MB in size. Our platform automatically analyzes your files 
              for printability and suggests optimizations for better results.
            </p>
          </div>
        </div>
      </section>

      {/* Example Quote Screen */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Example Quote Screen</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Printer className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">miniature_robot.stl</h3>
                    <p className="text-gray-500">Uploaded 2 minutes ago</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Print Options</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material:</span>
                        <span className="font-medium">PLA+ (White)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Layer Height:</span>
                        <span className="font-medium">0.2mm (Standard)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Infill:</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">1 piece</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Quote Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Print Cost:</span>
                        <span className="font-medium">₹245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">₹50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST (18%):</span>
                        <span className="font-medium">₹53</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-purple-600">₹348</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                    Place Order
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Modify Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Bring Your Ideas to Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Upload your first file and see how affordable custom manufacturing can be.
          </p>
          <a
            href="https://3d.makrx.store/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Upload a File
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
