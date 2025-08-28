"use client";

import React, { useState } from 'react';
import { useUserInfo } from '../../hooks/useUserInfo';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import { maskPhone } from '@/app/utils/maskPhoneFormatter';
import Alert from '@/app/components/Alert';

const PerfilPage = () => {
  const { userInfo, loading, error, refreshUserInfo } = useUserInfo();
  const logout = useAuthStore((state) => state.logout);
  const [form, setForm] = useState({
    nome: userInfo?.nome || '',
    email: userInfo?.email || '',
    senhaAtual: '',
    senha: '',
    telefone: userInfo?.telefone || '',
    dataNascimento: userInfo?.dataNascimento ? userInfo.dataNascimento.slice(0,10) : '',
    endereco: userInfo?.endereco || '',
    avatarUrl: userInfo?.avatarUrl || '',
    preferencias: userInfo?.preferencias || { notificacoes: true, idioma: 'pt-BR', tema: 'claro' },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [alert, setAlert] = useState<null | { type: "success" | "error" | "warning" | "info", title: string, message: string }>(null);

  // Atualiza o form quando userInfo mudar
  React.useEffect(() => {
    if (userInfo) {
      setForm({
        nome: userInfo.nome || '',
        email: userInfo.email || '',
        senhaAtual: '',
        senha: '',
        telefone: userInfo.telefone || '',
        dataNascimento: userInfo.dataNascimento ? userInfo.dataNascimento.slice(0,10) : '',
        endereco: userInfo.endereco || '',
        avatarUrl: userInfo.avatarUrl || '',
        preferencias: userInfo.preferencias || { notificacoes: true, idioma: 'pt-BR', tema: 'claro' },
      });
    }
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('preferencias.')) {
      const prefKey = name.replace('preferencias.', '');
      setForm((prev) => ({
        ...prev,
        preferencias: {
          ...prev.preferencias,
          [prefKey]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload: Partial<typeof form> = { ...form };
      if (!form.senha) {
        delete payload.senha;
        delete payload.senhaAtual;
      }
      await api.put('/users/me', payload);
      setAlert({
        type: 'success',
        title: 'Perfil atualizado!',
        message: 'Suas informações foram salvas com sucesso.'
      });
      refreshUserInfo();
      setForm((prev) => ({ ...prev, senha: '', senhaAtual: '' }));
    } catch (err: any) {
      setAlert({
        type: 'error',
        title: 'Erro ao atualizar perfil',
        message: err?.response?.data?.message || 'Erro ao atualizar perfil'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      setAlert({
        type: 'success',
        title: 'Avatar atualizado!',
        message: 'Sua foto de perfil foi atualizada com sucesso.'
      });
      refreshUserInfo();
    } catch (err: any) {
      setAlert({
        type: 'error',
        title: 'Erro ao enviar avatar',
        message: 'Não foi possível atualizar sua foto de perfil.'
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-lg text-gray-500">Carregando...</div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-lg text-red-500">{error}</div>;
  if (!userInfo) return null;

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full py-8">
        <div className="w-full max-w-7xl bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Meu Perfil</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-6">
              <div className="relative flex flex-col items-center">
                <img
                  src={avatarPreview || form.avatarUrl || '/avatar-placeholder.png'}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-blue-200 shadow mb-2 object-cover bg-white"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm shadow transition mt-2">
                  Trocar foto
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Nome</label>
              <input name="nome" value={form.nome} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Senha atual</label>
              <input name="senhaAtual" value={form.senhaAtual} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" type="password" autoComplete="current-password" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Nova Senha</label>
              <input name="senha" value={form.senha} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" type="password" autoComplete="new-password" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={e => setForm(prev => ({
                  ...prev,
                  telefone: maskPhone(e.target.value)
                }))}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                type="text"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Data de Nascimento</label>
              <input name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="preferencias.notificacoes" checked={!!form.preferencias.notificacoes} onChange={handleChange} />
              <label className="font-medium text-gray-700">Receber notificações</label>
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 mt-4">
              <button type="submit" className="ml-2 bg-primary text-white text-sm px-6 py-3 rounded hover:opacity-90 cursor-pointer" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              {msg && <div className="text-center text-sm text-blue-600">{msg}</div>}
            </div>
          </form>
          <div className="flex justify-center mt-10">
            <button onClick={logout} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-semibold shadow">
              <LogOut size={20} /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerfilPage;
