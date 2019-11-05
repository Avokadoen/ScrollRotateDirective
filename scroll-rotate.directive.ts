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

    const fixedUpdate = interval(this.FIXED_TIME_STEP_SECONDS * 1000);
    fixedUpdate.subscribe(() => this.updateRotation());
  }

  @HostListener('document:wheel', ['$event.deltaY'])
  onMouseWheel(deltaY: number): void {
    // normalize deltaY and apply it
    if (deltaY !== 0) {
      deltaY *= -1;
      deltaY /= Math.abs(deltaY);
      this.rotVelocity += this.SCROLL_SENSITIVITY * deltaY;
      this.startRotVel = this.rotVelocity;
      this.timer = 0;
    }
    this.updateRotation();
  }

  updateRotation(): void {
    // very imperfect drag, fix if nothing better to do
    this.timer += this.FIXED_TIME_STEP_SECONDS;
    const dragModifier = (1 + Math.abs(this.startRotVel * 0.1));
    const lerpValue = Math.min(this.timer/(this.DRAG_DELAY * dragModifier), 1);
    this.rotVelocity = ScrollRotateDirective.lerp(this.startRotVel, 0, lerpValue);
    this.degreeRotate += this.rotVelocity;
    this.el.nativeElement.style.transform = `rotateZ(${this.degreeRotate}deg)` + this.scaleFormatString;
  }

  // source: https://en.wikipedia.org/wiki/Linear_interpolation
  static lerp(from: number, to: number, time: number): number {
    return (1 - time) * from + time * to;
  }

}
