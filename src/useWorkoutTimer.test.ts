import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";
import { useWorkoutTimer } from "./useWorkoutTimer";
import { buildSteps, workouts } from "./workouts";
import { audioMock } from "./test/setup";

const steps = buildSteps(workouts[0]);

test("plays exactly one beep on each of the final three seconds and a different transition tone", () => {
  const { result } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(result.current.remaining).toBe(3);
  expect(audioMock.tones).toEqual([560]);
  for (let second = 0; second < 3; second++)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  expect(audioMock.tones).toEqual([560, 560, 560, 880]);
  expect(result.current.step.kind).toBe("warmup");
  expect(result.current.remaining).toBe(180);
});

test("mute suppresses cues and unmute does not repeat a cue", () => {
  const { result } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  act(() => result.current.toggleSound());
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(audioMock.tones).toEqual([]);
  act(() => result.current.toggleSound());
  expect(audioMock.tones).toEqual([]);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(audioMock.tones).toEqual([560]);
});

test("pause excludes time, resume continues, and reset returns to an idle timer", () => {
  const { result } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  act(() => result.current.pause());
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(result.current.remaining).toBe(4);
  act(() => result.current.start());
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.state.totalElapsed).toBeCloseTo(2);
  act(() => result.current.reset());
  expect(result.current.state.status).toBe("ready");
  expect(vi.getTimerCount()).toBe(0);
});

test("audio failures do not prevent the timer from running", async () => {
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        throw new Error("Not supported");
      }
    },
  );
  const { result } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  expect(result.current.audioUnavailable).toBe(true);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.remaining).toBe(4);
});

test("a rejected audio resume is reported and can recover on the next start", async () => {
  audioMock.resume.mockRejectedValueOnce(new Error("Blocked"));
  const { result } = renderHook(() => useWorkoutTimer(steps));
  await act(async () => result.current.start());
  expect(result.current.audioUnavailable).toBe(true);
  act(() => result.current.pause());
  await act(async () => result.current.start());
  expect(result.current.audioUnavailable).toBe(false);
});

test("releases the screen wake lock when paused", async () => {
  const release = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn().mockResolvedValue({ release, released: false });
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: { request },
  });
  const { result } = renderHook(() => useWorkoutTimer(steps));
  await act(async () => result.current.start());
  expect(request).toHaveBeenCalledWith("screen");
  act(() => result.current.pause());
  expect(release).toHaveBeenCalledOnce();
  Reflect.deleteProperty(navigator, "wakeLock");
});

test("unmount clears the ticking interval and closes audio", () => {
  const { result, unmount } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(audioMock.close).toHaveBeenCalledOnce();
});

test("denied wake-lock access leaves the timer usable", async () => {
  const request = vi.fn().mockRejectedValue(new Error("Denied"));
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: { request },
  });
  const { result, unmount } = renderHook(() => useWorkoutTimer(steps));
  await act(async () => result.current.start());
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.remaining).toBe(4);
  unmount();
  Reflect.deleteProperty(navigator, "wakeLock");
});

test("a wake lock acquired after pausing is immediately released", async () => {
  const release = vi.fn().mockResolvedValue(undefined);
  let resolveLock!: (lock: { release: typeof release; released: boolean }) => void;
  const request = vi.fn(
    () =>
      new Promise<{ release: typeof release; released: boolean }>((resolve) => {
        resolveLock = resolve;
      }),
  );
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: { request },
  });
  const { result } = renderHook(() => useWorkoutTimer(steps));
  act(() => result.current.start());
  act(() => result.current.pause());
  await act(async () => resolveLock({ release, released: false }));
  expect(release).toHaveBeenCalledOnce();
  Reflect.deleteProperty(navigator, "wakeLock");
});
