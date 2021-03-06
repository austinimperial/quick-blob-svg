import React, { useState, useContext, useCallback, useEffect } from "react";
import { ScreenSizesContext } from "globalState/screenSizes/index";
import { ControlStateContext } from "globalState/controlState/index";
import { PointsContext } from "globalState/points/index";
export const ResponsivePointShiftContext = React.createContext();

function ResponsivePointShiftProvider({ children }) {
  // global state
  const { xxs, xs, sm, md, lg, xl, prevScreenSize } = useContext(
    ScreenSizesContext
  );
  const { setDownloadPrompt } = useContext(ControlStateContext);
  const { getBounds, points, setPoints } = useContext(PointsContext);

  // local state
  const [initialScreenSize, setInitialScreenSize] = useState(null);

  // shift values
  const shiftY = 90;
  const shiftX = 160;

  useEffect(() => {
    if (xxs || xs || sm) setInitialScreenSize("small");
  }, []);

  const getScreenChangeDirection = useCallback(() => {
    const prevIsBig = ["md", "lg", "xl"].includes(prevScreenSize);
    const prevIsSmall = ["xxs", "xs", "sm"].includes(prevScreenSize);
    const bigToSmall = (xxs || xs || sm) && prevIsBig;
    const smallToBig = (md || lg || xl) && prevIsSmall;
    return { bigToSmall, smallToBig };
  }, [prevScreenSize]);

  const shiftAwayFromOrigin = useCallback(() => {
    const { xMin, yMin } = getBounds(points);
    const newPoints = points.map(point => ({
      x: xMin < shiftX ? point.x + shiftX : point.x,
      y: yMin < shiftY ? point.y + shiftY : point.y
    }));
    return newPoints;
  }, [points]);

  const shiftTowardOrigin = useCallback(() => {
    const { xMin, yMin } = getBounds(points);
    const newPoints = points.map(point => ({
      x:
        xMin > shiftX && initialScreenSize === "small"
          ? point.x - shiftX
          : point.x,
      y:
        yMin > shiftY && initialScreenSize === "small"
          ? point.y - shiftY
          : point.y
    }));
    return newPoints;
  }, [points,getBounds]);

  useEffect(() => {
    const { smallToBig, bigToSmall } = getScreenChangeDirection();
    if (smallToBig) {
      setPoints(shiftAwayFromOrigin());
      setDownloadPrompt(false);
    }
    if (bigToSmall) setPoints(shiftTowardOrigin());
  }, [
    prevScreenSize,
    getBounds,
    getScreenChangeDirection,
    setDownloadPrompt,
    setPoints
  ]);

  return (
    <ResponsivePointShiftContext.Provider>
      {children}
    </ResponsivePointShiftContext.Provider>
  );
}

export default ResponsivePointShiftProvider;
