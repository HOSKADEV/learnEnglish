import { AudioListenGame } from "../components/AudioListenGame";

interface AudioListenPageProps {
  onScore: (points: number) => void;
}

export default function  AudioListenGamePage({ onScore }: AudioListenPageProps) {
  return (
    <div className="mt-10 max-w-6xl mx-auto">
      <AudioListenGame
        onBack={() => {}}
        onScore={onScore}
      />
    </div>
  );
}
