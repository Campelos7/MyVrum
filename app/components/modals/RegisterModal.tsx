"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    country: "+351",
    address: "",
    password: "",
    vendedor: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationLink, setValidationLink] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Em desenvolvimento, mostrar o link de validação
        if (data.tokenValidacao) {
          const link = `/validar-email?token=${data.tokenValidacao}&email=${encodeURIComponent(form.email)}`;
          setValidationLink(link);
        }
      } else {
        setError(data.error || "Erro ao criar conta.");
      }
    } catch (error) {
      console.error("Erro ao registar:", error);
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
        className="bg-white text-black rounded-2xl p-8 w-full max-w-lg shadow-lg relative overflow-y-auto max-h-[90vh] flex flex-col"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Criar Conta</h2>

        {success ? (
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="text-green-500 text-5xl mb-2">✓</div>
            <h3 className="text-xl font-semibold">Conta criada com sucesso!</h3>
            <p className="text-gray-600">
              Por favor, valide o seu email para completar o registo.
            </p>
            {validationLink && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Desenvolvimento:</strong> Clique no link abaixo para validar o email:
                </p>
                <a
                  href={validationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all text-sm"
                >
                  {typeof window !== "undefined" ? window.location.origin : ""}{validationLink}
                </a>
              </div>
            )}
            <button
              onClick={onClose}
              className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition w-full mt-4"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">

          <div className="flex gap-2">
            <input
              name="firstName"
              placeholder="Primeiro Nome"
              className="border p-3 rounded-lg w-1/2"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Último Nome"
              className="border p-3 rounded-lg w-1/2"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            name="username"
            placeholder="Username"
            className="border p-3 rounded-lg"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-3 rounded-lg"
            value={form.email}
            onChange={handleChange}
          />

          <div className="flex gap-2">
            <select
              name="country"
              className="border p-3 rounded-lg w-1/3"
              value={form.country}
              onChange={handleChange}
            >
              <option value="+351">🇵🇹 +351</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+44">🇬🇧 +44</option>
            </select>

            <input
              type="tel"
              name="phone"
              placeholder="Número de Telemóvel"
              className="border p-3 rounded-lg flex-1"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <input
            name="address"
            placeholder="Morada"
            className="border p-3 rounded-lg"
            value={form.address}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border p-3 rounded-lg"
            value={form.password}
            onChange={handleChange}
          />

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "A registar..." : "Registar"}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-black z-10"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}
