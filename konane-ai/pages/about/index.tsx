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
        <div className={styles["paragraph-container"]}>
          <p>
            {
              "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, enim quas necessitatibus mollitia ex ratione placeat saepe veritatis repellat magni, fugit rem provident quod quidem omnis repudiandae sint cupiditate pariatur sapiente. Nulla assumenda similique, dolores veritatis quam eos consectetur tempore culpa aliquam nam iusto tempora voluptatum sit modi repellat fuga quae! Eligendi, provident. Impedit nam perspiciatis fuga id aspernatur laborum, dolorem facilis sapiente, totam, voluptatum maxime autem corporis eaque! Eligendi, dolorum consequuntur cum recusandae unde soluta, iure voluptate ratione, omnis tempore vel suscipit possimus est corrupti vitae veniam nemo corporis. Nulla accusantium quas dicta, eveniet dolores dolorum similique? Iure, debitis!"
            }
          </p>
        </div>
      </section>
      <section>
        <h1>AI</h1>
        <div className={styles["paragraph-container"]}>
          <p>
            {
              "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores, enim quas necessitatibus mollitia ex ratione placeat saepe veritatis repellat magni, fugit rem provident quod quidem omnis repudiandae sint cupiditate pariatur sapiente. Nulla assumenda similique, dolores veritatis quam eos consectetur tempore culpa aliquam nam iusto tempora voluptatum sit modi repellat fuga quae! Eligendi, provident. Impedit nam perspiciatis fuga id aspernatur laborum, dolorem facilis sapiente, totam, voluptatum maxime autem corporis eaque! Eligendi, dolorum consequuntur cum recusandae unde soluta, iure voluptate ratione, omnis tempore vel suscipit possimus est corrupti vitae veniam nemo corporis. Nulla accusantium quas dicta, eveniet dolores dolorum similique? Iure, debitis!"
            }
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
