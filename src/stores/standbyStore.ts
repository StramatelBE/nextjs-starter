import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StandbyState {
    standby: boolean;
    standbyStartTime: string | null;
    standbyEndTime: string | null;
    isStandby: boolean;
    setStandby: (standby: boolean) => void;
    setStandbyTimes: (startTime: string, endTime: string) => void;
    setIsStandby: (isStandby: boolean) => void;
    clearStandby: () => void;
}

const useStandbyStore = create<StandbyState>()(
    persist(
        (set) => ({
            standby: false,
            standbyStartTime: null,
            standbyEndTime: null,
            isStandby: false,
            setStandby: (standby) => set({ standby }),
            setStandbyTimes: (startTime, endTime) =>
                set({ standbyStartTime: startTime, standbyEndTime: endTime }),
            setIsStandby: (isStandby) => set({ isStandby }),
            clearStandby: () =>
                set({
                    standby: false,
                    standbyStartTime: null,
                    standbyEndTime: null,
                    isStandby: false,
                }),
        }),
        {
            name: "standby-storage",
        }
    )
);

export default useStandbyStore;