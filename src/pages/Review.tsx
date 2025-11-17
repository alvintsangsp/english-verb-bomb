import { useNavigate } from "react-router-dom";
import ReviewMode from "@/components/ReviewMode";

const Review = () => {
  const navigate = useNavigate();

  return <ReviewMode onBack={() => navigate("/")} />;
};

export default Review;

