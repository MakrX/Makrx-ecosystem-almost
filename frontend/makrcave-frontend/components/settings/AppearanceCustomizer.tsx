import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  MessageCircle,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Info,
  Eye,
  Paintbrush,
  Layout
} from 'lucide-react';

interface CustomThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text_primary?: string;
  text_secondary?: string;
}

interface MakerspaceSettings {
  theme_mode?: string;
  custom_theme_colors?: CustomThemeColors;
  landing_page_cta?: string;
  welcome_message?: string;
  enable_chat_widget?: boolean;
  enable_help_widget?: boolean;
  custom_css?: string;
}

interface AppearanceCustomizerProps {
  settings: MakerspaceSettings;
  onUpdate: (data: Partial<MakerspaceSettings>) => void;
  onSave: (data: any) => void;
  saving: boolean;
}

const themePresets = [
  {
    name: 'Default Blue',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text_primary: '#1F2937',
      text_secondary: '#6B7280'
    }
  },
  {
    name: 'Green Tech',
    colors: {
      primary: '#10B981',
      secondary: '#6B7280',
      accent: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      text_primary: '#065F46',
      text_secondary: '#047857'
    }
  },
  {
    name: 'Orange Maker',
    colors: {
      primary: '#F59E0B',
      secondary: '#78716C',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#FFFBEB',
      text_primary: '#92400E',
      text_secondary: '#A16207'
    }
  },
  {
    name: 'Purple Innovation',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FAF5FF',
      text_primary: '#581C87',
      text_secondary: '#7C3AED'
    }
  }
];

