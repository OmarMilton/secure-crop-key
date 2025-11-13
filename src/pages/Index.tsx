import { useState } from 'react';
import { Header } from '@/components/Header';
import { CropCard, type Crop } from '@/components/CropCard';
import { AddCropDialog } from '@/components/AddCropDialog';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Database, Shield } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const { isConnected } = useAccount();
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: 'Winter Wheat',
      variety: 'Hard Red Winter',
      plantDate: '2024-10-15',
      growthStage: 'Growing',
      expectedHarvest: '2025-06-15',
      location: 'Field A-North',
      area: '120 acres',
      yieldPrediction: '65 bushels per acre',
      pestControl: 'Integrated Pest Management with monthly monitoring',
    },
    {
      id: '2',
      name: 'Corn',
      variety: 'Pioneer P1197',
      plantDate: '2024-05-01',
      growthStage: 'Harvested',
      expectedHarvest: '2024-10-20',
      location: 'Field B-South',
      area: '200 acres',
      yieldPrediction: '180 bushels per acre',
      pestControl: 'Bt technology with organic supplemental treatment',
    },
  ]);

  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCrop = (newCrop: Omit<Crop, 'id'>) => {
    const crop: Crop = {
      ...newCrop,
      id: Date.now().toString(),
    };
    setCrops([...crops, crop]);
  };

  const handleUpdateCrop = (updatedCrop: Crop) => {
    setCrops(crops.map(c => c.id === updatedCrop.id ? updatedCrop : c));
    setEditingCrop(null);
    setIsDialogOpen(false);
  };

  const handleDeleteCrop = (id: string) => {
    setCrops(crops.filter(c => c.id !== id));
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCrop(null);
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-80px)] relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBg})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
          </div>
          
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-5xl font-bold">
                Secure Agricultural Data Management
              </h2>
              <p className="text-xl text-muted-foreground">
                Connect your wallet to access encrypted crop tracking, growth monitoring, 
                and harvest data management with blockchain-secured privacy.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Encrypted Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      All sensitive agricultural data is encrypted and secured
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                      <Database className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold">Blockchain Secured</h3>
                    <p className="text-sm text-muted-foreground">
                      Access control managed through secure wallet authentication
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-semibold">Privacy First</h3>
                    <p className="text-sm text-muted-foreground">
                      Your farm data remains private and under your control
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Your Crops</h2>
            <p className="text-muted-foreground mt-1">
              Manage and track your agricultural operations securely
            </p>
          </div>
          <AddCropDialog 
            onAdd={handleAddCrop}
            editCrop={editingCrop}
            onUpdate={handleUpdateCrop}
            {...(editingCrop && { open: isDialogOpen, onOpenChange: handleDialogClose })}
          />
        </div>

        {crops.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No crops added yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Add New Crop" to start tracking your agricultural data
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onEdit={handleEditCrop}
                onDelete={handleDeleteCrop}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Index;
