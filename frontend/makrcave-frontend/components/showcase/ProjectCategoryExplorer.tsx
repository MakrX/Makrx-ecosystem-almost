import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Cpu,
  Wrench,
  Lightbulb,
  Zap,
  Palette,
  Home,
  Car,
  Gamepad2,
  Music,
  Camera,
  Printer,
  Smartphone,
  Settings,
  Layers3,
  Rocket,
  Heart,
  Leaf,
  Coffee,
  Clock
} from 'lucide-react';

interface ProjectCategoryExplorerProps {
  categories: string[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const ProjectCategoryExplorer: React.FC<ProjectCategoryExplorerProps> = ({
  categories,
  onCategorySelect,
  selectedCategory
}) => {
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      '3D Printing': Printer,
      'Electronics': Cpu,
      'Woodworking': Wrench,
      'Robotics': Rocket,
      'IoT': Smartphone,
      'Art & Design': Palette,
      'Automation': Settings,
      'Tools': Wrench,
      'Home': Home,
      'Automotive': Car,
      'Gaming': Gamepad2,
      'Music': Music,
      'Photography': Camera,
      'Wearables': Heart,
      'Sustainability': Leaf,
      'Kitchen': Coffee,
      'Lighting': Lightbulb,
      'Energy': Zap,
      'Furniture': Layers3,
      'Clocks': Clock
    };
    
    return iconMap[category] || Lightbulb;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '3D Printing': 'from-blue-500 to-cyan-500',
      'Electronics': 'from-green-500 to-emerald-500',
      'Woodworking': 'from-amber-500 to-orange-500',
      'Robotics': 'from-purple-500 to-violet-500',
      'IoT': 'from-indigo-500 to-blue-500',
      'Art & Design': 'from-pink-500 to-rose-500',
      'Automation': 'from-gray-500 to-slate-500',
      'Tools': 'from-red-500 to-pink-500',
      'Home': 'from-teal-500 to-cyan-500',
      'Automotive': 'from-slate-500 to-gray-500',
      'Gaming': 'from-violet-500 to-purple-500',
      'Music': 'from-yellow-500 to-amber-500',
      'Photography': 'from-emerald-500 to-teal-500',
      'Wearables': 'from-rose-500 to-pink-500',
      'Sustainability': 'from-green-600 to-emerald-600',
      'Kitchen': 'from-orange-500 to-red-500',
      'Lighting': 'from-yellow-400 to-orange-400',
      'Energy': 'from-blue-600 to-indigo-600',
      'Furniture': 'from-amber-600 to-yellow-600',
      'Clocks': 'from-indigo-400 to-blue-400'
    };
    
    return colorMap[category] || 'from-gray-500 to-slate-500';
  };

  const getCategoryDescription = (category: string) => {
    const descriptionMap: { [key: string]: string } = {
      '3D Printing': 'Innovative designs and functional prints',
      'Electronics': 'Circuits, sensors, and electronic projects',
      'Woodworking': 'Traditional and modern wood crafting',
      'Robotics': 'Autonomous systems and robotic builds',
      'IoT': 'Connected devices and smart solutions',
      'Art & Design': 'Creative and artistic maker projects',
      'Automation': 'Streamlined processes and workflows',
      'Tools': 'Custom tools and workshop improvements',
      'Home': 'Smart home and household solutions',
      'Automotive': 'Vehicle mods and automotive tech',
      'Gaming': 'Gaming accessories and custom builds',
      'Music': 'Musical instruments and audio gear',
      'Photography': 'Camera gear and photo accessories',
      'Wearables': 'Wearable tech and fashion tech',
      'Sustainability': 'Eco-friendly and green projects',
      'Kitchen': 'Culinary tools and kitchen gadgets',
      'Lighting': 'Creative lighting and illumination',
      'Energy': 'Power generation and energy systems',
      'Furniture': 'Custom furniture and storage',
      'Clocks': 'Timepieces and chronometer builds'
    };
    
    return descriptionMap[category] || 'Explore amazing maker projects';
  };

  const getProjectCount = (category: string) => {
    // Mock project counts - in real app, this would come from props or API
    const countMap: { [key: string]: number } = {
      '3D Printing': 245,
      'Electronics': 189,
      'Woodworking': 156,
      'Robotics': 78,
      'IoT': 134,
      'Art & Design': 203,
      'Automation': 67,
      'Tools': 89,
      'Home': 112,
      'Automotive': 45,
      'Gaming': 98,
      'Music': 67,
      'Photography': 54,
      'Wearables': 76,
      'Sustainability': 43,
      'Kitchen': 32,
      'Lighting': 87,
      'Energy': 29,
      'Furniture': 56,
      'Clocks': 21
    };
    
    return countMap[category] || Math.floor(Math.random() * 100) + 10;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Explore by Category</h2>
        <Badge variant="outline" className="text-sm">
          {categories.length} Categories
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* All Projects Card */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
            selectedCategory === '' 
              ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
              : ''
          }`}
          onClick={() => onCategorySelect('')}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg`}>
                <Layers3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">All Projects</h3>
                <p className="text-xs text-gray-600 mt-1">Browse everything</p>
              </div>
              <div className="pt-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.reduce((sum, cat) => sum + getProjectCount(cat), 0)} projects
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Cards */}
        {categories.map(category => {
          const Icon = getCategoryIcon(category);
          const projectCount = getProjectCount(category);
          const isSelected = selectedCategory === category;
          
          return (
            <Card 
              key={category}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : ''
              }`}
              onClick={() => onCategorySelect(isSelected ? '' : category)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${getCategoryColor(category)} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {category}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {getCategoryDescription(category)}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Badge 
                      variant={isSelected ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {projectCount} projects
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryColor(selectedCategory)} flex items-center justify-center`}>
                {React.createElement(getCategoryIcon(selectedCategory), { className: "h-4 w-4 text-white" })}
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{selectedCategory} Projects</h3>
                <p className="text-sm text-blue-700">{getCategoryDescription(selectedCategory)}</p>
              </div>
            </div>
            <Badge className="bg-blue-600">
              {getProjectCount(selectedCategory)} projects
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCategoryExplorer;
