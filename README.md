# Konane-AI

The site is live at [https://play-konane.vercel.app/](https://play-konane.vercel.app/)

The site's home page lays out the rules and goal of Konanae and has a few visual demonstrations for the types of moves that a player may see and make.

The AI difficultly has 4 levels: novice, easy, medium, and hard. The novice difficulty has the AI make random moves. The easy, medium and hard AI all implement the minmax algorithm with alpha beta pruning and uses the same zero-sum evaluation function. The evaulation function quantifies how good the board is for both player and takes the difference. The goodness of a board for one player is summing up the quantification of the goodness of the player's checkers.

# Install and Start

1. Clone the repository `git clone https://github.com/ichang1/covid-tracker.git`
2. Enter the root of the Next project `cd Konane-AI/konane-ai`
3. Install the dependencies `npm install`
4. Start the project locally `npm run dev`
