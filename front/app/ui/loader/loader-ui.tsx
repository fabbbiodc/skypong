import { useEffect } from "react";

export default function Loader({ classes, message }) {
  return (
    <>
      <p className={classes}>{message}</p>
    </>
  );
}
