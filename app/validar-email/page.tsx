"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ValidarEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const validarEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMensagem("Token ou email não fornecidos");
        return;
      }

      try {
        const res = await fetch(`/api/auth/validar-email?token=${token}&email=${email}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMensagem(data.mensagem || "Email validado com sucesso!");
        } else {
          setStatus("error");
          setMensagem(data.error || "Erro ao validar email");
        }
      } catch (error) {
        console.error("Erro ao validar email:", error);
        setStatus("error");
        setMensagem("Erro ao validar email");
      }
    };

    validarEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
      <div className="bg-zinc-800 rounded-xl p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-lg">A validar email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-4">Email Validado!</h2>
            <p className="text-gray-300 mb-6">{mensagem}</p>
            <Link
              href="/"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition inline-block"
            >
              Ir para a página inicial
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold mb-4">Erro na Validação</h2>
            <p className="text-gray-300 mb-6">{mensagem}</p>
            <Link
              href="/"
              className="bg-zinc-600 hover:bg-zinc-500 text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
            >
              Voltar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

