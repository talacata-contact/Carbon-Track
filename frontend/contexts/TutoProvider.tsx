import { tutoSteps } from '@/constants/TutoSteps';
import { updateUser } from '@/services/utilisateurService/utilisateur';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface TutoContextType {
  isTutoActive: boolean;
  currentStep: number;
  startTuto: (page: keyof typeof tutoSteps, isGlobal?: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  finishTuto: () => void;
  skipTuto: () => void;
  currentPage: keyof typeof tutoSteps | null;
  isGlobal: boolean;
}

const TutoContext = createContext<TutoContextType | undefined>(undefined);

interface TutoProviderProps {
  children: ReactNode;
}

export const TutoProvider: React.FC<TutoProviderProps> = ({ children }) => {
  const [isTutoActive, setIsTutoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState<keyof typeof tutoSteps | null>(null);
  const [isGlobal, setIsGlobal] = useState(false);

  const startTuto = (page: keyof typeof tutoSteps, global: boolean = false) => {
    setCurrentPage(page);
    setCurrentStep(0);
    setIsTutoActive(true);
    setIsGlobal(global);
  };

  const nextStep = () => {
    if (!currentPage) return;
    const steps = tutoSteps[currentPage];
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTuto();
    }
  };

  const previousStep = () => setCurrentStep((s) => Math.max(0, s - 1));

  const finishTuto = async () => {
    setIsTutoActive(false);
    setCurrentPage(null);

    if (isGlobal) {
      try {
        await updateUser({ is_tuto_done: true });
      } catch (err) {
        console.log('❌ Erreur mise à jour utilisateur :', err);
      }
    }
    setIsGlobal(false);
  };

  const skipTuto = () => finishTuto();

  return (
    <TutoContext.Provider
      value={{
        isTutoActive,
        currentStep,
        startTuto,
        nextStep,
        previousStep,
        finishTuto,
        skipTuto,
        currentPage,
        isGlobal,
      }}
    >
      {children}
    </TutoContext.Provider>
  );
};

export const useTuto = () => {
  const context = useContext(TutoContext);
  if (!context) throw new Error('useTuto must be used within a TutoProvider');
  return context;
};
