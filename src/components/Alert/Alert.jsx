import React from "react";
import Button from "../Button/Button";
import Container from "../LayoutBlocks/Container/Container";
import Row from "../LayoutBlocks/Row/Row";
import Col from "../LayoutBlocks/Col/Col";


export default function Alert({ errorMsg, buttonLabel, buttonFunction }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-40 flex justify-center items-center">
      <Container>
        <Row>
          <Col>
            <div className="w-full bg-white rounded-[1.125rem] overflow-clip font-seurat z-50">
              {/* Header */}
              <div className="text-white text-base bg-infoBorder">
                <h2 className="text-center py-2 px-4">Oops an error has occured</h2>
              </div>
              {/* End:Header */}
              {/* Code Info */}
              <div className="py-8 mx-2 flex flex-col gap-2">
                <p className="text-center">{errorMsg}</p>
              </div>
              {/* Join Button */}
              <div className="text-white text-base bg-infoBorder flex justify-center py-2">
                {buttonLabel && (
                  <Button label={buttonLabel} onClick={buttonFunction} />
                )}
              </div>
              {/* End:Join Button */}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
