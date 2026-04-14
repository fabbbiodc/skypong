import { useState } from "react";
import l from "../lib/i18n/localizer";
import { format } from "path";

function clickHandler(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const selectedMode = formData.get("mode");
  // console.log("Selected mode:", selectedMode);
  // Aquí puedes manejar la selección del modo de juego
}

export default function ModalModeSelector({ close, isModalOpen }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    // 1. Activamos la clase de animación de salida
    setIsClosing(true);

    // 2. Esperamos a que termine la animación (0.3s según tu config)
    setTimeout(() => {
      onClose(); // 3. Ahora sí, desmontamos el componente
    }, 300);
  };
  return (
    <aside
      className={`modal-mode-selector-container relative flex flex-col justify-center items-center bg-gray-900 basis-0 p-4 ${isClosing ? "closed" : "opened"}`}
    >
      <form className="modal-mode-selector-form">
        <h2>{l("gameMode.chooseMode")}</h2>
        <div className="mode-options">
          <label>
            <input type="radio" name="mode" value="localMode" defaultChecked />
            {l("gameMode.local.title")}
          </label>
          <label>
            <input type="radio" name="mode" value="aiMode" />
            {l("gameMode.ai.title")}
          </label>
        </div>
        <button type="submit">{l("game.playButton")}</button>
      </form>
      <div className="modal-mode-selector-backdrop">
        <h2 className="play-remote-mode-title">{l("gameMode.cta")}</h2>
        <ul className="sigin-links">
          <li>
            <a href="/signin">{l("signInPage.title")}</a>
          </li>
          <li>
            <a href="/signup">{l("signUpPage.title")}</a>
          </li>
        </ul>
      </div>
      <div
        className="modal-mode-selector-close-button absolute top-10 left-10 bg-gray-800 text-white p-2 aspect-square rounded-[50%]"
        onClick={() => close(true)}
      >
        {" "}
        &#10005;
      </div>
    </aside>
  );
}
