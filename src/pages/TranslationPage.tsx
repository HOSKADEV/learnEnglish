import { TranslationGame } from '../components/TranslationGame';

interface TranslationPageProps {
  onScore: (points: number) => void;
}

export default function TranslationPage({ onScore }: TranslationPageProps) {

  return<div className="mt-10 max-w-6xl mx-auto">
   <TranslationGame onBack={() => {}} onScore={onScore} />;

  </div>
}