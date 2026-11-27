import { useState, type FormEvent } from 'react';
import type { Application } from '../../types/index.js';

interface ChecklistProps {
  application: Application;
  onUpdate: (updater: (app: Application) => Application) => void;
}

export default function Checklist({ application, onUpdate }: ChecklistProps) {
  const [text, setText] = useState('');

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    onUpdate((current) => ({
      ...current,
      checklist: [
        ...current.checklist,
        { id: crypto.randomUUID(), text: value, done: false },
      ],
    }));

    setText('');
  }

  function toggleItem(itemId: string) {
    onUpdate((current) => ({
      ...current,
      checklist: current.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }));
  }

  function removeItem(itemId: string) {
    onUpdate((current) => ({
      ...current,
      checklist: current.checklist.filter((item) => item.id !== itemId),
    }));
  }

  const doneCount = application.checklist.filter((item) => item.done).length;
  const total = application.checklist.length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <div className="checklist">
      <div className="checklist-heading">
        <strong>Checklist</strong>
        <span>{doneCount}/{total} selesai</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <form className="checklist-form" onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tambah item checklist..."
          aria-label="Item checklist baru"
        />
        <button type="submit">Tambah</button>
      </form>

      <ul className="checklist-items">
        {application.checklist.map((item) => (
          <li key={item.id} className={item.done ? 'checklist-item done' : 'checklist-item'}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.text}</span>
            </label>
            <button type="button" onClick={() => removeItem(item.id)} aria-label="Hapus item">
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
