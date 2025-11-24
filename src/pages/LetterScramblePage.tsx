import { LetterScrambleGame } from '../components/LetterScrambleGame';

interface LetterScramblePageProps {
  onScore: (points: number) => void;
}

export default function LetterScramblePage({ onScore }: LetterScramblePageProps) {

  return <div className="mt-10 max-w-6xl mx-auto">
   <LetterScrambleGame onBack={() => {}} onScore={onScore} />;

  </div>
}