// Components
import Container from "../LayoutBlocks/Container/Container";
import Row from "../LayoutBlocks/Row/Row";
import Col from "../LayoutBlocks/Col/Col";
import Wave from "../Wave/Wave";
import Board from "../Board/Board";
import Button from "../Button/Button";

export default function GameScreen({
  isMyTurn,
  playerState,
  board,
  setPiece,
  gameWin,
  gameIsTied,
  playerColors,
  resetGame,
}) {
  return (
    <>
      {isMyTurn && <Wave />}
      <Container className={"relative z-10"}>
        <Row className={"justify-center"}>
          <Col className={"h-screen flex justify-center items-center flex-col"}>
            <div className="bg-white font-seurat text-xl w-full text-center rounded-[1.125rem] p-2 mb-10 mt-8">
              {gameWin === false & gameIsTied=== false ? (
                <p
                  style={{
                    color:
                      playerState === 1 ? "#FF5858" : "#42982D",
                  }}
                  className="px-2"
                >
                  {isMyTurn === true
                    ? "It's Your Turn"
                    : "Waiting for the other player to place their piece"}
                </p>
              ) : gameWin === true & gameIsTied=== false ? (
                <p>
                  <span
                    style={{
                      color: playerState === 1 ? "#FF5858" : "#42982D",
                    }}
                  >
                    Player {playerState}
                  </span>{" "}
                  Wins!
                </p>
              ) : null}
              {gameIsTied === true ? <p>Game is tied</p> : null}
            </div>
            <div className="flex flex-col justify-center items-center">
              <Board board={board} setPiece={setPiece} />
              {(gameWin || gameIsTied) && (
                <div className="mt-4">
                  <Button label={"Play Again"} onClick={resetGame} />
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
