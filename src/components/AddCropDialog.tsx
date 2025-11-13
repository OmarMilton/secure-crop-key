import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Crop } from './CropCard';

interface AddCropDialogProps {
  onAdd: (crop: Omit<Crop, 'id'>) => void;
  editCrop?: Crop | null;
  onUpdate?: (crop: Crop) => void;
}

export function AddCropDialog({ onAdd, editCrop, onUpdate }: AddCropDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Crop, 'id'>>({
    name: editCrop?.name || '',
    variety: editCrop?.variety || '',
    plantDate: editCrop?.plantDate || '',
    growthStage: editCrop?.growthStage || 'Seeding',
    expectedHarvest: editCrop?.expectedHarvest || '',
    location: editCrop?.location || '',
    area: editCrop?.area || '',
    yieldPrediction: editCrop?.yieldPrediction || '',
    pestControl: editCrop?.pestControl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCrop && onUpdate) {
      onUpdate({ ...formData, id: editCrop.id });
    } else {
      onAdd(formData);
    }
    setOpen(false);
    setFormData({
      name: '',
      variety: '',
      plantDate: '',
      growthStage: 'Seeding',
      expectedHarvest: '',
      location: '',
      area: '',
      yieldPrediction: '',
      pestControl: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editCrop ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Crop Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plantDate">Plant Date</Label>
              <Input
                id="plantDate"
                type="date"
                value={formData.plantDate}
                onChange={(e) => setFormData({ ...formData, plantDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedHarvest">Expected Harvest</Label>
              <Input
                id="expectedHarvest"
                type="date"
                value={formData.expectedHarvest}
                onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthStage">Growth Stage</Label>
            <Select
              value={formData.growthStage}
              onValueChange={(value: Crop['growthStage']) => 
                setFormData({ ...formData, growthStage: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seeding">Seeding</SelectItem>
                <SelectItem value="Growing">Growing</SelectItem>
                <SelectItem value="Flowering">Flowering</SelectItem>
                <SelectItem value="Harvesting">Harvesting</SelectItem>
                <SelectItem value="Harvested">Harvested</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (acres)</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-3">Encrypted Fields</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="yieldPrediction">Yield Prediction</Label>
                <Input
                  id="yieldPrediction"
                  value={formData.yieldPrediction}
                  onChange={(e) => setFormData({ ...formData, yieldPrediction: e.target.value })}
                  placeholder="e.g., 500 bushels per acre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pestControl">Pest Control Strategy</Label>
                <Input
                  id="pestControl"
                  value={formData.pestControl}
                  onChange={(e) => setFormData({ ...formData, pestControl: e.target.value })}
                  placeholder="e.g., Organic pesticides applied monthly"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary">
              {editCrop ? 'Update Crop' : 'Add Crop'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
