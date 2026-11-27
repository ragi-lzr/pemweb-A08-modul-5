import { useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown.js';
import { INTERVIEW_QUESTIONS } from './interviewQuestions.js';

const QUESTION_SECONDS = 120;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function InterviewPrep() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const { seconds, isRunning, start, pause, reset } =
    useCountdown(QUESTION_SECONDS);

  function goToNext() {
    setQuestionIndex((index) => (index + 1) % INTERVIEW_QUESTIONS.length);
    reset(QUESTION_SECONDS);
  }

  return (
    <div className="interview-prep">
      <div className="interview-prep-heading">
        <strong>Latihan Interview</strong>
        <span>
          Soal {questionIndex + 1} / {INTERVIEW_QUESTIONS.length}
        </span>
      </div>

      <div className="interview-timer">{formatTime(seconds)}</div>

      <p className="interview-question">{INTERVIEW_QUESTIONS[questionIndex]}</p>

      <div className="interview-actions">
        {!isRunning ? (
          <button type="button" onClick={start} disabled={seconds === 0}>
            Start
          </button>
        ) : (
          <button type="button" onClick={pause}>
            Pause
          </button>
        )}
        <button type="button" onClick={() => reset(QUESTION_SECONDS)}>
          Reset
        </button>
        <button type="button" onClick={goToNext}>
          Soal Berikutnya
        </button>
      </div>
    </div>
  );
}
