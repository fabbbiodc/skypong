import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/canvas", { replace: true });
  }, [navigate]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#1a1a2e",
      color: "white",
      fontSize: "18px",
    }}>
      <p>Redirecting to game...</p>
    </div>
  );
};

export default StartPage;
