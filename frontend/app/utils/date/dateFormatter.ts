export function formatarDataInput(data: string | Date): string {
  const d = new Date(data);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const ano = d.getFullYear();
  const mes = pad(d.getMonth() + 1);
  const dia = pad(d.getDate());
  const horas = pad(d.getHours());
  const minutos = pad(d.getMinutes());

  return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
}
