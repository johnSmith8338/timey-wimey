import { Injectable } from '@angular/core';

export const DEFAULT_TIMER_SOUND = 'none';

export type TimerSound = 'inherit' | 'none' | 'ding' | 'alarm';

@Injectable({
  providedIn: 'root',
})
export class SoundSvc {
  private audio?: HTMLAudioElement;

  play(sound: TimerSound = 'none') {
    this.stop();

    if (sound === 'none' || sound === 'inherit') return;

    this.audio = new Audio(`sounds/${sound}.mp3`);
    this.audio.loop = sound === 'alarm';
    void this.audio.play();
  }

  stop() {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio = undefined;
  }

  preview(sound: TimerSound) {
    this.stop();
    this.play(sound);
    if (sound === 'alarm') setTimeout(() => this.stop(), 1000);
  }
}

