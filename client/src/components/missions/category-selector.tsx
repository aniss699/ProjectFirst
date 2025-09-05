import { CATEGORIES as categories, connectionCategories, type Category } from '@/lib/categories';
import * as LucideIcons from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  serviceType?: 'reverse-bidding' | 'direct-connection';
}

export function CategorySelector({ selectedCategory, onCategorySelect, serviceType = 'reverse-bidding' }: CategorySelectorProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    ];
    return IconComponent || LucideIcons.Briefcase;
  };

  const categoriesToShow = serviceType === 'direct-connection' ? connectionCategories : categories;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {categoriesToShow.map((category: Category) => {
        const IconComponent = getIcon(category.icon);
        const isSelected = selectedCategory === category.id;
        
        return (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all text-center hover:scale-105 transform duration-200 ${
              isSelected 
                ? 'border-primary bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-primary hover:shadow-md'
            }`}
          >
            <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${category.color}`} />
            <span className="block text-xs sm:text-sm font-medium leading-tight">{category.name}</span>
            {category.description && (
              <span className="block text-xs text-gray-500 mt-1 hidden sm:block">{category.description}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
