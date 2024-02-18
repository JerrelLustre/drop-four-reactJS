import React, { useState } from "react";

// Components
import Container from "../LayoutBlocks/Container/Container";
import Col from "../LayoutBlocks/Col/Col";
import Row from "../LayoutBlocks/Row/Row";

export default function Gameboard() {
  const [playerState, setPlayerState] = useState(1);
  const [gamestate,setGamestate] = useState(true);
  // Specify row and column length for the board then make a 2D array for the board
  const rows = 7;
  const columns = 6;
  const emptyBoard = [];

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push(null);
    }
    emptyBoard.push(row);
  }

  const [board, setBoard] = useState(emptyBoard);

  console.log(board);

  function setPiece(colPos, rowPos) {
    if(gamestate === false){
        return
    }
    console.log("This cell is in column " + colPos + " and row " + rowPos);

    const player1Color = "red";
    const player2Color = "blue";
    let value = "";
    if (playerState === 1) {
      value = player1Color;
    } else {
      value = player2Color;
    }
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
    if(checkBoardState(board,value)){
        console.log('yippee');
        handlePlayerWin();
        return
    }
    if (playerState === 1) {
        setPlayerState(2);
      } else {
        setPlayerState(1);
      }
  }

  function handlePlayerWin(){
    setGamestate(false)
    console.log('player ' + playerState +' wins!')
  }

  function checkBoardState(board,player){

    // Check horizontal
    for (let row = 0; row < board.length; row++) {
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
    for (let col = 0; col < board[0].length; col++) {
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
            <div><p className="text-black">It is player {playerState}'s turn</p></div>
            <div className="flex flex-col h-screen justify-center">
              <div id="board">
                {/* {boardSpaces.map((space, index) => (
                  <div
                    id={'cell'+ index}
                    isFilled={false}
                    key={index}
                    onClick={() => setPiece(index)}
                    className="border-4 aspect-square border-green-400 p-8 cursor-pointer"
                  ></div>
                ))} */}
                {board.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    rowpos={rowIndex}
                    className="flex border-4 border-green-500 w-full"
                  >
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        colpos={colIndex}
                        value={cell}
                        style={
                          cell !== null
                            ? { backgroundColor: cell, pointerEvents: "none" }
                            : {}
                        }
                        className="border-2 border-white p-8 cursor-pointer"
                        onClick={() => setPiece(colIndex, rowIndex)}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
