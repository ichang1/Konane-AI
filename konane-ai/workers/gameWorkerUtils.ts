import { ComputerDifficulty } from "../konane/KonaneGameUtils";
import { Action, Cell, Player } from "../konane/KonaneUtils";

type Start = {
  type: "START";
  data: {
    human: Player;
    difficulty: ComputerDifficulty;
  };
};

type FetchBoard = { type: "FETCH_BOARD" };

type FetchPlayerToPlay = { type: "FETCH_PLAYER_TO_PLAY" };

type FetchLegalHumanActions = { type: "FETCH_LEGAL_HUMAN_ACTIONS" };

type FetchBestComputerAction = { type: "FETCH_BEST_COMPUTER_ACTION" };

type ApplyAction = { type: "APPLY_ACTION"; data: { action: Action } };

type FetchGameTurn = { type: "FETCH_GAME_TURN" };

export type GameWorkerAction =
  | Start
  | FetchBoard
  | FetchPlayerToPlay
  | FetchLegalHumanActions
  | FetchBestComputerAction
  | ApplyAction
  | FetchGameTurn;

type FetchBoardResponse = {
  type: "FETCH_BOARD_RESPONSE";
  data: { board: Cell[][] };
};

type FetchPlayerToPlayResponse = {
  type: "FETCH_PLAYER_TO_PLAY_RESPONSE";
  data: { playerToPlay: Player };
};

type FetchLegalHumanActionsResponse = {
  type: "FETCH_LEGAL_HUMAN_ACTIONS_RESPONSE";
  data: {
    legalHumanActions: Map<[number, number], Action[]> | null;
  };
};

type FetchBestComputerActionResponse = {
  type: "FETCH_BEST_COMPUTER_ACTION_RESPONSE";
  data: { bestComputerAction: Action | null };
};

type FetchGameTurnResponse = {
  type: "FETCH_GAME_TURN_RESPONSE";
  data: { turn: number };
};

export type GameWorkerResponse =
  | FetchBoardResponse
  | FetchPlayerToPlayResponse
  | FetchLegalHumanActionsResponse
  | FetchBestComputerActionResponse
  | FetchGameTurnResponse;
