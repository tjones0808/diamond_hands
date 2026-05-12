import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { RunState, SaveState } from '../game/types';
import { RoomScene } from './RoomScene';

export function RoomCanvas({ run, save }: { run: RunState; save: SaveState }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

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

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;
    gameRef.current.scene.stop('RoomScene');
    gameRef.current.scene.start('RoomScene', { run, save });
  }, [run.week, run.day, run.cash, run.reputation, run.tier, save.unlocks.secondMonitor, save.unlocks.betterNewsFeed, save.tiersEverReached.join(',')]);

  return <div className="room-canvas" ref={hostRef} />;
}
