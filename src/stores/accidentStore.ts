// src/stores/accidentStore.ts - Add persistence to the accident store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';  // Import persist
import { Accident } from '@prisma/client';

interface AccidentState {
    accident: Accident | null;
    setAccident: (accident: Accident) => void;
    updateAccident: (updatedAccident: Partial<Accident>) => void;
    resetAccidentOnNewYear: () => void;
}

// Add persist middleware to store accident data between refreshes
const useAccidentStore = create<AccidentState>()(
    persist(
        (set) => ({
            accident: null,
            setAccident: (accident) => set({ accident }),
            updateAccident: (updatedAccident) => {
                set((state) => {
                    if (!state.accident) return state;

                    return {
                        accident: {
                            ...state.accident,
                            ...updatedAccident,
                        },
                    };
                });
            },
            resetAccidentOnNewYear: () => {
                set((state) => {
                    if (!state.accident) return state;

                    return {
                        accident: {
                            ...state.accident,
                            accidents_this_year: 0,
                            days_without_accident: 0,
                        },
                    };
                });
            },
        }),
        {
            name: 'accident-storage', // Storage key
        }
    )
);

export default useAccidentStore;