import { useEffect, useRef } from 'react';
import type { RunState, SaveState } from '../game/types';

// Phaser is ~1MB minified. Dynamic-import it so the initial JS bundle doesn't pay the
// cost upfront; the room canvas mounts after the rest of the game UI is interactive.

type PhaserGame = import('phaser').Game;

export function RoomCanvas({ run, save }: { run: RunState; save: SaveState }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserGame | null>(null);
  const sceneReadyRef = useRef(false);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;
    let cancelled = false;

    void (async () => {
      const [{ default: Phaser }, { RoomScene }] = await Promise.all([
        import('phaser'),
        import('./RoomScene')
      ]);
      if (cancelled || !hostRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: 960,
        height: 640,
        backgroundColor: '#050812',
        scene: [RoomScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      });

      gameRef.current.scene.start('RoomScene', { run, save });
      sceneReadyRef.current = true;
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current || !sceneReadyRef.current) return;
    gameRef.current.scene.stop('RoomScene');
    gameRef.current.scene.start('RoomScene', { run, save });
  }, [run.week, run.day, run.cash, run.reputation, run.tier, save.unlocks.secondMonitor, save.unlocks.betterNewsFeed, save.tiersEverReached.join(',')]);

  return <div className="room-canvas" ref={hostRef} />;
}
