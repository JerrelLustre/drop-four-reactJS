import React, { useState, useEffect } from "react";
// Plugins
import Peer from "peerjs";
// Components
import Container from "../LayoutBlocks/Container/Container";
import Col from "../LayoutBlocks/Col/Col";
import Row from "../LayoutBlocks/Row/Row";
import Board from "../Board/Board";
import Wave from "../Wave/Wave";
import Alert from "../Alert/Alert";
import Button from "../Button/Button";
import GameLobby from "../GameLobby/GameLobby";
import GameScreen from "../GameScreen/GameScreen";

export default function Gameboard() {
  // Specify Board dimensions. Referred to by several functions that check the state of the board
  const rows = 7;
  const columns = 6;

  /* -------------------------------------------------------------------------- */
  /*                                  Hooks                                     */
  /* -------------------------------------------------------------------------- */
  // Specifies which player color to place down
  const [playerState, setPlayerState] = useState(1);
  // Specifies if the game is in play, disables player input
  const [gamestate, setGamestate] = useState(true);
  // Initializes an empty board
  const [board, setBoard] = useState(() => {
    // Specify row and column length for the board then make a 2D array for the board

    const emptyBoard = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        row.push(null);
      }
      emptyBoard.push(row);
    }

    return emptyBoard;
  });

  // Specifies if it is currently the user's turn
  const [isMyTurn, setIsMyTurn] = useState(true);
  // Switches between the lobby and game screen
  const [showGame, setShowGame] = useState(false);
  // Specifies if the game has been won
  const [gameWin, setGameWin] = useState(false);
  /* -------------------------------------------------------------------------- */
  /*                             Handle Connections                             */
  /* -------------------------------------------------------------------------- */
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
  const initialPeerId = generateRandomCode();
  const peer = new Peer(initialPeerId);
  // Render Peer ID
  useEffect(() => {
    peer.on("open", function (id) {
      setPeerId(id);
    });
  }, []);

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
  peer.on("connection", function (conn) {
    conn.on("data", function (data) {
      console.log("connection function running");
      console.log(data);

      // Runs when receiving board data
      if (data.sentBoardData === true) {
        console.log("received board data");
        setBoard(data.board);
        setPlayerState(data.playerState);
        setIsMyTurn(data.setYourTurn);
        return;
      }

      // Runs only on initial connection
      if (data.initialConnect === true) {
        console.log("initial connection setup");
        console.log("peer id received:");
        console.log(data.id);
        let conn = peer.connect(data.id);
        conn.on("open", function () {
          setPeerConnection(conn);
        });
        setShowGame(true);
        setAllowConnectionButton(false);
        return;
      }

      // Runs if the data says a player has won
      if (data.playerHasWon === true) {
        setBoard(data.board);
        setPlayerState(data.winningPlayer);
        handlePlayerWin();
        return;
      }

      // Runs if the data says a player has tied
      if (data.playersHaveTied === true) {
        // setgameIstied
      }

      return;
    });
  });

  /* -------------------------------------------------------------------------- */
  /*                  Connect to peer using inputted lobby code                 */
  /* -------------------------------------------------------------------------- */
  function connect() {
    // Once a connection has been established, prevent the button from being pushed
    if (!allowConnectionButton) {
      return;
    }
    let item = document.querySelector("#userIDInput");
    // Sanitize
    let sanitizedValue = item.value.trim(); // Remove leading and trailing spaces
    sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9]/g, ""); // Remove non-alphanumeric characters

    let conn = peer.connect(item.value);
    // Show spinner
    setIsConnectionLoading(true);
    // If connection cannot happen before the time finishes then throw an error
    let timeoutId = setTimeout(() => {
      setErrorState(true);
      setErrorMsg(
        "Connection timeout: Unable to establish connection. Please try again."
      );
      // Close the connection
      conn.close();
    }, 5000); // 5 seconds

    // Listener for when the connection has opened
    conn.on("open", function () {
      clearTimeout(timeoutId); // Clear the timeout
      setPeerConnection(conn); // Store connection data so we can send game data later
      setAllowConnectionButton(false); // Disable connection button when connection has been established
      conn.send({
        id: peerId,
        message: "connection established, This page is the host",
        initialConnect: true,
        setYourTurn: false,
        board: null,
        playerState: null,
      });
      setShowGame(true); //Switches to game screen
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
    if (gamestate === false) {
      console.log("gamestate is false");
      return;
    }
    if (isMyTurn === false) {
      console.log("not my turn");
      return;
    }

    // Decide the piece's color value based on player state
    // An array is used in order to easily reference and switch the color value using array indexes
    const playerColors = ["#FF5858", "#9DFF3B"];
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

    // check for win conditions, if so setgamestate to win
    if (checkBoardState(board, value)) {
      handlePlayerWin();
      peerConnection.send({
        board: board,
        playerHasWon: true,
        winningPlayer: playerState,
      });
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
  /*                      Show that the message was copied.                     */
  /* -------------------------------------------------------------------------- */
  /* ---------- Used when users press the copy button for the user ID --------- */
  function copy() {
    // Target ID element
    let copyText = document.getElementById("userID");
    if (copyText.textContent === "") {
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
        />
      )}
    </main>
  );
}
