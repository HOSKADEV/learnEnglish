import { FillBlankGame } from '../components/FillBlankGame';

interface FillBlankPageProps {
  onScore: (points: number) => void;
}

export default function FillBlankPage({ onScore }: FillBlankPageProps) {
  return <div className="mt-10 max-w-6xl mx-auto">
    <FillBlankGame onBack={() => {}} onScore={onScore} />;
    </div>
}