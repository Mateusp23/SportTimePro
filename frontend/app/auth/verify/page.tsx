"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/confirm-email?token=${token}`);
        setStatus("success");
        setTimeout(() => router.push("/auth/login"), 3000);
      } catch (err) {
        setStatus("error");
      }
    };

    if (token) verifyEmail();
    else setStatus("error");
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center space-y-4 border border-gray-100">
        {status === "loading" && (
          <div>
            <p className="text-gray-600 text-lg">Verificando e-mail...</p>
            <div className="mt-4 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              E-mail confirmado com sucesso!
            </h1>
            <p className="text-gray-600">
              Você será redirecionado para o login em alguns segundos...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="text-red-500 w-16 h-16 mx-auto" />
            <h1 className="text-2xl text-texts font-heading font-bold text-foreground">
              Token inválido ou expirado
            </h1>
            <p className="text-gray-600">
              O link de confirmação não é válido. Solicite um novo registro ou reenviar e-mail.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-4 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Voltar ao Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
