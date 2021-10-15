import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/pages/play/[difficulty].module.scss";
import {
  Cell,
  konaneDifficulties,
  Player,
  BLACK,
  WHITE,
  stringIsPlayer,
  cellIsChecker,
  actionIsMoveChecker,
  actionIsRemoveChecker,
  Action,
} from "../../konane/KonaneUtils";
import { useEffect, useRef, useState } from "react";
import PageModal from "../../components/PageModal/PageModal";
import KonaneGame from "../../konane/KonaneGame";

const n = 8;
const emptyBoard = [...Array(n)].map((_) => [...Array(n)]);

const xCellColor = "#ab4e52";
const oCellColor = "white";
const COMPUTER_ANIMATION_SPEED = 1000;

interface PlayKonaneProps {
  difficulty: string;
}

const PlayKonane: NextPage<PlayKonaneProps> = ({ difficulty }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const gameRef = useRef<KonaneGame | null>(null);
  const boardRef = useRef<(HTMLButtonElement | null)[][]>(emptyBoard);

  const [playerToPlay, setPlayerToPlay] = useState<Player | undefined>(
    gameRef.current?.playerToPlay
  );

  /**
   * draws the checkers of the current game state
   * @returns null
   */
  const addCheckers = () => {
    if (!gameRef.current) return;
    const internalBoard = gameRef.current.board;
    internalBoard.forEach((row, rowN) => {
      row.forEach((cellVal, colN) => {
        const cellElement = boardRef.current[rowN][colN];
        if (!cellElement) return;
        if (cellIsChecker(cellVal)) {
          cellElement.innerHTML = cellVal;
        } else {
          cellElement.innerHTML = "";
        }
      });
    });
  };

  /**
   *
   * @param e mouse event on clicking checker that can be removed
   * @returns null
   */
  const handleRemoveChecker = (e: MouseEvent) => {
    e.preventDefault();
    const game = gameRef.current;
    if (!game) return;
    const checkerCell = e.currentTarget as HTMLButtonElement;
    // position of the checker is in the value attr of the button
    const coordinates = checkerCell.value.split("-").map((s) => parseInt(s));
    const [row, col] = coordinates;
    if (isNaN(row) || isNaN(col)) return;
    const legalActions = game.getLegalHumanActions();
    if (!legalActions) return;
    // find remove action that corresponds to this cell
    // should be unique
    const targetRemove = legalActions.find((action) => {
      if (!actionIsRemoveChecker(action)) return false;
      const [removeRow, removeCol] = action.cell;
      return row === removeRow && col === removeCol;
    });
    if (!targetRemove) return;
    game.applyAction(targetRemove);
    setPlayerToPlay((p) => (p === BLACK ? WHITE : BLACK));
  };

  /**
   *
   * @param e mouse event on clicking checker that can be moved
   */
  const handleMoveChecker = (e: MouseEvent) => {};

  /**
   * adds a dashed moving border to the cells of the checkers that can
   * be moved/removed legally
   * adds onclick to remove/move
   * adds valid actions as
   * @returns null
   */
  const addPlayerLegalCellsProps = () => {
    if (playerToPlay !== player) return;
    if (!gameRef.current) return;
    const game = gameRef.current;
    const playerLegalActions = game.getLegalHumanActions();
    if (!playerLegalActions) return;
    playerLegalActions.forEach((action) => {
      if (actionIsMoveChecker(action)) {
        const { from } = action;
        const [row, col] = from;
        const cellElement = boardRef.current[row][col];
        if (!cellElement) return;
        cellElement.classList.add("rotating-cell-border-secondary");
        cellElement.style.cursor = "pointer";
        cellElement.onclick = handleMoveChecker;
      } else if (actionIsRemoveChecker(action)) {
        const [row, col] = action.cell;
        const cellElement = boardRef.current[row][col];
        if (!cellElement) return;
        cellElement.classList.add("rotating-cell-border-primary");
        cellElement.style.cursor = "pointer";
        cellElement.onclick = handleRemoveChecker;
      }
    });
  };

  /**
   * removes the added dashed border's, onclicks, pointer styles
   * @returns null
   */
  const removeCellsSpecialProps = () => {
    if (!gameRef.current) return;
    const internalBoard = gameRef.current.board;
    internalBoard.forEach((row, rowN) => {
      row.forEach((_, colN) => {
        const cellElement = boardRef.current[rowN][colN];
        if (!cellElement) return;
        cellElement.onclick = null;
        cellElement.classList.remove(
          "rotating-cell-border-primary",
          "rotating-cell-border-secondary",
          "cell-border-primary",
          "cell-border-secondary"
        );
        cellElement.style.cursor = "default";
      });
    });
  };

  /**
   * animates computers action on board
   * @param action computer's action
   * @returns null
   */
  const animateComputerAction = (action: Action) => {
    const game = gameRef.current;
    if (!game) return;
    if (actionIsMoveChecker(action)) {
      const { from, to } = action;
      const [fromRow, fromCol] = from;
      const [toRow, toCol] = to;
      const fromCellElement = boardRef.current[fromRow][fromCol];
      const toCellElement = boardRef.current[toRow][toCol];
      if (!fromCellElement || !toCellElement) return;
      const callbacks = [
        () => {
          // add border to checker that will be moved
          fromCellElement.classList.add("cell-border-secondary");
        },
        () => {
          // remove border from checker that will be moved
          fromCellElement.classList.remove("cell-border-secondary");
          // add border to cell that checker will be moved to
          toCellElement.classList.add("cell-border-secondary");
        },
        () => {
          // remove border to cell that checker will be moved to
          toCellElement.classList.remove("cell-border-secondary");
          game.applyAction(action);
          setPlayerToPlay((p) => (p === BLACK ? WHITE : BLACK));
        },
      ];
      callbacks.forEach((cb, idx) => {
        setTimeout(cb, idx * COMPUTER_ANIMATION_SPEED);
      });
    } else if (actionIsRemoveChecker(action)) {
      const {
        cell: [row, col],
      } = action;
      const cellElement = boardRef.current[row][col];
      if (!cellElement) return;
      const callbacks = [
        () => {
          // add border to checker that will be removed
          cellElement.classList.add("cell-border-primary");
        },
        () => {
          // remove border from checker that will be removed
          cellElement.classList.remove("cell-border-primary");
          game.applyAction(action);
          setPlayerToPlay((p) => (p === BLACK ? WHITE : BLACK));
        },
      ];
      callbacks.forEach((cb, idx) => {
        setTimeout(cb, idx * COMPUTER_ANIMATION_SPEED);
      });
    }
  };

  useEffect(() => {
    if (player) {
      // once user chooses to play as white or black, set up the game
      gameRef.current = new KonaneGame(
        player,
        konaneDifficulties[difficulty] || 0
      );
      setPlayerToPlay(BLACK);
    }
  }, [player]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    removeCellsSpecialProps();
    addCheckers();
    if (playerToPlay === player) {
      // human's turn
      addPlayerLegalCellsProps();
    } else {
      // computer's turn
      const bestAction = game.getBestComputerAction();
      if (!bestAction) {
        // human wins
      } else {
        animateComputerAction(bestAction);
      }
    }
  }, [playerToPlay]);

  const handleSetPlayerButtonClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const { value } = e.currentTarget;
    if (!value) {
      console.log("Something went wrong");
    }
    if (!stringIsPlayer(value)) {
      console.log(`${value} is not of player type`);
    } else {
      setPlayer(value);
    }
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!player && (
        <PageModal>
          <div className={styles["set-player-modal-content"]}>
            <div className={styles["set-player-modal-prompt-message"]}>
              Choose
            </div>
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
        </PageModal>
      )}
      {playerToPlay && (
        <div className={styles["player-turn-message"]}>
          {playerToPlay} to play
        </div>
      )}
      <div className={styles["konane-board-container"]}>
        {emptyBoard.map((row, rowN) => (
          <div className={styles["konane-board-row"]} key={`row${rowN}`}>
            {row.map((_, colN) => (
              <button
                className={styles["konane-board-cell"]}
                style={{
                  background: rowN % 2 === colN % 2 ? xCellColor : oCellColor,
                }}
                key={`row${rowN}-col${colN}`}
                value={`${rowN}-${colN}`}
                ref={(el) => (boardRef.current[rowN][colN] = el)}
              ></button>
            ))}
          </div>
        ))}
      </div>
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