const AppearanceCustomizer: React.FC<AppearanceCustomizerProps> = ({
  settings,
  onUpdate,
  onSave,
  saving
}) => {
  const [showCssEditor, setShowCssEditor] = useState(false);

  const handleToggle = (field: string, value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleColorChange = (colorKey: string, value: string) => {
    const currentColors = settings.custom_theme_colors || {};
    const updatedColors = {
      ...currentColors,
      [colorKey]: value
    };
    onUpdate({ custom_theme_colors: updatedColors });
  };

  const applyThemePreset = (preset: typeof themePresets[0]) => {
    onUpdate({ 
      theme_mode: 'custom',
      custom_theme_colors: preset.colors 
    });
  };

  const resetToDefaultTheme = () => {
    onUpdate({ 
      theme_mode: 'light',
      custom_theme_colors: null 
    });
  };

  const handleSave = () => {
    const appearanceData = {
      theme_mode: settings.theme_mode,
      custom_theme_colors: settings.custom_theme_colors,
      landing_page_cta: settings.landing_page_cta,
      welcome_message: settings.welcome_message,
      enable_chat_widget: settings.enable_chat_widget,
      enable_help_widget: settings.enable_help_widget,
      custom_css: settings.custom_css
    };
    onSave(appearanceData);
  };

  const customColors = settings.custom_theme_colors || {};

  return (
    <div className="space-y-6">
      {/* Appearance Customization Overview */}
      <Card className="bg-pink-50 border-pink-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-pink-600 mt-0.5" />
            <div className="text-sm text-pink-800">
              <p className="font-medium">Appearance Customization</p>
              <p className="text-pink-700 mt-1">
                Customize the look and feel of your makerspace portal including themes, colors, 
                messaging, and user interface elements to match your brand identity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode Selection */}
          <div className="space-y-3">
            <Label>Theme Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.theme_mode === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('theme_mode', 'light')}
              >
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">Light</p>
                    <p className="text-xs text-gray-500">Bright and clean</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.theme_mode === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('theme_mode', 'dark')}
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Dark</p>
                    <p className="text-xs text-gray-500">Easy on the eyes</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.theme_mode === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('theme_mode', 'custom')}
              >
                <div className="flex items-center gap-3">
                  <Paintbrush className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Custom</p>
                    <p className="text-xs text-gray-500">Your brand colors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Presets */}
          {settings.theme_mode === 'custom' && (
            <div className="space-y-3">
              <Label>Theme Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themePresets.map((preset, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:border-gray-300 transition-all"
                    onClick={() => applyThemePreset(preset)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <span className="text-sm font-medium">{preset.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {Object.values(preset.colors).slice(0, 4).map((color, i) => (
                        <div 
                          key={i}
                          className="w-3 h-3 rounded border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Color Picker */}
          {settings.theme_mode === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Colors</Label>
                <Button variant="outline" size="sm" onClick={resetToDefaultTheme}>
                  Reset to Default
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.primary || '#3B82F6'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.primary || '#3B82F6'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.secondary || '#64748B'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.secondary || '#64748B'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      placeholder="#64748B"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.accent || '#10B981'}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.accent || '#10B981'}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background_color">Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={customColors.background || '#FFFFFF'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-12 h-10 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={customColors.background || '#FFFFFF'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Interface Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              value={settings.welcome_message || ''}
              onChange={(e) => handleInputChange('welcome_message', e.target.value)}
              placeholder="Welcome to our makerspace! We're excited to have you join our community of makers."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Displayed to new members during onboarding and on the landing page
            </p>
          </div>

          {/* Landing Page CTA */}
          <div className="space-y-2">
            <Label htmlFor="landing_page_cta">Landing Page Call-to-Action</Label>
            <Input
              id="landing_page_cta"
              value={settings.landing_page_cta || ''}
              onChange={(e) => handleInputChange('landing_page_cta', e.target.value)}
              placeholder="Join Our Maker Community Today!"
            />
            <p className="text-xs text-gray-500">
              Primary button text on your makerspace landing page
            </p>
          </div>

          {/* Widget Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="enable_chat_widget" className="font-medium">
                    Chat Widget
                  </Label>
                  {settings.enable_chat_widget && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Enable live chat support widget
                </p>
              </div>
              <Switch
                id="enable_chat_widget"
                checked={settings.enable_chat_widget || false}
                onCheckedChange={(checked) => handleToggle('enable_chat_widget', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="enable_help_widget" className="font-medium">
                    Help Widget
                  </Label>
                  {settings.enable_help_widget && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Enable contextual help and documentation
                </p>
              </div>
              <Switch
                id="enable_help_widget"
                checked={settings.enable_help_widget !== false}
                onCheckedChange={(checked) => handleToggle('enable_help_widget', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Advanced Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom CSS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Custom CSS</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCssEditor(!showCssEditor)}
              >
                {showCssEditor ? <Eye className="h-4 w-4 mr-2" /> : <Type className="h-4 w-4 mr-2" />}
                {showCssEditor ? 'Hide Editor' : 'Show Editor'}
              </Button>
            </div>

            {showCssEditor && (
              <div className="space-y-2">
                <Textarea
                  value={settings.custom_css || ''}
                  onChange={(e) => handleInputChange('custom_css', e.target.value)}
                  placeholder={`/* Custom CSS */\n.custom-button {\n  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);\n  border: none;\n  color: white;\n}\n\n.makerspace-header {\n  background-color: var(--primary-color);\n}`}
                  rows={10}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500">
                  Add custom CSS to override default styles. Use CSS variables like --primary-color for theme colors.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Theme Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview Card */}
            <div 
              className="border rounded-lg p-4"
              style={{
                backgroundColor: customColors.background || '#FFFFFF',
                color: customColors.text_primary || '#1F2937'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-bold text-lg"
                  style={{ color: customColors.primary || '#3B82F6' }}
                >
                  Welcome to {settings.makerspace_name || 'Your Makerspace'}
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    style={{ 
                      backgroundColor: customColors.primary || '#3B82F6',
                      borderColor: customColors.primary || '#3B82F6'
                    }}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    style={{ 
                      borderColor: customColors.secondary || '#64748B',
                      color: customColors.secondary || '#64748B'
                    }}
                  >
                    Secondary
                  </Button>
                </div>
              </div>
              
              <p style={{ color: customColors.text_secondary || '#6B7280' }}>
                {settings.welcome_message || 'Welcome to our makerspace! We\'re excited to have you join our community of makers.'}
              </p>
              
              <div className="mt-4 flex items-center gap-2">
                <Badge 
                  style={{ 
                    backgroundColor: customColors.accent || '#10B981',
                    color: 'white'
                  }}
                >
                  Accent Color
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: customColors.secondary || '#64748B',
                    color: customColors.secondary || '#64748B'
                  }}
                >
                  Secondary Badge
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              This preview shows how your theme colors and messaging will appear to users.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Appearance Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Theme Configuration</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Theme Mode:</span>
                  <Badge variant="outline">
                    {settings.theme_mode?.charAt(0).toUpperCase() + settings.theme_mode?.slice(1) || 'Light'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Custom Colors:</span>
                  <Badge variant={settings.custom_theme_colors ? "default" : "outline"}>
                    {settings.custom_theme_colors ? 'Applied' : 'Default'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Custom CSS:</span>
                  <Badge variant={settings.custom_css ? "default" : "outline"}>
                    {settings.custom_css ? 'Applied' : 'None'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Interface Elements</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span>Chat Widget:</span>
                  <Badge variant={settings.enable_chat_widget ? "default" : "outline"}>
                    {settings.enable_chat_widget ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Help Widget:</span>
                  <Badge variant={settings.enable_help_widget !== false ? "default" : "outline"}>
                    {settings.enable_help_widget !== false ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Welcome Message:</span>
                  <Badge variant={settings.welcome_message ? "default" : "outline"}>
                    {settings.welcome_message ? 'Custom' : 'Default'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Appearance Settings
        </Button>
      </div>
    </div>
  );
};

export default AppearanceCustomizer;
