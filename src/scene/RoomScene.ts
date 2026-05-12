import Phaser from 'phaser';
import { getCareerGate } from '../career/careerEngine';
import type { RunState, SaveState } from '../game/types';

type RoomPalette = {
  wall: number;
  desk: number;
  glass: number;
  primary: number;
  secondary: number;
  accent: number;
  danger: number;
};

export class RoomScene extends Phaser.Scene {
  private run?: RunState;
  private save?: SaveState;

  constructor() {
    super('RoomScene');
  }

  init(data: { run: RunState; save: SaveState }) {
    this.run = data.run;
    this.save = data.save;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const hasSecondMonitor = Boolean(this.save?.unlocks.secondMonitor);
    const hasBetterFeed = Boolean(this.save?.unlocks.betterNewsFeed);
    const tier = this.run?.tier ?? 'BEDROOM_DAY_TRADER';
    const gate = getCareerGate(tier);
    const palette = getRoomPalette(tier);
    const centerX = width * 0.5;
    const compact = height < 380;
    const cockpitY = compact ? height * 0.54 : Math.max(214, height * 0.42);
    const monitorHeight = compact ? Phaser.Math.Clamp(height * 0.36, 84, 112) : 142;
    const primaryMonitorWidth = compact ? Phaser.Math.Clamp(width * 0.2, 188, 248) : 234;
    const secondaryMonitorWidth = compact ? Phaser.Math.Clamp(width * 0.19, 180, 236) : 224;
    const deskY = compact
      ? Math.min(height - 44, cockpitY + monitorHeight * 0.72)
      : Math.min(height - 88, Math.max(cockpitY + 152, height * 0.73));

    this.add.rectangle(width / 2, height / 2, width, height, palette.wall);
    this.drawMatrixBackdrop(width, height, palette);
    this.drawWindow(width, palette);

    this.add.rectangle(centerX, cockpitY + 8, Math.min(width - 78, compact ? 760 : 730), compact ? height * 0.68 : 238, 0x020617, 0.38)
      .setStrokeStyle(1, palette.primary, 0.18);
    this.drawMonitor(centerX - (hasSecondMonitor ? primaryMonitorWidth * 0.68 : primaryMonitorWidth * 0.36), cockpitY - 10, primaryMonitorWidth, monitorHeight, palette.primary, 'ALPHA FEED');

    if (hasSecondMonitor) {
      this.drawMonitor(centerX + primaryMonitorWidth * 0.55, cockpitY - 8, secondaryMonitorWidth, monitorHeight - 4, palette.secondary, 'VOL SURFACE');
    } else {
      this.add.rectangle(centerX + primaryMonitorWidth * 0.54, cockpitY - 8, secondaryMonitorWidth, monitorHeight - 4, 0x020617, 0.24).setStrokeStyle(2, 0x334155, 0.75);
      this.add.text(centerX + primaryMonitorWidth * 0.28, cockpitY - 20, 'LOCKED', {
        color: '#64748b',
        fontFamily: 'Consolas, monospace',
        fontSize: '15px',
        fontStyle: '700'
      });
    }

    this.drawDesk(width, height, deskY, palette, compact);
    this.drawArtifacts(width, deskY, palette, compact);
    this.drawRoomLabels(gate.title, gate.roomLabel, hasSecondMonitor, hasBetterFeed, palette, compact);
  }

  private drawArtifacts(width: number, deskY: number, palette: RoomPalette, compact: boolean) {
    const reached = new Set(this.save?.tiersEverReached ?? []);
    const shelfY = deskY - (compact ? 24 : 30);
    const startX = 60;
    const gap = compact ? 30 : 38;
    let cursor = startX;

    if (reached.has('BEDROOM_DAY_TRADER')) {
      this.drawMug(cursor, shelfY, palette);
      cursor += gap;
    }
    if (reached.has('PROP_DESK_ROOKIE')) {
      this.drawTrophy(cursor, shelfY, palette);
      cursor += gap;
    }
    if (reached.has('STOCK_BROKER')) {
      this.drawNameplate(cursor, shelfY, palette);
      cursor += gap;
    }
    if (reached.has('FUND_MANAGER')) {
      this.drawFramedClipping(width - 60, 162, palette);
    }
    if (reached.has('HEDGE_FUND_FOUNDER')) {
      this.drawBull(cursor, shelfY, palette);
    }
  }

