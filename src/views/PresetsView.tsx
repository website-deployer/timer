import React, { useState, useEffect } from 'react';
import { Play, Coffee, TreePine, Zap, Plus, Brain, Flame, Moon, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vibrate, cn } from '../lib/utils';

interface PresetsViewProps {
  onSelectPreset: (minutes: number, name?: string) => void;
}

export interface Preset {
  id: string;
  name: string;
  minutes: number;
  description: string;
  icon: string;
  color: string;
}

const DEFAULT_PRESETS: Preset[] = [
  { id: 'default-0', name: '25m Focus', minutes: 25, description: 'Optimized for high-concentration tasks and creative flow states.', icon: 'Brain', color: 'primary' },
  { id: 'default-1', name: '5m Break', minutes: 5, description: 'Quick recharge.', icon: 'Coffee', color: 'secondary' },
  { id: 'default-2', name: '15m Long Break', minutes: 15, description: 'Full detachment.', icon: 'TreePine', color: 'tertiary' },
  { id: 'default-3', name: '10m Sprint', minutes: 10, description: 'High-intensity burst.', icon: 'Zap', color: 'primary' }
];

const IconMap: Record<string, React.ElementType> = {
  Coffee, TreePine, Zap, Brain, Flame, Moon
};

const getColorClasses = (color: string) => {
  switch(color) {
    case 'blue': return { bg: 'bg-blue-500/10', text: 'text-blue-500', hover: 'hover:text-blue-500', gradient: 'from-blue-500', border: 'border-blue-500/50', solid: 'bg-blue-500' };
    case 'green': return { bg: 'bg-green-500/10', text: 'text-green-500', hover: 'hover:text-green-500', gradient: 'from-green-500', border: 'border-green-500/50', solid: 'bg-green-500' };
    case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-500', hover: 'hover:text-purple-500', gradient: 'from-purple-500', border: 'border-purple-500/50', solid: 'bg-purple-500' };
    case 'orange': return { bg: 'bg-orange-500/10', text: 'text-orange-500', hover: 'hover:text-orange-500', gradient: 'from-orange-500', border: 'border-orange-500/50', solid: 'bg-orange-500' };
    case 'rose': return { bg: 'bg-rose-500/10', text: 'text-rose-500', hover: 'hover:text-rose-500', gradient: 'from-rose-500', border: 'border-rose-500/50', solid: 'bg-rose-500' };
    case 'secondary': return { bg: 'bg-secondary/10', text: 'text-secondary', hover: 'hover:text-secondary', gradient: 'from-secondary', border: 'border-secondary/50', solid: 'bg-secondary' };
    case 'tertiary': return { bg: 'bg-tertiary/10', text: 'text-tertiary', hover: 'hover:text-tertiary', gradient: 'from-tertiary', border: 'border-tertiary/50', solid: 'bg-tertiary' };
    case 'primary': default: return { bg: 'bg-primary/10', text: 'text-primary', hover: 'hover:text-primary', gradient: 'from-primary', border: 'border-primary/50', solid: 'bg-primary' };
  }
};

export default function PresetsView({ onSelectPreset }: PresetsViewProps) {
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newMinutes, setNewMinutes] = useState(20);
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Brain');
  const [newColor, setNewColor] = useState('primary');

  useEffect(() => {
    const saved = localStorage.getItem('obsidian_custom_presets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const savePresets = (presets: Preset[]) => {
    setCustomPresets(presets);
    localStorage.setItem('obsidian_custom_presets', JSON.stringify(presets));
  };

  const handleAddPreset = () => {
    if (!newName) return;
    const newPreset: Preset = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName,
      minutes: newMinutes,
      description: newDesc,
      icon: newIcon,
      color: newColor
    };
    savePresets([...customPresets, newPreset]);
    setShowAddModal(false);
    setNewName('');
    setNewMinutes(20);
    setNewDesc('');
  };

  const handleDelete = (id: string) => {
    vibrate(20);
    savePresets(customPresets.filter(p => p.id !== id));
  };

  const handleSelect = (minutes: number, name?: string) => {
    vibrate(40);
    onSelectPreset(minutes, name);
  };
  return (
    <div className="flex-1 px-6 pt-4 w-full max-w-5xl mx-auto md:pb-8">
      {/* Header Section */}
      <div className="mb-12 mt-8 md:mt-0">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-2 text-on-surface">Presets</h1>
        <p className="text-on-surface-variant text-sm font-label tracking-wider uppercase">Your curated flow sessions</p>
      </div>

      {/* Bento Grid Presets */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {/* Dynamic Presets */}
        {[...DEFAULT_PRESETS, ...customPresets].map((preset) => {
          const Icon = IconMap[preset.icon] || Brain;
          const colors = getColorClasses(preset.color);
          return (
            <motion.div 
              key={preset.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
              className="group relative overflow-hidden rounded-xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-highest border border-white/5"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg, colors.text)}>
                    <Icon size={20} />
                  </div>
                  <div className="flex gap-2">
                    {customPresets.some(p => p.id === preset.id) && (
                      <button 
                        onClick={() => handleDelete(preset.id)}
                        className="w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-full text-on-surface-variant transition-colors hover:text-error active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleSelect(preset.minutes, preset.name)}
                      className={cn("w-10 h-10 flex items-center justify-center bg-surface-container-highest rounded-full text-on-surface transition-colors active:scale-90", colors.hover)}
                    >
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-1 text-on-surface">{preset.name}</h3>
                <p className="text-on-surface-variant text-sm">{preset.description}</p>
              </div>
              <div className={cn("absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-30", colors.gradient)}></div>
            </motion.div>
          );
        })}

        {/* Custom New Preset Button (Bento Style) */}
        <motion.button 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
          }}
          onClick={() => { vibrate(20); setShowAddModal(true); }} 
          className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-primary group-hover:bg-primary/10 transition-colors">
            <Plus size={24} className="text-on-surface-variant group-hover:text-primary" />
          </div>
          <span className="font-headline text-lg font-medium text-on-surface-variant group-hover:text-on-surface">New Preset</span>
        </motion.button>
      </motion.div>

      {/* Add Preset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-low border border-white/10 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Create Preset</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Reading Time"
                    className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Duration ({newMinutes}m)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="120" 
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Uninterrupted reading."
                    className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Icon</label>
                  <div className="flex gap-2">
                    {Object.keys(IconMap).map(iconName => {
                      const IconCmp = IconMap[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setNewIcon(iconName)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            newIcon === iconName ? "bg-primary/20 text-primary border border-primary/50" : "bg-surface-container-highest text-on-surface-variant border border-transparent hover:text-on-surface"
                          )}
                        >
                          <IconCmp size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['primary', 'blue', 'green', 'purple', 'orange', 'rose'].map(color => {
                      const colorClasses = getColorClasses(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setNewColor(color)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            newColor === color ? `bg-${color}/20 border ${colorClasses.border}` : "bg-surface-container-highest border border-transparent"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded-full", colorClasses.solid)}></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddPreset}
                disabled={!newName}
                className="w-full py-3 rounded-xl bg-primary text-on-primary-container font-bold font-label uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
