"use client";

import { useTranslation } from "@/hooks/use-translation";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useTranslation();

  const homePage = t.homePage as unknown as Record<string, unknown> | undefined;
  const aboutModal = homePage?.aboutModal as Record<string, string> | undefined;

  const title = aboutModal?.title ?? "About";
  const description = aboutModal?.description ?? "SkyPong is a 3D Pong game built with Babylon.js. This is a streamlined showcase version featuring local AI and 2-player modes. The full project with online multiplayer, player profiles, and more is available on GitHub.";
  const repoLink = aboutModal?.repoLink ?? "View the full project on GitHub →";
  const repoUrl = "https://github.com/fabbbiodc/skypong/";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-xl bg-slate-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
        <p className="mb-4 text-sm text-slate-300">{description}</p>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-400 underline decoration-slate-500 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
        >
          {repoLink}
        </a>
      </div>
    </div>
  );
}
