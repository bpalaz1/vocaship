/**
 * Harici ses dosyası kullanmadan Web Audio API (AudioContext) ile
 * sıfır gecikmeli oyun ses efektleri üretir.
 */

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedCtx || sharedCtx.state === "closed") {
      sharedCtx = new AudioCtx();
    }
    if (sharedCtx.state === "suspended") {
      sharedCtx.resume().catch(() => {});
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export function playArenaSound(
  type: "correct" | "wrong" | "milestone",
  enabled: boolean = true
): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === "correct") {
      // Tok vuruş / onay sesi
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.11);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === "wrong") {
      // Hafif uyarı sesi
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (type === "milestone") {
      // 5'li seri zafer akoru (C5 - E5 - G5 - C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.16, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    }
  } catch {}
}
