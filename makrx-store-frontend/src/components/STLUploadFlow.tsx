"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Eye, Calculator, Settings, Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertContent } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  analysis?: FileAnalysis;
  preview?: string;
  status: 'uploading' | 'analyzing' | 'ready' | 'error';
  error?: string;
}

interface FileAnalysis {
  dimensions: { x: number; y: number; z: number };
  volume: number;
  surfaceArea: number;
  estimatedPrintTime: number;
  estimatedMaterialWeight: number;
  complexityScore: number;
  supportsRequired: boolean;
  issues: string[];
}

interface PrintOptions {
  material: string;
  quality: string;
  color: string;
  infill: number;
  supports: boolean;
  quantity: number;
  priority: string;
}

interface PricingBreakdown {
  materialCost: number;
  laborCost: number;
  machineCost: number;
  setupFee: number;
  supportCost: number;
  qualityAdjustment: number;
  priorityAdjustment: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const STLUploadFlow: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    material: 'pla',
    quality: 'standard',
    color: 'natural',
    infill: 20,
    supports: false,
    quantity: 1,
    priority: 'normal'
  });
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [currentStep, setCurrentStep] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const materials = [
    { value: 'pla', label: 'PLA - Biodegradable, Easy to Print', price: 0.50 },
    { value: 'abs', label: 'ABS - Strong, Heat Resistant', price: 0.60 },
    { value: 'petg', label: 'PETG - Chemical Resistant, Clear', price: 0.70 },
    { value: 'tpu', label: 'TPU - Flexible, Rubber-like', price: 1.20 },
    { value: 'wood_pla', label: 'Wood PLA - Natural Look & Feel', price: 0.80 },
    { value: 'carbon_fiber', label: 'Carbon Fiber - Ultra Strong', price: 2.00 }
  ];

  const qualities = [
    { value: 'draft', label: 'Draft (0.3mm) - Fast & Economical', multiplier: 0.8 },
    { value: 'standard', label: 'Standard (0.2mm) - Good Quality', multiplier: 1.0 },
    { value: 'high', label: 'High (0.15mm) - Fine Details', multiplier: 1.3 },
    { value: 'ultra', label: 'Ultra (0.1mm) - Maximum Detail', multiplier: 1.6 }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority (7-10 days)', multiplier: 0.9 },
    { value: 'normal', label: 'Normal (3-5 days)', multiplier: 1.0 },
    { value: 'high', label: 'High Priority (1-2 days)', multiplier: 1.3 },
    { value: 'urgent', label: 'Urgent (24 hours)', multiplier: 1.8 }
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const allowedTypes = ['.stl', '.obj', '.3mf', '.ply'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        alert(`Unsupported file type: ${fileExtension}. Please upload STL, OBJ, 3MF, or PLY files.`);
        return;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, newFile]);
      uploadAndAnalyzeFile(newFile);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const uploadAndAnalyzeFile = async (uploadedFile: UploadedFile) => {
    try {
      // Simulate file upload
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      // Update status to analyzing
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'analyzing' } 
            : f
        )
      );

      // Create file URL for 3D preview
      const fileUrl = URL.createObjectURL(uploadedFile.file);

      // Simulate API call for file analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis results
      const analysis: FileAnalysis = {
        dimensions: { x: 50.0, y: 30.0, z: 20.0 },
        volume: 25.5,
        surfaceArea: 85.2,
        estimatedPrintTime: 120,
        estimatedMaterialWeight: 30.0,
        complexityScore: 0.6,
        supportsRequired: true,
        issues: []
      };

      // Update file with analysis
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'ready', 
                url: fileUrl, 
                analysis,
                preview: fileUrl 
              } 
            : f
        )
      );

      // Auto-select first file
      if (uploadedFiles.length === 0) {
        setSelectedFile({ ...uploadedFile, url: fileUrl, analysis, status: 'ready' });
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: 'Upload failed' } 
            : f
        )
      );
    }
  };

  const load3DPreview = useCallback(async (file: UploadedFile) => {
    if (!previewRef.current || !file.url) return;

    try {
      // Clear previous scene
      if (sceneRef.current && rendererRef.current) {
        previewRef.current.removeChild(rendererRef.current.domElement);
      }

      // Setup Three.js scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(400, 300);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      previewRef.current.appendChild(renderer.domElement);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Load STL file
      const loader = new STLLoader();
      
      // For demo purposes, create a simple geometry instead of loading STL
      // In production, you would load the actual STL file
      const geometry = new THREE.BoxGeometry(1, 0.6, 0.4);
      const material = new THREE.MeshStandardMaterial({ 
        color: getMaterialColor(printOptions.material),
        roughness: 0.7,
        metalness: 0.1 
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      mesh.scale.multiplyScalar(scale);
      mesh.position.copy(center).multiplyScalar(-scale);

      // Position camera
      camera.position.set(3, 3, 3);
      camera.lookAt(0, 0, 0);

      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Add ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1;
      ground.receiveShadow = true;
      scene.add(ground);

      // Store references
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      controlsRef.current = controls;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

    } catch (error) {
      console.error('3D preview error:', error);
    }
  }, [printOptions.material]);

  const getMaterialColor = (material: string): number => {
    const colors: { [key: string]: number } = {
      pla: 0x87CEEB,
      abs: 0x696969,
      petg: 0x32CD32,
      tpu: 0xFF6347,
      wood_pla: 0xDEB887,
      carbon_fiber: 0x2F4F4F
    };
    return colors[material] || 0x87CEEB;
  };

  const calculatePricing = useCallback(async () => {
    if (!selectedFile?.analysis) return;

    setIsCalculating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { analysis } = selectedFile;
      const materialInfo = materials.find(m => m.value === printOptions.material);
      const qualityInfo = qualities.find(q => q.value === printOptions.quality);
      const priorityInfo = priorities.find(p => p.value === printOptions.priority);

      // Calculate costs
      const materialCost = analysis.volume * (materialInfo?.price || 0.50) * printOptions.quantity;
      const timeCost = (analysis.estimatedPrintTime / 60) * 15.0 * printOptions.quantity;
      const supportCost = printOptions.supports ? analysis.volume * 0.20 * printOptions.quantity : 0;
      const setupFee = printOptions.quantity === 1 ? 5.0 : 5.0 + (printOptions.quantity - 1) * 1.0;

      const qualityAdjustment = materialCost * ((qualityInfo?.multiplier || 1.0) - 1);
      const priorityAdjustment = materialCost * ((priorityInfo?.multiplier || 1.0) - 1);

      let subtotal = materialCost + timeCost + supportCost + setupFee + qualityAdjustment + priorityAdjustment;

      // Quantity discounts
      if (printOptions.quantity >= 10) {
        subtotal *= 0.9;
      } else if (printOptions.quantity >= 5) {
        subtotal *= 0.95;
      }

      const tax = subtotal * 0.08;
      const shipping = printOptions.priority === 'urgent' ? 25.0 : 10.0;
      const total = subtotal + tax + shipping;

      const breakdown: PricingBreakdown = {
        materialCost: Math.round(materialCost * 100) / 100,
        laborCost: Math.round(timeCost * 100) / 100,
        machineCost: 0,
        setupFee: Math.round(setupFee * 100) / 100,
        supportCost: Math.round(supportCost * 100) / 100,
        qualityAdjustment: Math.round(qualityAdjustment * 100) / 100,
        priorityAdjustment: Math.round(priorityAdjustment * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        total: Math.round(total * 100) / 100
      };

      setPricing(breakdown);
      setActiveTab('quote');

    } catch (error) {
      console.error('Pricing calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedFile, printOptions, materials, qualities, priorities]);

  React.useEffect(() => {
    if (selectedFile && activeTab === 'preview') {
      load3DPreview(selectedFile);
    }
  }, [selectedFile, activeTab, load3DPreview]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      fileInputRef.current.files = dt.files;
      
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const addToCart = async () => {
    if (!selectedFile || !pricing) return;

    try {
      // Create quote/order data
      const orderData = {
        file_urls: [selectedFile.url],
        material: printOptions.material,
        quality: printOptions.quality,
        color: printOptions.color,
        quantity: printOptions.quantity,
        priority: printOptions.priority,
        supports: printOptions.supports,
        infill: printOptions.infill,
        pricing: pricing
      };

      console.log('Adding to cart:', orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Successfully added to cart!');
      
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Professional 3D Printing Services
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload your 3D files, get instant quotes, and have your prints delivered by our network of verified makers
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { step: 1, title: 'Upload Files', tab: 'upload' },
            { step: 2, title: 'Configure Print', tab: 'configure' },
            { step: 3, title: '3D Preview', tab: 'preview' },
            { step: 4, title: 'Get Quote', tab: 'quote' }
          ].map(({ step, title, tab }) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">{title}</span>
              {step < 4 && <div className="w-8 h-px bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="configure" disabled={uploadedFiles.length === 0}>Configure</TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedFile}>Preview</TabsTrigger>
          <TabsTrigger value="quote" disabled={!selectedFile}>Quote</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload 3D Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your 3D files
                </h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supported formats: STL, OBJ, 3MF, PLY (Max 100MB per file)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".stl,.obj,.3mf,.ply"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Uploaded Files</h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{file.file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Badge variant={
                            file.status === 'ready' ? 'default' :
                            file.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {file.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'ready' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(file);
                                setActiveTab('configure');
                              }}
                            >
                              Configure
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Info */}
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile?.analysis && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Dimensions (mm)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500">X</div>
                          <div className="font-medium">{selectedFile.analysis.dimensions.x}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500">Y</div>
                          <div className="font-medium">{selectedFile.analysis.dimensions.y}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500">Z</div>
                          <div className="font-medium">{selectedFile.analysis.dimensions.z}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Volume</Label>
                        <div className="font-medium">{selectedFile.analysis.volume} cm³</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Estimated Weight</Label>
                        <div className="font-medium">{selectedFile.analysis.estimatedMaterialWeight}g</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Print Time</Label>
                        <div className="font-medium">{Math.floor(selectedFile.analysis.estimatedPrintTime / 60)}h {selectedFile.analysis.estimatedPrintTime % 60}m</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Complexity</Label>
                        <div className="font-medium">{Math.round(selectedFile.analysis.complexityScore * 100)}%</div>
                      </div>
                    </div>

                    {selectedFile.analysis.supportsRequired && (
                      <Alert>
                        <AlertContent>
                          This model may require support structures for optimal printing.
                        </AlertContent>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Print Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Print Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Select 
                    value={printOptions.material} 
                    onValueChange={(value) => setPrintOptions(prev => ({ ...prev, material: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.value} value={material.value}>
                          {material.label} - ₹{material.price}/cm³
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality">Print Quality</Label>
                  <Select 
                    value={printOptions.quality} 
                    onValueChange={(value) => setPrintOptions(prev => ({ ...prev, quality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualities.map((quality) => (
                        <SelectItem key={quality.value} value={quality.value}>
                          {quality.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={printOptions.priority} 
                    onValueChange={(value) => setPrintOptions(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={printOptions.quantity}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="infill">Infill Percentage</Label>
                  <Input
                    id="infill"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={printOptions.infill}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, infill: parseInt(e.target.value) }))}
                  />
                  <div className="text-sm text-gray-500 mt-1">{printOptions.infill}%</div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="supports"
                    checked={printOptions.supports}
                    onCheckedChange={(checked) => setPrintOptions(prev => ({ ...prev, supports: checked as boolean }))}
                  />
                  <Label htmlFor="supports">Add support structures</Label>
                </div>

                <Button 
                  onClick={() => setActiveTab('preview')} 
                  className="w-full"
                  disabled={!selectedFile}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview 3D Model
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  3D Preview
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  ref={previewRef} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  style={{ width: 400, height: 300 }}
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Use mouse to rotate, zoom, and pan the 3D model
                </p>
                <Button 
                  onClick={calculatePricing}
                  className="w-full"
                  disabled={isCalculating}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {isCalculating ? 'Calculating...' : 'Calculate Price'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quote" className="space-y-6">
          {pricing && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Material Cost</span>
                      <span>₹{pricing.materialCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor Cost</span>
                      <span>₹{pricing.laborCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Setup Fee</span>
                      <span>₹{pricing.setupFee}</span>
                    </div>
                    {pricing.supportCost > 0 && (
                      <div className="flex justify-between">
                        <span>Support Structures</span>
                        <span>₹{pricing.supportCost}</span>
                      </div>
                    )}
                    {pricing.qualityAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span>Quality Adjustment</span>
                        <span>₹{pricing.qualityAdjustment}</span>
                      </div>
                    )}
                    {pricing.priorityAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span>Priority Adjustment</span>
                        <span>₹{pricing.priorityAdjustment}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{pricing.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>₹{pricing.tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>₹{pricing.shipping}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{pricing.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500">File</Label>
                      <div className="font-medium">{selectedFile?.file.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-500">Material</Label>
                        <div className="font-medium">{materials.find(m => m.value === printOptions.material)?.label}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Quality</Label>
                        <div className="font-medium">{qualities.find(q => q.value === printOptions.quality)?.label}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Quantity</Label>
                        <div className="font-medium">{printOptions.quantity}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Priority</Label>
                        <div className="font-medium">{priorities.find(p => p.value === printOptions.priority)?.label}</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <Button onClick={addToCart} className="w-full">
                        Add to Cart - ₹{pricing.total}
                      </Button>
                      <Button variant="outline" className="w-full">
                        Save Quote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default STLUploadFlow;
