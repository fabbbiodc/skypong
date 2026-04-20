import { useState } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { TextField, Button } from "../base";

const getCsrfToken = (): string | undefined => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

export default function PlayerDeleteUI() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const csrfToken = getCsrfToken();

    try {
      const response = await fetch("/api/auth/deleteme", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        // Redirect to home or goodbye page
        await logout();
        router.push("/");
      } else {
        console.error("Error deleting account");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Network error:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full mt-8">
      {/* Delete Button */}
      <Button
        variant="danger"
        size="lg"
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        {t.user.deleteBtn}
      </Button>

      {/* Warning Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t.user.deleteAccountTitle}
            </h2>

            <p className="text-slate-300 mb-4">
              {t.user.deleteAccountWarning}
            </p>

            <p className="text-sm text-slate-200 font-medium mb-2">
              {t.user.typeConfirm}{" "}
              <span className="font-bold text-red-500 underline">CONFIRM</span>{" "}
              {t.user.toContinue}:
            </p>

            <TextField
              type="text"
              placeholder="CONFIRM"
              value={confirmationText}
              onChange={setConfirmationText}
              error={
                confirmationText && confirmationText !== "CONFIRM"
                  ? t.user.mustTypeConfirm
                  : undefined
              }
            />

            <div className="flex gap-4 mt-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  setIsModalOpen(false);
                  setConfirmationText("");
                }}
                disabled={isDeleting}
                className="flex-1"
              >
                {t.common.cancel}
              </Button>

              <Button
                variant="danger"
                size="lg"
                onClick={handleDeleteAccount}
                disabled={confirmationText !== "CONFIRM" || isDeleting}
                className="flex-1"
              >
                {isDeleting ? "..." : t.user.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
