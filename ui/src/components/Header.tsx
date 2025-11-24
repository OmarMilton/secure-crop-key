import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from '@/assets/logo.png';
import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Secure Crop Key" className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Secure Crop Key</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Encrypted Soil Moisture Tracking
              </p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
