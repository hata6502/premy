import "@material/mwc-dialog";

class KanvasDialog extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #dialog {
          --mdc-dialog-max-width: 1280px;
        }
      </style>

      <mwc-dialog id="dialog" open>
        Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog Dialog 
      </mwc-dialog>
    `;
  }
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog };
