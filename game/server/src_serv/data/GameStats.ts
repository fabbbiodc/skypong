const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
const STATS_SERVICE_URL =
  process.env.STATS_SERVICE_URL;

import axios from "axios";

interface PlayerResult {
  user_id: string;
  user_score: number;
  user_result: "win" | "loss";
}

interface GameResultPayload {
  game_id: string;
  start_at: string;
  end_at: string;
  players: [PlayerResult, PlayerResult];
}

export class GameStats {
  private player1Id: string;
  private player2Id: string;
  private player1Name: string;
  private player2Name: string;
  private player1Score: number;
  private player2Score: number;
  private startAt: string;
  private endAt: string;
  private gameId: string;

  constructor(
    gameId: string,
    startAt: string,
    endAt: string,
    player1Id: string,
    player1Name: string,
    player2Id: string,
    player2Name: string,
    player1Score: number,
    player2Score: number,
  ) {
    this.gameId = gameId;
    this.startAt = startAt;
    this.endAt = endAt;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.player1Name = player1Name;
    this.player2Name = player2Name;
    this.player1Score = player1Score;
    this.player2Score = player2Score;
  }

  setPlayer1Id(id: string): void {
    this.player1Id = id;
  }

  setPlayer2Id(id: string): void {
    this.player2Id = id;
  }

  setPlayer1Name(name: string): void {
    this.player1Name = name;
  }

  setPlayer2Name(name: string): void {
    this.player2Name = name;
  }

  setScore(player1Score: number, player2Score: number): void {
    this.player1Score = player1Score;
    this.player2Score = player2Score;
  }

  setEndAt(endAt: string) {
    this.endAt = endAt;
  }

  toPayload(): GameResultPayload {
    let p1Result: "win" | "loss" =
      this.player1Score > this.player2Score ? "win" : "loss";
    let p2Result: "win" | "loss" =
      this.player2Score > this.player1Score ? "win" : "loss";

    const payload: GameResultPayload = {
      game_id: this.gameId,
      start_at: this.startAt,
      end_at: this.endAt,
      players: [
        {
          user_id: this.player1Id,
          user_score: this.player1Score,
          user_result: p1Result,
        },
        {
          user_id: this.player2Id,
          user_score: this.player2Score,
          user_result: p2Result,
        },
      ],
    };

    return payload;
  }

  // ILYA

  async send(): Promise<void> {
    const payload = this.toPayload();
    const url = `${STATS_SERVICE_URL}/internal/statistics/gameresult/update`;
    const token = SERVICE_TOKEN;

    try {
      const res = await axios.post(url, payload, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Service-Name": "game-service",
        },
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error("[FAILED] game results -> statistics");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
