import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface PortfolioItem {
  title: string;
  description: string;
}

interface ProfilePortfolioProps {
  portfolio: PortfolioItem[];
  newPortfolioItem: PortfolioItem;
  isEditing: boolean;
  onNewPortfolioItemChange: (updater: (prev: PortfolioItem) => PortfolioItem) => void;
  onAddPortfolioItem: () => void;
}

export function ProfilePortfolio({
  portfolio,
  newPortfolioItem,
  isEditing,
  onNewPortfolioItemChange,
  onAddPortfolioItem
}: ProfilePortfolioProps) {
  return (
    <Card data-testid="card-portfolio">
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4" data-testid="portfolio-grid">
            {portfolio.map((item, index) => (
              <Card key={index} className="border" data-testid={`portfolio-item-${index}`}>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2" data-testid={`portfolio-title-${index}`}>
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm" data-testid={`portfolio-description-${index}`}>
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {isEditing && (
            <div className="border rounded-lg p-4 bg-gray-50" data-testid="add-portfolio-form">
              <h4 className="font-medium mb-3">Ajouter un projet</h4>
              <div className="space-y-3">
                <Input
                  value={newPortfolioItem.title}
                  onChange={(e) => onNewPortfolioItemChange(prev => ({...prev, title: e.target.value}))}
                  placeholder="Titre du projet"
                  data-testid="input-portfolio-title"
                />
                <Textarea
                  value={newPortfolioItem.description}
                  onChange={(e) => onNewPortfolioItemChange(prev => ({...prev, description: e.target.value}))}
                  placeholder="Description du projet"
                  rows={3}
                  data-testid="textarea-portfolio-description"
                />
                <Button onClick={onAddPortfolioItem} data-testid="button-add-portfolio">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}