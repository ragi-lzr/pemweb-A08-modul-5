interface UndoToastProps {
  company: string;
  onUndo: () => void;
}

export default function UndoToast({ company, onUndo }: UndoToastProps) {
  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span>Lamaran {company} dihapus</span>
      <button type="button" onClick={onUndo}>Undo</button>
      <span className="undo-toast-time">(5 detik)</span>
    </div>
  );
}
