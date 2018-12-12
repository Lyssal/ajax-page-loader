import Blinking from '../../../blinking/src/js/blinking';

/**
 * A Ajax link.
 *
 * @author Rémi Leclerc
 */
export default class AjaxLink {
  /**
   * Create a new link.
   *
   * @param {ChildNode} element The element
   */
  constructor(element, pageLoader) {
    this.element = element;
    this.pageLoader = pageLoader;
    this.ajaxLoader = null;
    this.initClickEvent();
    this.element.dataset.pageLoaderInit = 'true';
  }

  /**
   * Init the click event.
   */
  initClickEvent() {
    // If there is a click event, we got it to see if the event have to be stopped or not
    const onclickEvent = (typeof this.element.context !== 'undefined' ? this.element.context.onclick : null);
    if (onclickEvent !== null) {
      this.element.removeEventListener('click', onclickEvent, true);
      this.element.removeAttribute('onclick');
    }

    this.element.addEventListener('click', (event) => {
      if (onclickEvent !== null) {
        const clickReturn = onclickEvent();
        if (!clickReturn) {
          event.preventDefault();
          return;
        }
      }

      this.click();
      event.preventDefault();
    });
  }

  /**
   * The click event.
   *
   * @param {boolean} refreshTargets If we have to refresh targets
   * @returns {boolean} The event response
   */
  click(refreshTargets = true) {
    const url = this.getUrl();

    if (url !== null && typeof url !== 'undefined') {
      const targetElement = this.getTargetElement();
      const ajaxOptions = {
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'X-Requested-With': 'Fetch',
        },
      };
      let isForm = false;

      // Options for form
      if (!this.isLink()) {
        const form = this.getForm();
        if (form !== null) {
          isForm = true;
          ajaxOptions.method = AjaxLink.getElementAttribute(form, 'method', 'POST');

          this.processEvent('data-before-form-submitting', this.pageLoader.beforeFormSubmittingEvent);

          if (ajaxOptions.method.toLowerCase() === 'get') {
            ajaxOptions.data = AjaxLink.serializeFormGet(form);
          } else {
            ajaxOptions.data = new global.window.FormData(form);
          }

          // Add the button name, useful if there are many buttons
          // (to manage after a redirection for example)
          const buttonName = this.getAttribute('name');
          if (buttonName !== null) {
            if (ajaxOptions.method.toLowerCase() === 'get') {
              ajaxOptions.data += `&${encodeURI(buttonName)}=${encodeURI(this.element.value)}`;
            } else {
              ajaxOptions.data.append(buttonName, this.element.value);
            }
          }
        } else {
          ajaxOptions.method = this.getAttribute('data-method', this.pageLoader.defaultMethod);
        }
      }

      // let ajaxLoader = null;
      if (targetElement !== null && targetElement !== '') {
        this.displayLoading(targetElement);
      }
      const redirectUrl = this.getAttribute('data-redirect-url');

      this.processEvent('data-before-ajax-loading', this.pageLoader.beforeAjaxLoadingEvent);

      global.fetch(url, ajaxOptions)
        .then((response) => {
          if (!response.ok) {
            throw Error(response);
          }
          return response.text();
        })
        .then((html) => {
          if (redirectUrl === null) {
            this.updateAjaxContent(html);
          } else {
            global.fetch(redirectUrl)
              .then((response) => {
                if (!response.ok) {
                  throw Error(response);
                }
                return response.text();
              })
              .then((redirectionHtml) => {
                this.updateAjaxContent(redirectionHtml);
                this.finalizeAjaxProcess(isForm);
              })
              .catch(error => console.error(error));
          }

          if (refreshTargets) {
            const targetSelector = this.getAttribute('data-refresh-target');
            if (targetSelector !== null) {
              const refreshTargetElements = global.document.querySelectorAll(targetSelector);

              Object.values(refreshTargetElements).forEach((refreshTargetElement) => {
                const refreshTargetLink = new AjaxLink(refreshTargetElement, this.pageLoader);
                refreshTargetLink.click(false);
              });
            }
          }

          if (redirectUrl === null) {
            this.finalizeAjaxProcess(isForm);
          }
        })
        .catch(error => console.error(error));

      return false;
    }

