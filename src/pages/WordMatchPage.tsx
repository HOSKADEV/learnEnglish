import { WordMatchGame } from '../components/WordMatchGame';

interface WordMatchPageProps {
  onScore: (points: number) => void;
}

export default function WordMatchPage({ onScore }: WordMatchPageProps) {

  return  <div className="mt-10 max-w-6xl mx-auto">
   <WordMatchGame className="mt-10" onBack={() => {}} onScore={onScore} />;

  </div>
}