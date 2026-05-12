import { useEffect, useLayoutEffect, useState } from 'react';
import type { RunState, SaveState } from '../game/types';
import { tutorialSteps } from './tutorialSteps';

interface CoachmarkProps {
  run: RunState;
  save: SaveState;
  onComplete: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOT_PAD = 6;
const KEEP_SHARP_PAD = 4;

export function Coachmark({ run, save, onComplete }: CoachmarkProps) {
  const [active, setActive] = useState(() => !save.hasCompletedTutorial);
  const [stepIndex, setStepIndex] = useState(0);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [extras, setExtras] = useState<Rect[]>([]);
  const step = active ? tutorialSteps[stepIndex] : undefined;

  useLayoutEffect(() => {
    if (!step) {
      setAnchor(null);
      setExtras([]);
      return;
    }
    let frame = 0;
    const measure = () => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setAnchor({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      } else {
        setAnchor(null);
      }

      const extraRects: Rect[] = [];
      for (const selector of step.keepSharp ?? []) {
        const el = document.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          extraRects.push({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }
      }
      setExtras(extraRects);
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

  const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;

  const spotRect = anchor
    ? {
        top: anchor.top - SPOT_PAD,
        left: anchor.left - SPOT_PAD,
        width: anchor.width + SPOT_PAD * 2,
        height: anchor.height + SPOT_PAD * 2
      }
    : null;

  const sharpRects: Rect[] = [];
  if (spotRect) sharpRects.push(spotRect);
  for (const extra of extras) {
    sharpRects.push({
      top: extra.top - KEEP_SHARP_PAD,
      left: extra.left - KEEP_SHARP_PAD,
      width: extra.width + KEEP_SHARP_PAD * 2,
      height: extra.height + KEEP_SHARP_PAD * 2
    });
  }

  const clipPath = sharpRects.length === 0
    ? undefined
    : buildClipPath(viewportWidth, viewportHeight, sharpRects);

  const placement = step.placement;
  const margin = 12;
  const tooltipStyle: React.CSSProperties = {};
  if (anchor) {
    switch (placement) {
      case 'bottom':
        tooltipStyle.top = anchor.top + anchor.height + margin;
        tooltipStyle.left = Math.max(margin, Math.min(viewportWidth - 360 - margin, anchor.left));
        break;
      case 'top':
        tooltipStyle.top = Math.max(margin, anchor.top - margin - 160);
        tooltipStyle.left = Math.max(margin, Math.min(viewportWidth - 360 - margin, anchor.left));
        break;
      case 'left':
        tooltipStyle.top = Math.max(margin, anchor.top);
        tooltipStyle.left = Math.max(margin, anchor.left - 360 - margin);
        break;
      case 'right':
        tooltipStyle.top = Math.max(margin, anchor.top);
        tooltipStyle.left = Math.min(viewportWidth - 360 - margin, anchor.left + anchor.width + margin);
        break;
    }
  }

  return (
    <div className="coachmark-layer" role="dialog" aria-label="Tutorial">
      <div
        className="coachmark-veil"
        style={clipPath ? { clipPath, WebkitClipPath: clipPath } : undefined}
      />
      {spotRect ? (
        <div
          className="coachmark-spotlight"
          style={{
            top: spotRect.top,
            left: spotRect.left,
            width: spotRect.width,
            height: spotRect.height
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

function buildClipPath(width: number, height: number, holes: Rect[]): string {
  const outer = `M0,0 L${width},0 L${width},${height} L0,${height} Z`;
  const inner = holes
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => {
      const x = Math.max(0, r.left);
      const y = Math.max(0, r.top);
      const w = Math.min(width - x, r.width);
      const h = Math.min(height - y, r.height);
      return `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`;
    })
    .join(' ');
  return `path(evenodd, "${outer} ${inner}")`;
}