    console.error('The element URL has not be found for the AJAX page loader.', this.element);
    return true;
  }

  /**
   * Update the page after an Ajax call.
   *
   * @param {string} html The content
   */
  updateAjaxContent(html) {
    const targetElement = this.getTargetElement();

    this.processEvent('data-before-content-setting', this.pageLoader.beforeContentSettingEvent);
    if (targetElement !== null && targetElement !== '') {
      targetElement.innerHTML = html;
    }
    this.pageLoader.setSelector(this.pageLoader.selector);
    this.processEvent('data-after-content-setting', this.pageLoader.afterContentSettingEvent);
  }

  /**
   * Process an event.
   *
   * @param {string}   dataAttribute   The element attribute used for the event function
   * @param {function} functionDefault The default function
   */
  processEvent(dataAttribute, functionDefault) {
    if (this.eventsAreActivate()) {
      const eventFunction = this.getAttribute(dataAttribute, functionDefault);

      if (eventFunction !== null) {
        if (typeof eventFunction !== 'function') {
          // If eventFunction is a script, eval will execute it
          if (this.eval(`typeof ${eventFunction}`) === 'function') {
            this.eval(`${eventFunction}(element)`);
          }
        } else {
          eventFunction(this.element);
        }
      }
    }
  }

  /**
   * Finalize the Ajax process.
   *
   * @param {Boolean} isForm If It is a submitted form
   */
  finalizeAjaxProcess(isForm) {
    this.hideLoading();
    if (isForm) {
      this.processEvent('data-after-form-submitting', this.pageLoader.afterFormSubmittingEvent);
    }
    this.processEvent('data-after-ajax-loading', this.pageLoader.afterAjaxLoadingEvent);
  }

  /**
   * Return if events are activate.
   *
   * @returns {Boolean} If activate
   */
  eventsAreActivate() {
    return this.getAttribute('data-ajax-events') !== 'false';
  }

  /**
   * Get the target element where content will be displayed.
   *
   * @returns {ChildNode}
   */
  getTargetElement() {
    const customTargetElementSelector = this.getAttribute('data-target');

    if (customTargetElementSelector !== null) {
      return global.document.querySelector(customTargetElementSelector);
    }

    return this.pageLoader.defaultTarget;
  }

  /**
   * Get the element URL.
   *
   * @returns {string|null} The URL
   */
  getUrl() {
    const url = this.getAttribute('data-url');
    if (url !== null) {
      return url;
    }

    if (this.element.hasAttribute('href')) {
      return this.getAttribute('href');
    }

    // Form button submit
    const form = this.getForm();
    if (form !== null) {
      if (form.hasAttribute('action')) {
        return form.getAttribute('action');
      }

      return global.window.location.href;
    }

    return null;
  }

  /**
   * Return if the element is a link.
   *
   * @returns {boolean} If link
   */
  isLink() {
    return this.element.getAttribute('href') !== null;
  }

  /**
   * Get the element's attribute.
   *
   * @param {string}     attribute    The attribute
   * @param {mixed|null} defaultValue The value if attribute not found
   * @returns {string|null} The attribute
   */
  getAttribute(attribute, defaultValue = null) {
    return AjaxLink.getElementAttribute(this.element, attribute, defaultValue);
  }

  /**
   * Get the element's form.
   *
   * @return {ChildNode|null} The form
   */
  getForm() {
    const forms = this.element.closest('form');

    if (forms !== null) {
      return forms[0];
    }

    return null;
  }

  /**
   * Display the animation during the loading.
   *
   * @returns {*} The used object for the animation
   */
  displayLoading(targetElement) {
    if (this.pageLoader.loadingType !== null) {
      switch (this.pageLoader.loadingType) {
        case 'blinking':
          this.ajaxLoader = new Blinking(targetElement);
          this.ajaxLoader.start();

        // no default
      }
    }

    return null;
  }

  /**
   * Remove the animation.
   *
   * @params {*} object The used object for the animation
   */
  hideLoading() {
    if (this.pageLoader.loadingType !== null && this.ajaxLoader !== null) {
      switch (this.pageLoader.loadingType) {
        case 'blinking':
          this.ajaxLoader.stop();
          break;

        // no default
      }
    }
  }


  /**
   * Get the attribute of an element.
   *
   * @param {ChildNode}  element      The element
   * @param {string}     attribute    The attribute
   * @param {mixed|null} defaultValue The value if attribute not found
   * @returns {string|null} The attribute
   */
  static getElementAttribute(element, attribute, defaultValue = null) {
    if (element.hasAttribute(attribute)) {
      return element.getAttribute(attribute);
    }

    return defaultValue;
  }

  /**
   * Serialize the form for GET method.
   *
   * @param {ChildNode} form The form
   * @returns {string} The query string
   */
  static serializeFormGet(form) {
    if (!form || form.nodeName.lower() !== 'form') {
      return '';
    }

    const query = [];
    for (let i = form.elements.length - 1; i >= 0; i -= 1) {
      if (form.elements[i].name !== '') {
        switch (form.elements[i].nodeName.lower()) {
          case 'input':
            switch (form.elements[i].type.lower()) {
              case 'checkbox':
              case 'radio':
                if (form.elements[i].checked) {
                  query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].value)}`);
                }
                break;
              case 'file':
                break;
              case 'button':
              case 'color':
              case 'date':
              case 'datetime-local':
              case 'email':
              case 'hidden':
              case 'month':
              case 'number':
              case 'password':
              case 'range':
              case 'reset':
              case 'search':
              case 'submit':
              case 'tel':
              case 'text':
              case 'time':
              case 'url':
              case 'week':
                query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].value)}`);
                break;

              // no default
            }
            break;
          case 'textarea':
            query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].value)}`);
            break;
          case 'select':
            switch (form.elements[i].type.lower()) {
              case 'select-one':
                query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].value)}`);
                break;
              case 'select-multiple':
                for (let j = form.elements[i].options.length - 1; j >= 0; j -= 1) {
                  if (form.elements[i].options[j].selected) {
                    query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].options[j].value)}`);
                  }
                }
                break;

              // no default
            }
            break;
          case 'button':
            switch (form.elements[i].type.lower()) {
              case 'reset':
              case 'submit':
              case 'button':
                query.push(`${form.elements[i].name}=${encodeURIComponent(form.elements[i].value)}`);
                break;

              // no default
            }
            break;

          // no default
        }
      }
    }

    return query.join('&');
  }
}
