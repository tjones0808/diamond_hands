# Sound Design

Web Audio API synthesis (no audio asset files). All SFX are oscillator + envelope chains built at runtime; the `AudioContext` lazy-inits on first sound so browsers don't reject it before a user gesture.

## SFX catalogue

| Id | Trigger | Sound |
|---|---|---|
| `click` | (reserved) | Short triangle tick |
| `buy` | BUY_SHARES / BUY_CALL / BUY_PUT / OPEN_STRATEGY | Two-tone ascending square |
| `sell` | SELL_SHARES / CLOSE_OPTIONS | Two-tone descending square |
| `dayAdvance` | ADVANCE_DAY (MON–THU) | Soft chord pulse |
| `shock` | Wednesday shock fires | Noise burst + low sawtooth |
| `expiryItm` | Any option settles in the money | Bell-like sine triad |
| `expiryOtm` | Any option settles worthless | Low sine thud |
| `profit` | Friday net-worth delta > 0 | Ascending triangle arpeggio |
| `loss` | Friday net-worth delta < -$100 | Falling sawtooth |
| `promotion` | Boss week passed and tier advanced | 4-note rising fanfare |
| `bossReveal` | New boss week assigned on Monday | Dark sawtooth chord |
| `bankruptcy` | Bankruptcy first detected | Descending dissonant sawtooth |
| `tutorialNext` | (reserved) | Triangle blip |

## Mute toggle

A 🔊/🔇 button sits in the market tape header. Toggling dispatches `TOGGLE_AUDIO_MUTE` which flips `save.audioMuted`. An `useEffect` in `App.tsx` mirrors that flag into the audio engine via `setSfxMuted(...)`. State is persisted to localStorage on every change.
