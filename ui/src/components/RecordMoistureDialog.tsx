import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSoilMoisture } from '@/hooks/useSoilMoisture';
import { toast } from 'sonner';

interface RecordMoistureDialogProps {
  contractAddress: string | undefined;
}

export function RecordMoistureDialog({ contractAddress }: RecordMoistureDialogProps) {
  const [open, setOpen] = useState(false);
  const [moisture, setMoisture] = useState('');
  const { recordMoisture, isLoading, message } = useSoilMoisture(contractAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const moistureValue = parseFloat(moisture);
    
    if (isNaN(moistureValue) || moistureValue < 0 || moistureValue > 100) {
      toast.error('Please enter a valid moisture value between 0 and 100');
      return;
    }

    try {
      await recordMoisture(moistureValue);
      toast.success('Soil moisture recorded successfully!');
      setOpen(false);
      setMoisture('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record soil moisture');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Record Moisture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Soil Moisture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moisture">Soil Moisture (%)</Label>
            <Input
              id="moisture"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={moisture}
              onChange={(e) => setMoisture(e.target.value)}
              placeholder="Enter moisture value (0-100)"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Enter the soil moisture percentage (0-100). This value will be encrypted before storage.
            </p>
          </div>

          {message && (
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {message}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Moisture'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

