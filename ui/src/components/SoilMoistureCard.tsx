import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, RefreshCw, Loader2 } from 'lucide-react';
import { useSoilMoisture } from '@/hooks/useSoilMoisture';
import { toast } from 'sonner';

interface SoilMoistureCardProps {
  contractAddress: string | undefined;
}

export function SoilMoistureCard({ contractAddress }: SoilMoistureCardProps) {
  const { 
    encryptedMoisture, 
    decryptedMoisture, 
    isLoading, 
    message,
    decryptMoisture,
    loadEncryptedMoisture 
  } = useSoilMoisture(contractAddress);

  const handleDecrypt = async () => {
    try {
      await decryptMoisture();
      toast.success('Moisture decrypted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to decrypt moisture');
    }
  };

  const handleRefresh = async () => {
    try {
      await loadEncryptedMoisture();
      toast.success('Refreshed successfully!');
    } catch (error: any) {
      toast.error('Failed to refresh');
    }
  };

  if (!contractAddress) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">Contract address not configured</p>
        <p className="text-sm text-muted-foreground">
          Please set VITE_CONTRACT_ADDRESS in your .env.local file
        </p>
      </Card>
    );
  }

  if (!encryptedMoisture) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No soil moisture data recorded yet</p>
        <p className="text-sm text-muted-foreground">
          Click "Record Moisture" to start tracking your encrypted soil moisture data
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Encrypted Soil Moisture Data
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Encrypted Handle:</p>
          </div>
          <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
            {encryptedMoisture}
          </div>
        </div>

        {decryptedMoisture !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Decrypted Value:</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md">
              <p className="text-2xl font-bold text-primary">
                {decryptedMoisture.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            onClick={handleDecrypt}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Decrypt Moisture
              </>
            )}
          </Button>
        </div>

        {message && (
          <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

