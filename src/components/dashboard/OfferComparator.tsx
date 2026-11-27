import './dashboard.css';
import { useMemo, useState } from 'react';
import type { Application } from '../../types/index.js';
import { calcOfferScore, getMatchScore } from '../../utils/offerScore.js';
import { calcSkillMatch } from '../../utils/skillMatch.js';

interface OfferComparatorProps {
  applications: Application[];
  kaptenSkills: string[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OfferComparator({
  applications,
  kaptenSkills,
}: OfferComparatorProps) {
  const offers = useMemo(
    () => applications.filter((app) => app.status === 'OFFER'),
    [applications]
  );

  const [selectedAId, setSelectedAId] = useState<string>(
    offers[0]?.id ?? ''
  );
  const [selectedBId, setSelectedBId] = useState<string>(
    offers[1]?.id ?? ''
  );

  if (offers.length < 2) {
    return (
      <div className="offer-empty">
        <h2>Bandingkan Offer</h2>
        <p>Butuh minimal 2 offer untuk dibandingkan.</p>
      </div>
    );
  }

  const offerA =
    offers.find((offer) => offer.id === selectedAId) ?? offers[0];
  const offerB =
    offers.find((offer) => offer.id === selectedBId) ?? offers[1];

  if (!offerA || !offerB) return null;

  const maxSalary = Math.max(offerA.salaryOffer ?? 0, offerB.salaryOffer ?? 0);
  const matchA = getMatchScore(offerA, kaptenSkills);
  const matchB = getMatchScore(offerB, kaptenSkills);

  const scoreA = calcOfferScore(offerA, maxSalary, matchA);
  const scoreB = calcOfferScore(offerB, maxSalary, matchB);

  const isTie = scoreA.total === scoreB.total;

  function matchesFor(offer: Application) {
    const result = calcSkillMatch(kaptenSkills, offer.requiredSkills);
    return `${result.score}% (${result.matched.length} dari ${offer.requiredSkills.length} skill)`;
  }

  return (
    <section className="offer-comparator">
      <div className="offer-heading">
        <div>
          <p className="offer-eyebrow">OFFER COMPARATOR</p>
          <h2>Bandingkan Offer</h2>
        </div>
      </div>

      <div className="offer-selectors">
        <label>
          Offer A
          <select
            value={offerA.id}
            onChange={(event) => setSelectedAId(event.target.value)}
          >
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id} disabled={offer.id === offerB.id}>
                {offer.company} — {offer.role}
              </option>
            ))}
          </select>
        </label>

        <label>
          Offer B
          <select
            value={offerB.id}
            onChange={(event) => setSelectedBId(event.target.value)}
          >
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id} disabled={offer.id === offerA.id}>
                {offer.company} — {offer.role}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="offer-grid">
        <div className="offer-column">
          <h3>{offerA.company}</h3>
          {!isTie && scoreA.total > scoreB.total && (
            <span className="offer-badge">Rekomendasi Terbaik</span>
          )}
          <table className="offer-table">
            <tbody>
              <tr>
                <th>Uang Saku/Bulan</th>
                <td>{formatRupiah(offerA.salaryOffer ?? 0)}</td>
                <td>{scoreA.salary} / 50</td>
              </tr>
              <tr>
                <th>Mode Kerja</th>
                <td>{offerA.workMode}</td>
                <td>{scoreA.mode} / 25</td>
              </tr>
              <tr>
                <th>Kecocokan Skill</th>
                <td>{matchesFor(offerA)}</td>
                <td>{scoreA.skill} / 25</td>
              </tr>
              <tr className="offer-total-row">
                <th>Total</th>
                <td colSpan={2}>{scoreA.total.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="offer-column">
          <h3>{offerB.company}</h3>
          {!isTie && scoreB.total > scoreA.total && (
            <span className="offer-badge">Rekomendasi Terbaik</span>
          )}
          <table className="offer-table">
            <tbody>
              <tr>
                <th>Uang Saku/Bulan</th>
                <td>{formatRupiah(offerB.salaryOffer ?? 0)}</td>
                <td>{scoreB.salary} / 50</td>
              </tr>
              <tr>
                <th>Mode Kerja</th>
                <td>{offerB.workMode}</td>
                <td>{scoreB.mode} / 25</td>
              </tr>
              <tr>
                <th>Kecocokan Skill</th>
                <td>{matchesFor(offerB)}</td>
                <td>{scoreB.skill} / 25</td>
              </tr>
              <tr className="offer-total-row">
                <th>Total</th>
                <td colSpan={2}>{scoreB.total.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {isTie && <p className="offer-tie">Seri</p>}
    </section>
  );
}


