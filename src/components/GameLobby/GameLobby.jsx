// Components
import React from "react";
import Container from "../LayoutBlocks/Container/Container";
import Row from "../LayoutBlocks/Row/Row";
import Col from "../LayoutBlocks/Col/Col";
import Button from "../Button/Button";
// Icons
import { FaRegCopy } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function GameLobby({
  peerId,
  copy,
  connect,
  isConnectionLoading,
})
 {
  return (
    <Container>
      <Row>
        <Col className={"justify-center items-center flex flex-col w-full "}>
          <div className="max-w-[25rem]">
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
                  To play with someone, send them your lobby code and have them
                  join with it.
                </p>
                <div id="copyBox" className="relative">
                  <div className="flex rounded-[0.25rem] w-full overflow-clip">
                    {peerId !== null ? (
                      <p
                        id="userID"
                        className="w-full text-base break-all text-[#868686] bg-[#f2f2f2] border-4 pl-2"
                      >
                        {peerId}
                      </p>
                    ) : (
                      <p className="w-full text-base break-all text-[#868686] bg-[#f2f2f2] border-4 pl-2">
                        <AiOutlineLoading3Quarters className="animate-spin inline" />{" "}
                        Generating lobby code...
                      </p>
                    )}
                    <button onClick={copy} className="bg-[#81ABFF] ">
                      <FaRegCopy className="fill-white w-[2.625rem] h-[2.625rem] p-1 " />
                    </button>
                  </div>
                </div>

                {/* End:Code Info */}
                <div className="font-seurat mt-8">
                  <p>Join Lobby Code</p>
                  <input
                    id="userIDInput"
                    name="codeJoin"
                    placeholder="Type Code Here to Join"
                    className="text-[#454545] border-4 border-buttonBg pl-2 w-full rounded-[0.125rem] mt-2 "
                  />
                </div>
              </div>
              {/* Join Button */}
              <div className="text-white text-base bg-infoBorder flex justify-center py-2 flex-col items-center">
                <Button label="Join" onClick={connect} />

                {isConnectionLoading && (
                  <p className="mt-2">
                    <AiOutlineLoading3Quarters className="animate-spin inline mr-2" />
                    Attempting to connect please wait a bit...
                  </p>
                )}
              </div>
              {/* End:Join Button */}
            </div>
            <p className="text-base text-center text-[#4D4D4D] font-seurat mt-10">
              Web App By Jerrel Lustre
            </p>
            <div className="text-center text-[#4D4D4D] font-seurat mt-10">
              <p>
                Having trouble connecting? This game runs on PeerJS and may run
                into issues if their server is down.
              </p>
              <p>
                You can check their status with this{" "}
                <a href="https://status.peerjs.com/" className="underline" target="_blank">
                  link
                </a>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
