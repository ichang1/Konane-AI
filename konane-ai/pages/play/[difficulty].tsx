import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/pages/play/[difficulty].module.scss";
import {
  konaneDifficulties,
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
} from "../../konane/KonaneUtils";
import { useEffect, useRef, useState } from "react";
import Modal from "../../components/Modal/Modal";
import SideBar from "../../components/SideBar/SideBar";
import KonaneGame from "../../konane/KonaneGame";

const n = 8;
const emptyBoard = [...Array(n)].map((_) => [...Array(n)]);

const xCellColor = "#ab4e52";
const oCellColor = "#703642";
const ANIMATION_SPEED = 1250;

interface PlayKonaneProps {
  difficulty: string;
}

const specialCssClasses = [
  "rotating-cell-border-black-primary",
  "rotating-cell-border-white-primary",
  "rotating-cell-border-black-secondary",
  "rotating-cell-border-white-secondary",
  "cell-border-black-primary",
  "cell-border-white-primary",
  "cell-border-black-secondary",
  "cell-border-white-secondary",
];

const PlayKonane: NextPage<PlayKonaneProps> = ({ difficulty }) => {
  const [human, setHuman] = useState<Player | null>(null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [humanWins, setHumanWins] = useState<boolean | null>(null);

  const gameRef = useRef<KonaneGame | null>(null);
  const boardRef = useRef<(HTMLButtonElement | null)[][]>(emptyBoard);
  const historyRef = useRef<HTMLDivElement | null>(null);

  const [playerToPlay, setPlayerToPlay] = useState<Player | undefined>(
    gameRef.current?.playerToPlay
  );

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
    if (playerToPlay !== human) return;
    if (!gameRef.current) return;
    const game = gameRef.current;
    const playerLegalActions = game.getLegalHumanActions();
    if (!playerLegalActions) return;
    Object.entries(playerLegalActions).forEach(
      ([cellString, actionsFromCell]) => {
        const [row, col] = cellString.split(",").map((n) => parseInt(n));
        if (isNaN(row) || isNaN(col) || row === undefined || col === undefined)
          return;
        addCellSpecialProps([row, col], actionsFromCell);
      }
    );
  };

  /**
   * removes the added dashed border's, onclicks, pointer styles
   * @returns null
   */
  const removeAllCellsSpecialProps = () => {
    if (!gameRef.current) return;
    const internalBoard = gameRef.current.board;
    internalBoard.forEach((row, rowN) => {
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
    const game = gameRef.current;
    if (!game) return;
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
      const callbacks = [
        () => {
          // record move in history
          const description = `${game.turn + 1}. ${
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
        () => {
          // remove border from checker that will be moved
          fromCellElement.classList.remove(solidBorderCls);
          // make destination cell solid
          toCellElement.classList.remove(dashedBorderCls);
          // add border to cell that checker will be moved to
          toCellElement.classList.add(solidBorderCls);
        },
        () => {
          // remove border to cell that checker will be moved to
          toCellElement.classList.remove(solidBorderCls);
          game.applyAction(action);
          setPlayerToPlay((p) => (p === BLACK ? WHITE : BLACK));
        },
      ];
      callbacks.forEach((cb, idx) => {
        setTimeout(cb, idx * ANIMATION_SPEED);
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
      const callbacks = [
        () => {
          // record remove in history
          const description = `${game.turn + 1}. ${
            playerToPlay === human ? "Human" : "Computer"
          } (${playerToPlay}) removes (${verboseCellPosition(cell).join(
            ", "
          )})`;
          writeToHistory(description);
          // add border to checker that will be removed
          cellElement.classList.add(solidBorderCls);
        },
        () => {
          // remove border from checker that will be removed
          cellElement.classList.remove(solidBorderCls);
          game.applyAction(action);
          setPlayerToPlay((p) => (p === BLACK ? WHITE : BLACK));
        },
      ];
      callbacks.forEach((cb, idx) => {
        setTimeout(cb, idx * ANIMATION_SPEED);
      });
    }
  };

  const escapeActiveActionHandler = () => {
    if (!activeAction) return;
    setActiveAction(null);
    setActiveCell(null);
    if (actionIsMoveChecker(activeAction) && activeCell) {
      const game = gameRef.current;
      if (!game) return;
      const legalHumanActions = game.getLegalHumanActions();
      if (!legalHumanActions) return;
      const thisCellClickHandler = getMoveCheckerClickHandler(
        activeCell,
        legalHumanActions[activeCell.toString()] as MoveChecker[]
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
    if (!history) return;
    history.innerHTML = "";
  }, []);

  useEffect(() => {
    if (human) {
      // once user chooses to play as white or black, set up the game
      gameRef.current = new KonaneGame(
        human,
        konaneDifficulties[difficulty] || 0
      );
      setPlayerToPlay(BLACK);
    }
  }, [human]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    removeAllCellsSpecialProps();
    if (playerToPlay === human) {
      // human's turn
      const playerLegalActions = game.getLegalHumanActions();
      if (!playerLegalActions) return;
      if (Object.keys(playerLegalActions).length === 0) {
        // human has no moves left, human loses
        setHumanWins(false);
        console.log(
          `human: ${human} loses, computer: ${
            human === BLACK ? WHITE : BLACK
          } wins`
        );
      } else {
        addPlayerCellsSpecialProps();
      }
    } else {
      // computer's turn
      const bestAction = game.getBestComputerAction();
      if (!bestAction) {
        // computer has no moves left, human wins
        setHumanWins(true);
        console.log(
          `human: ${human} wins, computer: ${
            human === BLACK ? WHITE : BLACK
          } loses`
        );
      } else {
        animateAndResolveAction(bestAction);
      }
    }
  }, [playerToPlay]);

  useEffect(() => {
    console.log(humanWins);
  }, [humanWins]);

  return (
    <div
      className={styles.container}
      onKeyDown={(e) => {
        if (e.key === "Escape") escapeActiveCellHandler();
      }}
      tabIndex={0}
    >
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBar>
        <div className={styles["sidebar-difficulty-buttons-container"]}>
          {Object.keys(konaneDifficulties).map((diff, idx) => (
            <button
              data-level={idx}
              className={styles["sidebar-difficulty-button"]}
              key={idx}
            >
              <a key={idx} href={`/play/${diff}`}>
                {diff.toUpperCase()}
              </a>
            </button>
          ))}
        </div>
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
              background: playerToPlay,
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
                  background: rowN % 2 === colN % 2 ? xCellColor : oCellColor,
                }}
                key={`row${rowN}-col${colN}`}
                value={`${rowN}-${colN}`}
                ref={(el) => (boardRef.current[rowN][colN] = el)}
                tabIndex={-1}
                data-col={`${colN + 1}`}
              >
                {gameRef.current &&
                  cellIsChecker(gameRef.current.board[rowN][colN]) && (
                    <div
                      className={
                        gameRef.current.board[rowN][colN] === "X"
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
        <div className={`rainfall ${styles["lose-screen"]}`}>
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
