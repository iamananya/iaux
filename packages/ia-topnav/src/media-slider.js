import { LitElement, html, css } from 'lit-element';
import './media-subnav';
import mediaSliderCSS from './styles/media-slider';

class MediaSlider extends LitElement {
  static get styles() {
    return mediaSliderCSS;
  }

  static get properties() {
    return {
      config: { type: Object },
      mediaSliderOpen: { type: Boolean },
      mediaSliderAnimate: { type: Boolean },
      selectedMenuOption: { type: String },
    };
  }

  constructor() {
    super();

    this.config = {};
    this.mediaSliderOpen = false;
    this.mediaSliderAnimate = false;
    this.selectedMenuOption = 'texts';
  }

  shouldUpdate() {
    const scrollPane = this.shadowRoot.querySelector('.information-menu');

    if (!scrollPane) { return true; }
    scrollPane.scroll(0, 0);
    return true;
  }

  render() {
    let sliderDetailsClass = 'menu-slider-offscreen';

    if (this.mediaSliderOpen) {
      sliderDetailsClass = 'menu-enter';
    }

    if (!this.mediaSliderOpen && this.mediaSliderAnimate) {
      sliderDetailsClass = 'menu-exit';
    }

    return html`
      <div class="information-menu ${sliderDetailsClass}">
        <div class="info-box">
          <media-subnav .config=${this.config} .menu=${this.selectedMenuOption}></media-subnav>
        </div>
      </div>
    `;
  }
}

customElements.define('media-slider', MediaSlider);