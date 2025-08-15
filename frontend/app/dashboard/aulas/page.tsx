"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import NovaAulaModal from "@/app/components/NovaAulaModel";
import { useUser } from "@/app/hooks/useUser";
import EditarAulaModal from "@/app/components/EditarAulaModal";
import { Aula } from "@/app/types/types";
import { confirmAlert } from "@/app/utils/confirmAlert";

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { user, isLoading: isLoadingUser } = useUser();
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);

  const fetchAulas = async () => {
    const res = await api.get("/aulas");
    setAulas(res.data.items);
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirmAlert({
      type: "warning",
      title: "Excluir aula",
      message: "Tem certeza que deseja excluir esta aula? Essa ação não pode ser desfeita.",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
    });

    if (!ok) return;

    await api.delete(`/aulas/${id}`);
    fetchAulas();
  };

  const handleEdit = (id: string) => {
    console.log('🔍 handleEdit - ID recebido:', id);
    const aula = aulas.find((a) => a.id === id);
    if (!aula) {
      console.log('❌ Aula não encontrada para o ID:', id);
      return;
    }

    console.log('🔍 Aula encontrada:', aula);
    setAulaSelecionada(aula);
    setShowEditarModal(true); // chama o modal exclusivo de edição
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };
  
  useEffect(() => {
    console.log('📊 Aulas atualizadas:', aulas);
  }, [aulas]);
  
  useEffect(() => {
    console.log('🔍 Estado do modal de edição:', { showEditarModal, aulaSelecionada });
  }, [showEditarModal, aulaSelecionada]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <button
        className="bg-primary text-white px-4 py-2 rounded mb-4 hover:bg-primary/80 transition-colors cursor-pointer"
        onClick={handleOpenModal}
      >
        + Nova Aula
      </button>

      {showModal && (
        <NovaAulaModal
          onClose={() => setShowModal(false)}
          onCreated={fetchAulas}
        />
      )}

      {showEditarModal && (
        <EditarAulaModal
          show={showEditarModal}
          aula={aulaSelecionada}
          onClose={() => {
            console.log('🔍 onClose chamado - fechando modal');
            console.log('🔍 Estado antes de fechar:', showEditarModal);
            setShowEditarModal(false);
            console.log('🔍 Estado após fechar:', false);
          }}
          onUpdated={() => {
            console.log('🔍 onUpdated chamado - atualizando lista');
            fetchAulas();
          }}
        />
      )}

      <table className="w-full  border">
        <thead>
          <tr className="w-full border bg-gray-50 border-gray-200 rounded-lg">
            <th className="p-3 text-left font-medium text-gray-700 border-b">Modalidade</th>
            <th className="p-3 text-left font-medium text-gray-700 border-b">Data</th>
            <th className="p-3 text-left font-medium text-gray-700 border-b">Vagas</th>
            <th className="p-3 text-left font-medium text-gray-700 border-b">Ações</th>
          </tr>
        </thead>
        <tbody className="border border-gray-200 rounded-lg">
          {aulas.map((aula: Aula) => (
            <tr key={aula.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 border-b">{aula.modalidade}</td>
              <td className="p-3 border-b">{new Date(aula.dataHoraInicio).toLocaleString()}</td>
              <td className="p-3 border-b">{aula.vagasTotais}</td>
              <td className="p-3 border-b">
                <button
                  onClick={() => handleEdit(aula.id)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 cursor-pointer">
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(aula.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
