import { inject, Injectable } from '@angular/core';
import { SettingsSvc } from './settings-svc';
import { ALARM_SOUND_RAMP_UP_DURATION } from '../models/settings.model';

export const DEFAULT_TIMER_SOUND = 'none';

export type TimerSound = 'inherit' | 'none' | 'ding' | 'alarm';

@Injectable({
  providedIn: 'root',
})
export class SoundSvc {
  private readonly settings = inject(SettingsSvc);

  private audio?: HTMLAudioElement;
  private rampFrame: number | null = null;
  private previewTimer: number | null = null;

  play(sound: TimerSound = 'none') {
    this.stop();

    if (sound === 'none' || sound === 'inherit') return;

    if (this.shouldRampUp(sound)) {
      this.playAlarmWithRampUp();
      return;
    }

    this.playNormal(sound);
  }

  stop() {
    if (this.rampFrame !== null) {
      cancelAnimationFrame(this.rampFrame);
      this.rampFrame = null;
    }
    if (this.previewTimer !== null) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio = undefined;
  }

  preview(sound: TimerSound) {
    this.stop();

    if (sound === 'none' || sound === 'inherit') return;

    this.playNormal(sound);

    if (sound === 'alarm') {
      this.previewTimer = window.setTimeout(() => {
        this.previewTimer = null;
        this.stop();
      }, 1000);
    }
  }

  private shouldRampUp(sound: TimerSound): boolean {
    return (sound === 'alarm' && this.settings.alarmSoundRampUp() !== 'off');
  }

  private playNormal(sound: TimerSound) {
    this.audio = new Audio(`sounds/${sound}.mp3`);
    this.audio.loop = sound === 'alarm';
    void this.audio.play();
  }

  private playAlarmWithRampUp() {
    const audio = new Audio('sounds/alarm.mp3');

    audio.loop = true;
    audio.volume = 0;

    this.audio = audio;

    void audio.play();

    const rampUp = this.settings.alarmSoundRampUp();
    if (rampUp === 'off') {
      audio.volume = 1;
      return;
    }

    const duration = ALARM_SOUND_RAMP_UP_DURATION[rampUp];
    let startedAt = performance.now();
    const tick = (now: number) => {
      if (this.audio !== audio) return;
      startedAt ??= now;

      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));

      audio.volume = progress;
      if (progress < 1) {
        this.rampFrame = requestAnimationFrame(tick);
      } else {
        this.rampFrame = null;
      }
    }

    this.rampFrame = requestAnimationFrame(tick);
  }
}

