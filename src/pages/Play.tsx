import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GamePlay from "@/components/GamePlay";
import { getLevelById } from "@/data/levels";

const Play = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const parsedLevel = levelId ? Number(levelId) : NaN;
  const level = Number.isNaN(parsedLevel) ? undefined : getLevelById(parsedLevel);

  useEffect(() => {
    if (!level) {
      navigate("/modes", { replace: true });
    }
  }, [level, navigate]);

  if (!level) {
    return null;
  }

  return <GamePlay levelId={level.id} onBack={() => navigate(`/levels/${level.mode}`)} />;
};

export default Play;

