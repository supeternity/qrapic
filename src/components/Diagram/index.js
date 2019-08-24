import React, { useState, useEffect, useLayoutEffect } from "react";

function Diagram() {
  const [layout, setLayout] = useState({
    ref: React.createRef(),
    viewport: null,
    width: 0,
    height: 0,
    zoom: 1,

  });
  useEffect(() => {
    const resizeHandler = () => {
      if (layout.ref.current) {
        const set = Object.assign({}, layout);
        set.width = layout.ref.current.clientWidth;
        set.height = layout.ref.current.clientHeight;
        setLayout(set);
      }
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  });
  useLayoutEffect(() => {
    if (!layout.viewport && layout.ref.current) {
      const set = Object.assign({}, layout);
      set.width = layout.ref.current.clientWidth;
      set.height = layout.ref.current.clientHeight;
      set.viewport = `0 0 ${set.width} ${set.height}`;
      setLayout(set);
    }
  }, [layout]);

  const Drawer = () => {
    const [draw, tick] = useState({
      stamp: {
        start: Date.now(),
        milliseconds: 0,
        seconds: 0,
        minutes: 0
      },
      path: {
        x: 0,
        red: {
          awl: "M 0 0 ", // Schilo
          y: 0,
          x: null
        }
      },
      viewBox: 0,
      viewShift: `translate(0, 0)`
    });
    useEffect(() => {
      const frame = () => {
        const buffer = Object.create(draw);
        // or bad perfomance? .. = deepFreeze(Object.create(draw)); (from ../utils)
        buffer.stamp.milliseconds = Math.abs(buffer.stamp.start - Date.now());
        buffer.stamp.seconds = Math.floor(buffer.stamp.milliseconds / 1000);
        buffer.stamp.minutes = Math.floor((buffer.stamp.milliseconds / 1000 / 60) << 0);
        buffer.path.x = buffer.stamp.milliseconds / 100;
        buffer.path.red.y = Math.cos(buffer.path.x) * 10;
        buffer.path.red.awl += `L ${layout.width + buffer.path.x} ${draw.path.red.y} M ${layout.width + buffer.path.x} ${draw.path.red.y} `;
        buffer.viewBox = `${buffer.path.x} 0 ${buffer.path.x + layout.width} ${layout.height}`;
        buffer.viewShift = `translate(${-buffer.path.x}, 0)`
        tick(buffer);
      };
      const RAF = requestAnimationFrame(frame);
      return () => {
        window.cancelAnimationFrame(RAF);
      };
    });
    return (
      <>
        <>
          <text x="0" y="40">
            debug drawer:
          </text>
          <text x="150" y="40">
            init: {draw.stamp.start}
          </text>
          <text x="350" y="40">
            {draw.stamp.milliseconds}
          </text>
          <text x="580" y="40">
            {draw.stamp.minutes}m /{draw.stamp.seconds}s
          </text>
        </>
        <svg
          // viewBox={draw.viewBox ? draw.viewBox : "0 0 0 0"}
          style={{
            fill: 'gray',
            width: layout.width ? layout.width : "100%",
            height: layout.height ? layout.height : "100%"
          }}>
          <path
            transform={draw.viewShift}
            style={{ stroke: 'white', strokeWidth: 1 }} name="red" d={draw.path.red.awl} />
        </svg>
      </>
    );
  };

  return (
    <>
      <p>debug viewport:</p>
      <p>width: {layout.width}</p>
      <p>height: {layout.height}</p>
      <div style={{ width: "100%", height: "640px" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          ref={layout.ref}
          viewport={layout.viewport ? layout.viewport : ""}
          style={{
            width: layout.width ? layout.width : "100%",
            height: layout.height ? layout.height : "100%"
          }}
        >
          {layout.ref.current ? (
            <>
              <text x="0" y="13" width="70" height="40">
                Дemos React Component
                August 2019
                MIT License
              </text>
              <Drawer />
            </>
          ) : (
            <>
              <text x="40" y="60" width="70" height="40">
                init viewport
              </text>
            </>
          )}
        </svg>
      </div>
    </>
  );
}

export default Diagram;
