import { Constants } from "@/utils/constants";
import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: "[appEllipsis]",
  standalone: true,
})
export class EllipsisDirective {
  element: ElementRef;
  fullHeight: string;

  @Input() ellipsisData: any;
  @Input() checkElement: HTMLElement;
  @Input() ellipsisMargin = 10;

  cssMaxHeight: number; // add more as needed

  running: boolean = false; // prevent recursion

  private get _checkElement(): HTMLElement {
    return this.checkElement ? this.checkElement : this.element.nativeElement;
  }

  private resizeObserver: ResizeObserver;

  constructor(el: ElementRef) {
    this.element = el;
  }

  ngAfterViewInit() {
    if (!window) return;

    // console.log(this.element.nativeElement);
    this.element.nativeElement.attributes.lastWindowResizeTime = 0;
    this.element.nativeElement.attributes.lastWindowResizeWidth = 0;
    this.element.nativeElement.attributes.lastWindowResizeHeight = 0;
    this.element.nativeElement.attributes.lastWindowTimeoutEvent = null;
    /* State Variables */
    this.element.nativeElement.attributes.isTruncated = false;

    this.fullHeight = this.getFullHeight();
    // console.debug("HEIGHT", this.fullHeight);
    this._checkElement.dataset[Constants.Dataset.ORIGINAL_HEIGHT] =
      this.fullHeight;

    this.buildEllipsis();

    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (this.running) return;
      
      // console.debug("Element resized:", entry.contentRect);
      this.running = true;
      try {
        this.buildEllipsis();
      } finally {
        this.running = false;
      }
    });

    this.resizeObserver.observe(this._checkElement);
  }

  buildEllipsis() {
    if (!this.ellipsisData) return;

    const maxHeight = parseFloat(
      window.getComputedStyle(this._checkElement).maxHeight
    );
    if (maxHeight === this.cssMaxHeight) return;
    this.cssMaxHeight = maxHeight;

    // console.debug("Rebuilding ellipsis text at", this.element);

    var bindArray = this.ellipsisData.split(" ");
    var i = 0;
    var ellipsisSymbol = "&hellip;";
    var appendString = ellipsisSymbol;

    // console.debug("TEST", this.element.nativeElement, appendString, this._checkElement);

    this.element.nativeElement.attributes.isTruncated = false;
    this.element.nativeElement.innerHTML = this.ellipsisData;

    // If text has overflow
    if (this.isOverflowed(this._checkElement)) {
      const bindArrayStartingLength = bindArray.length;
      const initialMaxHeight = this._checkElement.clientHeight;

      this.element.nativeElement.innerHTML = this.ellipsisData + appendString;

      // Set complete text and remove one word at a time, until there is no overflow
      for (; i < bindArrayStartingLength; i++) {
        bindArray.pop();
        this.element.nativeElement.innerHTML =
          bindArray.join(" ") + appendString;

        // console.debug("\t", i, this.element.nativeElement.innerHTML, this._checkElement.scrollHeight, initialMaxHeight, this.isOverflowed(this._checkElement))

        if (
          this._checkElement.scrollHeight < initialMaxHeight - this.ellipsisMargin ||
          this.isOverflowed(this._checkElement) === false
        ) {
          this.element.nativeElement.attributes.isTruncated = true;
          break;
        }
      }
    }
  }

  isOverflowed(el) {
    return el.scrollHeight > el.clientHeight + this.ellipsisMargin;
  }

  getFullHeight() {
    this.element.nativeElement.innerHTML = this.ellipsisData;

    const clone = this._checkElement.cloneNode(true) as HTMLElement;

    this.element.nativeElement.innerHTML = "";

    clone.style.minHeight = "none";
    clone.style.maxHeight = "none";
    clone.style.position = "absolute";
    clone.style.width = window.getComputedStyle(this._checkElement).width;

    this._checkElement.parentNode.appendChild(clone);
    const fullHeight = window.getComputedStyle(clone).height;
    // if (EllipsisDirective.int !== 1)
    this._checkElement.parentNode.removeChild(clone);
    // EllipsisDirective.int++;

    return fullHeight;
  }
}
