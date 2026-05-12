import { useEffect, useLayoutEffect, useState } from 'react';
import type { RunState, SaveState } from '../game/types';
import { tutorialSteps } from './tutorialSteps';

interface CoachmarkProps {
  run: RunState;
  save: SaveState;
  onComplete: () => void;
}

interface Anchor {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function Coachmark({ run, save, onComplete }: CoachmarkProps) {
  const [active, setActive] = useState(() => !save.hasCompletedTutorial);
  const [stepIndex, setStepIndex] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const step = active ? tutorialSteps[stepIndex] : undefined;

  useLayoutEffect(() => {
    if (!step) {
      setAnchor(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const target = document.querySelector(step.target);
      if (!target) {
        setAnchor(null);
        frame = window.requestAnimationFrame(measure);
        return;
      }
      const rect = target.getBoundingClientRect();
      setAnchor({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };
    measure();

    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [step, run.day, run.activeEvent, run.weekResult]);

  useEffect(() => {
    if (!step || !step.autoAdvance || !step.isComplete) return;
    if (step.isComplete(run)) {
      advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, step]);

  function advance() {
    if (stepIndex >= tutorialSteps.length - 1) {
      finish();
      return;
    }
    setStepIndex((index) => index + 1);
  }

  function finish() {
    setActive(false);
    onComplete();
  }

  if (!active || !step) return null;

  const placement = step.placement;
  const margin = 12;
  const tooltipStyle: React.CSSProperties = {};
  if (anchor) {
    switch (placement) {
      case 'bottom':
        tooltipStyle.top = anchor.top + anchor.height + margin;
        tooltipStyle.left = Math.max(margin, Math.min(window.innerWidth - 360 - margin, anchor.left));
        break;
      case 'top':
        tooltipStyle.top = Math.max(margin, anchor.top - margin - 160);
        tooltipStyle.left = Math.max(margin, Math.min(window.innerWidth - 360 - margin, anchor.left));
        break;
      case 'left':
        tooltipStyle.top = Math.max(margin, anchor.top);
        tooltipStyle.left = Math.max(margin, anchor.left - 360 - margin);
        break;
      case 'right':
        tooltipStyle.top = Math.max(margin, anchor.top);
        tooltipStyle.left = Math.min(window.innerWidth - 360 - margin, anchor.left + anchor.width + margin);
        break;
    }
  }

  return (
    <div className="coachmark-layer" role="dialog" aria-label="Tutorial">
      <div className="coachmark-veil" />
      {anchor ? (
        <div
          className="coachmark-spotlight"
          style={{
            top: anchor.top - 6,
            left: anchor.left - 6,
            width: anchor.width + 12,
            height: anchor.height + 12
          }}
        />
      ) : null}
      <section
        className="coachmark-tooltip"
        style={tooltipStyle}
        data-step={step.id}
      >
        <header>
          <span>Step {stepIndex + 1} of {tutorialSteps.length}</span>
          <button type="button" className="coachmark-skip" onClick={finish}>Skip tutorial</button>
        </header>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <footer>
          {step.autoAdvance ? (
            <em>Continue playing to advance.</em>
          ) : (
            <button type="button" className="coachmark-next" onClick={advance}>
              {stepIndex === tutorialSteps.length - 1 ? 'Start trading' : 'Got it'}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
