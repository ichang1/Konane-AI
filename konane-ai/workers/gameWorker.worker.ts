import * as Comlink from "comlink";
import KonaneGame from "../konane/KonaneGame";
import { Action } from "../konane/KonaneUtils";

const init = async (game: KonaneGame) => {
  gameWorker.game = game;
};

const getBestComputerAction = async () => {
  if (!gameWorker.game) return null;
  return gameWorker.game.getBestComputerAction();
};

const getLegalHumanActions = async () => {
  if (!gameWorker.game) return null;
  return gameWorker.game.getLegalHumanActions();
};

const applyAction = async (action: Action) => {
  if (!gameWorker.game) return;
  gameWorker.game.applyAction(action);
};

const test = async () => {
  console.log("Hello");
};

export interface GameWorkerProps {
  game: KonaneGame | null;
  init: (game: KonaneGame) => void;
  getBestComputerAction: () => Promise<Action | null>;
  getLegalHumanActions: () => Promise<Map<[number, number], Action[]> | null>;
  applyAction: (a: Action) => void;
  test: () => void;
}

const gameWorker: GameWorkerProps = {
  game: null,
  init,
  getBestComputerAction,
  getLegalHumanActions,
  applyAction,
  test,
};

Comlink.expose(gameWorker);
