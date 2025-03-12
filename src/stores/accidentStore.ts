import { create } from 'zustand';
import { Accident } from '@prisma/client';

interface AccidentState {
    accident: Accident | null;
    setAccident: (accident: Accident) => void;
    updateAccident: (updatedAccident: Partial<Accident>) => void;
    resetAccidentOnNewYear: () => void;
}

const useAccidentStore = create<AccidentState>((set) => ({
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
}));

export default useAccidentStore;