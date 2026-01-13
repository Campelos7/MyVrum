"use client";
import Image from "next/image";

export default function UserAvatar({ name, image }: { name?: string; image?: string }) {
  if (image)
    return (
      <Image
        src={image}
        alt={name || "Avatar"}
        width={40}
        height={40}
        className="rounded-full border border-gray-500"
      />
    );

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
      {initials}
    </div>
  );
}
