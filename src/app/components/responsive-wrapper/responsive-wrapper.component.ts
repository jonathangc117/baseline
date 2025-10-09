import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BreakpointService } from '../../services/breakpoint.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-responsive-wrapper',
  template: `
    <ng-container *ngIf="shouldShow">
      <ng-content></ng-content>
    </ng-container>
  `,
  standalone: true
})
export class ResponsiveWrapperComponent implements OnInit, OnDestroy {
  @Input() hideOnMobile = false;
  @Input() showOnMobile = false;
  
  shouldShow = true;
  private subscription?: Subscription;

  constructor(private breakpointService: BreakpointService) {}

  ngOnInit() {
    this.subscription = this.breakpointService.isMdOrLarger$.subscribe(isMdOrLarger => {
      if (this.hideOnMobile) {
        this.shouldShow = isMdOrLarger;
      } else if (this.showOnMobile) {
        this.shouldShow = !isMdOrLarger;
      } else {
        this.shouldShow = true;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
