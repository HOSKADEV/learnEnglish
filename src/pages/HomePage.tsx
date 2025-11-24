import { useNavigate } from 'react-router-dom';
import { GameMenu } from '../components/GameMenu';
import { ScoreBoard } from '../components/ScoreBoard';

interface HomePageProps {
  scores: {
    wordMatch: number;
    fillBlank: number;
    translation: number;
    letterScramble: number;
  };
}

export default function HomePage({ scores }: HomePageProps) {
  const navigate = useNavigate();

  const handleSelectGame = (game: string) => {
    const routes: Record<string, string> = {
      wordMatch: '/word-match',
      fillBlank: '/fill-blank',
      translation: '/translation',
      letterScramble: '/letter-scramble',
    };
    navigate(routes[game]);
  };

  return (
    <>
      <div className="mb-8">
        <ScoreBoard scores={scores} />
      </div>
      <GameMenu onSelectGame={handleSelectGame} />
    </>
  );
}