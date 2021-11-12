import KonaneGame from "../konane/KonaneGame";
import { Action, Player } from "../konane/KonaneUtils";
import { GameWorkerAction } from "./gameWorkerUtils";
const ctx: Worker = self as unknown as Worker;

self.addEventListener("message", handleMessage);

let game: KonaneGame | null = null;

async function handleMessage(e: MessageEvent<GameWorkerAction>) {
  const gameWorkerAction = e.data;
  switch (gameWorkerAction.type) {
    case "START":
      const { human, difficulty } = gameWorkerAction.data;
      await start(human, difficulty);
      ctx.postMessage("started game");
      return;
    case "FETCH_BOARD":
      const board = await fetchBoard();
      ctx.postMessage({
        type: "FETCH_BOARD_RESPONSE",
        data: { board },
      });
      return;
    case "FETCH_PLAYER_TO_PLAY":
      const playerToPlay = await fetchPlayerToPlay();
      ctx.postMessage({
        type: "FETCH_PLAYER_TO_PLAY_RESPONSE",
        data: { playerToPlay },
      });
      return;
    case "FETCH_LEGAL_HUMAN_ACTIONS":
      const legalHumanActions = await fetchLegalHumanActions();
      ctx.postMessage({
        type: "FETCH_LEGAL_HUMAN_ACTIONS_RESPONSE",
        data: {
          legalHumanActions,
        },
      });
      return;
    case "FETCH_BEST_COMPUTER_ACTION":
      const bestComputerAction = await fetchBestComputerAction();
      ctx.postMessage({
        type: "FETCH_BEST_COMPUTER_ACTION_RESPONSE",
        data: {
          bestComputerAction,
        },
      });
      return;
    case "FETCH_GAME_TURN":
      const turn = await fetchGameTurn();
      ctx.postMessage({
        type: "FETCH_GAME_TURN_RESPONSE",
        data: {
          turn,
        },
      });
      return;
    case "APPLY_ACTION":
      const { action } = gameWorkerAction.data;
      applyAction(action);
      const p = await fetchPlayerToPlay();
      ctx.postMessage({
        type: "FETCH_PLAYER_TO_PLAY_RESPONSE",
        data: { playerToPlay: p },
      });
      return;
    default:
      return;
  }
}

async function start(human: Player, computerDifficulty: number) {
  game = new KonaneGame(human, computerDifficulty);
}

async function fetchBoard() {
  if (!game) return null;
  return game.board;
}

async function fetchPlayerToPlay() {
  if (!game) return null;
  return game.playerToPlay;
}

async function fetchLegalHumanActions() {
  if (!game) return null;
  return game.getLegalHumanActions();
}

async function fetchBestComputerAction() {
  if (!game) return null;
  return game.getBestComputerAction();
}

async function fetchGameTurn() {
  if (!game) return null;
  return game.turn;
}

async function applyAction(action: Action) {
  if (!game) return;
  game.applyAction(action);
}

// https://github.com/studio-lagier/next-wasm-workers
