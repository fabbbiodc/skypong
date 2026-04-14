import { useState } from "react";
import l from "../lib/i18n/localizer";
import { format } from "path";

function clickHandler(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const selectedMode = formData.get("mode");
  // console.log("Selected mode:", selectedMode);
  // Here you can handle the game mode selection
}

export default function ModalModeSelector({ close, isModalOpen }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    // 1. Activate exit animation class
    setIsClosing(true);

    // 2. Wait for animation to finish (0.3s according to your config)
    setTimeout(() => {
      onClose(); // 3. Now unmount the component
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
