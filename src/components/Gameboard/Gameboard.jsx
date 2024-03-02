import React, { useState, useEffect, useRef } from "react";
// Plugins
import Peer from "peerjs";
// Components
import Alert from "../Alert/Alert";
import GameLobby from "../GameLobby/GameLobby";
import GameScreen from "../GameScreen/GameScreen";

export default function Gameboard() {
  /* -------------------------------------------------------------------------- */
  /*                                  Hooks                                     */
  /* -------------------------------------------------------------------------- */
  // Specifies which player color to place down
  const [playerState, setPlayerState] = useState(1);
  // Specifies if the game is in play, disables player input
  const [gamestate, setGamestate] = useState(true);
  // Specify Board dimensions. Referred to by several functions that check the state of the board
  const rows = 7;
  const columns = 6;
  // Initializes an empty board
  const [board, setBoard] = useState(() => {
    return createEmptyBoard(rows, columns);
  });

  // Specifies if it is currently the user's turn
  const [isMyTurn, setIsMyTurn] = useState(true);
  // Switches between the lobby and game screen
  const [showGame, setShowGame] = useState(false);
  // Specifies if the game has been won
  const [gameWin, setGameWin] = useState(false);
  // Specifies if the game is tied
  const [gameIsTied, setGameIsTied] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                              Initialize Board                              */
  /* -------------------------------------------------------------------------- */

  // An array is used in order to easily reference and switch the color value using array indexes
  const playerColors = ["#FF5858", "#9DFF3B"];
  function createEmptyBoard(rows, columns) {
    const emptyBoard = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        row.push(null);
      }
      emptyBoard.push(row);
    }

    return emptyBoard;
  }

  /* -------------------------------------------------------------------------- */
  /*                             Handle Connections                             */
  /* -------------------------------------------------------------------------- */

  const [peer, setPeer] = useState(null);

  // ID that peerJS uses to connect to
  const [peerId, setPeerId] = useState(null);

  // Store connection data. Referred to whenever we want to send data to peers
  const [peerConnection, setPeerConnection] = useState(null);

  /* -------------------------------------------------------------------------- */
  /*                           Handle UI functionality                          */
  /* -------------------------------------------------------------------------- */
  // Prevents the connection button from running functionality when clicked. Used to prevent users from trying to connect when they already have a connection
  const [allowConnectionButton, setAllowConnectionButton] = useState(true);
  // Show spinner while we try to connect to a peer
  const [isConnectionLoading, setIsConnectionLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                Handle Errors                               */
  /* -------------------------------------------------------------------------- */
  const [errorState, setErrorState] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* -------------------------------------------------------------------------- */
  /*              Generate Peer ID / Lobby Code used for connection             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const code = generateRandomCode();
    setPeer(new Peer(code));
  }, []);

  useEffect(() => {
    if (peer === null) {
      return;
    }
    setPeerId(peer.id);
  }, [peer]);

  function generateRandomCode() {
    // 5 Letter code for ID
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /* -------------------------------------------------------------------------- */
  /*                Handler for when we receive data from a peer                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (peer === null) {
      return;
    }
    peer.on("connection", function (conn) {
      conn.on("data", function (data) {
        // Runs when receiving board data
        if (data.sentBoardData === true) {
          setBoard(data.board);
          setPlayerState(data.playerState);
          setIsMyTurn(data.setYourTurn);
          return;
        }

        // Runs only on initial connection
        if (data.initialConnect === true) {
          let conn = peer.connect(data.id);
          conn.on("open", function () {
            setPeerConnection(conn);
          });
          setShowGame(true);
          setAllowConnectionButton(false);
          createEmptyBoard(rows, columns);
          return;
        }

        // Runs if the data says a player has won
        if (data.playerHasWon === true) {
          setBoard(data.board);
          setPlayerState(data.winningPlayer);
          handlePlayerWin();
          return;
        }

        // Runs if the data says to reset the game
        if (data.resetGame === true) {
          setIsMyTurn(true);
          setBoard(createEmptyBoard(rows, columns));
          setGamestate(true);
          setGameWin(false);
          return;
        }

        // Runs if the data says a player has won
        if (data.gameIsTied === true) {
          setBoard(data.board);
          setGameIsTied(true);
          setGamestate(false);
          return;
        }

        return;
      });
    });
  }, [peer]);

  /* -------------------------------------------------------------------------- */
  /*                  Connect to peer using inputted lobby code                 */
  /* -------------------------------------------------------------------------- */
  function connect() {
    // Once a connection has been established, prevent the button from being pushed
    if (!allowConnectionButton) {
      return;
    }

    let item = document.querySelector("#userIDInput");

    let conn = peer.connect(item.value);

    // Show spinner
    setIsConnectionLoading(true);
    // // If connection cannot happen before the time finishes then throw an error
    // let timeoutId = setTimeout(() => {
    //   setErrorState(true);
    //   setErrorMsg(
    //     "Connection timeout: Unable to establish connection. Please try again."
    //   );
    //   setIsConnectionLoading(false);
    //   // Close the connection
    //   conn.close();
    // }, 5000); // 5 seconds

    // Listener for when the connection has opened
    conn.on("open", function () {
      setIsConnectionLoading(false);
      // clearTimeout(timeoutId); // Clear the timeout
      setPeerConnection(conn); // Store connection data so we can send game data later
      setAllowConnectionButton(false); // Disable connection button when connection has been established
      conn.send(
        {
          id: peerId,
          message: "connection established, This page is the host",
          initialConnect: true,
          setYourTurn: false,
          board: null,
          playerState: null,
        },
        (error) => {
          setErrorState(true);
          setErrorMsg(error + "Connection error occurred. Returning to lobby");
        }
      );
      setShowGame(true); //Switches to game screen
      setIsMyTurn(false);
    });

    // Listener for when the connection has an error
    conn.on("error", function (error) {
      setErrorState(true);
      setErrorMsg(error + "Connection error occurred. Please try again.");
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                  Update game board when user makes a move                  */
  /* -------------------------------------------------------------------------- */
  function setPiece(colPos) {
    // Enabled in situations where the player shouldn't be allowed to update the board
    if (gamestate === false) {
      return;
    }
    // Enabled when its not the player's turn
    if (isMyTurn === false) {
      return;
    }

    // Decide the piece's color value based on player state
    let value = playerColors[playerState - 1];

    // Create a copy of the current board state
    const newBoard = [...board];

    // When clicking on a column, start at the bottom-most row and check if its filled. If not, change the value and break the loop
    for (let r = rows - 1; r >= 0; r--)
      if (!newBoard[r][colPos]) {
        newBoard[r][colPos] = value;
        break;
      }

    // Update the board state with the new array
    setBoard(newBoard);

    // check for win conditions, if so playerHasWon to true
    if (checkBoardState(board, value)) {
      handlePlayerWin();
      peerConnection.send(
        {
          board: board,
          playerHasWon: true,
          winningPlayer: playerState,
        },
        (error) => {
          setErrorState(true);
          setErrorMsg(error + "Connection error occurred. Returning to lobby");
        }
      );
      return;
    }

    // check for tie conditions, if so set gameIsTied to true
    const nullCheck = board
      .flatMap((row) => row)
      .every((item) => item !== null);
    if (nullCheck) {
      setGamestate(false);
      setGameIsTied(true);
      peerConnection.send(
        {
          board: board,
          gameIsTied: true,
        },
        (error) => {
          setErrorState(true);
          setErrorMsg(error + "Connection error occurred. Returning to lobby");
        }
      );
      return;
    }

    // Switch to next player
    let nextPlayer = playerState === 1 ? 2 : 1;

    // Change to the color of the next player
    setPlayerState(nextPlayer);
    sendBoardData(board, nextPlayer);
  }

  /* -------------------------------------------------------------------------- */
  /*                     Send update game board data to peer                    */
  /* -------------------------------------------------------------------------- */
  function sendBoardData(board, nextPlayer) {
    // Disable this page's user from placing additonal pieces
    setIsMyTurn(false);

    /* ------------------------------- For Testing ------------------------------ */
    // console.log("heres the data we're sending");
    // console.log(board);
    // console.log("playerstate " + nextPlayer);
    // console.log("You are connected to...");
    // console.log(peerConnection);

    // Send the board and player state data to the peer
    peerConnection.send(
      {
        sentBoardData: true,
        board: board,
        playerState: nextPlayer,
        setYourTurn: true,
      },
      (error) => {
        setErrorState(true);
        setErrorMsg(error + "Connection error occurred. Returning to lobby");
      }
    );
  }

  /* -------------------------------------------------------------------------- */
  /*           Check for win condition (four same pieces side by side)          */
  /* -------------------------------------------------------------------------- */
  function checkBoardState(board, player) {
    // Check horizontal
    // Repeat for every row in the board
    for (let row = 0; row < board.length; row++) {
      // Repeat for every column, -4 is needed as it would be impossible to win horizontally starting from the 3rd column (or col[2])
      for (let col = 0; col <= board[row].length - 4; col++) {
        if (
          board[row][col] === player &&
          board[row][col + 1] === player &&
          board[row][col + 2] === player &&
          board[row][col + 3] === player
        ) {
          return true;
        }
      }
    }

    // Check vertical
    // Repeat for every column
    for (let col = 0; col < board[0].length; col++) {
      // Repeat for every row, -4 is needed as it would be impossible to win vertically due to not having enough spaces
      for (let row = 0; row <= board.length - 4; row++) {
        if (
          board[row][col] === player &&
          board[row + 1][col] === player &&
          board[row + 2][col] === player &&
          board[row + 3][col] === player
        ) {
          return true;
        }
      }
    }

    // Check diagonals
    for (let row = 0; row <= board.length - 4; row++) {
      for (let col = 0; col <= board[row].length - 4; col++) {
        // Check upward diagonal
        if (
          board[row][col] === player &&
          board[row + 1][col + 1] === player &&
          board[row + 2][col + 2] === player &&
          board[row + 3][col + 3] === player
        ) {
          return true;
        }

        // Check downward diagonal
        if (
          board[row][col + 3] === player &&
          board[row + 1][col + 2] === player &&
          board[row + 2][col + 1] === player &&
          board[row + 3][col] === player
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /* -------------------------------------------------------------------------- */
  /*                           Handle a player winning                          */
  /* -------------------------------------------------------------------------- */
  function handlePlayerWin() {
    setGamestate(false);
    setGameWin(true);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Reset Game                                 */
  /* -------------------------------------------------------------------------- */
  function resetGame() {
    // Reset Game board
    setGamestate(true);
    setGameWin(false);
    setGameIsTied(false);
    setIsMyTurn(false);
    setBoard(createEmptyBoard(rows, columns));

    peerConnection.send(
      {
        resetGame: true,
      },
      (error) => {
        setErrorState(true);
        setErrorMsg(error + "Connection error occurred. Returning to lobby");
      }
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                      Show that the message was copied.                     */
  /* -------------------------------------------------------------------------- */
  /* ---------- Used when users press the copy button for the user ID --------- */
  function copy() {
    // Target ID element
    let copyText = document.getElementById("userID");
    if (copyText.textContent === "null") {
      return;
    }

    // Copy the text inside the element
    navigator.clipboard.writeText(copyText.textContent);

    // Render "message copied", Remove message after a few seconds
    // Append text node to "copyBox" element if not already present
    let copyBox = document.getElementById("copyBox");
    if (!copyBox.querySelector(".code")) {
      let messageNode = document.createElement("span");
      messageNode.classList.add("code");
      messageNode.textContent = "Code copied";

      // Apply Tailwind CSS classes for positioning
      messageNode.classList.add(
        "absolute",
        "top-full",
        "right-0",
        "text-xs",
        "mt-1"
      );

      copyBox.appendChild(messageNode);

      setTimeout(() => {
        copyBox.removeChild(messageNode);
      }, 2000);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                   Clear errors after a user receives one                   */
  /* -------------------------------------------------------------------------- */
  function clearError() {
    setErrorMsg("");
    setErrorState(false);
    window.location.reload();
  }

  return (
    <main className="h-screen w-screen relative overflow-clip bg-[url('./assets/bg.jpg')] bg-repeat">
      {errorState && (
        <Alert
          errorMsg={errorMsg}
          buttonLabel={"OK"}
          buttonFunction={clearError}
        />
      )}
      {/* Game Lobby, the initial screen where players connect to other players */}
      {!showGame && (
        <GameLobby
          peerId={peerId}
          copy={copy}
          connect={connect}
          isConnectionLoading={isConnectionLoading}
        />
      )}
      {/* Game screen where players actually play the game */}
      {showGame && (
        <GameScreen
          isMyTurn={isMyTurn}
          playerState={playerState}
          board={board}
          setPiece={setPiece}
          gameWin={gameWin}
          gameIsTied={gameIsTied}
          playerColors={playerColors}
          resetGame={resetGame}
        />
      )}
    </main>
  );
}
