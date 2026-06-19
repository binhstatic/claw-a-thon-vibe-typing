export interface LintBox {
  rect: DOMRect;
  lintIndex: number;
}

const UNDERLINE_STYLE = `
  .vt-lint-box {
    position: fixed;
    pointer-events: none;
    box-sizing: border-box;
    border-radius: 1px;
  }
  .vt-lint-box.loading {
    border-bottom: 2px dotted rgba(79, 70, 229, 0.35);
  }
  .vt-lint-box.ready {
    border-bottom: 2px solid rgba(79, 70, 229, 0.85);
    background: rgba(79, 70, 229, 0.06);
  }
`;

export class HighlightRenderer {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private boxes: LintBox[] = [];

  constructor() {
    this.host = document.createElement('div');
    this.host.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:2147483646;overflow:visible;';
    document.body.appendChild(this.host);

    this.shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = UNDERLINE_STYLE;
    this.shadow.appendChild(style);
  }

  update(rectsByLint: Array<{ rects: DOMRect[]; lintIndex: number }>, ready = false): void {
    for (const el of [...this.shadow.querySelectorAll('.vt-lint-box')]) {
      el.remove();
    }
    this.boxes = [];

    for (const { rects, lintIndex } of rectsByLint) {
      for (const rect of rects) {
        const div = document.createElement('div');
        div.className = `vt-lint-box ${ready ? 'ready' : 'loading'}`;
        div.style.cssText =
          `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
        this.shadow.appendChild(div);
        this.boxes.push({ rect, lintIndex });
      }
    }
  }

  hitTest(clientX: number, clientY: number): number | null {
    for (const { rect, lintIndex } of this.boxes) {
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return lintIndex;
      }
    }
    return null;
  }

  clear(): void {
    for (const el of [...this.shadow.querySelectorAll('.vt-lint-box')]) {
      el.remove();
    }
    this.boxes = [];
  }

  destroy(): void {
    this.host.remove();
  }
}
