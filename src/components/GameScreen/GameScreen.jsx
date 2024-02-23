// Components
import Container from "../LayoutBlocks/Container/Container";
import Row from "../LayoutBlocks/Row/Row";
import Col from "../LayoutBlocks/Col/Col";
import Wave from "../Wave/Wave";
import Board from "../Board/Board";

export default function GameScreen({
  isMyTurn,
  playerState,
  board,
  setPiece,
  gameWin,
  playerColors,
}) {
  return (
    <>
      {isMyTurn && <Wave />}
      <Container className={"relative z-10"}>
        <Row className={"justify-center"}>
          <Col className={"h-screen flex justify-center items-center flex-col"}>
            <div className="bg-white font-seurat text-xl w-full text-center rounded-[1.125rem] py-2 mb-10 mt-8">
              {gameWin === false ? (
                <p
                  style={{
                    color:
                      playerState === 1 ? playerColors[0] : playerColors[1],
                  }}
                  className="px-2"
                >
                  {isMyTurn === true
                    ? "Its Your Turn"
                    : "Waiting for the other player to place their piece"}
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
  );
}
