import { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, AlertTriangle, Shield, User,
  DollarSign, FileText, CheckCircle, Plus, Minus, XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSkills } from '../contexts/SkillContext';
import AvailabilityCalendar from './AvailabilityCalendar';

interface Equipment {
  id: string;
  equipment_id: string;
  name: string;
  requires_certification: boolean;
  certification_required?: string;
  hourly_rate?: number;
  deposit_required?: number;
  description?: string;
  image_url?: string;
}

interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  available: boolean;
}

interface ReservationData {
  start_time: string;
  end_time: string;
  purpose?: string;
  project_id?: string;
  project_name?: string;
  user_notes?: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  onSubmit: (reservationData: ReservationData) => void;
  userProjects?: Array<{ id: string; name: string }>;
}

export default function ReservationModal({
  isOpen,
  onClose,
  equipment,
  onSubmit,
  userProjects = []
}: ReservationModalProps) {
  const { user } = useAuth();
  const { canAccessEquipment, getRequiredSkillsForEquipment, hasSkillForEquipment } = useSkills();
  const [selectedSlots, setSelectedSlots] = useState<{ date: string; slot: TimeSlot }[]>([]);
  const [formData, setFormData] = useState({
    purpose: '',
    project_id: '',
    project_name: '',
    user_notes: '',
    accept_terms: false,
    certification_confirmed: false
  });
  const [showCertificationWarning, setShowCertificationWarning] = useState(false);
  const [skillAccessCheck, setSkillAccessCheck] = useState<{
    canAccess: boolean;
    missingSkills: string[];
    reason?: string;
  }>({ canAccess: true, missingSkills: [] });
  const [totalCost, setTotalCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedSlots([]);
      setFormData({
        purpose: '',
        project_id: '',
        project_name: '',
        user_notes: '',
        accept_terms: false,
        certification_confirmed: false
      });
      setErrors({});

      // Check actual skill requirements using skill system
      const accessCheck = canAccessEquipment(equipment.equipment_id);
      setSkillAccessCheck(accessCheck);

      // Show certification warning if skills are missing or if legacy certification flag is set
      if (!accessCheck.canAccess || equipment.requires_certification) {
        setShowCertificationWarning(true);
      }
    }
  }, [isOpen, equipment, canAccessEquipment]);

  useEffect(() => {
    // Calculate total hours and cost when slots change
    let hours = 0;
    selectedSlots.forEach(({ slot }) => {
      const startTime = parseTime(slot.start);
      const endTime = parseTime(slot.end);
      hours += (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours
    });
    
    setTotalHours(hours);
    setTotalCost(hours * (equipment.hourly_rate || 0));
  }, [selectedSlots, equipment.hourly_rate]);

  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    const existingIndex = selectedSlots.findIndex(
      selected => selected.date === date && 
                 selected.slot.start === slot.start && 
                 selected.slot.end === slot.end
    );

    if (existingIndex >= 0) {
      // Remove slot if already selected
      setSelectedSlots(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add slot
      setSelectedSlots(prev => [...prev, { date, slot }]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedSlots.length === 0) {
      newErrors.slots = 'Please select at least one time slot';
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }

    // Check actual skills instead of just confirmation
    if (!skillAccessCheck.canAccess) {
      newErrors.certification = skillAccessCheck.reason || 'You do not have the required skills for this equipment';
    } else if (equipment.requires_certification && !formData.certification_confirmed) {
      newErrors.certification = 'You must confirm you have the required certification';
    }

    if (!formData.accept_terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Sort slots by date and time
    const sortedSlots = [...selectedSlots].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.slot.start.localeCompare(b.slot.start);
    });

    // For simplicity, create one reservation for each continuous block
    // In a real app, you might want to merge consecutive slots
    sortedSlots.forEach(({ date, slot }) => {
      const startDateTime = `${date}T${slot.start}:00`;
      const endDateTime = `${date}T${slot.end}:00`;

      const reservationData: ReservationData = {
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: formData.purpose,
        project_id: formData.project_id || undefined,
        project_name: formData.project_name || undefined,
        user_notes: formData.user_notes || undefined
      };

      onSubmit(reservationData);
    });

    onClose();
  };

  const handleProjectChange = (projectId: string) => {
    const project = userProjects.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      project_name: project?.name || ''
    }));
  };

  const clearSelectedSlots = () => {
    setSelectedSlots([]);
  };

  const formatSlotTime = (slot: TimeSlot) => {
    return `${slot.start} - ${slot.end}`;
  };

  const formatSlotDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reserve Equipment</h2>
            <p className="text-sm text-gray-600">{equipment.name} ({equipment.equipment_id})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Calendar */}
            <div>
              <AvailabilityCalendar
                equipmentId={equipment.id}
                equipmentName={equipment.name}
                onSlotSelect={handleSlotSelect}
                userRole={user?.role || 'user'}
                canReserve={true}
                selectedSlots={selectedSlots}
              />
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Skill/Certification Warnings */}
              {!skillAccessCheck.canAccess && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Missing Required Skills</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You need the following skills to access this equipment:
                      </p>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {skillAccessCheck.missingSkills.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                      <p className="text-sm text-red-700 mt-2">
                        Please request these skills from your makerspace administrator or complete the required training.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {skillAccessCheck.canAccess && showCertificationWarning && equipment.requires_certification && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Certification Required</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        This equipment requires: <strong>{equipment.certification_required}</strong>
                      </p>
                      <p className="text-sm text-amber-600 mt-2">
                        Please ensure you have completed the required training before making a reservation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Slots */}
              {selectedSlots.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-900">Selected Time Slots</h4>
                    <button
                      onClick={clearSelectedSlots}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedSlots.map((selected, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>
                          {formatSlotDate(selected.date)} - {formatSlotTime(selected.slot)}
                        </span>
                        <button
                          onClick={() => handleSlotSelect(selected.date, selected.slot)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.slots && (
                    <p className="text-sm text-red-600 mt-2">{errors.slots}</p>
                  )}
                </div>
              )}

              {/* Reservation Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Describe what you'll be using this equipment for..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                  />
                  {errors.purpose && (
                    <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
                  )}
                </div>

                {/* Project Association */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Associated Project
                  </label>
                  {userProjects.length > 0 ? (
                    <select
                      value={formData.project_id}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                    >
                      <option value="">Select a project (optional)</option>
                      {userProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.project_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                      placeholder="Project name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                    />
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.user_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, user_notes: e.target.value }))}
                    placeholder="Any special requirements or notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                  />
                </div>

                {/* Cost Summary */}
                {equipment.hourly_rate && totalHours > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Cost Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{totalHours.toFixed(1)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span>${equipment.hourly_rate.toFixed(2)}/hour</span>
                      </div>
                      {equipment.deposit_required && (
                        <div className="flex justify-between">
                          <span>Deposit:</span>
                          <span>${equipment.deposit_required.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t border-gray-200 pt-1">
                        <span>Total Cost:</span>
                        <span>${(totalCost + (equipment.deposit_required || 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certification Confirmation */}
                {equipment.requires_certification && (
                  <div>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.certification_confirmed}
                        onChange={(e) => setFormData(prev => ({ ...prev, certification_confirmed: e.target.checked }))}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700">
                        I confirm that I have the required certification ({equipment.certification_required}) 
                        and am authorized to operate this equipment safely.
                      </span>
                    </label>
                    {errors.certification && (
                      <p className="text-sm text-red-600 mt-1">{errors.certification}</p>
                    )}
                  </div>
                )}

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.accept_terms}
                      onChange={(e) => setFormData(prev => ({ ...prev, accept_terms: e.target.checked }))}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the equipment usage terms and conditions, including liability for damage 
                      and adherence to safety protocols.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-sm text-red-600 mt-1">{errors.terms}</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedSlots.length === 0 || !skillAccessCheck.canAccess}
                    className="px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!skillAccessCheck.canAccess ? "Missing required skills" : ""}
                  >
                    {!skillAccessCheck.canAccess ? "Skills Required" : "Submit Reservation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
