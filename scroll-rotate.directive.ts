import {AfterViewInit, Directive, ElementRef, HostListener} from '@angular/core';
import {interval, Subscription} from "rxjs";

@Directive({
  selector: '[appScrollRotate]'
})
export class ScrollRotateDirective implements AfterViewInit {

  readonly DRAG_DELAY = 1;
  readonly SCROLL_SENSITIVITY = 1;
  readonly FIXED_TIME_STEP_SECONDS = 0.01667; // approximate 60 fps

  // source: https://en.wikipedia.org/wiki/Linear_interpolation
  static lerp(from: number, to: number, time: number): number {
    return (1 - time) * from + time * to;
  }

  degreeRotate = 0;
  rotVelocity = 0;
  startRotVel = 0;
  timer = 0;

  updateSubscription: Subscription;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void { }

  @HostListener('document:wheel', ['$event.deltaY'])
  onMouseWheel(deltaY: number): void {
    // ignore events with no change
    if (deltaY === 0) {
      return;
    }

    // flip deltaY as it seems unnatural to rotate the other way
    deltaY *= -1;

    // increase velocity and set a start velocity for decrease lerp
    this.rotVelocity += this.SCROLL_SENSITIVITY * deltaY;
    this.startRotVel = this.rotVelocity;

    // reset timer
    this.timer = 0;


    // unsubscribe to previous update loop if it exist
    this.unsubscribeUpdate();

    // create an update loop to update element state
    const fixedUpdate = interval(this.FIXED_TIME_STEP_SECONDS * 1000);
    this.updateSubscription = fixedUpdate.subscribe(() => this.updateRotation());
  }

  updateRotation(): void {
    this.timer += this.FIXED_TIME_STEP_SECONDS;

    // increase time to reach zero with start velocity
    const dragModifier = (1 + Math.abs(this.startRotVel * 0.1));

    // calculate current lerp "position" (between 0 and 1)
    const lerpValue = Math.min(this.timer/(this.DRAG_DELAY * dragModifier), 1);

    // use lerp to decrease velocity towards 0 (this work independent of negative and positive velocity)
    this.rotVelocity = ScrollRotateDirective.lerp(this.startRotVel, 0, lerpValue);

    // apply velocity to rotation
    this.degreeRotate += this.rotVelocity;

    // apply rotation to DOM
    this.el.nativeElement.style.transform = `rotateZ(${this.degreeRotate}deg)`;

    if (lerpValue === 1) {
      this.unsubscribeUpdate();
    }
  }

  unsubscribeUpdate() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

}
