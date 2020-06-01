import { html } from 'lit-element';

import { PayPalButtonDataSourceInterface, PayPalButtonDataSourceDelegate } from "../../braintree-manager/payment-providers/paypal/paypal-button-datasource";
import { DonationResponse } from "../../models/response-models/donation-response";
import { ModalManagerInterface } from "../../modal-manager/modal-manager";
import { BraintreeManagerInterface } from "../../braintree-manager/braintree-manager";
import { DonationType } from "../../models/donation-info/donation-type";
import { DonationPaymentInfo } from "../../models/donation-info/donation-payment-info";
import { ModalConfig } from '../../modal-manager/modal-template';

import '../../modals/upsell-modal-content';

export interface PayPalFlowHandlerInterface {
  updateDonationInfo(donationInfo: DonationPaymentInfo): void;
  updateUpsellDonationInfo(donationInfo: DonationPaymentInfo): void;
  renderPayPalButton(): Promise<void>;
  showUpsellModal(): Promise<void>;
  renderUpsellPayPalButton(): Promise<void>;
}

export class PayPalFlowHandler implements PayPalFlowHandlerInterface, PayPalButtonDataSourceDelegate {
  private paypalUpsellButtonDataSource?: PayPalButtonDataSourceInterface;

  private paypalDataSource?: PayPalButtonDataSourceInterface;

  private modalManager: ModalManagerInterface;

  private braintreeManager: BraintreeManagerInterface;

  updateDonationInfo(donationInfo: DonationPaymentInfo): void {
    this.paypalDataSource?.updateDonationInfo(donationInfo);
  }

  updateUpsellDonationInfo(donationInfo: DonationPaymentInfo): void {
    this.paypalUpsellButtonDataSource?.updateDonationInfo(donationInfo);
  }

  constructor(options: {
    braintreeManager: BraintreeManagerInterface,
    modalManager: ModalManagerInterface
  }) {
    this.braintreeManager = options.braintreeManager;
    this.modalManager = options.modalManager;
  }

  payPalPaymentStarted(options: object): void {
    console.debug('PaymentSector:payPalPaymentStarted options:', options);
  }

  payPalPaymentAuthorized(payload: braintree.PayPalCheckoutTokenizePayload, response: DonationResponse): void {
    console.debug('PaymentSector:payPalPaymentAuthorized payload,response', payload,response);
    this.showUpsellModal();
  }

  payPalPaymentCancelled(data: object): void {
    console.debug('PaymentSector:payPalPaymentCancelled data:', data);
  }

  payPalPaymentError(error: string): void {
    console.debug('PaymentSector:payPalPaymentError error:', error);
  }

  async renderPayPalButton(): Promise<void> {
    const donationInfo = new DonationPaymentInfo({
      donationType: DonationType.OneTime,
      amount: 5
    });

    this.paypalDataSource = await this.braintreeManager?.paymentProviders.paypalHandler?.renderPayPalButton({
      selector: '#paypal-button',
      style: {
        color: 'blue' as paypal.ButtonColorOption, // I'm not sure why I can't access the enum directly here.. I get a UMD error
        label: 'paypal' as paypal.ButtonLabelOption,
        shape: 'rect' as paypal.ButtonShapeOption,
        size: 'small' as paypal.ButtonSizeOption,
        tagline: false
      },
      donationInfo: donationInfo
    });
    if (this.paypalDataSource) {
      this.paypalDataSource.delegate = this;
    }
  }

  private showYesButton = false

  async showUpsellModal(): Promise<void> {
    const customContent = html`
      <upsell-modal-content
        ?showYesButton=${this.showYesButton}
        @yesSelected=${this.yesSelected.bind(this)}
        @noThanksSelected=${this.noThanksSelected.bind(this)}>
        <slot name="paypal-upsell-button"></slot>
      </upsell-modal-content>
    `;

    const modalConfig = new ModalConfig();
    modalConfig.headerColor = 'green';
    modalConfig.title = 'Thank You!';
    modalConfig.headline = 'Thanks for becoming a donor!';
    modalConfig.message = 'Would you like to become a monthly supporter?';
    modalConfig.showProcessingIndicator = false;

    this.modalManager?.showModal(modalConfig, customContent);

    if (!this.paypalUpsellButtonDataSource) {
      this.renderUpsellPayPalButton();
    }
  }

  private yesSelected(e: CustomEvent): void {
    console.debug('yesSelected', e.detail.amount);
    this.modalManager.closeModal();
  }

  private noThanksSelected(): void {
    console.debug('noThanksSelected');
    this.modalManager.closeModal();
  }

  async renderUpsellPayPalButton(): Promise<void> {
    const upsellDonationInfo = new DonationPaymentInfo({
      donationType: DonationType.Upsell,
      amount: 10
    });

    this.paypalUpsellButtonDataSource = await this.braintreeManager?.paymentProviders.paypalHandler?.renderPayPalButton({
      selector: '#paypal-upsell-button',
      style: {
        color: 'gold' as paypal.ButtonColorOption, // I'm not sure why I can't access the enum directly here.. I get a UMD error
        label: 'paypal' as paypal.ButtonLabelOption,
        shape: 'rect' as paypal.ButtonShapeOption,
        size: 'small' as paypal.ButtonSizeOption,
        tagline: false
      },
      donationInfo: upsellDonationInfo
    });
  }

}