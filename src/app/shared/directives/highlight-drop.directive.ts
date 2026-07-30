import { Directive, HostBinding, HostListener } from '@angular/core';

/**
 * HighlightDropDirective
 * Applies a visual highlight class to a CDK drop list when
 * a draggable element is hovered over it. Demonstrates custom
 * structural awareness with HostBinding + HostListener.
 */
@Directive({
  selector: '[appHighlightDrop]',
  standalone: true
})
export class HighlightDropDirective {
  @HostBinding('class.drop-active') isActive = false;

  @HostListener('cdkDragEntered')
  onDragEnter(): void {
    this.isActive = true;
  }

  @HostListener('cdkDragExited')
  onDragExit(): void {
    this.isActive = false;
  }

  @HostListener('cdkDropListDropped')
  onDrop(): void {
    this.isActive = false;
  }
}
