import "./KanvasCanvas";
declare const dialogMaxWidth = 1280;
declare class KanvasDialog extends HTMLElement {
    static get observedAttributes(): string[];
    private dialog;
    constructor();
    attributeChangedCallback(): void;
    connectedCallback(): void;
    private handleAttributeChange;
    private handleClosed;
    private handleOpening;
}
export { KanvasDialog, dialogMaxWidth };
