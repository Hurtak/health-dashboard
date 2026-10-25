import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

export const audioMock = {
  tones: [] as number[],
  resume: vi.fn<() => Promise<void>>(),
  close: vi.fn<() => Promise<void>>(),
};

class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = audioMock.resume;
  close = audioMock.close;
  createOscillator() {
    const oscillator = {
      frequency: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      stop: vi.fn(),
      onended: null,
      start: () => audioMock.tones.push(oscillator.frequency.value),
    };
    return oscillator;
  }
  createGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
  audioMock.tones = [];
  audioMock.resume.mockReset().mockResolvedValue(undefined);
  audioMock.close.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("AudioContext", MockAudioContext);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