  private drawMug(x: number, y: number, palette: RoomPalette) {
    this.add.rectangle(x, y, 16, 18, 0x9ca3af, 0.85).setStrokeStyle(1, 0x111827, 0.7);
    this.add.rectangle(x + 10, y, 4, 10, 0x9ca3af, 0.85);
    this.add.text(x - 14, y + 12, 'MUG', { color: colorToHex(palette.secondary), fontFamily: 'Consolas, monospace', fontSize: '9px' });
  }

  private drawTrophy(x: number, y: number, palette: RoomPalette) {
    this.add.rectangle(x, y - 6, 12, 16, 0xfbbf24, 0.92).setStrokeStyle(1, 0xb45309, 0.8);
    this.add.rectangle(x, y + 6, 18, 6, 0xb45309, 0.92);
    this.add.text(x - 16, y + 12, 'TROPHY', { color: colorToHex(palette.accent), fontFamily: 'Consolas, monospace', fontSize: '9px' });
  }

  private drawNameplate(x: number, y: number, palette: RoomPalette) {
    this.add.rectangle(x, y + 2, 28, 12, 0xfbbf24, 0.88).setStrokeStyle(1, 0x78350f, 0.9);
    this.add.text(x - 13, y - 2, 'BROKER', { color: '#1f2937', fontFamily: 'Consolas, monospace', fontSize: '8px', fontStyle: '700' });
    this.add.text(x - 18, y + 14, 'PLATE', { color: colorToHex(palette.accent), fontFamily: 'Consolas, monospace', fontSize: '9px' });
  }

  private drawFramedClipping(x: number, y: number, palette: RoomPalette) {
    this.add.rectangle(x, y, 90, 60, 0xd1d5db, 0.94).setStrokeStyle(2, 0x78350f, 0.9);
    this.add.rectangle(x, y, 78, 48, 0xfefce8, 0.95);
    this.add.text(x - 34, y - 18, 'ONE TO WATCH', { color: '#1f2937', fontFamily: 'Consolas, monospace', fontSize: '9px', fontStyle: '700' });
    this.add.text(x - 34, y - 4, 'trade weekly', { color: '#475569', fontFamily: 'Consolas, monospace', fontSize: '7px' });
    this.add.rectangle(x - 10, y + 12, 56, 2, 0x475569, 0.7);
    this.add.rectangle(x - 10, y + 16, 56, 2, 0x475569, 0.7);
    this.add.text(x - 36, y + 30, 'PRESS', { color: colorToHex(palette.accent), fontFamily: 'Consolas, monospace', fontSize: '9px' });
  }

  private drawBull(x: number, y: number, palette: RoomPalette) {
    this.add.ellipse(x, y - 4, 22, 14, 0xb45309, 0.95).setStrokeStyle(1, 0x431407, 0.9);
    this.add.rectangle(x - 9, y + 4, 4, 8, 0xb45309, 0.95);
    this.add.rectangle(x + 9, y + 4, 4, 8, 0xb45309, 0.95);
    this.add.triangle(x - 9, y - 10, 0, 0, 6, -6, -2, -4, 0xfde68a, 0.95);
    this.add.triangle(x + 9, y - 10, 0, 0, -6, -6, 2, -4, 0xfde68a, 0.95);
    this.add.text(x - 12, y + 14, 'BULL', { color: colorToHex(palette.accent), fontFamily: 'Consolas, monospace', fontSize: '9px' });
  }

