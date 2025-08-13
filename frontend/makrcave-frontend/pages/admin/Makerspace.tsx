import { Settings, Building2, Clock, DollarSign, AlertTriangle } from 'lucide-react';

export default function AdminMakerspace() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Makerspace Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your makerspace policies and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Makerspace Name</label>
              <input 
                type="text" 
                defaultValue="Downtown MakrSpace"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input 
                type="text" 
                defaultValue="123 Maker Street, Tech City, TC 12345"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input 
                type="email" 
                defaultValue="info@makrspace.local"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Monday - Friday</span>
              <span className="text-sm font-medium">9:00 AM - 10:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Saturday</span>
              <span className="text-sm font-medium">10:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sunday</span>
              <span className="text-sm font-medium">12:00 PM - 6:00 PM</span>
            </div>
          </div>
          <button className="makrcave-btn-secondary text-sm mt-4">
            Edit Hours
          </button>
        </div>

        {/* Pricing & Policies */}
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing & Policies
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Daily Access Fee</label>
              <input 
                type="number" 
                defaultValue="15"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">3D Printer Rate (per hour)</label>
              <input 
                type="number" 
                defaultValue="5"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Reservation Duration</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-makrx-blue">
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Safety & Alerts */}
        <div className="makrcave-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Safety & Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low Stock Notifications</p>
                <p className="text-xs text-muted-foreground">Alert when inventory runs low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-makrx-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Equipment Maintenance Reminders</p>
                <p className="text-xs text-muted-foreground">Notify when maintenance is due</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-makrx-blue"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-approve Reservations</p>
                <p className="text-xs text-muted-foreground">Automatically approve member bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-makrx-blue"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="makrcave-btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  );
}
