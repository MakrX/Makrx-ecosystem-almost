import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/apiService';

interface Equipment {
  id: string;
  name: string;
  type: 'printer_3d' | 'laser_cutter' | 'cnc_machine' | 'workstation' | 'tool';
  status: 'available' | 'in_use' | 'under_maintenance' | 'offline';
  location?: string;
  lastMaintenance?: string;
  makerspaceId: string;
  description?: string;
  specifications?: Record<string, any>;
  requiredCertifications?: string[];
  hourlyRate?: number;
  totalHours?: number;
  successRate?: number;
  monthlyHours?: number;
  maintenanceInterval?: number;
  nextMaintenance?: string;
  accessMethod?: 'nfc' | 'manual' | 'badge';
  operatorRequired?: boolean;
}

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

interface InventoryItem {
  id: string; // item_id in spec
  name: string;
  category: 'filament' | 'resin' | 'tools' | 'electronics' | 'materials' | 'consumables' | 'machines' | 'sensors' | 'components';
  subcategory?: string; // PLA, Capacitor, etc.
  quantity: number;
  unit: string; // gram, pcs, mL, etc.
  minThreshold: number; // min_threshold in spec
  location: string; // Rack/Shelf code
  status: 'active' | 'in_use' | 'damaged' | 'reserved' | 'discontinued';
  supplierType: 'makrx' | 'external'; // supplier_type in spec
  productCode?: string; // Used for reorder integration with MakrX.Store
  makerspaceId: string; // linked_makerspace_id in spec
  history: InventoryUsageLog[]; // Usage, issue, refill logs

  // Optional fields
  imageUrl?: string;
  notes?: string;
  ownerUserId?: string; // for personal tools
  restrictedAccessLevel?: 'basic' | 'certified' | 'admin_only';
  price?: number;
  supplier?: string;
  lastRestocked?: string;
  sku?: string;
  description?: string;
  isScanned?: boolean;

  // Legacy fields (for backward compatibility)
  lowStockThreshold?: number; // maps to minThreshold
}

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  collaborators: string[];
  bomItems?: BOMItem[];
}

interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost?: number;
  supplier?: string;
  inventoryItemId?: string;
  makrxStoreProductId?: string;
}

interface Reservation {
  id: string;
  equipmentId: string;
  equipmentName: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  purpose?: string;
}

interface Makerspace {
  id: string;
  name: string;
  description?: string;
  location?: string;
  managerId?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
}

interface MakerspaceStats {
  totalMembers: number;
  activeProjects: number;
  equipmentUtilization: number;
  lowStockItems: number;
  pendingReservations: number;
  completedProjectsThisMonth: number;
}

interface MakerspaceContextType {
  currentMakerspace: Makerspace | null;
  allMakerspaces: Makerspace[];
  stats: MakerspaceStats;
  equipment: Equipment[];
  inventory: InventoryItem[];
  projects: Project[];
  reservations: Reservation[];
  updateStats: () => void;
  setCurrentMakerspace: (makerspace: Makerspace | null) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  updateInventoryQuantity: (id: string, quantity: number) => void;
  issueInventoryItem: (id: string, quantity: number, reason?: string, projectId?: string, jobId?: string) => Promise<void>;
  restockInventoryItem: (id: string, quantity: number, reason?: string) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  loadInventoryItems: () => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  createReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateEquipmentStatus: (id: string, status: Equipment['status']) => void;
}

const MakerspaceContext = createContext<MakerspaceContextType | undefined>(undefined);