  private drawMatrixBackdrop(width: number, height: number, palette: RoomPalette) {
    const grid = this.add.graphics();
    grid.lineStyle(1, palette.primary, 0.055);

    for (let x = 0; x <= width; x += 34) {
      grid.lineBetween(x, 0, x, height);
    }

    for (let y = 0; y <= height; y += 30) {
      grid.lineBetween(0, y, width, y);
    }

    for (let index = 0; index < 58; index += 1) {
      const x = Phaser.Math.Between(18, Math.max(20, width - 70));
      const y = Phaser.Math.Between(28, Math.max(30, height - 32));
      const token = ['$', '1', '0', 'IV', 'P/L', 'CALL', 'PUT'][index % 7];
      this.add.text(x, y, token, {
        color: colorToHex(index % 5 === 0 ? palette.secondary : palette.primary),
        fontFamily: 'Consolas, monospace',
        fontSize: `${Phaser.Math.Between(10, 15)}px`
      }).setAlpha(Phaser.Math.Between(4, 14) / 100);
    }

    this.add.rectangle(width * 0.34, height * 0.32, width * 0.72, height * 0.48, palette.primary, 0.045);
    this.add.rectangle(width * 0.72, height * 0.58, width * 0.42, height * 0.58, palette.secondary, 0.04);
  }

  private drawWindow(width: number, palette: RoomPalette) {
    const x = width - 116;
    const y = 86;

    this.add.rectangle(x, y, 160, 118, palette.glass, 0.16).setStrokeStyle(1, palette.secondary, 0.65);

    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        const lit = (row + col) % 3 === 0;
        this.add.rectangle(x - 54 + col * 34, y - 42 + row * 19, 14, 8, lit ? palette.accent : 0x0f172a, lit ? 0.46 : 0.28);
      }
    }
  }

  private drawDesk(width: number, height: number, deskY: number, palette: RoomPalette, compact = false) {
    const deskHeight = compact ? 34 : 50;
    const lipOffset = compact ? 22 : 34;
    const keyboardWidth = compact ? 148 : 170;
    const keyboardHeight = compact ? 26 : 38;

    this.add.rectangle(width / 2, deskY + (height - deskY) / 2, width, height - deskY, 0x010403, 0.5);
    this.add.rectangle(width / 2, deskY, width - 76, deskHeight, palette.desk, 0.92).setStrokeStyle(1, palette.accent, 0.24);
    this.add.rectangle(width / 2, deskY + lipOffset, width - 124, compact ? 10 : 14, 0x020617, 0.72);

    if (!compact) {
      this.add.rectangle(width / 2 - 24, Math.min(height - 42, deskY + 76), 130, 62, 0x020617, 0.78).setStrokeStyle(1, palette.primary, 0.28);
    }

    const keyboard = this.add.graphics();
    keyboard.fillStyle(0x030712, 0.9);
    keyboard.fillRoundedRect(width / 2 - 158, deskY + 18, keyboardWidth, keyboardHeight, 7);
    keyboard.lineStyle(1, palette.secondary, 0.22);
    keyboard.strokeRoundedRect(width / 2 - 158, deskY + 18, keyboardWidth, keyboardHeight, 7);

    for (let index = 0; index < 18; index += 1) {
      const keyX = width / 2 - 144 + (index % 9) * (compact ? 15 : 17);
      const keyY = deskY + 25 + Math.floor(index / 9) * (compact ? 9 : 13);
      keyboard.fillStyle(index % 5 === 0 ? palette.primary : 0x111827, index % 5 === 0 ? 0.54 : 0.92);
      keyboard.fillRoundedRect(keyX, keyY, compact ? 9 : 10, compact ? 5 : 6, 2);
    }

    this.add.rectangle(width / 2 + 128, deskY + (compact ? 25 : 36), 70, compact ? 28 : 38, 0x03130d, 0.88).setStrokeStyle(1, palette.primary, 0.38);
    this.add.text(width / 2 + 101, deskY + (compact ? 15 : 26), 'P&L', {
      color: colorToHex(palette.primary),
      fontFamily: 'Consolas, monospace',
      fontSize: '11px'
    });
  }

  private drawMonitor(x: number, y: number, width: number, height: number, lineColor: number, label: string) {
    this.add.rectangle(x, y, width + 14, height + 16, 0x020617, 0.92).setStrokeStyle(2, lineColor, 0.36);
    this.add.rectangle(x, y, width, height, 0x00130b, 0.95).setStrokeStyle(1, lineColor, 0.82);

    const graphics = this.add.graphics();
    const left = x - width / 2 + 16;
    const right = x + width / 2 - 16;
    const top = y - height / 2 + 22;
    const bottom = y + height / 2 - 20;

    graphics.lineStyle(1, lineColor, 0.16);
    for (let row = 0; row < 5; row += 1) {
      const lineY = top + row * ((bottom - top) / 4);
      graphics.lineBetween(left, lineY, right, lineY);
    }
    for (let col = 0; col < 6; col += 1) {
      const lineX = left + col * ((right - left) / 5);
      graphics.lineBetween(lineX, top, lineX, bottom);
    }

    graphics.lineStyle(3, lineColor, 0.92);
    const points = [
      new Phaser.Math.Vector2(left, bottom - 10),
      new Phaser.Math.Vector2(left + 32, bottom - 30),
      new Phaser.Math.Vector2(left + 72, bottom - 20),
      new Phaser.Math.Vector2(left + 112, bottom - 58),
      new Phaser.Math.Vector2(left + 154, bottom - 45),
      new Phaser.Math.Vector2(right, top + 28)
    ];
    graphics.strokePoints(points, false);

    graphics.fillStyle(lineColor, 0.24);
    for (let index = 0; index < 9; index += 1) {
      const barHeight = 10 + ((index * 13) % 28);
      graphics.fillRect(left + index * 16, bottom - barHeight, 8, barHeight);
    }

    this.add.text(left, y - height / 2 + 7, label, {
      color: colorToHex(lineColor),
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      fontStyle: '700'
    });
    this.add.rectangle(x, y + height / 2 + 16, 52, 10, 0x111827, 0.95);
  }

  private drawRoomLabels(title: string, roomLabel: string, hasSecondMonitor: boolean, hasBetterFeed: boolean, palette: RoomPalette, compact = false) {
    this.add.rectangle(164, compact ? 62 : 70, 276, compact ? 84 : 98, 0x020617, 0.58).setStrokeStyle(1, palette.primary, 0.26);
    this.add.text(32, 28, title, {
      color: '#f8fafc',
      fontFamily: 'Consolas, monospace',
      fontSize: compact ? '19px' : '22px',
      fontStyle: '700'
    });
    this.add.text(32, 57, `Week ${this.run?.week ?? 1} / ${this.run?.day ?? 'MON'} / ${roomLabel}`, {
      color: '#94a3b8',
      fontFamily: 'Consolas, monospace',
      fontSize: '13px'
    });
    this.add.text(32, 85, hasSecondMonitor ? 'MONITOR 02 ONLINE' : 'MONITOR 02 NEEDED', {
      color: hasSecondMonitor ? colorToHex(palette.primary) : '#f87171',
      fontFamily: 'Consolas, monospace',
      fontSize: '12px'
    });
    this.add.text(32, 106, hasBetterFeed ? 'PREMIUM SIGNALS LIVE' : 'RUMOR FEED DEGRADED', {
      color: hasBetterFeed ? colorToHex(palette.secondary) : '#facc15',
      fontFamily: 'Consolas, monospace',
      fontSize: '12px'
    });
  }
}

