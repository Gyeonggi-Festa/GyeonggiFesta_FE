// src/store/useFestivalStore.ts
import { create } from 'zustand';

interface FestivalData {
  id: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  place: string;
  lot: string;
  lat: string;
  mainImg: string;
  orgLink: string;
  guName: string;
  introduce: string;
  useFee?: string;
  isFree?: string;
  useTarget?: string;
  player?: string;
  orgName?: string;
}

interface FestivalStore {
  eventId: string | null;
  setEventId: (id: string) => void;
  eventData: FestivalData | null;
  setEventData: (data: FestivalData) => void;
  clear: () => void;
}

const useFestivalStore = create<FestivalStore>((set) => ({
  eventId: null,
  setEventId: (id) => set({ eventId: id }),
  eventData: null,
  setEventData: (data) => set({ eventData: data }),
  clear: () => set({ eventId: null, eventData: null }),
}));

export default useFestivalStore;
