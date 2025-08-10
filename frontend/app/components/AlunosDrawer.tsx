"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";

type Props = {
  aulaId: string | null;
  open: boolean;
  onClose: () => void;
};

type Aluno = { id: string; nome: string; email: string };

export default function AlunosDrawer({ aulaId, open, onClose }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !aulaId) return;
    (async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<Aluno[]>(`/aulas/${aulaId}/inscritos`);
        setAlunos(data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [open, aulaId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Alunos inscritos</h3>
          <button
            className="rounded p-2 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="text-gray-500">Carregando…</div>
        ) : alunos.length === 0 ? (
          <div className="text-gray-500">Nenhum aluno inscrito.</div>
        ) : (
          <ul className="divide-y">
            {alunos.map(a => (
              <li key={a.id} className="py-3">
                <div className="font-medium">{a.nome}</div>
                <div className="text-sm text-gray-600">{a.email}</div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
