import { useState } from 'react';
import { Header } from '@/components/Header';
import { SoilMoistureCard } from '@/components/SoilMoistureCard';
import { RecordMoistureDialog } from '@/components/RecordMoistureDialog';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Database, Shield } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const Index = () => {
  const { isConnected } = useAccount();

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
                Connect your wallet to access encrypted soil moisture tracking 
                with blockchain-secured privacy. Your data remains private and under your control.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Encrypted Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      All soil moisture data is encrypted using Fully Homomorphic Encryption
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
                      Your farm data remains private and only you can decrypt it
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
            <h2 className="text-3xl font-bold">Soil Moisture Tracking</h2>
            <p className="text-muted-foreground mt-1">
              Record and manage your encrypted soil moisture data securely
            </p>
          </div>
          <RecordMoistureDialog contractAddress={CONTRACT_ADDRESS} />
        </div>

        <SoilMoistureCard contractAddress={CONTRACT_ADDRESS} />
      </main>
    </>
  );
};

export default Index;
