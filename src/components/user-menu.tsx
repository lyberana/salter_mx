"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as any)?.role ?? "";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-[#4A5568] hover:text-[#0F1F3D] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#0F1F3D] text-white flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-[#0F1F3D] leading-tight">{userName}</div>
          <div className="text-xs text-[#8A96A8]">{userRole}</div>
        </div>
        <svg className="w-4 h-4 text-[#8A96A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed w-56 bg-white rounded-lg border border-[#DDE3EC] shadow-lg z-50 py-1"
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="px-4 py-3 border-b border-[#EEF1F6]">
              <div className="text-sm font-medium text-[#0F1F3D]">{userName}</div>
              <div className="text-xs text-[#8A96A8]">{userEmail}</div>
              <div className="mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                  {userRole}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </>
  );
}
