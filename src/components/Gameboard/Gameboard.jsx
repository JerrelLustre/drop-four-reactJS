import React, { useState, useEffect } from "react";
// Plugins
import Peer from "peerjs";
// Components
import Container from "../LayoutBlocks/Container/Container";
import Col from "../LayoutBlocks/Col/Col";
import Row from "../LayoutBlocks/Row/Row";
import Board from "../Board/Board";

export default function Gameboard() {
  const [isMyTurn, setIsMyTurn] = useState(true);
  // Handle Connections
  const [peerId, setPeerId] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [allowConnection, setAllowConnection] = useState(true);

  const peer = new Peer();
  // Render Peer ID
  useEffect(() => {
    peer.on("open", function (id) {
      setPeerId(id);
    });
  }, []);

  // Runs on initial start, makes sure that the second player is unable to set a piece
  peer.on("connection", function (conn) {
    conn.on("data", function (data) {
      console.log("connection function running");
      console.log(data);

      // Runs only on initial connection
      if (data.initialConnect === true){
        console.log('initial connection setup')
        console.log("peer id received:");
        console.log(data.id);
        let conn = peer.connect(data.id);
        conn.on("open", function () {
          setPeerConnection(conn);
        });
      }

            // Runs when receiving boar data
      if (data.sentBoardData === true) {
        console.log('received board data')
        setBoard(data.board);
        setPlayerState(data.playerState);
        setIsMyTurn(data.setYourTurn);
      }

      // Initial connection
      // if (data.setYourTurn !== undefined) {
      //   console.log(data)
      //   console.log('peer id received:')
      //   console.log(data.id)
      //   let conn = peer.connect(data.id);
      //   console.log(conn)
      //   setPeerConnection(conn);
      //   console.log('connected to...')
      //   console.log(peerConnection)
      //   setAllowConnection(false);

      //   console.log(data.message);
      //   setIsMyTurn(data.setYourTurn);
      //   conn.send({
      //     message: "Hello connector",
      //   });
      // }

      // Receiving data when board updates
      // if (data.board !== null && data.playerState !== null) {
      //   // console.log("data received ");
      //   // console.log(data);
      //   setBoard(data.board);
      //   setPlayerState(data.playerState);
      //   setIsMyTurn(data.setYourTurn);
      // }

      return;
    });
  });

  function connect() {
    if (!allowConnection) {
      return;
    }
    let item = document.querySelector("#userID");
    console.log(item.value);
    let conn = peer.connect(item.value);
    // on open will be launch when you successfully connect to PeerServer
    conn.on("open", function () {
      setPeerConnection(conn);
      setAllowConnection(false);
      conn.send({
        id: peerId,
        message: "connection established, This page is the host",
        initialConnect: true,
        setYourTurn: false,
        board: null,
        playerState: null,
      });

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
    const playerColors = ["red", "blue"];
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

  return (
    <>
      <Container>
        <Row className={"justify-center"}>
          <Col className={"bg-red-400 text-red-500"}>
            <input type="text" id="userID" />
            <p>{peerId}</p>
            <button onClick={connect}>Connect to this id</button>
            <button onClick={sendMessage}>send message</button>
            <div>
              <p className="text-black">It is player {playerState}'s turn</p>
            </div>
            <div className="flex flex-col h-screen justify-center">
              <Board board={board} setPiece={setPiece} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
