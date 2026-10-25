import { useCallback, useEffect, useRef, useState } from "react";
import { advanceTimer, initialTimer, remainingSeconds, tickTimer } from "./timer";
import type { TimerState } from "./timer";
import type { Step } from "./workouts";

export function useWorkoutTimer(steps: Step[]) {
  const [state, setState] = useState<TimerState>(initialTimer);
  const [sound, setSound] = useState(true);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const lastCue = useRef("");

  const enableAudio = useCallback(() => {
    try {
      if (!audio.current || audio.current.state === "closed") audio.current = new AudioContext();
      void audio.current
        .resume()
        .then(() => setAudioUnavailable(false))
        .catch(() => setAudioUnavailable(true));
    } catch {
      setAudioUnavailable(true);
    }
  }, []);

  const beep = useCallback(
    (transition: boolean) => {
      const context = audio.current;
      if (!sound || !context || context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.frequency.value = transition ? 880 : 560;
      const start = context.currentTime;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + (transition ? 0.38 : 0.13));
      oscillator.start(start);
      oscillator.stop(start + 0.4);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    },
    [sound],
  );

  useEffect(() => {
    if (state.status !== "running") return;
    const id = window.setInterval(() => setState((previous) => tickTimer(previous, steps, performance.now())), 100);
    return () => window.clearInterval(id);
  }, [state.status, steps]);

  const step = steps[state.index];
  const remaining = step?.seconds === undefined ? undefined : remainingSeconds(step, state.elapsed);
  useEffect(() => {
    if (state.status !== "running" && state.status !== "complete") return;
    const cue = `${state.index}:${remaining !== undefined && remaining <= 3 ? remaining : "start"}`;
    if (cue === lastCue.current) return;
    const previousIndex = lastCue.current.split(":")[0];
    lastCue.current = cue;
    if (state.status === "complete" || (previousIndex !== String(state.index) && state.index > 0)) beep(true);
    else if (remaining !== undefined && remaining <= 3 && remaining > 0) beep(false);
  }, [state.index, state.status, remaining, beep]);

  const pause = useCallback(
    () =>
      setState((previous) => {
        if (previous.status !== "running") return previous;
        const current = tickTimer(previous, steps, performance.now());
        return {
          ...current,
          status: current.status === "complete" ? "complete" : "paused",
        };
      }),
    [steps],
  );

  function start() {
    enableAudio();
    setState((previous) => ({
      ...previous,
      status: "running",
      lastTick: performance.now(),
    }));
  }

  // The screen stays awake while training when the browser supports it.
  useEffect(() => {
    if (state.status !== "running" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    let disposed = false;
    async function acquire() {
      if (document.visibilityState !== "visible" || (lock && !lock.released)) return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (disposed) await next.release();
        else lock = next;
      } catch {
        /* A wake lock is optional; the timer still works. */
      }
    }
    void acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      void lock?.release();
    };
  }, [state.status]);

  useEffect(
    () => () => {
      const context = audio.current;
      audio.current = null;
      void context?.close();
    },
    [],
  );

  return {
    state,
    step,
    remaining,
    sound,
    audioUnavailable,
    start,
    pause,
    advance: () => setState((previous) => advanceTimer(previous, steps, performance.now())),
    reset: () => {
      lastCue.current = "";
      setState(initialTimer);
    },
    toggleSound: () => {
      if (!sound) enableAudio();
      setSound((previous) => !previous);
    },
  };
}
