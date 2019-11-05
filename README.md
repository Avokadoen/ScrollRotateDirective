# ScrollRotateDirective
Angular directive example that rotates any html element tagget when user scroll with simulated drag

tag is simple html angular directive syntax:

```html
<!-- angular material icon that can rotate -->
<mat-icon appScrollRotate>local_shipping</mat-icon>
```

```typescript
// selector defines html tag
@Directive({
  selector: '[appScrollRotate]' 
})
export class ScrollRotateDirective implements AfterViewInit {
```

# Example
![img](https://github.com/Avokadoen/ScrollRotateDirective/blob/master/Peek%202019-11-05%2014-09.gif)
