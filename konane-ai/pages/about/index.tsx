import { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { baseUrl } from "../../utils/misc";
import styles from "../../styles/pages/about/index.module.scss";

const About: NextPage = () => {
  return (
    <div className={styles["about-container"]}>
      <Head>
        <title>{"Play Konane \u2012 About"}</title>
        <meta name="title" content={"Play Konane \u2012 About"} />
        <meta
          name="description"
          content="Play against a Konane AI of varying difficulty"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:title" content={"Play Konane \u2012 About"} />
        <meta
          property="og:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="og:image" content={`${baseUrl}/logo.png`} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={baseUrl} />
        <meta property="twitter:title" content={"Play Konane \u2012 About"} />
        <meta
          property="twitter:description"
          content="Play against a Konane AI of varying difficulty"
        />
        <meta property="twitter:image" content={`${baseUrl}/logo.png`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section>
        <h1>Game Play</h1>
        <div className={styles["section-container"]}>
          <ol className={styles["game-instructions-list"]}>
            <li>
              Cells that have a rotating dashed border have checkers that are
              playable.
            </li>
            <li>Cells that are playable can be clicked on.</li>
            <li>
              When removable checkers are clicked on, a confirmation modal pops
              up confirming the move.
            </li>
            <li>
              When movable checkers are clicked on, its cell with be focused
              with a solid border and rotating dashed borders will appear on the
              cells that the checker can move to. When the destination cells are
              clicked on, a confirmation modal pops up confirming the move.
            </li>
            <li>
              Confirmation modals can be closed via <kbd>Esc</kbd> and focused
              cells for movable checkers can also be escaped via <kbd>Esc</kbd>
            </li>
          </ol>
        </div>
      </section>
      <section>
        <h1>AI</h1>
        <div className={styles["section-container"]}>
          <p>
            The AI is powered by the min-max algorithm with alpha beta pruning.
            The min-max algorithm uses caching to memoize successors generation
            and static evaluations for extra performance. The static evaluation
            function takes in a konane board and quantifies the board by
            weighing how good each checker is to a player and summing those
            values. If a checker has multiple moves associated with it, then it
            is weighted by the best possible move that it can partake. The
            evaluation is then the difference between these two sums for the
            players.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
