import React from 'react';
import { Heart, Flower } from 'lucide-react';

const Logo = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex items-center space-x-2 animate-pulse-slow">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-pink rounded-full flex items-center justify-center shadow-lg`}>
          <Flower className="text-white" size={size === 'small' ? 20 : size === 'medium' ? 28 : 36} />
        </div>
        <div className="absolute -top-1 -right-1">
          <Heart className="text-rose-500" size={size === 'small' ? 12 : size === 'medium' ? 16 : 20} fill="currentColor" />
        </div>
      </div>
      <div className={`font-bold ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-2xl' : 'text-3xl'} bg-gradient-pink bg-clip-text text-transparent`}>
        SheCares
      </div>
    </div>
  );
};

export default Logo;