function colorToHex(color: number) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function getRoomPalette(tier: RunState['tier']): RoomPalette {
  switch (tier) {
    case 'PROP_DESK_ROOKIE':
      return { wall: 0x07111f, desk: 0x22314a, glass: 0x38bdf8, primary: 0x22c55e, secondary: 0x38bdf8, accent: 0xfacc15, danger: 0xf87171 };
    case 'STOCK_BROKER':
      return { wall: 0x100f1c, desk: 0x303341, glass: 0x818cf8, primary: 0x22c55e, secondary: 0x818cf8, accent: 0xf59e0b, danger: 0xfb7185 };
    case 'FUND_MANAGER':
      return { wall: 0x06170f, desk: 0x1f3427, glass: 0x22c55e, primary: 0x6ee7b7, secondary: 0x38bdf8, accent: 0xfacc15, danger: 0xf87171 };
    case 'HEDGE_FUND_FOUNDER':
      return { wall: 0x05070b, desk: 0x242424, glass: 0xfacc15, primary: 0x22c55e, secondary: 0xfacc15, accent: 0x38bdf8, danger: 0xf87171 };
    case 'BEDROOM_DAY_TRADER':
    default:
      return { wall: 0x070b12, desk: 0x1f2937, glass: 0x2563eb, primary: 0x22c55e, secondary: 0x38bdf8, accent: 0xfacc15, danger: 0xf87171 };
  }
}
