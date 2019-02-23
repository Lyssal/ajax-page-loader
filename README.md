# AJAX page loader

The Lyssal AJAX page loader permits to load pages more simply using AJAX.
Laodings are created with the Lyssal blinking library.


## Installation

### Yarn

```bash
yarn add @lyssal/blinking
```

### NPM

```bash
npm install @lyssal/blinking
```


## How to use

Set the attribute `data-ajax="true"` in your links or submit buttons to activate the AJAX page loader.

Init with:

```js
import '@lyssal/ajax-page-loader/lib/ajax-page-loader.css';
let ajaxPageLoader = new AjaxPageLoader();

// The element in which the page loader will be used
// By default, It is `body`
ajaxPageLoader.setDefaultTarget('#page');
```


## Classic use

```html
<link rel="stylesheet" href="{...}/ajax-page-loader/lib/ajax-page-loader.css">

<script type="text/javascript" src="{...}/ajax-page-loader/lib/ajax-page-loader.var.js"></script>
<script type="text/javascript">
  var ajaxPageLoader = new AjaxPageLoader();
  ajaxPageLoader.setDefaultTarget('#page');
</script>
```


## Advanced functionalities

### Default properties

You can define default properties with `AjaxPageLoader`.
Read the documentation in the JavaScript file for more informations.

For example:

```js
ajaxPageLoader.setBeforeContentSettingEvent((ajaxLink) => {
  // Go to the top of the page
  global.window.scrollTo(0, 0);
});

ajaxPageLoader.setAfterContentSettingEvent((ajaxLink) => {
  // Update something in the updated DOM
});

ajaxPageLoader.setAfterAjaxLoadingEvent((ajaxLink) => {
  // Change the browser tab title
  const url = ajaxLink.getUrl();
  global.history.pushState({}, null, url);

  // Update the tab title
  document.title = document.querySelector('h1').textContent;
});

// As we dynamically change the URL, we refresh the page when the user use back / forward buttons
window.addEventListener('popstate', function(event) {
  window.location.href = window.location.pathname;
}, false);
```


### Attributes

Always you have to use `data-ajax="true"` in your DOM element (but you can customize this attribute with the `setSelector()` method).

But you also can add these attributes in specific elements:

 * `data-target` : The element where the page will be loaded, can be empty
 * `data-url` : The URL of the AJAX call (by default, the `href` parameter of the link or the `action` parameter of the form)
 * `data-redirect-url` : The redirect location, useful to force a redirection when forms are submitted
 * `data-refresh-target` : The other elements which have to be refreshed (separated with commas) ; use `data-url` and `data-target` on these elements
 * `data-method` : The HTTP method ; by default It is `GET` or the form method for submit buttons
 * `data-before-ajax-loading` : The function name to call before the AJAX loading (the argument is the AjaxLink element)
 * `data-after-ajax-loading` : The function name to call after the AJAX loading (the argument is the AjaxLink element)
 * `data-before-form-submitting` : The function name to call before a form submit (the argument is the AjaxLink element)
 * `data-after-form-submitting` : The function name to call after a form submit (the argument is the AjaxLink element)
 * `data-before-content-setting` : The function name to call before the content setting (the argument is the AjaxLink element)
 * `data-after-content-setting` : The function name to call after the content setting (the argument is the AjaxLink element)
 * `data-ajax-events="false"` : Unactivate all events


## Technical documentation

Expect the documentation in the JavaScript files in the `@lyssal/ajax-page-loader/src/` directory.
