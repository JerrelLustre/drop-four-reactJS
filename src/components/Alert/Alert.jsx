import React from "react";

export default function Alert() {
  return (
    <div className="w-full bg-white rounded-[1.125rem] overflow-clip font-seurat ">
      {/* Header */}
      <div className="text-white text-base bg-infoBorder">
        <h2 className="text-center py-2">Send Code To Connect</h2>
      </div>
      {/* End:Header */}
      {/* Code Info */}
      <div className="py-8 mx-2 flex flex-col gap-2">
        <p className=" text-xs mb-2">
          To play with someone, send them your lobby code and have them join
          with it.
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
  );
}
