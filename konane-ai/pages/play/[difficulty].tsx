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

interface PlayKonaneProps {
  difficulty: string;
}

const MOVE_CELL_COLOR = "green";
const MOVE_CELL_COLOR_RGBA = "0,128,0,1";
const REMOVE_CELL_COLOR = "red";
const REMOVE_CELL_COLOR_RGBA = "255,0,0,1";

const PlayKonane: NextPage<PlayKonaneProps> = ({ difficulty }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [playerLegalActions, setPlayerLegalActions] = useState<Action[] | null>(
    null
  );
  const gameRef = useRef<KonaneGame | null>(null);
  const boardRef = useRef<(HTMLButtonElement | null)[][]>(emptyBoard);

  const [playerToPlay, setPlayerToPlay] = useState<Player | undefined>(
    gameRef.current?.playerToPlay
  );

  const handlePrimaryCellClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { value } = e.currentTarget;
    if (!value) {
      console.log("Something went wrong");
    }
    const [row, col] = value.split("-").map((n) => parseInt(n));
    if (isNaN(row) || isNaN(col)) return;
    const cellElement = boardRef.current[row][col];
    if (!cellElement) return;
    // reset border for everything
    boardRef.current.forEach((row) => {
      row.forEach((cell) => {
        if (!cell) return;
        cell.style.border = "none";
      });
    });
    if (activeCell === [row, col]) {
      // clicked on the same active cell
      setActiveCell(null);
      if (!playerLegalActions) return;
      playerLegalActions.forEach((action) => {
        if (actionIsMoveChecker(action)) {
          const { from } = action;
          const [row, col] = from;
          const cellElement = boardRef.current[row][col];
          if (!cellElement) return;
          cellElement.style.border = "2px dashed green";
        } else if (actionIsRemoveChecker(action)) {
          const [row, col] = action.cell;
          const cellElement = boardRef.current[row][col];
          if (!cellElement) return;
          cellElement.style.border = "2px dashed green";
        }
      });
    } else {
      // turn on
      // turn on related cells
      cellElement.style.border = "2px solid green";
      if (!playerLegalActions) return;
      const relatedCells = playerLegalActions
        // get actions related to clicked cell
        .filter((action) => {
          if (actionIsMoveChecker(action)) {
            return action.from === [row, col];
          } else if (actionIsRemoveChecker(action)) {
            return action.cell === [row, col];
          } else {
            return false;
          }
        })
        // get coordinates from actions
        .map((action) => {
          if (actionIsMoveChecker(action)) {
            return action.to;
          } else if (actionIsRemoveChecker(action)) {
            return action.cell;
          } else {
            return null;
          }
        });
      relatedCells.forEach((cell) => {
        if (!cell) return;
        const [row, col] = cell;
        const relatedCellElement = boardRef.current[row][col];
        if (!relatedCellElement) return;
        relatedCellElement.style.border = "2px dashed green";
      });
    }
  };

  const addBoardHumanProps = () => {
    // adds props to cells when human's turn
    if (!gameRef.current) return;
    if (!boardRef.current[0]) return;
    const game = gameRef.current;
    const playerToPlay = game.playerToPlay;
    if (playerToPlay !== player) return;
    const legalActions = game.getLegalHumanActions();
    if (!legalActions) return;
    legalActions.forEach((action) => {
      if (actionIsMoveChecker(action)) {
        const { to, from } = action;
      } else if (actionIsRemoveChecker(action)) {
        const { cell } = action;
        const [row, col] = cell;
      }
    });
  };

  useEffect(() => {
    if (player) {
      // once user chooses to play as white or black, set up the game
      gameRef.current = new KonaneGame(player);
      setPlayerToPlay(BLACK);
    }
  }, [player]);

  useEffect(() => {
    // once user chooses who to play as render the board
    // ^ helps with initial render
    // once it is the other player's turn, render the new board
    if (!gameRef.current) return;
    const internalBoard = gameRef.current.board;
    internalBoard.forEach((row, rowN) => {
      row.forEach((cellVal, colN) => {
        if (cellIsChecker(cellVal)) {
          const cellElement = boardRef.current[rowN][colN];
          if (!cellElement) return;
          cellElement.innerHTML = cellVal;
          if (rowN === 0 && colN === 0) {
            cellElement.classList.add("rotating-cell-border-primary");
          }
        }
      });
    });
  }, [player, gameRef.current?.konane.turn]);

  useEffect(() => {
    // outline possible moves for human when it is their turn
    if (playerToPlay !== player) return;
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
