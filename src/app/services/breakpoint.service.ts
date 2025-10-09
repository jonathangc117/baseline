import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private isMdOrLargerSubject = new BehaviorSubject<boolean>(this.checkScreenSize());
  public isMdOrLarger$ = this.isMdOrLargerSubject.asObservable();

  constructor() {
    // Listen for window resize events
    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.isMdOrLargerSubject.next(this.checkScreenSize());
      });
  }

  private checkScreenSize(): boolean {
    return window.innerWidth >= 768; // md breakpoint is typically 768px
  }

  get isMdOrLarger(): boolean {
    return this.isMdOrLargerSubject.value;
  }
}
