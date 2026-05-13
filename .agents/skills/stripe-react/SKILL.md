# React Stripe.js reference

Learn about React components for Stripe.js and Stripe Elements.

# Elements

> This is a Elements for when ui is embedded-components. View the full page at <https://docs.stripe.com/sdks/stripejs-react?ui=embedded-components>.

If you want to see how React Stripe.js works or help develop it, see the [project on GitHub](https://github.com/stripe/react-stripe-js). You can also view the changelog on the [Releases tab](https://github.com/stripe/react-stripe-js/releases).

React Stripe.js is a thin wrapper around [Stripe Elements](https://docs.stripe.com/payments/elements.md). It allows you to add Elements to any React app.

The [Stripe.js reference](https://docs.stripe.com/js/custom_checkout/create_payment_element) covers complete Elements customization details.

You can use Elements with any Stripe product to collect online payments. To find the right integration path for your business, [explore our docs](https://docs.stripe.com/.md).

> This reference covers the full React Stripe.js API. If you prefer to learn by doing, check out our documentation on [accepting a payment](https://docs.stripe.com/payments/accept-a-payment.md?platform=web) or take a look at a [sample integration](https://docs.stripe.com/payments/quickstart-checkout-sessions.md).

## Before you begin

This doc assumes that you already have a basic working knowledge of [React](https://reactjs.org/) and that you’ve already set up a React project. If you’re new to React, we recommend that you take a look at the [Getting Started](https://react.dev/learn) guide before continuing.

## Setup

#### npm

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry.

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

#### yarn

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry.

```bash
yarn add @stripe/react-stripe-js @stripe/stripe-js
```

#### umd

We also provide a UMD build for sites that don’t use npm or modules.

Include the Stripe.js script, which exports a global `Stripe` function, and the UMD build of React Stripe.js, which exports a global `ReactStripe` object. Always load the Stripe.js script directly from **js.stripe.com** to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

```html
<!-- Stripe.js -->
<script src="https://js.stripe.com/dahlia/stripe.js"></script>

<!-- React Stripe.js development build -->
<script src="https://unpkg.com/@stripe/react-stripe-js@latest/dist/react-stripe.umd.js"></script>

<!-- When you are ready to deploy your site to production, remove the
     above development script, and include the following production build. -->
<script src="https://unpkg.com/@stripe/react-stripe-js@latest/dist/react-stripe.umd.min.js"></script>
```

## CheckoutElementsProvider

The `CheckoutElementsProvider` allows you to use [Element components](https://docs.stripe.com/sdks/stripejs-react.md#element-components) and access the [Stripe object](https://docs.stripe.com/js/initializing) in any nested component. Render a `CheckoutElementsProvider` at the root of your React app so that it’s available everywhere you need it.

To use the `CheckoutElementsProvider`, call [loadStripe](https://github.com/stripe/stripe-js/blob/master/README.md#loadstripe) from `@stripe/stripe-js` with your publishable key. The `loadStripe` function asynchronously loads the Stripe.js script and initializes a Stripe object. Pass the returned `Promise` to the `CheckoutElementsProvider`.

See [Create a Checkout Session](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=checkout#create-checkout-session) for an example of what your endpoint might look like.

```jsx

import {CheckoutElementsProvider} from '@stripe/react-stripe-js/checkout';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('<<YOUR_PUBLISHABLE_KEY>>');

export default function App() {
  const promise = useMemo(() => {
    return fetch('/create-checkout-session', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  return (

    <CheckoutElementsProvider stripe={stripePromise} options={{clientSecret: promise}}>
      <CheckoutForm />
    </CheckoutElementsProvider>
  );
}
```

| prop      | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stripe`  | (required) `Stripe | null | Promise<Stripe | null>`

  A [Stripe object](https://docs.stripe.com/js/initializing) or a `Promise` resolving to a Stripe object. We recommend using the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme) to initialize a Stripe object. After you set this prop, you can’t change it.

  You can also pass in `null` or a `Promise` resolving to `null` if you’re performing an initial server-side render or when generating a static site. |
| `options` | (required) `Object`

  CheckoutElementsProvider configuration options. [See available options](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider#react_checkout_provider-options). You must provide the `clientSecret` of the created Checkout Session. See [Create a Checkout Session](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=checkout#create-checkout-session) for an example.                                                                 |

## Element components

Element components allow you to securely collect payment information in your React app and place the Elements wherever you want on your checkout page. You can also customize the appearance.

You can mount individual Element components inside of your `CheckoutElementsProvider` tree. You can only mount one of each type of Element in a single `<CheckoutElementsProvider>`.

```jsx
import {PaymentElement} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  return (
    <form>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

export default CheckoutForm;
```

| prop            | description                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | (optional) `Object`

  An object containing Element configuration options. [See available options](https://docs.stripe.com/js/custom_checkout/create_payment_element) for the Payment Element.                                                                                                                                                                                                                                                  |
| `onBlur`        | (optional) `() => void`

  Triggered when the Element loses focus.                                                                                                                                                                                                                                                                                                                                                                              |
| `onChange`      | (optional) `(event: Object) => void`

  Triggered when data exposed by this Element changes.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_change?type=paymentElement#element_on_change-handler).                                                                                                                                                                                    |
| `onEscape`      | (optional) `(event: Object) => void`

  Triggered when the escape key is pressed within an Element.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_escape).                                                                                                                                                                                                                           |
| `onFocus`       | (optional) `() => void`

  Triggered when the Element receives focus.                                                                                                                                                                                                                                                                                                                                                                           |
| `onLoaderror`   | (optional) `(event: Object) => void`

  Triggered when the Element fails to load.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_loaderror).                                                                                                                                                                                                                                          |
| `onLoaderStart` | (optional) `(event: Object) => void`

  Triggered when the [loader](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-elementsOptions-loader) UI is mounted to the DOM and ready to be displayed.

  You only receive these events from the `payment`, `paymentForm`, and `address` Elements.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_loaderstart). |
| `onReady`       | (optional) `(element: Element) => void`

  Triggered when the Element is fully rendered and can accept imperative `element.focus()` calls. Called with a reference to the underlying Element instance.                                                                                                                                                                                                                                          |

### Calling imperative Element methods

Props such as `onFocus` and `onBlur` are event handlers that respond to user interaction. To programmatically call methods such as `focus()` on the underlying Element instance, use the `onReady` prop to capture a reference to the Element when it mounts.

```jsx
import {useState} from 'react';
import {PaymentElement} from '@stripe/react-stripe-js/checkout';

function CheckoutForm() {
  const [paymentElement, setPaymentElement] = useState(null);

  return (
    <>
      <PaymentElement onReady={setPaymentElement} />
      <button type="button" onClick={() => paymentElement?.focus()}>
        Focus payment element
      </button>
    </>
  );
}
```

### Available Element components

You can use several different kinds of Elements for collecting information on your checkout page. These are the available Elements:

| Component                       | Usage                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BillingAddressElement`         | Collects billing address details for more than 236 regional formats. To learn more, see the [Address Element](https://docs.stripe.com/payments/advanced/collect-addresses.md?payment-ui=embedded-components) documentation.                                                                                        |
| `CurrencySelectorElement`       | Allows customers to select the currency for their payment with Adaptive Pricing. To learn more, see the [Currency Selector Element](https://docs.stripe.com/elements/currency-selector-element.md) documentation.                                                                                                  |
| `ExpressCheckoutElement`        | Allows you to accept card or wallet payments through one or more payment buttons, including Apple Pay, Google Pay, Link, or PayPal. To learn more, see the [Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment.md?payment-ui=embedded-components) documentation. |
| `PaymentElement`                | Collects payment details for [more than 25 payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md) from around the globe. To learn more, see the [Payment Element](https://docs.stripe.com/payments/quickstart-checkout-sessions.md) documentation.                              |
| `PaymentMethodMessagingElement` | Show your customers available buy now, pay later plans. To learn more, see the [Payment Method Messaging Element](https://docs.stripe.com/elements/payment-method-messaging.md) documentation.                                                                                                                     |
| `ShippingAddressElement`        | Collects shipping address details for more than 236 regional formats. To learn more, see the [Address Element](https://docs.stripe.com/payments/advanced/collect-addresses.md?payment-ui=embedded-components) documentation.                                                                                       |
| `TaxIdElement`                  | Collects tax ID information from your customers, including business name and tax identification number. To learn more, see the [Tax ID Element](https://docs.stripe.com/elements/tax-id-element.md) documentation.                                                                                                 |

## useCheckoutElements hook

#### `useCheckoutElements(): CheckoutValue`

Use the [useCheckoutElements](https://docs.stripe.com/js/react_stripe_js/checkout/use_checkout_elements) hook in your components to get the `Checkout` object, which contains data from the Checkout Session, and methods to update and confirm the Session. Use `useCheckoutElements` inside a [CheckoutElementsProvider](https://docs.stripe.com/sdks/stripejs-react.md#checkout-provider). If you use a [CheckoutFormProvider](https://docs.stripe.com/js/react_stripe_js/checkout_form/checkout_form_provider) instead, use [useCheckoutForm](https://docs.stripe.com/js/react_stripe_js/checkout_form/use_checkout_form) inside it.

> In `@stripe/react-stripe-js` versions before v6, use [useCheckout](https://docs.stripe.com/js/react_stripe_js/checkout/use_checkout) instead.

```jsx
import {useCheckoutElements, PaymentElement} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {const checkoutState = useCheckoutElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (checkoutState.type === 'loading') {
      return (
        <div>Loading...</div>
      );
    } else if (checkoutState.type === 'error') {
      return (
        <div>Error: {checkoutState.error.message}</div>
      );
    }

    // checkoutState.type === 'success'
    const {checkout} = checkoutState;const result = await checkout.confirm();

    if (result.type === 'error') {
      // Show error to your customer (for example, payment details incomplete)
      console.log(result.error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button>Submit</button>
    </form>
  )
};

export default CheckoutForm;
```

## Customization and styling

We recognize that the use of iframes makes styling an Element more difficult, but they shift the burden of securely handling payment data to Stripe and allows you to keep your site [compliant with industry regulations](https://docs.stripe.com/security/guide.md#validating-pci-compliance).

Each element is mounted in an `iframe`, which means that Elements probably won’t work with any existing styling and component frameworks that you have. Despite this, you can still configure Elements to match the design of your site. To customize Elements, you [respond to events](https://docs.stripe.com/js/element/events) and configure Elements with the [appearance option](https://docs.stripe.com/elements/appearance-api.md). The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and so on.

## Next steps

Build an integration with React Stripe.js and Elements with the Checkout Sessions API.

- [Accept a payment](https://docs.stripe.com/payments/quickstart-checkout-sessions.md)
- [Add the Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment.md?payment-ui=embedded-components)
- [The Elements Appearance API](https://docs.stripe.com/payments/checkout/customization/appearance.md?payment-ui=embedded-components)
- [Stripe.js reference](https://docs.stripe.com/js/custom_checkout)

# Advanced integration

> This is a Advanced integration for when ui is elements. View the full page at <https://docs.stripe.com/sdks/stripejs-react?ui=elements>.

If you want to see how React Stripe.js works or help develop it, check out the [project on GitHub](https://github.com/stripe/react-stripe-js). You can also view the changelog on the [Releases tab](https://github.com/stripe/react-stripe-js/releases).

React Stripe.js is a thin wrapper around [Stripe Elements](https://docs.stripe.com/payments/elements.md). It allows you to add Elements to any React app.

The [Stripe.js reference](https://docs.stripe.com/js/elements_object/create_payment_element#payment_element_create-options) covers complete Elements customization details.

You can use Elements with any Stripe product to collect online payments. To find the right integration path for your business, [see our documentation](https://docs.stripe.com/.md).

> This reference covers the full React Stripe.js API. If you prefer to learn by doing, check out our documentation on [accepting a payment](https://docs.stripe.com/payments/accept-a-payment.md?platform=web) or look at a [sample integration](https://docs.stripe.com/payments/quickstart.md).

## Before you begin

This documentation assumes that you already have a basic working knowledge of [React](https://reactjs.org/) and that you’ve already set up a React project. If you’re new to React, we recommend that you look at the [Getting Started](https://react.dev/learn) guide before continuing.

## Setup

#### npm

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry.

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

#### yarn

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry.

```bash
yarn add @stripe/react-stripe-js @stripe/stripe-js
```

#### umd

We also provide a UMD build for sites that don’t use npm or modules.

Include the Stripe.js script, which exports a global `Stripe` function, and the UMD build of React Stripe.js, which exports a global `ReactStripe` object. Always load the Stripe.js script directly from **js.stripe.com** to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

```html
<!-- Stripe.js -->
<script src="https://js.stripe.com/dahlia/stripe.js"></script>

<!-- React Stripe.js development build -->
<script src="https://unpkg.com/@stripe/react-stripe-js@latest/dist/react-stripe.umd.js"></script>

<!-- When you are ready to deploy your site to production, remove the
     above development script, and include the following production build. -->
<script src="https://unpkg.com/@stripe/react-stripe-js@latest/dist/react-stripe.umd.min.js"></script>
```

## Elements provider

The `Elements` provider allows you to use [Element components](https://docs.stripe.com/sdks/stripejs-react.md#element-components) and access the [Stripe object](https://docs.stripe.com/js/initializing) in any nested component. Render an `Elements` provider at the root of your React app so that it’s available everywhere you need it.

To use the `Elements` provider, call [loadStripe](https://github.com/stripe/stripe-js/blob/master/README.md#loadstripe) from `@stripe/stripe-js` with your publishable key. The `loadStripe` function asynchronously loads the Stripe.js script and initializes a Stripe object. Pass the returned `Promise` to `Elements`.

```jsx
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('<<YOUR_PUBLISHABLE_KEY>>');

export default function App() {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: '{{CLIENT_SECRET}}',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};
```

| prop      | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stripe`  | (required) `Stripe | null | Promise<Stripe | null>`

  A [Stripe object](https://docs.stripe.com/js/initializing) or a `Promise` resolving to a Stripe object. The easiest way to initialize a Stripe object is with the [Stripe.js wrapper module](https://github.com/stripe/stripe-js/blob/master/README.md#readme). After you set this prop, you can’t change it.

  You can also pass in `null` or a `Promise` resolving to `null` if you’re performing an initial server-side render or when generating a static site.                                                                                                                           |
| `options` | (optional) `Object`

  Optional Elements configuration options. [See available options](https://docs.stripe.com/js/elements_object/create#stripe_elements-options). To create Payment Elements, you must include the Intent’s `clientSecret` unless [you render the element before creating the Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?platform=web).

  Because props are immutable, you can’t change `options` after setting it. However, you can change the appearance of an element by calling the [elements.update](https://docs.stripe.com/js/elements_object/update#elements_update-options-appearance) method. |

## Element components

Element components provide a flexible way to securely collect payment information in your React app.

You can mount individual Element components inside of your `Elements` tree. You can only mount one of each type of Element in a single `<Elements>` group.

```jsx
import {PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

export default CheckoutForm;
```

| prop            | description                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | (optional) `string`

  Passes through to the [Element’s container](https://docs.stripe.com/js/element/the_element_container).                                                                                                                                                                                                                                                                                                                      |
| `className`     | (optional) `string`

  Passes through to the [Element’s container](https://docs.stripe.com/js/element/the_element_container).                                                                                                                                                                                                                                                                                                                      |
| `options`       | (optional) `Object`

  An object containing Element configuration options. [See available options](https://docs.stripe.com/js/elements_object/create_payment_element#payment_element_create-options) for the Payment Element.                                                                                                                                                                                                                      |
| `onBlur`        | (optional) `() => void`

  Triggered when the Element loses focus.                                                                                                                                                                                                                                                                                                                                                                                 |
| `onChange`      | (optional) `(event: Object) => void`

  Triggered when data exposed by this Element is changed (for example, when there is an error).

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_change?type=paymentElement#element_on_change-handler).                                                                                                                                              |
| `onClick`       | (optional) `(event: Object) => void`

  Triggered by the `<ExpressCheckoutElement>` when it’s clicked.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_click#element_on_click-handler).                                                                                                                                                                                                   |
| `onEscape`      | (optional) `(event: Object) => void`

  Triggered when the escape key is pressed within an Element.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_escape).                                                                                                                                                                                                                              |
| `onFocus`       | (optional) `() => void`

  Triggered when the Element receives focus.                                                                                                                                                                                                                                                                                                                                                                              |
| `onLoaderror`   | (optional) `(event: Object) => void`

  Triggered when the Element fails to load.

  You only receive these events from the `payment`, `linkAuthentication`, `address`, and `expressCheckout` Elements.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_loaderror).                                                                                                                       |
| `onLoaderStart` | (optional) `(event: Object) => void`

  Triggered when the [loader](https://docs.stripe.com/js/elements_object/create#stripe_elements-options-loader) UI is mounted to the DOM and ready to be displayed.

  You only receive these events from the `payment`, `paymentForm`, `linkAuthentication`, and `address` Elements.

  For more information, refer to the [Stripe.js reference](https://docs.stripe.com/js/element/events/on_loaderstart). |
| `onReady`       | (optional) `(element: Element) => void`

  Triggered when the Element is fully rendered and can accept imperative `element.focus()` calls. Called with a reference to the underlying Element instance.                                                                                                                                                                                                                                             |

### Available Element components

There are many different kinds of Elements, useful for collecting different kinds of payment information. These are the available Elements today.

| Component                       | Usage                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AddressElement`                | Collects address details for 236+ regional formats. To learn more, see the [Address Element](https://docs.stripe.com/payments/advanced/collect-addresses.md?platform=web&client=react) documentation.                                                                                                                      |
| `ExpressCheckoutElement`        | Allows you to accept card or wallet payments through one or more payment buttons, including Apple Pay, Google Pay, Link, or PayPal. To learn more, see the [Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element.md) documentation.                                                         |
| `LinkAuthenticationElement`     | Collects email addresses and allows users to log in to Link. To learn more, see the [Link Authentication Element](https://docs.stripe.com/payments/elements/link-authentication-element.md) documentation.                                                                                                                 |
| `PaymentElement`                | Collects payment details for [25+ payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md) from around the globe. To learn more, see the [Payment Element](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=checkout&client=react) documentation. |
| `PaymentMethodMessagingElement` | Show your customers available buy now, pay later plans. To learn more, see the [Payment Method Messaging Element](https://docs.stripe.com/elements/payment-method-messaging.md) documentation.                                                                                                                             |
| `TaxIdElement`                  | Collects tax ID information from your customers, including business name and tax identification number. To learn more, see the [Tax ID Element](https://docs.stripe.com/elements/tax-id-element.md) documentation.                                                                                                         |

## useElements hook

#### `useElements(): Elements | null`

To safely pass the payment information collected by the Payment Element to the Stripe API, access the `Elements` instance so that you can use it with [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment). If you use the [React Hooks API](https://react.dev/reference/react), then `useElements` is the recommended way to access a mounted Element. If you need to access an Element from a class component, use [ElementsConsumer](https://docs.stripe.com/sdks/stripejs-react.md#elements-consumer) instead.

> If you pass a `Promise` to the [Elements provider](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider) and the `Promise` hasn’t yet resolved, then `useElements` will return `null`.

```jsx
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmPayment({//`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
    });

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      console.log(result.error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  )
};

export default CheckoutForm;
```

### Calling imperative Element methods

Props such as `onFocus` and `onBlur` are event handlers that respond to user interaction. To programmatically call methods such as `focus()` on the underlying Element instance, use `useElements` to retrieve the mounted Element with `elements.getElement(...)`.

```jsx
import {PaymentElement, useElements} from '@stripe/react-stripe-js';

function MyForm() {
  const elements = useElements();

  const handleClick = () => {
    const paymentElement = elements?.getElement(PaymentElement);
    paymentElement?.focus();
  };

  return (
    <>
      <PaymentElement />
      <button type="button" onClick={handleClick}>
        Focus payment element
      </button>
    </>
  );
}
```

## useStripe hook

#### `useStripe(): Stripe | null`

The `useStripe` [hook](https://react.dev/reference/react) returns a reference to the [Stripe](https://docs.stripe.com/js/initializing) instance passed to the [Elements](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider) provider. If you need to access the Stripe object from a class component, use [ElementsConsumer](https://docs.stripe.com/sdks/stripejs-react.md#elements-consumer) instead.

> If you pass a `Promise` to the [Elements provider](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider) and the `Promise` hasn’t yet resolved, then `useStripe` will return `null`.

```jsx
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
    });


    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      console.log(result.error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  )
};

export default CheckoutForm;
```

## ElementsConsumer

To safely pass the payment information collected by the Payment Element to the Stripe API, access the `Elements` instance so that you can use it with [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment). If you need to access the Stripe object or an Element from a class component, then `ElementsConsumer` provides an alternative to the [useElements](https://docs.stripe.com/sdks/stripejs-react.md#useelements-hook) and [useStripe](https://docs.stripe.com/sdks/stripejs-react.md#usestripe-hook) hooks.

```jsx
import {ElementsConsumer, PaymentElement} from '@stripe/react-stripe-js';

class CheckoutForm extends React.Component {
  handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
const {stripe, elements} = this.props;

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
    });

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
      console.log(result.error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <PaymentElement />
        <button disabled={!this.props.stripe}>Submit</button>
      </form>
    );
  }
}

export default function InjectedCheckoutForm() {
  return (<ElementsConsumer>
      {({stripe, elements}) => (
        <CheckoutForm stripe={stripe} elements={elements} />
      )}
    </ElementsConsumer>
  )
}
```

| prop       | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | (required) `({elements, stripe}) => ReactNode`

  This component takes a [function as child](https://reactjs.org/docs/render-props.html#using-props-other-than-render). The function that you provide will be called with the [Elements object](https://docs.stripe.com/js/elements_object) that is managing your Element components and the [Stripe object](https://docs.stripe.com/js/initializing) that you passed to [<Elements>](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider).

  If you pass a `Promise` to the [Elements provider](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider) and the `Promise` hasn’t yet resolved, then `stripe` and `elements` will be `null`. |

## Customization and styling

We recognize that the use of iframes makes styling an Element more difficult, but they shift the burden of securely handling payment data to Stripe and allows you to keep your site [compliant with industry regulation](https://docs.stripe.com/security/guide.md#validating-pci-compliance).

Each element is mounted in an `iframe`, which means that Elements probably won’t work with any existing styling and component frameworks that you have. Despite this, you can still configure Elements to match the design of your site. Customizing Elements consists of [responding to events](https://docs.stripe.com/js/element/events) and configuring Elements with the [appearance](https://docs.stripe.com/elements/appearance-api.md) option. The layout of each Element stays consistent, but you can modify colors, fonts, borders, padding, and more.

## Next steps

Build an integration with React Stripe.js and Elements.

- [Accept a payment](https://docs.stripe.com/payments/quickstart.md)
- [Accept a payment with the Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment.md)
- [Adding the Payment Request Button](https://docs.stripe.com/stripe-js/elements/payment-request-button.md)
- [Learn about the Elements Appearance API](https://docs.stripe.com/elements/appearance-api.md)
- [Stripe.js reference](https://docs.stripe.com/js.md)
