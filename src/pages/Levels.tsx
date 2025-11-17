import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameMode from "@/components/GameMode";
import { getModeById } from "@/data/modes";

const Levels = () => {
  const navigate = useNavigate();
  const { modeId } = useParams();
  const mode = modeId ? getModeById(modeId) : undefined;

  useEffect(() => {
    if (!mode) {
      navigate("/modes", { replace: true });
    }
  }, [mode, navigate]);

  if (!mode) {
    return null;
  }

  return (
    <GameMode
      mode={mode.id}
      onBack={() => navigate("/modes")}
      onSelectLevel={(levelId) => navigate(`/play/${levelId}`)}
    />
  );
};

export default Levels;

