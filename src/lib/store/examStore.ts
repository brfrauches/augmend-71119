import { create } from "zustand";
import { Marker } from "../types";

interface ExamStore {
  file: File | null;
  markers: Marker[];
  examDate: string | null;

  setFile: (file: File | null) => void;
  setMarkers: (m: Marker[]) => void;
  setExamDate: (d: string | null) => void;

  reset: () => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  file: null,
  markers: [],
  examDate: null,

  setFile: (file) => set({ file }),
  setMarkers: (markers) => set({ markers }),
  setExamDate: (examDate) => set({ examDate }),

  reset: () => set({ file: null, markers: [], examDate: null }),
}));
