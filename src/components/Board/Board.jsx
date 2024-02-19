import React from "react";

export default function Board({board,setPiece}) {
  return (
    <div id="board">
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
  );
}
