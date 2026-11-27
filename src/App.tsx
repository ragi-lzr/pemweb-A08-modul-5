import { useEffect, useRef, useState } from 'react';
import type { Application } from './types/index.js';
import { useApplications } from './hooks/useApplications.js';
import WarRoom from './components/pipeline/WarRoom.js';
import AddApplicationForm from './components/form/AddApplicationForm.js';
import SkillProfile from './components/explore/SkillProfile.js';
import JobExplorer from './components/explore/JobExplorer.js';
import ConflictBanner from './components/pipeline/ConflictBanner.js';
import UndoToast from './components/toast/UndoToast.js';
import StatsCards from './components/dashboard/StatsCards.js';
import OfferComparator from './components/dashboard/OfferComparator.js';
import ApplicationDetail from './components/detail/ApplicationDetail.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

type Tab = 'explore' | 'pipeline' | 'offers';

const tabs: { id: Tab; label: string }[] = [
  { id: 'explore', label: 'Eksplorasi Lowongan' },
  { id: 'pipeline', label: 'Pipeline Lamaran' },
  { id: 'offers', label: 'Bandingkan Offer' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<Application | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    applications,
    addApplication,
    updateApplication,
    removeApplication,
    restoreApplication,
    hasApplied,
  } = useApplications();

  const defaultSkills = ['React', 'TypeScript', 'CSS'];
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    'akm:kaptenSkills',
    defaultSkills
  );
  const [skillsDefaultsMigrated, setSkillsDefaultsMigrated] = useLocalStorage<boolean>(
    'akm:skills-defaults-migrated',
    false
  );

  // Migrasi sekali untuk pengguna lama yang sebelumnya menyimpan array kosong.
  useEffect(() => {
    if (!skillsDefaultsMigrated) {
      if (kaptenSkills.length === 0) setKaptenSkills(defaultSkills);
      setSkillsDefaultsMigrated(true);
    }
  }, [skillsDefaultsMigrated, kaptenSkills, setKaptenSkills, setSkillsDefaultsMigrated]);

  const offerCount = applications.filter((application) => application.status === 'OFFER').length;

  function handleDeleteApplication(id: string) {
    const removed = removeApplication(id);
    if (!removed) return;

    // Hanya satu undo yang aktif; hapus timer lama saat ada delete baru.
    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
    }

    setPendingUndo(removed);
    undoTimeoutRef.current = setTimeout(() => {
      setPendingUndo(null);
      undoTimeoutRef.current = null;
    }, 5000);
  }

  function handleUndo() {
    if (!pendingUndo) return;

    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    restoreApplication(pendingUndo);
    setPendingUndo(null);
  }

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current !== null) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const selectedApplication = applications.find((application) => application.id === selectedId);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">CAREER TRACKER</p>
          <h1>Aku Mw Magang</h1>
          <p className="subtitle">Satu tempat untuk mengelola perjalanan magangmu.</p>
        </div>

        <div className="summary-card">
          <span>Total lamaran</span>
          <strong>{applications.length}</strong>
          <small>{offerCount} offer</small>
        </div>
      </header>

      {/* Statistik dan banner bentrok tampil di atas semua tab. */}
      <StatsCards applications={applications} />
      <ConflictBanner applications={applications} />

      <nav className="tab-navigation" aria-label="Navigasi utama">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'pipeline' && <span className="tab-count">{applications.length}</span>}
            {tab.id === 'offers' && <span className="tab-count">{offerCount}</span>}
          </button>
        ))}
      </nav>

      <div className="app-actions-row">
        <p>Catat dan pantau setiap peluang magangmu.</p>
        <button type="button" className="primary-action" onClick={() => setIsAddFormOpen((open) => !open)}>
          {isAddFormOpen ? 'Tutup Form' : '+ Catat Lamaran'}
        </button>
      </div>

      {isAddFormOpen && (
        <AddApplicationForm
          onAdd={addApplication}
          hasApplied={hasApplied}
          onClose={() => setIsAddFormOpen(false)}
        />
      )}

      <section className="page-content">
        {activeTab === 'explore' && (
          <div className="explore-layout">
            <SkillProfile kaptenSkills={kaptenSkills} setKaptenSkills={setKaptenSkills} />
            <JobExplorer
              kaptenSkills={kaptenSkills}
              addApplication={addApplication}
              hasApplied={hasApplied}
            />
          </div>
        )}

        {activeTab === 'pipeline' && (
          <WarRoom
            applications={applications}
            kaptenSkills={kaptenSkills}
            onSelectApplication={setSelectedId}
            onUpdateApplication={updateApplication}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeTab === 'offers' && (
          <OfferComparator
            applications={applications}
            kaptenSkills={kaptenSkills}
          />
        )}
      </section>

      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          kaptenSkills={kaptenSkills}
          onUpdateApplication={updateApplication}
          onClose={() => setSelectedId(null)}
        />
      )}

      {pendingUndo && (
        <UndoToast company={pendingUndo.company} onUndo={handleUndo} />
      )}
    </main>
  );
}
