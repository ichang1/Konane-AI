import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/pages/[difficulty].module.scss";
import {
  Player,
  BLACK,
  WHITE,
  stringIsPlayer,
  cellIsChecker,
  actionIsMoveChecker,
  actionIsRemoveChecker,
  Action,
  verboseCellPosition,
  RemoveChecker,
  MoveChecker,
  Cell,
} from "../konane/KonaneUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../components/Modal/Modal";
import SideBar from "../components/SideBar/SideBar";
import KonaneGame from "../konane/KonaneGame";
import LoadingIndicator from "../components/LoadingIndicator/LoadingIndicator";
import { boardValueDiff, konaneDifficulties } from "../konane/KonaneGameUtils";
import {
  baseUrl,
  capitalizeFirstLetter,
  specialCssClasses,
} from "../utils/misc";
import { GameWorkerResponse } from "../workers/gameWorkerUtils";

const n = 8;
const emptyBoard = [...Array(n)].map((_) => [...Array(n)]);

const ANIMATION_SPEED = 1100;

interface PlayKonaneProps {
  difficulty: string;
}

const PlayKonane: NextPage<PlayKonaneProps> = ({ difficulty }) => {
  const [human, setHuman] = useState<Player | null>(null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [humanWins, setHumanWins] = useState<boolean | null>(null);
  const [computerThinking, setComputerThinking] = useState<boolean>(true);

  // const gameRef = useRef<KonaneGame | null>(null);
  const boardRef = useRef<(HTMLButtonElement | null)[][]>(emptyBoard);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const gameWorkerRef = useRef<Worker | null>();

  const [playerToPlay, setPlayerToPlay] = useState<Player | null>(null);
  const [legalHumanActionsMap, setLegalHumanActionsMap] = useState<Map<
    [number, number],
    Action[]
  > | null>(null);
  const [bestComputerAction, setBestComputerAction] = useState<
    Action | null | undefined
  >(undefined);
  const [board, setBoard] = useState<Cell[][] | null>(null);
  const [turn, setTurn] = useState(0);

  const writeToHistory = (line: string) => {
    const history = historyRef.current;
    if (!history) return;
    history.innerHTML += `${line}\n`;
  };

  /**
   * returns an onclick handler based on an remove action
   */
  const getRemoveCheckerClickHandler = (action: RemoveChecker) => {
    return () => {
      setActiveAction(action);
    };
  };

  /**
   * returns an onclick handler based on an move Action
   * for moving a checker, the onclick will focus on a cell and
   * draw a dashed border on the possible destination cells
   */
  const getMoveCheckerClickHandler = (
    cell: [number, number],
    playerLegalMoves: MoveChecker[]
  ) => {
    const [row, col] = cell;
    const cellElement = boardRef.current[row][col];
    if (!cellElement) return null;
    const handler = () => {
      setActiveCell(cell);
      removeAllCellsSpecialProps();
      const solidBorderCls =
        playerToPlay === BLACK
          ? "cell-border-black-secondary"
          : "cell-border-white-secondary";
      cellElement.classList.add(solidBorderCls);
      playerLegalMoves.forEach((checkerMove) => {
        const {
          to: [toRow, toCol],
        } = checkerMove;
        const moveToCellElement = boardRef.current[toRow][toCol];
        if (!moveToCellElement) return;
        const dashedBorderCls =
          playerToPlay === BLACK
            ? "rotating-cell-border-black-secondary"
            : "rotating-cell-border-white-secondary";
        `  `;
        moveToCellElement.classList.add(dashedBorderCls);
        moveToCellElement.style.cursor = "pointer";
        moveToCellElement.onclick = () => {
          setActiveAction(checkerMove);
        };
      });
    };
    return handler;
  };

  /**
   *
   * @param e mouse event from choosing black or white
   */
  const handleSetPlayerButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const { value } = e.currentTarget;
    if (!value) {
      console.log("Something went wrong");
      return;
    }
    if (!stringIsPlayer(value)) {
      console.log(`${value} is not of player type`);
    } else {
      setHuman(value);
    }
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (!activeCell || elementHasSpecialCssClass(target)) return;
    // there is an active cell and the element is not a cell involved in an action
    escapeActiveCellHandler();
  };

  const elementHasSpecialCssClass = (el: HTMLElement) => {
    const { classList } = el;
    for (let cssCls of specialCssClasses) {
      if (classList.contains(cssCls)) return true;
    }
    return false;
  };

  /**
   *
   * @param cell coordinates of the cell in boardRef
   * @param legalActions list of valid actions from that cell
   * @returns
   */
  const addCellSpecialProps = (
    cell: [number, number],
    legalActions: Action[]
  ) => {
    if (legalActions.length === 0) return;
    const [row, col] = cell;
    const cellElement = boardRef.current[row][col];
    if (!cellElement) return;
    // there is at least one action
    // check if that action is a remove or move
    if (actionIsMoveChecker(legalActions[0])) {
      const dashedBorderCls =
        playerToPlay === BLACK
          ? "rotating-cell-border-black-secondary"
          : "rotating-cell-border-white-secondary";
      cellElement.classList.add(dashedBorderCls);
      cellElement.style.cursor = "pointer";
      cellElement.onclick = getMoveCheckerClickHandler(
        cell,
        legalActions as MoveChecker[]
      );
    } else if (actionIsRemoveChecker(legalActions[0])) {
      const dashedBorderCls =
        playerToPlay === BLACK
          ? "rotating-cell-border-black-primary"
          : "rotating-cell-border-white-primary";
      cellElement.classList.add(dashedBorderCls);
      cellElement.style.cursor = "pointer";
      cellElement.onclick = getRemoveCheckerClickHandler(legalActions[0]);
    }
  };

  /**
   * adds a dashed moving border to the cells of the checkers that can
   * be moved/removed legally
   * adds onclick to remove/move
   * adds valid actions as
   * @returns null
   */
  const addPlayerCellsSpecialProps = () => {
    if (playerToPlay !== human || !legalHumanActionsMap) return;
    // if (!gameRef.current) return;
    // const game = gameRef.current;
    // const playerLegalActionsMap = game.getLegalHumanActions();
    legalHumanActionsMap.forEach((actionsFromCell, cell) => {
      addCellSpecialProps(cell, actionsFromCell);
    });
  };

  /**
   * removes the added dashed border's, onclicks, pointer styles
   * @returns null
   */
  const removeAllCellsSpecialProps = () => {
    // if (!gameRef.current) return;
    // const internalBoard = gameRef.current.board;
    emptyBoard.forEach((row, rowN) => {
      row.forEach((_, colN) => {
        const cellElement = boardRef.current[rowN][colN];
        if (!cellElement) return;
        cellElement.onclick = null;
        cellElement.classList.remove(...specialCssClasses);
        cellElement.style.cursor = "default";
      });
    });
  };

  /**
   * animates action on board
   * @param action action
   * @returns null
   */
  const animateAndResolveAction = (action: Action) => {
    // const game = gameRef.current;
    // if (!game) return;
    removeAllCellsSpecialProps();
    if (actionIsMoveChecker(action)) {
      const { from, to } = action;
      const [fromRow, fromCol] = from;
      const [toRow, toCol] = to;
      const fromCellElement = boardRef.current[fromRow][fromCol];
      const toCellElement = boardRef.current[toRow][toCol];
      if (!fromCellElement || !toCellElement) return;
      const solidBorderCls =
        playerToPlay === BLACK
          ? "cell-border-black-secondary"
          : "cell-border-white-secondary";
      const dashedBorderCls =
        playerToPlay === BLACK
          ? "rotating-cell-border-black-secondary"
          : "rotating-cell-border-white-secondary";
      // sequence of animations/resolvers
      const callbacks: [() => void, (idx: number) => number][] = [
        [
          () => {
            // setComputerThinking(false);
            // record move in history
            const description = `${turn + 1}. ${
              playerToPlay === human ? "Human" : "Computer"
            } (${playerToPlay}) moves (${verboseCellPosition(from).join(
              ", "
            )}) to (${verboseCellPosition(to).join(", ")})`;
            writeToHistory(description);
            // add border to checker that will be moved
            fromCellElement.classList.add(solidBorderCls);
            // add rotating border to destination
            toCellElement.classList.add(dashedBorderCls);
          },
          (idx: number) => idx * ANIMATION_SPEED,
        ],
        [
          () => {
            // remove border from checker that will be moved
            fromCellElement.classList.remove(solidBorderCls);
            // make destination cell solid
            toCellElement.classList.remove(dashedBorderCls);
            // add border to cell that checker will be moved to
            toCellElement.classList.add(solidBorderCls);
          },
          (idx: number) => idx * ANIMATION_SPEED,
        ],
        [
          () => {
            // remove border to cell that checker will be moved to
            toCellElement.classList.remove(solidBorderCls);
            gameWorkerRef.current?.postMessage({
              type: "APPLY_ACTION",
              data: { action },
            });
          },
          (idx: number) => idx * ANIMATION_SPEED,
        ],
      ];
      callbacks.forEach(([cb, delayFn], idx) => {
        setTimeout(cb, delayFn(idx));
      });
    } else if (actionIsRemoveChecker(action)) {
      const { cell } = action;
      const [row, col] = cell;
      const cellElement = boardRef.current[row][col];
      if (!cellElement) return;
      const solidBorderCls =
        playerToPlay === BLACK
          ? "cell-border-black-primary"
          : "cell-border-white-primary";
      // sequence of animations/resolvers
      const callbacks: [() => void, (idx: number) => number][] = [
        [
          () => {
            // record remove in history
            const description = `${turn + 1}. ${
              playerToPlay === human ? "Human" : "Computer"
            } (${playerToPlay}) removes (${verboseCellPosition(cell).join(
              ", "
            )})`;
            writeToHistory(description);
            // add border to checker that will be removed
            cellElement.classList.add(solidBorderCls);
          },
          (idx: number) => idx * ANIMATION_SPEED,
        ],
        [
          () => {
            // remove border from checker that will be removed
            cellElement.classList.remove(solidBorderCls);
            gameWorkerRef.current?.postMessage({
              type: "APPLY_ACTION",
              data: { action },
            });
          },
          (idx: number) => idx * ANIMATION_SPEED,
        ],
      ];
      callbacks.forEach(([cb, delayFn], idx) => {
        setTimeout(cb, delayFn(idx));
      });
    }
  };

  const escapeActiveActionHandler = () => {
    if (!activeAction || !legalHumanActionsMap) return;
    setActiveAction(null);
    if (actionIsMoveChecker(activeAction) && activeCell) {
      const activeCellKeyValueArr = [...legalHumanActionsMap.entries()].find(
        (k, v) => k.toString() === activeCell.toString()
      );
      if (!activeCellKeyValueArr) return;
      const [_, activeCellLegalActions] = activeCellKeyValueArr;
      const thisCellClickHandler = getMoveCheckerClickHandler(
        activeCell,
        activeCellLegalActions as MoveChecker[]
      );
      if (thisCellClickHandler) thisCellClickHandler();
    } else {
      removeAllCellsSpecialProps();
      addPlayerCellsSpecialProps();
    }
  };

  const escapeActiveCellHandler = () => {
    if (!activeCell) return;
    setActiveCell(null);
    removeAllCellsSpecialProps();
    addPlayerCellsSpecialProps();
  };

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.innerHTML = "";
    gameWorkerRef.current = new Worker(
      new URL("../workers/game.worker.ts", import.meta.url)
    );
    gameWorkerRef.current.addEventListener(
      "message",
      (e: MessageEvent<GameWorkerResponse>) => {
        const response = e.data;
        console.log("Host received:", e);
        switch (response.type) {
          case "FETCH_BOARD_RESPONSE":
            const { board } = response.data;
            setBoard(board);
            // console.log(board);
            return;
          case "FETCH_PLAYER_TO_PLAY_RESPONSE":
            const { playerToPlay: p } = response.data;
            setPlayerToPlay(p);
            // console.log(p);
            return;
          case "FETCH_LEGAL_HUMAN_ACTIONS_RESPONSE":
            const { legalHumanActions } = response.data;
            setLegalHumanActionsMap(legalHumanActions);
            // console.log(legalHumanActions);
            return;
          case "FETCH_BEST_COMPUTER_ACTION_RESPONSE":
            const { bestComputerAction } = response.data;
            setBestComputerAction(bestComputerAction);
            // console.log(bestComputerAction);
            return;
          case "FETCH_GAME_TURN_RESPONSE":
            const { turn } = response.data;
            setTurn(turn);
            return;
          default:
            return;
        }
      }
    );
    return () => {
      gameWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (human) {
      // once user chooses to play as white or black, set up the game
      const diff = konaneDifficulties[difficulty] || 0;
      gameWorkerRef.current?.postMessage({
        type: "START",
        data: { human, difficulty: diff },
      });
      gameWorkerRef.current?.postMessage({
        type: "FETCH_BOARD",
      });
      gameWorkerRef.current?.postMessage({
        type: "FETCH_PLAYER_TO_PLAY",
      });
    }
  }, [human]);

  useEffect(() => {
    removeAllCellsSpecialProps();
    gameWorkerRef.current?.postMessage({
      type: "FETCH_GAME_TURN",
    });
    gameWorkerRef.current?.postMessage({
      type: "FETCH_BOARD",
    });
    if (playerToPlay === human) {
      // human's turn
      gameWorkerRef.current?.postMessage({
        type: "FETCH_LEGAL_HUMAN_ACTIONS",
      });
    } else {
      // computer's turn
      setComputerThinking(true);
      gameWorkerRef.current?.postMessage({
        type: "FETCH_BEST_COMPUTER_ACTION",
      });
    }
  }, [playerToPlay]);

  useEffect(() => {
    if (!legalHumanActionsMap) return;
    if (legalHumanActionsMap.size === 0) {
      // human has no moves left, human loses
      setHumanWins(false);
    } else {
      addPlayerCellsSpecialProps();
    }
  }, [legalHumanActionsMap]);

  useEffect(() => {
    if (bestComputerAction === undefined) return;
    setComputerThinking(false);
    if (!bestComputerAction) {
      // computer has no moves left, human wins
      setHumanWins(true);
    } else {
      animateAndResolveAction(bestComputerAction);
    }
  }, [bestComputerAction]);

  /**
   * Rerender if internal board changes at all
   */
  useEffect(() => {}, [`${board}`]);

  return (
    <div
      className={styles.container}
      onKeyDown={(e) => {
        if (e.key === "Escape" && activeAction) {
          escapeActiveActionHandler();
        } else if (e.key === "Escape" && activeCell) {
          escapeActiveCellHandler();
        }
      }}
      tabIndex={0}
    >
      <Head>
        <title>{`Play Konane \u2012 ${capitalizeFirstLetter(
          difficulty
        )}`}</title>
        <meta
          name="title"
          content={`Play Konane \u2012 ${capitalizeFirstLetter(difficulty)}`}
        />
        <meta
          name="description"
          content="Play against a Konane AI of varying difficulty"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta
          property="og:title"
          content={`Play Konane \u2012 ${capitalizeFirstLetter(difficulty)}`}
        />
        <meta
          property="og:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={baseUrl} />
        <meta
          property="twitter:title"
          content={`Play Konane \u2012 ${capitalizeFirstLetter(difficulty)}`}
        />
        <meta
          property="twitter:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="twitter:image" content={`${baseUrl}/logo.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBar navigation={false} right={true}>
        <div className={styles["game-history-title"]}>History</div>
        <div className={styles["game-history-container"]}>
          <div className={styles["game-history-wrapper"]}>
            <div className={styles["game-history"]} ref={historyRef}></div>
          </div>
        </div>
      </SideBar>
      {!human && (
        <Modal className={"set-player-modal"} full={true}>
          <div className={styles["set-player-modal-content"]}>
            <h1 className={styles["set-player-modal-prompt-message"]}>
              Choose
            </h1>
            <div className={styles["set-player-modal-buttons-container"]}>
              <button
                value={WHITE}
                className={styles["set-player-modal-white-button"]}
                onClick={handleSetPlayerButtonClick}
              >
                White
              </button>
              <button
                value={BLACK}
                className={styles["set-player-modal-black-button"]}
                onClick={handleSetPlayerButtonClick}
              >
                Black
              </button>
            </div>
          </div>
        </Modal>
      )}
      {activeAction && (
        <Modal
          className={styles["active-action-confirmation-modal"]}
          closable={true}
          onClose={escapeActiveActionHandler}
        >
          <div
            className={styles["active-action-confirmation-modal-content"]}
            style={{
              background: playerToPlay || "",
              color: playerToPlay === BLACK ? WHITE : BLACK,
              border: `0.5em solid ${
                actionIsMoveChecker(activeAction)
                  ? `var(--${
                      playerToPlay === BLACK ? "black" : "white"
                    }-move-cell-color)`
                  : actionIsRemoveChecker(activeAction)
                  ? `var(--${
                      playerToPlay === BLACK ? "black" : "white"
                    }-remove-cell-color)`
                  : "black"
              }`,
              borderRadius: "1em",
            }}
          >
            <div className={styles["active-action-confirmation-modal-prompt"]}>
              Are you sure?
            </div>
            {actionIsMoveChecker(activeAction) && (
              <div
                className={
                  styles["active-action-confirmation-modal-action-description"]
                }
                style={{
                  borderTop: `2px solid ${`var(--${
                    playerToPlay === BLACK ? "black" : "white"
                  }-move-cell-color)`}`,
                  borderBottom: `2px solid ${`var(--${
                    playerToPlay === BLACK ? "black" : "white"
                  }-move-cell-color)`}`,
                }}
              >
                Move {`(${verboseCellPosition(activeAction.from).join(", ")})`}{" "}
                to {`(${verboseCellPosition(activeAction.to).join(", ")})`}
              </div>
            )}
            {actionIsRemoveChecker(activeAction) && (
              <div
                className={
                  styles["active-action-confirmation-modal-action-description"]
                }
                style={{
                  borderTop: `2px solid ${`var(--${
                    playerToPlay === BLACK ? "black" : "white"
                  }-remove-cell-color)`}`,
                  borderBottom: `2px solid ${`var(--${
                    playerToPlay === BLACK ? "black" : "white"
                  }-remove-cell-color)`}`,
                }}
              >
                Remove {`(${verboseCellPosition(activeAction.cell).join(",")})`}
              </div>
            )}
            <div className={styles["active-action-confirmation-modal-buttons"]}>
              <button
                className={
                  styles["active-action-confirmation-modal-yes-button"]
                }
                onClick={() => {
                  setActiveAction(null);
                  setActiveCell(null);
                  animateAndResolveAction(activeAction);
                }}
              >
                Yes
              </button>
              <button
                className={styles["active-action-confirmation-modal-no-button"]}
                onClick={escapeActiveActionHandler}
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      )}
      {playerToPlay && human && (
        <div className={styles["player-dashboard"]}>
          <div
            className={styles["player-dashboard-human"]}
            style={{
              background: human === BLACK ? BLACK : WHITE,
              color: human === BLACK ? WHITE : BLACK,
              position: "relative",
              ...(playerToPlay === human
                ? { boxShadow: "0 0 1em 1em gold", zIndex: 5 }
                : {}),
            }}
          >
            You: {human.toUpperCase()}
          </div>
          <div
            className={styles["player-dashboard-computer"]}
            style={{
              background: human === BLACK ? WHITE : BLACK,
              color: human === BLACK ? BLACK : WHITE,
              position: "relative",
              ...(playerToPlay !== human
                ? { boxShadow: "0 0 1em 1em gold", zIndex: 5 }
                : {}),
            }}
          >
            Computer: {(human === BLACK ? WHITE : BLACK).toUpperCase()}
            {computerThinking &&
              humanWins === null &&
              playerToPlay !== human && (
                <LoadingIndicator
                  className={styles["computer-loading-indicator"]}
                />
              )}
          </div>
        </div>
      )}
      {activeCell && (
        <button
          className={styles["escape-active-cell-button"]}
          onClick={escapeActiveCellHandler}
          disabled={activeAction ? true : false}
        >
          <div className={styles["escape-active-cell-button-arrow"]}></div>
        </button>
      )}
      <div
        className={styles["konane-board-container"]}
        onClick={handleBoardClick}
      >
        {emptyBoard.map((row, rowN) => (
          <div
            className={styles["konane-board-row"]}
            key={`row${rowN}`}
            data-row={`${rowN + 1}`}
          >
            {row.map((_, colN) => (
              <button
                className={styles["konane-board-cell"]}
                style={{
                  background:
                    rowN % 2 === colN % 2
                      ? "var(--black-cell-color)"
                      : "var(--white-cell-color)",
                }}
                key={`row${rowN}-col${colN}`}
                value={`${rowN}-${colN}`}
                ref={(el) => (boardRef.current[rowN][colN] = el)}
                tabIndex={-1}
                data-col={`${colN + 1}`}
              >
                {board && cellIsChecker(board[rowN][colN]) && (
                  <div
                    className={
                      board[rowN][colN] === "X"
                        ? "checker-black"
                        : "checker-white"
                    }
                  ></div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      {humanWins && (
        <div className={`confetti-container ${styles["win-screen"]}`}>
          {[...Array(75)].map((_, idx) => (
            <div className="confetti" key={`confetti-${idx}`}></div>
          ))}
        </div>
      )}
      {humanWins === false && (
        <div className={`rainfall-container ${styles["lose-screen"]}`}>
          {[...Array(75)].map((_, idx) => (
            <div className="rainfall" key={`rain-${idx}`}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const difficulty = params?.difficulty;
  return {
    props: {
      difficulty,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(konaneDifficulties).map((difficulty) => ({
    params: { difficulty },
  }));
  return { paths, fallback: "blocking" };
};

export default PlayKonane;
