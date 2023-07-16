declare global {
  interface HTMLElementEventMap {
    premyPointerDown: PremyPointerDownEvent;
    premyPointerMove: PremyPointerMoveEvent;
    premyPointerUp: PremyPointerUpEvent;
  }
}

interface PremyPosition {
  x: number;
  y: number;
}

type PremyPointerDownEvent = CustomEvent<PremyPosition>;
type PremyPointerMoveEvent = CustomEvent<PremyPosition>;
type PremyPointerUpEvent = CustomEvent<PremyPosition>;

class PremyPointerListener extends HTMLElement {
  private touchStartTime = 0;
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
          eventTarget.classList.contains("premy-pointer-listener-ignore")
      );
  }

  private cancelPointer() {
    this.dispatchEvent(
      new CustomEvent("premyPointerCancel", {
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

    const premyPointerDownEvent: PremyPointerDownEvent = new CustomEvent(
      "premyPointerDown",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(premyPointerDownEvent);
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (
      this.getShouldIgnore({ event }) ||
      this.transactionDevice !== "mouse" ||
      event.buttons === 0
    ) {
      return;
    }

    const premyPointerMoveEvent: PremyPointerMoveEvent = new CustomEvent(
      "premyPointerMove",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(premyPointerMoveEvent);
  };

  private handleMouseUp = (event: MouseEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "mouse") {
      return;
    }

    const premyPointerUpEvent: PremyPointerUpEvent = new CustomEvent(
      "premyPointerUp",
      {
        bubbles: true,
        composed: true,
        detail: { x: event.clientX, y: event.clientY },
      }
    );

    this.dispatchEvent(premyPointerUpEvent);
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

    this.touchStartTime = Date.now();
    this.transactionDevice = "touch";

    const premyPointerDownEvent: PremyPointerDownEvent = new CustomEvent(
      "premyPointerDown",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(premyPointerDownEvent);
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    if (event.touches.length >= 2) {
      if (this.touchStartTime >= Date.now() - 500) {
        this.cancelPointer();
      }

      return;
    }

    const premyPointerMoveEvent: PremyPointerMoveEvent = new CustomEvent(
      "premyPointerMove",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(premyPointerMoveEvent);
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    if (event.touches.length >= 1) {
      return;
    }

    // Prevent mouse events for iOS.
    // https://developer.mozilla.org/ja/docs/Web/API/touchevent#using_with_addeventlistener_and_preventdefault
    event.preventDefault();

    const premyPointerUpEvent: PremyPointerUpEvent = new CustomEvent(
      "premyPointerUp",
      {
        bubbles: true,
        composed: true,
        detail: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }
    );

    this.dispatchEvent(premyPointerUpEvent);
    this.transactionDevice = undefined;
  };

  private handleTouchCancel = (event: TouchEvent) => {
    if (this.getShouldIgnore({ event }) || this.transactionDevice !== "touch") {
      return;
    }

    this.cancelPointer();
  };
}

if (!customElements.get("premy-pointer-listener")) {
  customElements.define("premy-pointer-listener", PremyPointerListener);
}

export { PremyPointerListener };
export type {
  PremyPointerDownEvent,
  PremyPointerMoveEvent,
  PremyPointerUpEvent,
  PremyPosition,
};
