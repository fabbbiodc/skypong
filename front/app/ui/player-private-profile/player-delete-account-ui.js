import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/use-translation";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";
import { TextField, Button } from "../base";

export default function PlayerDeleteUI() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper para obtener el token
  const getCsrfToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];
  };

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
        logout();
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
        {t?.user?.deleteBtn || "Delete Account"}
      </Button>

      {/* Warning Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t?.user?.deleteAccountTitle || "Are you absolutely sure?"}
            </h2>

            <p className="text-gray-600 mb-4">
              {t?.user?.deleteAccountWarning ||
                "This action cannot be undone. Your stats, friends, and progress will be deleted."}
            </p>

            <p className="text-sm text-gray-500 font-medium mb-2">
              {t?.user?.typeConfirm || "Type"}{" "}
              <span className="font-bold text-red-600 underline">CONFIRM</span>{" "}
              {t?.user?.toContinue || "to continue"}:
            </p>

            <TextField
              type="text"
              placeholder="CONFIRM"
              value={confirmationText}
              onChange={setConfirmationText}
              error={
                confirmationText && confirmationText !== "CONFIRM"
                  ? t?.user?.mustTypeConfirm || "Must type CONFIRM exactly"
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
                {t?.common?.cancel || "Cancel"}
              </Button>

              <Button
                variant="danger"
                size="lg"
                onClick={handleDeleteAccount}
                disabled={confirmationText !== "CONFIRM" || isDeleting}
                className="flex-1"
              >
                {isDeleting
                  ? "..."
                  : t?.user?.confirmDelete || "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
