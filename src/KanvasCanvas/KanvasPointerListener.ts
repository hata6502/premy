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
  private transactionDevice?: "mouse" | "touch";

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

  private getShouldIgnore({ event }: { event: Event }) {
    return event
      .composedPath()
      .some(
        (eventTarget) =>
          eventTarget instanceof Element &&
          eventTarget.classList.contains("kanvas-pointer-listener-ignore")
      );
  }

  private cancelPointer() {
    this.dispatchEvent(
      new CustomEvent("kanvasPointerCancel", {
        bubbles: true,
        composed: true,
      })
    );

    this.transactionDevice = undefined;
  }

  private handleConnected({ document }: { document: Document }) {
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
    document.addEventListener("touchcancel", this.handleTouchCancel);
  }

  private handleDisconnected({ document }: { document: Document }) {
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchCancel);
  }

  private handleMouseDown = (event: MouseEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice) {
      return;
    }

    this.transactionDevice = "mouse";

    const kanvasPointerDownEvent: KanvasPointerDownEvent = new CustomEvent(
      "kanvasPointerDown",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerDownEvent);
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (
      this.getShouldIgnore({ event }) ||
      this.transactionDevice !== "mouse" ||
      event.buttons === 0
    ) {
      return;
    }

    const kanvasPointerMoveEvent: KanvasPointerMoveEvent = new CustomEvent(
      "kanvasPointerMove",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerMoveEvent);
  };

  private handleMouseUp = (event: MouseEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "mouse") {
      return;
    }

    const kanvasPointerUpEvent: KanvasPointerUpEvent = new CustomEvent(
      "kanvasPointerUp",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(kanvasPointerUpEvent);
    this.transactionDevice = undefined;
  };

  private handleTouchStart = (event: TouchEvent) => {
    if (
      this.getShouldIgnore({ event }) ||
      this.transactionDevice ||
      event.touches.length !== 1
    ) {
      return;
    }

    this.transactionDevice = "touch";

    const kanvasPointerDownEvent: KanvasPointerDownEvent = new CustomEvent(
      "kanvasPointerDown",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerDownEvent);
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    if (event.touches.length !== 1) {
      this.cancelPointer();

      return;
    }

    const kanvasPointerMoveEvent: KanvasPointerMoveEvent = new CustomEvent(
      "kanvasPointerMove",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerMoveEvent);
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    if (event.touches.length !== 0) {
      this.cancelPointer();

      return;
    }

    // Prevent mouse events for iOS.
    // https://developer.mozilla.org/ja/docs/Web/API/touchevent#using_with_addeventlistener_and_preventdefault
    event.preventDefault();

    const kanvasPointerUpEvent: KanvasPointerUpEvent = new CustomEvent(
      "kanvasPointerUp",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(kanvasPointerUpEvent);
    this.transactionDevice = undefined;
  };

  private handleTouchCancel = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    this.cancelPointer();
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
