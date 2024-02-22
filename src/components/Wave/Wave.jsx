import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import wave from "../../assets/wave.svg";

const WaveElement = ({ id, direction }) => (
  <div id={id} className={`absolute w-full bg-cover ${direction} flex`}>
    <img
      style={{ maxWidth: "unset" }}
      className="inline-block w-full flex-shrink-0 "
      src={wave}
      aria-hidden="true"
    />
    <img
      style={{ maxWidth: "unset" }}
      className="inline-block w-full flex-shrink-0 -ml-[4px]"
      src={wave}
      aria-hidden="true"
    />
  </div>
);

export default function Wave() {
  const container = useRef();

  useGSAP(() => {
    let timeline = gsap.timeline({ repeat: -1 });

    timeline.to("#wave1", { x: "100%", duration: 2.8, ease: "linear" }, "start");
    timeline.to("#wave2", { x: "-100%", duration: 2.8, ease: "linear" }, "start");
  }, { scope: container });

  return (
    <div className="absolute w-screen h-screen">
      <div className="relative h-full w-full" ref={container}>
        <WaveElement id="wave1" direction="-top-[5%] sm:-top-[10%] lg:-top-[15%]  xl:-top-[20%] 2xl:-top-[18%]  rotate-180" />
        <WaveElement id="wave2" direction="-bottom-[5%] sm:-bottom-[10%] lg:-bottom-[15%] xl:-bottom-[20%] 2xl:-bottom-[18%]  " />
      </div>
    </div>
  );
}
