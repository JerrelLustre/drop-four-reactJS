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
// Icons
import { FaRegCopy } from "react-icons/fa6";

export default function Gameboard() {
  const [isMyTurn, setIsMyTurn] = useState(true);
  // Handle Connections
  const [peerId, setPeerId] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [allowConnectionButton, setAllowConnectionButton] = useState(true);

  const [showGame, setShowGame] = useState(false);
  const [gameWin, setGameWin] = useState(false);

  const peer = new Peer();
  // Render Peer ID
  useEffect(() => {
    peer.on("open", function (id) {
      setPeerId(id);
    });
  }, []);

  // Handle data received from peer
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

      // Runs if the data say a player has tied
      if (data.playersHaveTied === true) {
        // setgameIstied
      }

      return;
    });
  });

  function connect() {
    if (!allowConnectionButton) {
      return;
    }
    let item = document.querySelector("#userIDInput");
    console.log(item.value);
    let conn = peer.connect(item.value);
    // on open will be launch when you successfully connect to PeerServer
    conn.on("open", function () {
      setPeerConnection(conn);
      setAllowConnectionButton(false);
      conn.send({
        id: peerId,
        message: "connection established, This page is the host",
        initialConnect: true,
        setYourTurn: false,
        board: null,
        playerState: null,
      });
      setShowGame(true);
      console.log("Connection established");
    });
  }

  function sendMessage() {
    peerConnection.send("Message sent");
  }

  // Handle Game logic
  // Specify Board dimensions
  const rows = 7;
  const columns = 6;
  // Hooks
  const [playerState, setPlayerState] = useState(1);
  const [gamestate, setGamestate] = useState(true);
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
    // Issue: the peer that starts the connection with the connection function is unable to recieve board data.
    // Switch to next player
    let nextPlayer = playerState === 1 ? 2 : 1;

    setPlayerState(nextPlayer);
    sendBoardData(board, nextPlayer);
  }

  function sendBoardData(board, nextPlayer) {
    // Disable this page's user from placing additonal pieces
    setIsMyTurn(false);
    // Send the board and player state data to the peer
    console.log("heres the data we're sending");
    console.log(board);
    console.log("playerstate " + nextPlayer);
    // The issue is that one of the players connects to the wrong player id
    console.log("You are connected to...");
    console.log(peerConnection);
    peerConnection.send(
      {
        sentBoardData: true,
        board: board,
        playerState: nextPlayer,
        setYourTurn: true,
      },
      (error) => {
        if (error) {
          console.error("Failed to send data:", error);
          // Handle the error here, such as displaying an error message to the user
        }
      }
    );
  }

  function handlePlayerWin() {
    setGamestate(false);
    setGameWin(true);
    console.log("player " + playerState + " wins!");
  }

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

  function copy() {
    // Target ID element
    let copyText = document.getElementById("userID");
    if (copyText.textContent === "") {
      return;
    }

    // Copy the text inside the element
    navigator.clipboard.writeText(copyText.textContent);
    window.alert("Code Copied");
  }

  return (
    <main className="h-screen w-screen relative overflow-clip bg-[url('./assets/bg.jpg')] bg-repeat">
      {!showGame && (
        <Container>
          <Row>
            <Col
              className={"justify-center items-center flex flex-col w-full "}
            >
              <div className="lg:max-w-[25rem]">
                <div className="bg-white font-seurat text-xl w-full text-center rounded-[1.125rem] py-2 mb-10 mt-8">
                  <h1>
                    Welcome To <span className="text-red">Drop</span>{" "}
                    <span className="text-darkGreen">Four</span>
                  </h1>
                </div>
                <div className="w-full bg-white rounded-[1.125rem] overflow-clip font-seurat ">
                  {/* Header */}
                  <div className="text-white text-base bg-infoBorder">
                    <h2 className="text-center py-2">Send Code To Connect</h2>
                  </div>
                  {/* End:Header */}
                  {/* Code Info */}
                  <div className="py-8 mx-2 flex flex-col gap-2">
                    <p className=" text-xs mb-2">
                      To play with someone, send them your lobby code and have
                      them join with it.
                    </p>
                    <div className="flex rounded-[0.25rem] w-full overflow-clip mb-8">
                      <p
                        id="userID"
                        className="w-full text-base break-all text-[#868686] bg-[#f2f2f2] border-4 pl-2"
                      >
                        {peerId}
                      </p>
                      <button onClick={copy} className="bg-[#81ABFF] ">
                        <FaRegCopy className="fill-white w-[2.625rem] h-[2.625rem] p-1 " />
                      </button>
                    </div>
                    {/* End:Code Info */}
                    <div className="font-seurat">
                      <label htmlFor="codeJoin" className="">
                        Join Lobby Code
                      </label>
                      <input
                        id="userIDInput"
                        name="codeJoin"
                        placeholder="Type Code Here to Join"
                        className="text-[#454545] border-4 border-buttonBg pl-2 w-full rounded-[0.125rem] mt-2 "
                      />
                    </div>
                  </div>
                  {/* Join Button */}
                  <div className="text-white text-base bg-infoBorder flex justify-center py-2">
                    <button
                      className="font-seurat text-base text-white bg-buttonBg border-b-2 border-b-buttonStroke px-5 py-2 rounded-[0.5rem]"
                      onClick={connect}
                    >
                      Join
                    </button>
                  </div>
                  {/* End:Join Button */}
                </div>
                <p className="text-base text-center text-[#4D4D4D] font-seurat mt-10">
                  Web App By Jerrel Lustre
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      )}
      {showGame && (
        <>
          {isMyTurn && <Wave />}
          {/* {GameWin && <Alert/>} */}
          <Container className={"relative z-10"}>
            <Row className={"justify-center"}>
              <Col className={"h-screen flex justify-center flex-col"}>
                <div className="bg-white font-seurat text-xl w-full text-center rounded-[1.125rem] py-2 mb-10 mt-8">
                  {gameWin === false ? (
                    <p>
                      It is
                      <span
                        style={{
                          color: playerState === 1 ? "#FF5858" : "#9DFF3B",
                        }}
                      >
                        {" "}
                        Player {playerState}'s{" "}
                      </span>
                      turn
                    </p>
                  ) : (
                    <p>
                      <span
                        style={{
                          color: playerState === 1 ? "#FF5858" : "#9DFF3B",
                        }}
                      >
                        Player {playerState}
                      </span>{" "}
                      Wins!
                    </p>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <Board board={board} setPiece={setPiece} />
                </div>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </main>
  );
}
