import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  QrCode, 
  Camera, 
  Nfc, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle,
  RefreshCw,
  Play,
  Square,
  Timer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, differenceInMinutes } from 'date-fns';
import { formatUserDisplayName } from '../lib/userUtils';

interface CheckInSession {
  id: string;
  reservation_id: string;
  equipment_id: string;
  equipment_name: string;
  user_id: string;
  user_name: string;
  check_in_time: string;
  check_out_time?: string;
  planned_start: string;
  planned_end: string;
  status: 'active' | 'completed' | 'overdue';
  webcam_check_in_url?: string;
  webcam_check_out_url?: string;
  consumables_used?: { name: string; quantity: number; unit: string }[];
  notes?: string;
}

interface EquipmentCheckInOutProps {
  className?: string;
}

const EquipmentCheckInOut: React.FC<EquipmentCheckInOutProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [sessions, setSessions] = useState<CheckInSession[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showNFCReader, setShowNFCReader] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [manualEquipmentId, setManualEquipmentId] = useState('');
  const [consumables, setConsumables] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedSession, setSelectedSession] = useState<CheckInSession | null>(null);

  // Mock active sessions
  const mockSessions: CheckInSession[] = [
    {
      id: 'session-1',
      reservation_id: 'res-1',
      equipment_id: 'eq-1',
      equipment_name: 'Prusa i3 MK3S+',
      user_id: 'user-1',
      user_name: 'John Maker',
      check_in_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      planned_start: new Date(Date.now() - 3600000).toISOString(),
      planned_end: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      status: 'active',
      webcam_check_in_url: '/api/check-in-photos/session-1-checkin.jpg'
    }
  ];

  useEffect(() => {
    setSessions(mockSessions);
  }, []);

  useEffect(() => {
    // Check for overdue sessions every minute
    const interval = setInterval(() => {
      setSessions(prev => prev.map(session => {
        const now = new Date();
        const plannedEnd = new Date(session.planned_end);
        if (session.status === 'active' && now > plannedEnd) {
          return { ...session, status: 'overdue' as const };
        }
        return session;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Convert to blob and upload (mock)
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            console.log('Photo captured:', blob);
            // In real implementation, upload to server
          }
        });
      }
    }
    stopCamera();
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Mock QR scan result
    setTimeout(() => {
      const mockEquipmentId = 'eq-1';
      handleCheckIn(mockEquipmentId);
      setShowQRScanner(false);
    }, 2000);
  };

  const handleNFCScan = async () => {
    setShowNFCReader(true);
    
    if ('NDEFReader' in window) {
      try {
        // @ts-ignore - NFC Web API is experimental
        const ndef = new NDEFReader();
        await ndef.scan();
        
        // @ts-ignore
        ndef.addEventListener('reading', ({ message }) => {
          const equipmentId = message.records[0]?.data;
          if (equipmentId) {
            handleCheckIn(equipmentId);
          }
          setShowNFCReader(false);
        });
      } catch (error) {
        console.error('NFC scan failed:', error);
        alert('NFC not supported or permission denied');
        setShowNFCReader(false);
      }
    } else {
      alert('NFC not supported on this device');
      setShowNFCReader(false);
    }
  };

  const handleCheckIn = async (equipmentId: string) => {
    // Check if user has an approved reservation for this equipment
    const now = new Date();
    const existingSession = sessions.find(s => 
      s.equipment_id === equipmentId && 
      s.user_id === user?.id &&
      s.status === 'active'
    );

    if (existingSession) {
      alert('You already have an active session for this equipment');
      return;
    }

    // Create new session
    const newSession: CheckInSession = {
      id: `session-${Date.now()}`,
      reservation_id: `res-${Date.now()}`, // Would be actual reservation ID
      equipment_id: equipmentId,
      equipment_name: `Equipment ${equipmentId}`, // Would fetch from equipment list
      user_id: user?.id || 'current-user',
      user_name: formatUserDisplayName(user),
      check_in_time: now.toISOString(),
      planned_start: now.toISOString(),
      planned_end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: 'active'
    };

    setSessions(prev => [...prev, newSession]);
    
    // Optionally capture check-in photo
    if (confirm('Capture check-in photo?')) {
      await startCamera();
    }
  };

  const handleCheckOut = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSession(session);
    
    // Optionally capture check-out photo
    if (confirm('Capture check-out photo?')) {
      await startCamera();
    }

    // Update session with check-out info
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { 
            ...s, 
            check_out_time: new Date().toISOString(),
            status: 'completed' as const,
            consumables_used: consumables,
            notes: sessionNotes
          }
        : s
    ));

    // Reset form
    setConsumables([]);
    setSessionNotes('');
    setSelectedSession(null);
  };

  const addConsumable = () => {
    setConsumables(prev => [...prev, { name: '', quantity: 0, unit: '' }]);
  };

  const updateConsumable = (index: number, field: keyof typeof consumables[0], value: string | number) => {
    setConsumables(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeConsumable = (index: number) => {
    setConsumables(prev => prev.filter((_, i) => i !== index));
  };

  const getSessionDuration = (session: CheckInSession) => {
    const start = new Date(session.check_in_time);
    const end = session.check_out_time ? new Date(session.check_out_time) : new Date();
    return differenceInMinutes(end, start);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'overdue': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Equipment Check-In/Out</h2>
        <p className="text-gray-600">Track equipment usage and manage active sessions</p>
      </div>

      {/* Check-In Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Check-In to Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleQRScan} 
              className="flex items-center justify-center gap-2 h-24"
              disabled={showQRScanner}
            >
              <QrCode className="h-8 w-8" />
              <div>
                <div className="font-semibold">QR Code</div>
                <div className="text-sm opacity-75">
                  {showQRScanner ? 'Scanning...' : 'Scan equipment QR'}
                </div>
              </div>
            </Button>

            <Button 
              onClick={handleNFCScan}
              className="flex items-center justify-center gap-2 h-24"
              disabled={showNFCReader}
            >
              <Nfc className="h-8 w-8" />
              <div>
                <div className="font-semibold">NFC Tag</div>
                <div className="text-sm opacity-75">
                  {showNFCReader ? 'Ready to scan...' : 'Tap equipment tag'}
                </div>
              </div>
            </Button>

            <div className="space-y-2">
              <Label>Manual Entry</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Equipment ID"
                  value={manualEquipmentId}
                  onChange={(e) => setManualEquipmentId(e.target.value)}
                />
                <Button 
                  onClick={() => handleCheckIn(manualEquipmentId)}
                  disabled={!manualEquipmentId.trim()}
                >
                  Check In
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Sessions
            <Badge variant="outline">{sessions.filter(s => s.status === 'active').length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.filter(s => s.status === 'active' || s.status === 'overdue').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Timer className="h-12 w-12 mx-auto mb-2" />
              <p>No active sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'active' || s.status === 'overdue').map(session => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        {session.status}
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{session.equipment_name}</h4>
                        <p className="text-sm text-gray-600">{session.user_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Duration: {getSessionDuration(session)} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        Started: {format(new Date(session.check_in_time), 'HH:mm')}
                      </p>
                    </div>
                  </div>

                  {session.status === 'overdue' && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                      <div className="flex items-center text-red-800">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="font-medium">Session Overdue</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Planned end time was {format(new Date(session.planned_end), 'HH:mm')}
                      </p>
                    </div>
                  )}

                  {/* Check-out form */}
                  <div className="space-y-4">
                    <div>
                      <Label>Consumables Used (Optional)</Label>
                      <div className="space-y-2 mt-2">
                        {consumables.map((item, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2">
                            <Input 
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateConsumable(index, 'name', e.target.value)}
                            />
                            <Input 
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateConsumable(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                            <Input 
                              placeholder="Unit"
                              value={item.unit}
                              onChange={(e) => updateConsumable(index, 'unit', e.target.value)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeConsumable(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addConsumable} className="w-full">
                          Add Consumable
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Session Notes (Optional)</Label>
                      <Textarea 
                        placeholder="Any issues, observations, or notes about this session..."
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleCheckOut(session.id)}
                        className="flex items-center gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Check Out
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={startCamera}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.filter(s => s.status === 'completed').map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(session.status)}>
                    {getStatusIcon(session.status)}
                    completed
                  </Badge>
                  <div>
                    <p className="font-medium">{session.equipment_name}</p>
                    <p className="text-sm text-gray-600">{session.user_name}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Duration: {getSessionDuration(session)} minutes</p>
                  <p>{format(new Date(session.check_in_time), 'MMM d, HH:mm')} - {session.check_out_time && format(new Date(session.check_out_time), 'HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Capture Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <video 
                ref={videoRef} 
                autoPlay 
                className="w-full rounded border"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EquipmentCheckInOut;
