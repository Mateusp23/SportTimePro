"use client";
import { useState, useEffect } from "react";
import { useSearchAcademias } from "@/app/hooks/useSearchAcademias";
import { useSolicitacaoVinculo } from "@/app/hooks/useSolicitacaoVinculo";
import { Search, Building, User, Send, X } from "lucide-react";

interface SearchAcademiaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchAcademiaModal({ isOpen, onClose }: SearchAcademiaModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [showSolicitacaoForm, setShowSolicitacaoForm] = useState(false);

  const { academias, loading, error, searchAcademias } = useSearchAcademias();
  const { criarSolicitacao, loading: loadingSolicitacao } = useSolicitacaoVinculo();

  useEffect(() => {
    if (isOpen) {
      searchAcademias();
    }
  }, [isOpen, searchAcademias]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchAcademias(searchQuery);
  };

  const handleProfessorSelect = (professor: any) => {
    setSelectedProfessor(professor);
    setShowSolicitacaoForm(true);
  };

  const handleSubmitSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfessor) return;

    try {
      await criarSolicitacao({
        professorId: selectedProfessor.id,
        mensagem: mensagem.trim() || undefined
      });

      alert("Solicitação enviada com sucesso! Aguarde a resposta do professor.");
      onClose();
      resetForm();
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  const resetForm = () => {
    setSelectedProfessor(null);
    setMensagem("");
    setShowSolicitacaoForm(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {showSolicitacaoForm ? "Solicitar Vínculo" : "Pesquisar Academia"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showSolicitacaoForm ? (
            <>
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Digite o nome da academia..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Pesquisar
                  </button>
                </div>
              </form>

              {/* Results */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Buscando academias...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : academias.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Nenhuma academia encontrada.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {academias.map((academia) => (
                    <div key={academia.academiaId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {academia.academiaNome}
                        </h3>
                      </div>
                      
                      <div className="ml-8">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Professores disponíveis:</h4>
                        <div className="space-y-2">
                          {academia.professores.map((professor) => (
                            <div
                              key={professor.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                              onClick={() => handleProfessorSelect(professor)}
                            >
                              <div className="flex items-center gap-3">
                                <User className="text-green-600" size={16} />
                                <div>
                                  <p className="font-medium text-gray-800">{professor.nome}</p>
                                  <p className="text-sm text-gray-600">{professor.email}</p>
                                </div>
                              </div>
                              <Send className="text-blue-600" size={16} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Solicitação Form */
            <div className="max-w-md mx-auto">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Professor selecionado:</h3>
                <div className="flex items-center gap-3">
                  <User className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium">{selectedProfessor?.nome}</p>
                    <p className="text-sm text-blue-600">{selectedProfessor?.email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitSolicitacao} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite uma mensagem para o professor..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSolicitacaoForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingSolicitacao}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loadingSolicitacao ? "Enviando..." : "Enviar Solicitação"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
