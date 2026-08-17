import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstallSvc } from '../../services/install-svc';
import { UpdateSvc } from '../../services/update-svc';
import { APP_VERSION } from '../../../app-info/version';

interface AboutFeatures {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly installSvc = inject(InstallSvc);
  readonly updateSvc = inject(UpdateSvc);

  readonly appVersion = APP_VERSION;
  readonly repositoryUrl = 'https://github.com/johnSmith8338/timey-wimey';

  readonly features: AboutFeatures[] = [
    {
      icon: '⏱',
      title: 'stopwatch',
      description: 'Precise timing with laps and session history.'
    },
    {
      icon: '⏲',
      title: 'timers',
      description: 'Run multiple timers and save your favorite presets.'
    },
    {
      icon: '⏰',
      title: 'alarms',
      description: 'Create repeating alarms with custom sounds.'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Get notified when a timer or alarm finishes.',
    },
    {
      icon: '📜',
      title: 'History',
      description: 'Keep track of completed timers, alarms and stopwatch sessions.',
    },
    {
      icon: '📴',
      title: 'Offline-first',
      description: 'Your timers, alarms and data work without an internet connection.',
    },
  ]

  async install() {
    await this.installSvc.install();
  }
}
