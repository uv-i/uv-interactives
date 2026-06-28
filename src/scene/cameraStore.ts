import { create } from 'zustand';

/** 'in' = zooming toward world (before page switch), 'idle' = normal */
type ZoomPhase = 'idle' | 'in';

interface CameraStore {
  routeTarget: string | null;
  zoomPhase: ZoomPhase;
  setRouteTarget: (route: string) => void;
  clearRouteTarget: () => void;
  startZoomIn: () => void;
  endZoom: () => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  routeTarget: null,
  zoomPhase: 'idle',
  setRouteTarget: (route) => set({ routeTarget: route }),
  clearRouteTarget: () => set({ routeTarget: null, zoomPhase: 'idle' }),
  startZoomIn: () => set({ zoomPhase: 'in' }),
  endZoom: () => set({ zoomPhase: 'idle' }),
}));
