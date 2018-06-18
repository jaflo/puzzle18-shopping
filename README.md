# Shopping Cart

A puzzle for [HackTX 2018](https://hacktx.com/).

## Setup

Copy `example.env` to `.env` and change anything needed (probably `PUZZLE_SECRET` and `HOST_SERVICE`). If `HOST_SERVICE` is an empty string, talking to the host API is disabled. The instructions below are to run this puzzle only without the puzzle host. See the readme for the host for complete instructions on starting a multi-container application of all puzzles.

A custom [Zepto.js](https://github.com/madrobby/zepto) build has been included and can be recompiled using `MODULES="zepto event fx fx_methods" npm run-script dist`.
This project uses Promises and the Fetch API.

### Without Docker

1. Setup and start a database service (for example [MariaDB](https://mariadb.org/)).
2. `npm install` to install needed dependencies (Node.js and npm need to be installed).
3. Download the [Kaggle Cats and Dogs Dataset](https://www.microsoft.com/en-us/download/details.aspx?id=54765) from Microsoft and place the ZIP file into the `bin` folder.
4. `cd bin && ./setup.sh` to unzip and clean the dataset and generate the images used for the CAPTCHA.
5. `npm start` (use `nodemon` to keep restart on file changes)
6. Open http://localhost:4000 in your browser.
