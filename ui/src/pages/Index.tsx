import { useState } from 'react';
import { Header } from '@/components/Header';
import { SoilMoistureCard } from '@/components/SoilMoistureCard';
import { RecordMoistureDialog } from '@/components/RecordMoistureDialog';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Database, Shield, Zap, TrendingUp, Cpu, Server, Globe, TreePine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroBg from '@/assets/hero-bg.jpg';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const Index = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Header />
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
              </div>
              
              <div className="relative container mx-auto px-4 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
                      Secure <span className="text-primary">Agricultural</span> Data
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                      Revolutionizing farm privacy with Fully Homomorphic Encryption. 
                      Your soil moisture data remains your secret, even while being processed.
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-6 mt-16">
                    {[
                      { icon: Lock, title: "Encrypted Storage", desc: "All data is FHE-encrypted at the source.", color: "text-primary", bg: "bg-primary/10" },
                      { icon: Database, title: "Blockchain Secured", desc: "Decentralized access control and immutability.", color: "text-secondary", bg: "bg-secondary/10" },
                      { icon: Shield, title: "Privacy First", desc: "No third party can see your raw sensor data.", color: "text-accent", bg: "bg-accent/10" }
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      >
                        <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-sm hover:translate-y-[-5px] transition-transform duration-300">
                          <CardContent className="pt-8 text-center space-y-4">
                            <div className={`h-16 w-16 mx-auto rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                              <feature.icon className={`h-8 w-8 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {feature.desc}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Static Sections */}
            <div className="bg-secondary/5 py-24">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold">Why SecureCrop?</h3>
                    <p className="text-lg text-muted-foreground">
                      Modern agriculture relies on data, but data exposure can lead to competitive disadvantages or security risks. 
                      Our platform ensures your farm's vital signs are protected by military-grade encryption.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Zap, label: "Real-time Sync" },
                        { icon: Cpu, label: "FHE Engine" },
                        { icon: Globe, label: "Global Access" },
                        { icon: TreePine, label: "Sustainable" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                          <item.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse" />
                    <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center p-8">
                        <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground/50 font-mono text-sm uppercase tracking-widest">Decorative Data Visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-24">
              <div className="text-center mb-16 space-y-4">
                <h3 className="text-3xl font-bold italic text-muted-foreground/20 select-none">ARCHITECTURE</h3>
                <h2 className="text-4xl font-bold">Encrypted Processing Pipeline</h2>
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: "01", name: "Collection", text: "Sensor data collected from field devices." },
                  { step: "02", name: "Encryption", text: "Data encrypted locally before transmission." },
                  { step: "03", name: "FHE Compute", text: "Operations performed on encrypted values." },
                  { step: "04", name: "Insight", text: "Decrypted insights only accessible by owner." }
                ].map((step, i) => (
                  <div key={i} className="relative group">
                    <div className="text-8xl font-black text-muted-foreground/5 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">
                      {step.step}
                    </div>
                    <div className="relative z-10 pt-4">
                      <h4 className="text-xl font-bold mb-2">{step.name}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-12 space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold tracking-tight"
                >
                  Soil Moisture Tracking
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-muted-foreground mt-2"
                >
                  Record and manage your encrypted soil moisture data securely
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <RecordMoistureDialog contractAddress={CONTRACT_ADDRESS} />
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SoilMoistureCard contractAddress={CONTRACT_ADDRESS} />
              </div>
              
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security Status
                    </CardTitle>
                    <CardDescription>System integrity and encryption status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm font-medium">FHE Layer</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm font-medium">Chain Sync</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 font-bold uppercase tracking-wider">Synced</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm font-medium">Access Log</span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-500 font-bold uppercase tracking-wider">Private</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest font-bold opacity-60">System Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <Server className="h-10 w-10 opacity-20" />
                      <p className="text-sm italic">
                        All moisture readings are processed within the Zama FHEVM, 
                        ensuring that even validators cannot see the actual moisture levels.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Decorative Footer Content for Dashboard */}
            <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-muted-foreground/10 opacity-30 select-none">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-bold">UPTIME: 99.99%</span>
                <div className="h-1 bg-primary/20 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-bold">LATENCY: 142MS</span>
                <div className="h-1 bg-secondary/20 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-bold">NETWORK: ZAMA FHEVM</span>
                <div className="h-1 bg-accent/20 w-full" />
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
