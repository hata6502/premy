import "@material/mwc-dialog";
declare class KanvasCanvas extends HTMLElement {
    private canvas;
    private prevPointerPosition;
    private zoom;
    constructor();
    private getPointerPosition;
    adoptedCallback(oldDocument: Document, newDocument: Document): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private drawLine;
    private handleConnected;
    private handleDisconnected;
    private handlePointerDown;
    private handlePointerMove;
}
export { KanvasCanvas };
