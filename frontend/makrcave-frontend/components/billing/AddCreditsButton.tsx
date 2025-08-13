import React from 'react';
import { Button } from '../ui/button';
import { Plus, Zap } from 'lucide-react';

interface AddCreditsButtonProps {
  onAddCredits: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const AddCreditsButton: React.FC<AddCreditsButtonProps> = ({ 
  onAddCredits, 
  variant = 'default',
  size = 'default'
}) => {
  return (
    <Button 
      onClick={onAddCredits}
      variant={variant}
      size={size}
    >
      <Zap className="h-4 w-4 mr-2" />
      Add Credits
    </Button>
  );
};

export default AddCreditsButton;
