import type { GameConfig } from './launch-config';
import { useTranslation } from '../../hooks/use-translation';
/**
 * Configuration payload expected by the Babylon game engine launcher.
 */
export interface EngineLaunchConfig {
  readonly playerName: string;
  readonly playerColor: string;
  readonly gameMode: 'ai-easy' | 'ai-medium' | 'ai-hard' | 'local-2p' | 'online-create' | 'online-join';
  readonly player2Name?: string;
  readonly player2Color?: string;
  readonly roomId?: string;
}

/**
 * Maps the front-end game setup configuration to the game engine launch contract.
 */
export function toEngineLaunchConfig(config: GameConfig): EngineLaunchConfig {
    const { t } = useTranslation();

  if (config.mode === 'AI') {
    return {
      playerName: `${t?.game?.player(1) || 'Player 1'}`,
      playerColor: config.ballColor,
      gameMode: `ai-${config.difficulty.toLowerCase()}` as EngineLaunchConfig['gameMode'],
    };
  }

  if (config.mode === 'LOCAL') {
    return {
      playerName: `${t?.game.player(1) || 'Player 1'}`,
      playerColor: '#00A6ED',
      gameMode: 'local-2p',
      player2Name: `${t?.game.player(2) || 'Player 2'}`,
      player2Color: '#F6511D',
    };
  }

  return {
    playerName:`${t?.game?.player(1) || 'Player 1'}`,
    playerColor: config.ballColor,
    gameMode: config.onlineRole === 'join' ? 'online-join' : 'online-create',
    roomId: config.roomId,
  };
}

/**
 * Encodes an engine launch configuration into base64 for the launcher query param.
 */
export function encodeEngineLaunchConfig(config: EngineLaunchConfig): string {
  return btoa(JSON.stringify(config));
}
