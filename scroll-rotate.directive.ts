import {AfterViewInit, Directive, ElementRef, HostListener} from '@angular/core';
import {interval} from "rxjs";

@Directive({
  selector: '[appScrollRotate]'
})
export class ScrollRotateDirective implements AfterViewInit {

  readonly DRAG_DELAY = 1;
  readonly SCROLL_SENSITIVITY = 3;
  readonly FIXED_TIME_STEP_SECONDS = 0.01667; // approximate 60 fps

  scaleFormatString: string;

  degreeRotate = 0;
  rotVelocity = 0;
  startRotVel = 0;
  timer = 0;


  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    this.el.nativeElement.style.transform = this.scaleFormatString;

    // simplified solution to update everything, should not be used in production! (a lot of overhead)
    const fixedUpdate = interval(this.FIXED_TIME_STEP_SECONDS * 1000);
    fixedUpdate.subscribe(() => this.updateRotation());
  }

  @HostListener('document:wheel', ['$event.deltaY'])
  onMouseWheel(deltaY: number): void {
    // normalize deltaY and apply it
    if (deltaY !== 0) {
      // flip deltaY as it seems unnatural to rotate the other way
      deltaY *= -1;

      deltaY /= Math.abs(deltaY);

      // increase velocity and set a start velocity for decrease lerp
      this.rotVelocity += this.SCROLL_SENSITIVITY * deltaY;
      this.startRotVel = this.rotVelocity;

      // reset timer
      this.timer = 0;
    }
    this.updateRotation();
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
    this.el.nativeElement.style.transform = `rotateZ(${this.degreeRotate}deg)` + this.scaleFormatString;
  }

  // source: https://en.wikipedia.org/wiki/Linear_interpolation
  static lerp(from: number, to: number, time: number): number {
    return (1 - time) * from + time * to;
  }

}
