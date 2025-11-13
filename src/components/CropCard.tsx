import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantDate: string;
  growthStage: 'Seeding' | 'Growing' | 'Flowering' | 'Harvesting' | 'Harvested';
  expectedHarvest: string;
  location: string;
  area: string;
  yieldPrediction: string;
  pestControl: string;
}

interface CropCardProps {
  crop: Crop;
  onEdit: (crop: Crop) => void;
  onDelete: (id: string) => void;
}

const stageColors = {
  Seeding: 'bg-muted text-muted-foreground',
  Growing: 'bg-primary text-primary-foreground',
  Flowering: 'bg-accent text-accent-foreground',
  Harvesting: 'bg-secondary text-secondary-foreground',
  Harvested: 'bg-border text-foreground',
};

export function CropCard({ crop, onEdit, onDelete }: CropCardProps) {
  const [showEncrypted, setShowEncrypted] = useState(true);

  const encryptedText = (text: string) => {
    if (showEncrypted) {
      return '•'.repeat(Math.min(text.length, 20));
    }
    return text;
  };

  return (
    <Card className="hover:shadow-medium transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{crop.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{crop.variety}</p>
          </div>
          <Badge className={stageColors[crop.growthStage]}>
            {crop.growthStage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Plant Date
            </p>
            <p className="font-medium">{crop.plantDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Harvest</p>
            <p className="font-medium">{crop.expectedHarvest}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">{crop.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Area</p>
            <p className="font-medium">{crop.area}</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Encrypted Data
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEncrypted(!showEncrypted)}
              className="h-6 text-xs"
            >
              {showEncrypted ? 'Show' : 'Hide'}
            </Button>
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Yield Prediction:
              </span>
              <span className="ml-2 font-mono">{encryptedText(crop.yieldPrediction)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pest Control:</span>
              <span className="ml-2 font-mono">{encryptedText(crop.pestControl)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(crop)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(crop.id)}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
