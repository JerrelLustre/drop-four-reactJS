import React from "react";

export default function Board({ board, setPiece }) {
  return (
    <div id="board" className="bg-boardBg rounded-3xl py-6 px-3 ">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} rowpos={rowIndex} className="flex w-full my-2">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className="border-4 rounded-full overflow-clip mx-1"
            >
              <div
                key={colIndex}
                colpos={colIndex}
                value={cell}
                style={
                  cell !== null
                    ? { backgroundColor: cell, pointerEvents: "none" }
                    : { backgroundColor: "#f2f2f2" }
                }
                className="  p-3 md:p-4 lg:p-6 xl:p-6 2xl:p-8  cursor-pointer"
                onClick={() => setPiece(colIndex, rowIndex)}
              ></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
