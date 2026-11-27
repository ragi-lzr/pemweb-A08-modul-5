import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';

interface SkillProfileProps {
  kaptenSkills: string[];
  setKaptenSkills: Dispatch<SetStateAction<string[]>>; // dari useLocalStorage di App → otomatis persist
}

export default function SkillProfile({ kaptenSkills, setKaptenSkills }: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState('');
  const [message, setMessage] = useState('');

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const skill = newSkill.trim();

    if (!skill) {
      setMessage('Skill tidak boleh kosong.');
      return;
    }

    const exists = kaptenSkills.some((item) => item.toLowerCase() === skill.toLowerCase());
    if (exists) {
      setMessage(`Skill "${skill}" sudah ada di profil.`);
      return;
    }

    // Immutable: bikin array baru pakai spread, bukan .push()
    setKaptenSkills((prev) => [...prev, skill]);
    setNewSkill('');
    setMessage('');
  }

  function handleRemove(skill: string) {
    // Immutable: filter menghasilkan array baru tanpa skill tsb
    setKaptenSkills((prev) => prev.filter((item) => item !== skill));
  }

  return (
    <section className="explore-panel skill-profile">
      <div className="explore-panel-heading">
        <h2>Profil Skill Kapten</h2>
        <p>Skill ini dipakai untuk menghitung Match % setiap lowongan.</p>
      </div>

      <ul className="skill-chip-list">
        {kaptenSkills.length === 0 && <li className="skill-empty">Belum ada skill.</li>}
        {kaptenSkills.map((skill) => (
          <li key={skill} className="skill-chip">
            {skill}
            <button type="button" onClick={() => handleRemove(skill)} aria-label={`Hapus skill ${skill}`}>
              ×
            </button>
          </li>
        ))}
      </ul>

      <form className="skill-add-form" onSubmit={handleAdd}>
        <input
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          placeholder="Tambah skill, mis. Docker"
          aria-label="Skill baru"
        />
        <button type="submit" className="primary-action">Tambah</button>
      </form>
      {message && <p className="explore-error-text" role="alert">{message}</p>}
    </section>
  );
}
