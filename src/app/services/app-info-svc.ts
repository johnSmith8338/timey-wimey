import { Injectable } from '@angular/core';
import { APP_VERSION } from '../core/version';

@Injectable({
  providedIn: 'root',
})
export class AppInfoSvc {
  readonly version = APP_VERSION;
}
