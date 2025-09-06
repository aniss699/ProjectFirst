
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import type { ServiceMode } from '@/lib/types/services';

interface ServiceModeCardProps {
  mode: ServiceMode;
  className?: string;
}

export function ServiceModeCard({ mode, className = "" }: ServiceModeCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(mode.href);
  };

  return (
    <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {mode.emoji}
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {mode.title}
        </CardTitle>
        <Badge variant="outline" className={`mx-auto ${mode.color} border-current`}>
          Nouveau
        </Badge>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <CardDescription className="text-gray-600 text-sm leading-relaxed">
          {mode.description}
        </CardDescription>
        <Button 
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 group-hover:shadow-md"
        >
          Découvrir
        </Button>
      </CardContent>
    </Card>
  );
}
