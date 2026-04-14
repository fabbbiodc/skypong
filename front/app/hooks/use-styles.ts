"use client";

import { useState, useEffect } from "react";
import SelectStyles from "../lib/mobiledetection/detectMobile";

export const useStyles = (mobileStyles: any, desktopStyles: any) => {
  const [styles, setStyles] = useState(mobileStyles);

  useEffect(() => {
    // Al montar el componente, leemos el locale actual
    setStyles(SelectStyles(mobileStyles, desktopStyles));
  }, []);

  return { styles };
};
