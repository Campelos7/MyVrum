"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isVendedor, setIsVendedor] = useState(false);
  const [nif, setNif] = useState("");

useEffect(() => {
  if (session?.user) {
    const fullName = session.user.name || "";
    const [first, last] = fullName.split(" ");

    setFirstName(first || "");
    setLastName(last || "");
    setEmail(session.user.email || "");
    setContact(session.user.phone || "");
    setAddress(session.user.address || "");

    // caso o user já seja vendedor
    setIsVendedor((session.user as any).vendedor || false);
    setNif((session.user as any).nif || "");
  }
}, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("email", email); // para identificar o utilizador
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("contact", contact);
      formData.append("address", address);
      formData.append("vendedor", isVendedor.toString());
      formData.append("nif", nif);
      if (avatar) formData.append("image", avatar);

      const res = await fetch("/api/perfil", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        onClose(); 
        await fetch("/api/auth/session?update=true"); // endpoint custom se necessário
  window.location.reload();// 🔹 Recarrega a página para ler os dados atualizados
      } else {
        console.error("Erro ao atualizar perfil:", data.error);
      }
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    }
  };

  const avatarPreview = avatar ? URL.createObjectURL(avatar) : session?.user?.image || null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white text-black rounded-2xl p-8 w-full max-w-3xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-8">Editar perfil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex gap-4">
              <input
                placeholder="Primeiro Nome"
                className="border p-3 rounded-lg w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                placeholder="Apelido"
                className="border p-3 rounded-lg w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Correio Eletrónico</label>
              <input
                value={email}
                disabled
                className="border p-3 rounded-lg w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <input
              placeholder="Contacto"
              className="border p-3 rounded-lg"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <input
              placeholder="Morada"
              className="border p-3 rounded-lg"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {!isVendedor && (
  <button
    type="button"
    onClick={() => setIsVendedor(true)}
    className="text-sm underline text-gray-600 hover:text-black mb-2 w-fit"
  >
    Torne-se Vendedor
  </button>
)}
{isVendedor && (
  <input
    placeholder="NIF"
    className="border p-3 rounded-lg"
    value={nif}
    onChange={(e) => setNif(e.target.value)}
  />
)}
            <button
              type="submit"
              className="bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition mt-3"
            >
              Guardar
            </button>
          </form>

          {/* AVATAR PREVIEW */}
          <div className="relative bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview do avatar" className="object-cover w-full h-full" />
            ) : (
              <p className="text-gray-400">Sem foto</p>
            )}
            <div className="absolute bottom-4 right-4">
              <label className="bg-black text-white rounded-full p-3 cursor-pointer hover:bg-gray-800 transition">
                ✎
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

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
