import React from 'react';
import {
  Utensils,
  Hotel,
  Car,
  Coffee,
  Ticket,
  ShoppingBag,
  Sparkles,
  MoreHorizontal,
  Users,
  Gift,
  Landmark,
  RotateCcw,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { CATEGORIES } from '../types';

interface CategoryIconProps {
  category: string;
  type?: 'EXPENSE' | 'INCOME';
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type = 'EXPENSE',
  className = 'h-5 w-5',
  size = 20,
}) => {
  const allCategories = [...CATEGORIES.EXPENSE, ...CATEGORIES.INCOME];
  const found = allCategories.find((c) => c.name === category || c.id === category);

  const iconName = found ? found.icon : 'Tag';

  switch (iconName) {
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'Hotel':
      return <Hotel size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'Coffee':
      return <Coffee size={size} className={className} />;
    case 'Ticket':
      return <Ticket size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Users':
      return <Users size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'Landmark':
      return <Landmark size={size} className={className} />;
    case 'RotateCcw':
      return <RotateCcw size={size} className={className} />;
    case 'PlusCircle':
      return <PlusCircle size={size} className={className} />;
    case 'MoreHorizontal':
      return <MoreHorizontal size={size} className={className} />;
    default:
      return <Tag size={size} className={className} />;
  }
};
