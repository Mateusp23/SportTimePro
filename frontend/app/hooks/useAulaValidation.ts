import { useUnidadesLocais } from "./useUnidadesLocais";

interface ValidationResult {
  isValid: boolean;
  unidades: any[];
  locais: any[];
  isLoading: boolean;
  error: string | null;
}

export const useAulaValidation = (): ValidationResult => {
  const { unidades, locais, isLoading, error } = useUnidadesLocais();
  
  const isValid = unidades.length > 0 && locais.length > 0 && !error;

  return {
    isValid,
    unidades,
    locais,
    isLoading,
    error: error || (unidades.length === 0 || locais.length === 0 
      ? "Você precisa cadastrar ao menos uma unidade e um local antes de criar uma aula."
      : null)
  };
}; 