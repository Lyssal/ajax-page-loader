import AjaxLink from './ajax-link';

/**
 * The Ajax page loader.
 *
 * @author Rémi Leclerc
 */
export default class AjaxPageLoader {
  /**
   * Init the Ajax page loader.
   *
   * @param {string} selector The selector
   */
  constructor(selector = 'a[data-ajax="true"], input[type="submit"][data-ajax="true"], button[type="submit"][data-ajax="true"]') {
    this.elements = [];
    this.setSelector(selector);
    this.setDefaultTarget('body');
    this.setLoadingType('blinking');
    this.defaultMethod = 'GET';
    this.beforeFormSubmittingEvent = null;
    this.afterFormSubmittingEvent = null;
    this.beforeAjaxLoadingEvent = null;
    this.afterAjaxLoadingEvent = null;
    this.beforeContentSettingEvent = null;
    this.afterContentSettingEvent = null;
  }

  /**
   * Add elements.
   *
   * @param {string} selector The element' selector
   */
  setSelector(selector) {
    this.selector = selector;
    Object.values(global.document.querySelectorAll(selector)).forEach((element) => {
      if (element.dataset.pageLoaderInit !== 'true') {
        this.elements.push(new AjaxLink(element, this));
      }
    });
  }

  /**
   * Set the default target.
   *
   * @param {ChildNode|string} target The target
   */
  setDefaultTarget(target) {
    if (target.constructor === String) {
      this.defaultTarget = global.document.querySelector(target);
    } else {
      this.defaultTarget = target;
    }
  }

  /**
   * Set the loading type.
   *
   * @param {string|null} loadingType The loading type
   */
  setLoadingType(loadingType) {
    this.loadingType = loadingType;
  }

  /**
   * Set the event function dispatched before the form submitting.
   *
   * @param {Function} event The function
   */
  setBeforeFormSubmittingEvent(event) {
    this.beforeFormSubmittingEvent = event;
  }

  /**
   * Set the event function dispatched after the form submitting.
   *
   * @param {Function} event The function
   */
  setAfterFormSubmittingEvent(event) {
    this.afterFormSubmittingEvent = event;
  }

  /**
   * Set the event function dispatched before the Ajax loading.
   *
   * @param {Function} event The function
   */
  setBeforeAjaxLoadingEvent(event) {
    this.beforeAjaxLoadingEvent = event;
  }

  /**
   * Set the event function dispatched after the Ajax loading.
   *
   * @param {Function} event The function
   */
  setAfterAjaxLoadingEvent(event) {
    this.afterAjaxLoadingEvent = event;
  }

  /**
   * Set the event function dispatched before the content setting.
   *
   * @param {Function} event The function
   */
  setBeforeContentSettingEvent(event) {
    this.beforeContentSettingEvent = event;
  }

  /**
   * Set the event function dispatched after the content setting.
   *
   * @param {Function} event The function
   */
  setAfterContentSettingEvent(event) {
    this.afterContentSettingEvent = event;
  }
}
