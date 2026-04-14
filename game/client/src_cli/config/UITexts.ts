// Type definitions for flexible i18n strings
export interface HUDTexts {
  player1Default: string;
  player2Default: string;
  scoreDefault: string;
}

export interface PauseTexts {
  title: string;
  resume: string;
  quitToMenu: string;
}

export interface GameOverTexts {
  title: string;
  playAgain: string;
  backToMenu: string;
  winner: string;
  score: string;
}

export interface ControlHintTexts {
  paddleControlSingle: string;
  paddleControlP1: string;
  paddleControlP2: string;
}

export interface LanguageTexts {
  gameOver: GameOverTexts;
  pause: PauseTexts;
  hud: HUDTexts;
  controlHints: ControlHintTexts;
}

export const UITexts: Record<string, LanguageTexts> = {
  en: {
    gameOver: {
      title: "GAME OVER",
      playAgain: "Play Again",
      backToMenu: "Back to Menu",
      winner: "{winnerName} Wins!",
      score: "{player1Name}: {player1Score} - {player2Name}: {player2Score}",
    },
    pause: {
      title: "PAUSED",
      resume: "Resume",
      quitToMenu: "Quit to Menu",
    },
    hud: {
      player1Default: "Player 1",
      player2Default: "Player 2",
      scoreDefault: "0",
    },
    controlHints: {
      paddleControlSingle: "Paddle control keys : A - D",
      paddleControlP1: "Paddle control keys P1: A - D",
      paddleControlP2: "Paddle control keys P2: J - L",
    },
  },
  es: {
    gameOver: {
      title: "FIN DE PARTIDA",
      playAgain: "Jugar de Nuevo",
      backToMenu: "Volver al Menú",
      winner: "¡{winnerName} Gana!",
      score: "{player1Name}: {player1Score} - {player2Name}: {player2Score}",
    },
    pause: {
      title: "PAUSA",
      resume: "Continuar",
      quitToMenu: "Salir al Menú",
    },
    hud: {
      player1Default: "Jugador 1",
      player2Default: "Jugador 2",
      scoreDefault: "0",
    },
    controlHints: {
      paddleControlSingle: "Teclas de control de paleta : A - D",
      paddleControlP1: "Teclas de control de paleta P1: A - D",
      paddleControlP2: "Teclas de control de paleta P2: J - L",
    },
  },
  it: {
    gameOver: {
      title: "PARTITA TERMINATA",
      playAgain: "Gioca Ancora",
      backToMenu: "Torna al Menu",
      winner: "{winnerName} Vince!",
      score: "{player1Name}: {player1Score} - {player2Name}: {player2Score}",
    },
    pause: {
      title: "PAUSA",
      resume: "Continua",
      quitToMenu: "Esci al Menu",
    },
    hud: {
      player1Default: "Giocatore 1",
      player2Default: "Giocatore 2",
      scoreDefault: "0",
    },
    controlHints: {
      paddleControlSingle: "Tasti di controllo racchetta : A - D",
      paddleControlP1: "Tasti di controllo racchetta P1: A - D",
      paddleControlP2: "Tasti di controllo racchetta P2: J - L",
    },
  },
};

export type Language = keyof typeof UITexts;
