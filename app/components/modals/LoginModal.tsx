"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ user: "", password: "" });
  const [error, setError] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const [mostrarReenviar, setMostrarReenviar] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      user: form.user,
      password: form.password,
    });

    if (res?.error) {
      // Mostrar mensagem de erro específica
      if (res.error.includes("Acesso negado") || res.error.includes("bloqueado")) {
        setError(res.error);
        setMostrarReenviar(false);
      } else if (res.error.includes("valide o seu email")) {
        setError(res.error);
        setMostrarReenviar(true);
      } else {
        setError("Credenciais inválidas");
        setMostrarReenviar(false);
      }
      return;
    }

    // Login OK → fechar modal
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white text-black rounded-2xl p-8 w-96 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sessão</h2>

        {/* FORM */}
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Email ou Username"
            value={form.user}
            onChange={(e) =>
              setForm({ ...form, user: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black"
          />

          {error && (
            <div className="text-red-600 text-sm text-center">
              <p>{error}</p>
              {mostrarReenviar && (
                <button
                  type="button"
                  onClick={async () => {
                    setReenviando(true);
                    try {
                      // Tentar extrair email do campo user
                      const email = form.user.includes("@") ? form.user : null;
                      if (!email) {
                        alert("Por favor, insira o seu email para reenviar a validação");
                        setReenviando(false);
                        return;
                      }
                      
                      const res = await fetch("/api/auth/reenviar-validacao", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      
                      const data = await res.json();
                      if (data.success) {
                        if (data.linkValidacao) {
                          alert(`Link de validação gerado! Clique aqui para validar: ${window.location.origin}${data.linkValidacao}`);
                        } else {
                          alert("Email de validação enviado! Verifique a sua caixa de entrada.");
                        }
                        setMostrarReenviar(false);
                      } else {
                        alert(data.error || "Erro ao reenviar validação");
                      }
                    } catch (error) {
                      console.error("Erro:", error);
                      alert("Erro ao reenviar validação");
                    } finally {
                      setReenviando(false);
                    }
                  }}
                  disabled={reenviando}
                  className="mt-2 text-blue-600 hover:underline text-xs disabled:opacity-50"
                >
                  {reenviando ? "A reenviar..." : "Reenviar email de validação"}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}