export function MakerspaceProvider({ children }: { children: ReactNode }) {
  // Mock makerspace data - would come from API in real app
  const [allMakerspaces] = useState<Makerspace[]>([
    {
      id: 'ms-1',
      name: 'Downtown Innovation Hub',
      description: 'A state-of-the-art makerspace in the heart of the city',
      location: '123 Innovation St, Downtown',
      managerId: 'msa-1',
      managerName: 'Sarah Martinez',
      isActive: true,
      createdAt: '2023-01-15'
    },
    {
      id: 'ms-2',
      name: 'University MakrLab',
      description: 'Educational makerspace for students and faculty',
      location: 'University Campus, Building A',
      managerId: 'msa-2',
      managerName: 'Jordan Kim',
      isActive: true,
      createdAt: '2023-03-20'
    },
    {
      id: 'ms-3',
      name: 'Community Workshop',
      description: 'Community-focused making space for all skill levels',
      location: '456 Community Ave',
      managerId: 'msa-3',
      managerName: 'Casey Williams',
      isActive: true,
      createdAt: '2023-06-10'
    }
  ]);

  const [currentMakerspace, setCurrentMakerspace] = useState<Makerspace | null>(allMakerspaces[0]);

  // Mock data - would come from API in real app
  const [stats] = useState<MakerspaceStats>({
    totalMembers: 45,
    activeProjects: 12,
    equipmentUtilization: 68,
    lowStockItems: 3,
    pendingReservations: 5,
    completedProjectsThisMonth: 8
  });

  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'eq-1',
      name: 'Prusa i3 MK3S+',
      type: 'printer_3d',
      status: 'available',
      location: 'Station A1',
      lastMaintenance: '2024-01-15',
      makerspaceId: 'ms-1',
      description: 'High-precision FDM 3D printer perfect for prototyping and small-scale production. Features automatic bed leveling and filament detection.',
      hourlyRate: 12,
      totalHours: 1247,
      successRate: 94,
      monthlyHours: 89,
      nextMaintenance: '2024-02-15',
      accessMethod: 'nfc',
      operatorRequired: false,
      requiredCertifications: ['3D Printing', 'Safety Certified']
    },
    {
      id: 'eq-2',
      name: 'Ultimaker S5 Pro',
      type: 'printer_3d',
      status: 'in_use',
      location: 'Station A2',
      lastMaintenance: '2024-01-10',
      makerspaceId: 'ms-1',
      description: 'Professional FDM 3D printer with dual extrusion and air manager',
      hourlyRate: 15,
      totalHours: 856,
      successRate: 96,
      monthlyHours: 67,
      nextMaintenance: '2024-02-10',
      accessMethod: 'nfc',
      operatorRequired: true,
      requiredCertifications: ['3D Printing', 'Safety Certified']
    },
    {
      id: 'eq-3',
      name: 'Glowforge Pro',
      type: 'laser_cutter',
      status: 'available',
      location: 'Station B1',
      lastMaintenance: '2024-01-20',
      makerspaceId: 'ms-1',
      description: 'Precision laser cutter for wood, acrylic, leather, and fabric',
      hourlyRate: 25,
      totalHours: 543,
      successRate: 98,
      monthlyHours: 45,
      nextMaintenance: '2024-02-20',
      accessMethod: 'badge',
      operatorRequired: true,
      requiredCertifications: ['Laser Safety', 'Material Safety']
    },
    {
      id: 'eq-4',
      name: 'Shapeoko 4',
      type: 'cnc_machine',
      status: 'under_maintenance',
      location: 'Station C1',
      lastMaintenance: '2023-12-15',
      makerspaceId: 'ms-2',
      description: 'CNC machine for precision cutting and carving',
      hourlyRate: 30,
      totalHours: 234,
      successRate: 92,
      monthlyHours: 12,
      nextMaintenance: '2024-01-15',
      accessMethod: 'manual',
      operatorRequired: true,
      requiredCertifications: ['CNC Operation', 'Safety Certified', 'Material Handling']
    }
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      name: 'PLA Filament - White',
      category: 'filament',
      subcategory: 'PLA',
      quantity: 2,
      unit: 'kg',
      minThreshold: 3,
      location: 'Shelf A-1',
      status: 'active',
      supplierType: 'makrx',
      productCode: 'MKX-FIL-HAT-PLA001-WHT',
      makerspaceId: 'ms-1',
      history: [
        {
          id: 'log-1',
          timestamp: '2024-01-10T10:00:00Z',
          userId: 'user-1',
          userName: 'Sarah Martinez',
          action: 'restock',
          quantityBefore: 0,
          quantityAfter: 5,
          reason: 'Initial stock'
        },
        {
          id: 'log-2',
          timestamp: '2024-01-15T14:30:00Z',
          userId: 'user-2',
          userName: 'Casey Williams',
          action: 'issue',
          quantityBefore: 5,
          quantityAfter: 2,
          reason: 'Project housing prototype',
          linkedProjectId: 'proj-123'
        }
      ],
      price: 25.99,
      supplier: 'Hatchbox',
      description: 'High-quality PLA filament perfect for prototyping and general printing',
      sku: 'MKX-FIL-HAT-PLA001-WHT',
      isScanned: true,
      lastRestocked: '2024-01-10',
      lowStockThreshold: 3 // Legacy field for backward compatibility
    },
    {
      id: 'inv-2',
      name: 'PETG Filament - Clear',
      category: 'filament',
      subcategory: 'PETG',
      quantity: 5,
      unit: 'kg',
      minThreshold: 2,
      lowStockThreshold: 2,
      location: 'Shelf A-2',
      status: 'active',
      supplierType: 'makrx',
      productCode: 'MKX-FIL-PLA-PETG001-CLR',
      makerspaceId: 'ms-1',
      history: [],
      price: 32.99,
      supplier: 'Overture',
      lastRestocked: '2024-01-15',
      isScanned: true
    },
    {
      id: 'inv-3',
      name: 'Arduino Uno R3',
      category: 'electronics',
      subcategory: 'Microcontroller',
      quantity: 0,
      unit: 'pcs',
      minThreshold: 5,
      lowStockThreshold: 5,
      location: 'Drawer B-3',
      status: 'active',
      supplierType: 'external',
      makerspaceId: 'ms-1',
      history: [],
      price: 28.50,
      supplier: 'Arduino',
      lastRestocked: '2024-01-05',
      description: 'Arduino Uno R3 microcontroller board'
    },
    {
      id: 'inv-4',
      name: 'Acrylic Sheet 3mm Clear',
      category: 'materials',
      subcategory: 'Acrylic',
      quantity: 1,
      unit: 'sheets',
      minThreshold: 3,
      lowStockThreshold: 3,
      location: 'Rack C-1',
      status: 'active',
      supplierType: 'external',
      makerspaceId: 'ms-1',
      history: [],
      price: 15.99,
      supplier: 'Local Plastics',
      lastRestocked: '2023-12-20',
      description: '3mm clear acrylic sheets for laser cutting'
    }
  ]);

  const [projects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'IoT Weather Station',
      description: 'Building a connected weather monitoring system',
      ownerId: 'user-1',
      ownerName: 'John Maker',
      status: 'active',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-25',
      collaborators: ['user-2', 'user-3']
    },
    {
      id: 'proj-2',
      name: 'Custom Phone Stand',
      description: '3D printed adjustable phone stand',
      ownerId: 'user-4',
      ownerName: 'Sarah Designer',
      status: 'completed',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-20',
      collaborators: []
    }
  ]);

  const [reservations] = useState<Reservation[]>([
    {
      id: 'res-1',
      equipmentId: 'eq-1',
      equipmentName: 'Prusa i3 MK3S+',
      userId: 'user-1',
      userName: 'John Maker',
      startTime: '2024-01-27T10:00:00Z',
      endTime: '2024-01-27T14:00:00Z',
      status: 'approved',
      purpose: 'Weather station enclosure'
    },
    {
      id: 'res-2',
      equipmentId: 'eq-3',
      equipmentName: 'Glowforge Pro',
      userId: 'user-2',
      userName: 'Mike Creator',
      startTime: '2024-01-27T15:00:00Z',
      endTime: '2024-01-27T16:30:00Z',
      status: 'pending',
      purpose: 'Acrylic case panels'
    }
  ]);

  const updateStats = () => {
    // Would refresh stats from API
    console.log('Updating stats...');
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const response = await fetch('/api/v1/inventory/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...item,
          linked_makerspace_id: item.makerspaceId,
          min_threshold: item.minThreshold,
          supplier_type: item.supplierType,
          product_code: item.productCode,
          image_url: item.imageUrl,
          owner_user_id: item.ownerUserId,
          restricted_access_level: item.restrictedAccessLevel,
          created_by: 'current_user'
        })
      });

      if (response.ok) {
        const newItem = await response.json();
        setInventory(prev => [...prev, {
          ...item,
          id: newItem.id,
          history: newItem.usage_logs || []
        }]);
      } else {
        throw new Error('Failed to add inventory item');
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
      // Fallback to local state update for now
      const newItem = { ...item, id: `inv-${Date.now()}`, history: [] };
      setInventory(prev => [...prev, newItem]);
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const response = await fetch(`/api/v1/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...updates,
          linked_makerspace_id: updates.makerspaceId,
          min_threshold: updates.minThreshold,
          supplier_type: updates.supplierType,
          product_code: updates.productCode,
          image_url: updates.imageUrl,
          owner_user_id: updates.ownerUserId,
          restricted_access_level: updates.restrictedAccessLevel,
          updated_by: 'current_user'
        })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setInventory(prev => prev.map(item =>
          item.id === id ? {
            ...item,
            ...updates,
            history: updatedItem.usage_logs || item.history
          } : item
        ));
      } else {
        throw new Error('Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      // Fallback to local state update
      setInventory(prev => prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));
    }
  };

  const updateInventoryQuantity = (id: string, quantity: number) => {
    updateInventoryItem(id, { quantity });
  };

  const issueInventoryItem = async (id: string, quantity: number, reason?: string, projectId?: string, jobId?: string) => {
    try {
      const response = await fetch(`/api/v1/inventory/${id}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          quantity,
          reason,
          project_id: projectId,
          job_id: jobId
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with new quantity
        setInventory(prev => prev.map(item =>
          item.id === id ? {
            ...item,
            quantity: result.remaining_quantity,
            history: [...item.history, {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              action: 'issue',
              quantityBefore: item.quantity,
              quantityAfter: result.remaining_quantity,
              reason,
              linkedProjectId: projectId,
              linkedJobId: jobId
            }]
          } : item
        ));
      } else {
        throw new Error('Failed to issue inventory item');
      }
    } catch (error) {
      console.error('Error issuing inventory item:', error);
      throw error;
    }
  };

  const restockInventoryItem = async (id: string, quantity: number, reason?: string) => {
    try {
      const response = await fetch(`/api/v1/inventory/${id}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          quantity,
          reason
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with new quantity
        setInventory(prev => prev.map(item =>
          item.id === id ? {
            ...item,
            quantity: result.new_quantity,
            history: [...item.history, {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              action: 'restock',
              quantityBefore: item.quantity,
              quantityAfter: result.new_quantity,
              reason
            }]
          } : item
        ));
      } else {
        throw new Error('Failed to restock inventory item');
      }
    } catch (error) {
      console.error('Error restocking inventory item:', error);
      throw error;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setInventory(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to delete inventory item');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await api.inventory.getItems();

      if (response.data) {
        const mappedItems = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          quantity: item.quantity,
          unit: item.unit,
          minThreshold: item.min_threshold,
          location: item.location,
          status: item.status,
          supplierType: item.supplier_type,
          productCode: item.product_code,
          makerspaceId: item.linked_makerspace_id,
          imageUrl: item.image_url,
          notes: item.notes,
          ownerUserId: item.owner_user_id,
          restrictedAccessLevel: item.restricted_access_level,
          price: item.price,
          supplier: item.supplier,
          description: item.description,
          isScanned: item.is_scanned,
          history: [] // Would need separate API call for usage logs
        }));
        setInventory(mappedItems);
      }
    } catch (error) {
      console.error('Error loading inventory items:', error);
      // Keep using mock data as fallback
    }
  };

  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEquipment = {
      ...equipment,
      id: `eq-${Date.now()}`
    };
    setEquipment(prev => [...prev, newEquipment]);
    console.log('Added equipment:', newEquipment);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipment(prev => prev.map(equipment =>
      equipment.id === id ? { ...equipment, ...updates } : equipment
    ));
    console.log('Updated equipment:', id, updates);
  };

  const deleteEquipment = (id: string) => {
    setEquipment(prev => prev.filter(equipment => equipment.id !== id));
    console.log('Deleted equipment:', id);
  };

  const createReservation = (reservation: Omit<Reservation, 'id'>) => {
    // Would call API to create reservation
    console.log('Creating reservation:', reservation);
  };

  const updateEquipmentStatus = (id: string, status: Equipment['status']) => {
    // Would call API to update equipment status
    console.log('Updating equipment status:', id, status);
  };

  return (
    <MakerspaceContext.Provider value={{
      currentMakerspace,
      allMakerspaces,
      stats,
      equipment,
      inventory,
      projects,
      reservations,
      updateStats,
      setCurrentMakerspace,
      addInventoryItem,
      updateInventoryItem,
      updateInventoryQuantity,
      issueInventoryItem,
      restockInventoryItem,
      deleteInventoryItem,
      loadInventoryItems,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      createReservation,
      updateEquipmentStatus
    }}>
      {children}
    </MakerspaceContext.Provider>
  );
}

export function useMakerspace() {
  const context = useContext(MakerspaceContext);
  if (context === undefined) {
    throw new Error('useMakerspace must be used within a MakerspaceProvider');
  }
  return context;
}
