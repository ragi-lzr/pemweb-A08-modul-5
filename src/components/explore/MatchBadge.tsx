import { matchLevel } from '../../utils/skillMatch.js';

export default function MatchBadge({ score }: { score: number }) {
  // ≥70 hijau, 40–69 kuning, <40 merah (lihat matchLevel)
  return <span className={`match-badge match-badge-${matchLevel(score)}`}>Match {score}%</span>;
}
