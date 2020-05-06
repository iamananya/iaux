import {
  LitElement,
  html,
  css,
  customElement,
  CSSResult,
  TemplateResult,
  property,
  PropertyValues,
  query,
} from 'lit-element';
import { BraintreeManagerInterface } from './braintree-manager';

@customElement('payment-selector')
export class PaymentSelector extends LitElement {
  @property({ type: Object }) braintreeManager: BraintreeManagerInterface | undefined;

  @property({ type: Boolean }) private creditCardVisible = false;

  /** @inheritdoc */
  render(): TemplateResult {
    return html`
      <button>Apple Pay</button>
      <button>Google Pay</button>
      <button>Venmo</button>
      <button>PayPal</button>
      <button @click=${this.toggleCreditCard}>Credit Card</button>
      ${this.creditCardVisible ? html`<slot></slot>` : ''}
    `;
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('braintreeManager')) {
      this.braintreeManager?.setupHostedFields();
    }
  }

  private toggleCreditCard(): void {
    this.creditCardVisible = !this.creditCardVisible;
  }

  /** @inheritdoc */
  static get styles(): CSSResult {
    return css`
      div[slot='braintree-hosted-fields'] div {
        height: 30px;
      }
    `;
  }
}
