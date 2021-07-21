declare global {
  interface HTMLElementEventMap {
    kanvasPointerDown: KanvasPointerDownEvent;
    kanvasPointerMove: KanvasPointerMoveEvent;
    kanvasPointerUp: KanvasPointerUpEvent;
  }
}

interface KanvasPosition {
  x: number;
  y: number;
}

type KanvasPointerDownEvent = CustomEvent<KanvasPosition>;
type KanvasPointerMoveEvent = CustomEvent<KanvasPosition>;
type KanvasPointerUpEvent = CustomEvent<KanvasPosition>;

class KanvasPointerListener extends HTMLElement {
  adoptedCallback(oldDocument: Document, newDocument: Document): void {
    this.handleDisconnected({ document: oldDocument });
    this.handleConnected({ document: newDocument });
  }

  connectedCallback(): void {
    this.handleConnected({ document });
  }

  disconnectedCallback(): void {
    this.handleDisconnected({ document });
  }

  private handleConnected({ document }: { document: Document }) {
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
  }

  private handleDisconnected({ document }: { document: Document }) {
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
  }

  private handleMouseDown = (event: MouseEvent) => {
    const kanvasPointerDownEvent: KanvasPointerDownEvent = new CustomEvent(
      "kanvasPointerDown",
      {
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerDownEvent);
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (event.buttons === 0) {
      return;
    }

    const kanvasPointerMoveEvent: KanvasPointerMoveEvent = new CustomEvent(
      "kanvasPointerMove",
      {
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerMoveEvent);
  };

  private handleMouseUp = (event: MouseEvent) => {
    const kanvasPointerUpEvent: KanvasPointerUpEvent = new CustomEvent(
      "kanvasPointerUp",
      {
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerUpEvent);
  };

  private handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    const kanvasPointerDownEvent: KanvasPointerDownEvent = new CustomEvent(
      "kanvasPointerDown",
      {
        detail: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerDownEvent);
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    const kanvasPointerMoveEvent: KanvasPointerMoveEvent = new CustomEvent(
      "kanvasPointerMove",
      {
        detail: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerMoveEvent);
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    const kanvasPointerUpEvent: KanvasPointerUpEvent = new CustomEvent(
      "kanvasPointerUp",
      {
        detail: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerUpEvent);
  };
}

customElements.define("kanvas-pointer-listener", KanvasPointerListener);

export { KanvasPointerListener };
export type {
  KanvasPointerDownEvent,
  KanvasPointerMoveEvent,
  KanvasPointerUpEvent,
  KanvasPosition,
};
