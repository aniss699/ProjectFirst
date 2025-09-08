
import { ProgressiveFlow } from '@/components/home/progressive-flow';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressiveFlow />
      </div>
    </div>
  );
}
