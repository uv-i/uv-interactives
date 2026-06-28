import { create } from 'zustand';

export interface ScreenPin {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  label: string;
  icon: string;
  sub: string;
  desc: string;
  tags: string[];
  color: string;
  route: string;
}

interface LandmarkStore {
  pins: ScreenPin[];
  setPins: (p: ScreenPin[]) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

export const useLandmarkStore = create<LandmarkStore>((set) => ({
  pins: [],
  setPins: (pins) => set({ pins }),
  hoveredId: null,
  setHoveredId: (hoveredId) => set({ hoveredId }),
}));
