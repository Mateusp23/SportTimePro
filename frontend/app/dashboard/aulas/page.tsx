"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import NovaAulaModal from "@/app/components/NovaAulaModel";


export default function AulasPage() {
  const [aulas, setAulas] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAulas = async () => {
    const res = await api.get("/aulas");
    setAulas(res.data);
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta aula?")) return;
    await api.delete(`/aulas/${id}`);
    fetchAulas();
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-heading font-bold mb-4">Gerenciar Aulas</h2>
      <button
        className="bg-primary text-white px-4 py-2 rounded mb-4"
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



      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Modalidade</th>
            <th className="p-2">Data</th>
            <th className="p-2">Vagas</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map((aula: any) => (
            <tr key={aula.id} className="border-t">
              <td className="p-2">{aula.modalidade}</td>
              <td className="p-2">{new Date(aula.dataHoraInicio).toLocaleString()}</td>
              <td className="p-2">{aula.vagasTotais}</td>
              <td className="p-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
                <button
                  onClick={() => handleDelete(aula.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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
