import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { konaneDifficulties } from "../konane/KonaneGameUtils";
import styles from "../styles/pages/index.module.scss";
import { oddIndexElements, specialCssClasses } from "../utils/misc";
import { baseUrl } from "../utils/misc";

const ANIMATION_SPEED = 1250;

const Home: NextPage = () => {
  const singleJumpAnimationRef = useRef<(HTMLDivElement | null)[]>(
    [...Array(3)].map((_) => null)
  );
  const doubleJumpAnimationRef = useRef<(HTMLDivElement | null)[]>(
    [...Array(5)].map((_) => null)
  );
  const tripleJumpAnimationRef = useRef<(HTMLDivElement | null)[]>(
    [...Array(7)].map((_) => null)
  );

  /**
   * Animates black checker capturing white checkers
   * @param cellElementArr array of div elements
   */
  const runJumpAnimations = (cellElementArr: (HTMLDivElement | null)[]) => {
    const firstCellElement = cellElementArr[0];
    const lastCellElement = cellElementArr[cellElementArr.length - 1];
    const whiteCellElements = oddIndexElements(cellElementArr);
    // clear checkers and special border classes
    cellElementArr.forEach((el) => {
      if (!el) return;
      el.classList.remove(...specialCssClasses);
      el.firstElementChild?.classList.remove("checker-black", "checker-white");
    });
    // animations in order
    // callback for animation and callback for delay based on index
    const animations: [() => void, (idx: number) => number][] = [
      [
        () => {
          if (!firstCellElement) return;
          // add checkers
          firstCellElement.firstElementChild?.classList.add("checker-black");
          whiteCellElements.forEach((el) => {
            if (!el) return;
            el.firstElementChild?.classList.add("checker-white");
          });
        },
        (idx: number) => idx * ANIMATION_SPEED,
      ],
      [
        () => {
          if (!firstCellElement || !lastCellElement) return;
          // add starting and end cell border
          firstCellElement.classList.add("cell-border-black-secondary");
          lastCellElement.classList.add("rotating-cell-border-black-secondary");
        },
        (idx: number) => idx * ANIMATION_SPEED,
      ],
      [
        () => {
          if (!firstCellElement || !lastCellElement) return;
          // remove starting and ending cell border
          firstCellElement.classList.remove("cell-border-black-secondary");
          lastCellElement.classList.remove(
            "rotating-cell-border-black-secondary"
          );
          // add destination border signifying move
          lastCellElement.classList.add("cell-border-black-secondary");
        },
        (idx: number) => idx * ANIMATION_SPEED,
      ],
      [
        () => {
          if (!firstCellElement || !lastCellElement) return;
          // remove checker from start
          firstCellElement.firstElementChild?.classList.remove("checker-black");
          // remove intermediate white checkers
          whiteCellElements.forEach((el) => {
            if (!el) return;
            el.firstElementChild?.classList.remove("checker-white");
          });
          // add black checker to end cell
          lastCellElement.classList.remove("cell-border-black-secondary");
          lastCellElement.firstElementChild?.classList.add("checker-black");
        },
        (idx: number) => idx * ANIMATION_SPEED,
      ],
    ];
    animations.forEach(([cb, delayFn], idx) => {
      setTimeout(cb, delayFn(idx));
    });
  };

  useEffect(() => {
    const singleJumpAnimation = setInterval(
      () => runJumpAnimations(singleJumpAnimationRef.current),
      4 * ANIMATION_SPEED
    );
    const doubleJumpAnimation = setInterval(
      () => runJumpAnimations(doubleJumpAnimationRef.current),
      4 * ANIMATION_SPEED
    );
    const tripleJumpAnimation = setInterval(
      () => runJumpAnimations(tripleJumpAnimationRef.current),
      4 * ANIMATION_SPEED
    );
    return () => {
      clearInterval(singleJumpAnimation);
      clearInterval(doubleJumpAnimation);
      clearInterval(tripleJumpAnimation);
    };
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>{"Play Konane \u2012 Home"}</title>
        <meta name="title" content={"Play Konane \u2012 Home"} />
        <meta
          name="description"
          content="Play against a Konane AI of varying difficulty"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:title" content={"Play Konane \u2012 Home"} />
        <meta
          property="og:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={baseUrl} />
        <meta property="twitter:title" content={"Play Konane \u2012 Home"} />
        <meta
          property="twitter:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="twitter:image" content={`${baseUrl}/logo.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Konane - Hawaiian Checkers</h1>
        <h2>The Rules</h2>
        <ol className={styles["rules-list"]}>
          <li>Players decide which colors to play, black or white</li>
          <li>
            Black starts first and must remove one of their pieces from the
            middle of the 8 x 8 board.
          </li>
          <li>
            White then removes one of their pieces horizontally adjacent to the
            empty space created by Black. There are now two adjacent empty
            spaces on the board.
          </li>
          <li>
            From here on, players take turns capturing each other&apos;s pieces.
            All moves must be capturing moves. A player captures an enemy piece
            by hopping over it. Captures can be done only horizontally and
            vertically, <strong>not</strong> diagonally. The player&apos;s piece
            hops over the adjacent enemy piece, and lands on a vacant space
            immediately past. The player&apos;s piece can continue to hop over
            enemy pieces but only in the same orthogonal direction. The player
            can stop hopping enemy pieces at any time, choosing whether to
            perform a single, double or triple jump.
          </li>
        </ol>
        <div>Examples of valid capturing moves are below</div>
        <div className={styles["cell-animation-container"]}>
          <div
            className={`${styles["single-jump"]} ${styles["cell-animation"]}`}
          >
            {[...Array(3)].map((_, idx) => (
              <div
                className={`${styles["konane-board-cell"]}`}
                key={idx}
                style={{
                  background:
                    idx % 2 == 0
                      ? "var(--black-cell-color)"
                      : "var(--white-cell-color)",
                }}
                ref={(el) => (singleJumpAnimationRef.current[idx] = el)}
              >
                <div></div>
              </div>
            ))}
          </div>
          <div
            className={`${styles["double-jump"]} ${styles["cell-animation"]}`}
          >
            {[...Array(5)].map((_, idx) => (
              <div
                className={`${styles["konane-board-cell"]}`}
                key={idx}
                style={{
                  background:
                    idx % 2 == 0
                      ? "var(--black-cell-color)"
                      : "var(--white-cell-color)",
                }}
                ref={(el) => (doubleJumpAnimationRef.current[idx] = el)}
              >
                <div></div>
              </div>
            ))}
          </div>
          <div
            className={`${styles["triple-jump"]} ${styles["cell-animation"]}`}
          >
            {[...Array(7)].map((_, idx) => (
              <div
                className={`${styles["konane-board-cell"]}`}
                key={idx}
                style={{
                  background:
                    idx % 2 == 0
                      ? "var(--black-cell-color)"
                      : "var(--white-cell-color)",
                }}
                ref={(el) => (tripleJumpAnimationRef.current[idx] = el)}
              >
                <div></div>
              </div>
            ))}
          </div>
        </div>
        <h3>Play Now</h3>
        <div className={styles["play-difficulty-buttons-container"]}>
          {Object.keys(konaneDifficulties).map((diff, idx) => (
            <button
              data-level={idx}
              className={styles["play-difficulty-level"]}
              key={idx}
            >
              <a key={idx} href={`/${diff}`}>
                {diff.toUpperCase()}
              </a>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
