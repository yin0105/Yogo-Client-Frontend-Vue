<template>
  <div v-bind:style="{
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'zIndex': '9900',
      'background': 'rgba(0,0,0,.6)',
      'minWidth': '100vw',
      'minHeight': '100vh',
      'height': '100%',
      'width': '100%',
      'display': ['-webkit-box','-webkit-flex','-ms-flexbox','flex'],
      'webkitBoxPack': 'center',
      'webkitJustifyContent': 'center',
      'msFlexPack': 'center',
      'justifyContent': 'center',
      'webkitBoxAlign': 'start',
      'webkitAlignItems': 'flexStart',
      'msFlexAlign': 'start',
      'alignItems': 'flexStart',
      'padding': '0',
      'margin': '0',
      'overflow': 'auto'
    }">
      <form id="payment-form" @submit.prevent="checkoutSubmit" v-bind:style="{margin: 'auto', backgroundColor: 'antiquewhite'}">
        <div id="card-element" class="overflow-hidden"></div>
        <button  id="btnPayNow" type="submit" @click="checkoutSubmit" :disabled="buttonDisabled" >
          <div v-if="spin" class="spinner" id="spinner"></div>
          <span v-else id="button-text">Pay now</span>
        </button>
        <p id="card-error" role="alert"></p>
        <p class="result-message hidden">
          Payment succeeded, see the result in your
          <a href="" target="_blank">Stripe dashboard.</a> Refresh the page to pay again.
        </p>
        <button type="button"
            @click="close"
        >
          {{ $t('global.close') }}
        </button>
      </form>
      
    </div>
</template>

<script>

import { loadStripe } from "@stripe/stripe-js";
import YogoApi from '../gateways/YogoApi';

export default {

  name: "StripeCheckoutRecurring",
  data() {
    return {
      card: null,
      stripe: null,
      clientSecret: null,
      showStripeCheckout: true,
      buttonDisabled: true,
      spin: false,
      customerId: '',
    };
  },

  props: {
      membership: Object,
      amount: Number,
  },

  async mounted() {
    document.querySelector("#btnPayNow").disabled = true;
    console.log("amount = ", this.amount );
    const result = await YogoApi.post(`/payments/stripe/create-recurring-session/${this.amount}`);
    console.log("result = ", result);
    const publishableKey = await YogoApi.get('/payments/stripe/get-publishable-key');
    this.clientSecret = result.clientSecret;
    this.customerId = result.customerId;
    console.log("this.customerId = ", this.customerId);
    console.log("this.membership = ", this.membership);
    this.stripe = await loadStripe(publishableKey,  {
      stripeAccount: result.accountId
    });    
    const elements = this.stripe.elements();
    const style = {
        base: {
            color: "#32325d",
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
            color: "#32325d"
            }
        },
        invalid: {
            fontFamily: 'Arial, sans-serif',
            color: "#fa755a",
            iconColor: "#fa755a"
        }
    };
    this.card = elements.create("card", { style: style });
    this.mountCard();
    this.loading = false;
  },

  methods: {
    mountCard() {
      console.log("card = ", this.card)
      this.card.mount("#card-element");
      this.card.on("change", this.cardNumChange);
    },

    cardNumChange (event) { 
      this.buttonDisabled = event.empty;
      console.log("change: ", event.empty, this.buttonDisabled)
      document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
    },

    async checkoutSubmit(event) {
      event.preventDefault();
      this.buttonDisabled = false;
      console.log("submit");
      await this.payWithCard();
    },

    async payWithCard () {

      if (!this.stripe || !this.card) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }
      this.checkoutLoading(true);
      this.buttonDisabled = false;
      const customerId = this.customerId;
      const membershipId = this.membership.id;
      this.stripe.confirmCardPayment(this.clientSecret, {
          payment_method: {
            card: this.card
          },
          setup_future_usage: 'off_session'
        })
        .then(async function(result) {
          if (result.error) {
            // Show error to your customer
            let errorMsg = document.querySelector("#card-error");
            errorMsg.textContent = result.error.message;
            setTimeout(function() {
              errorMsg.textContent = "";
            }, 4000);
          } else {
            // The payment succeeded!
            console.log("paymentIntent.status = ", result.paymentIntent.status);
            if (result.paymentIntent.status == "succeeded") {
                const paymentMethodId = result.paymentIntent.payment_method;
                console.log("paymentMethodId = ", paymentMethodId);
                console.log("paymentIntent = ", result.paymentIntent);
                console.log("customerId = ", customerId);

                await YogoApi.post('/payments/stripe/attach-card-to-membership', {
                    paymentIntentId: paymentMethodId,
                    customerId: customerId,
                    membership: membershipId,
                });
            }
            document
              .querySelector(".result-message a")
              .setAttribute(
                "href",
                "https://dashboard.stripe.com/test/payments/" + result.paymentIntent.id
              );
            document.querySelector(".result-message").classList.remove("hidden");
            document.querySelector("#btnPayNow").disabled = true;
          }
        });
      
      this.checkoutLoading(false);
    },

    checkoutLoading(isLoading) {
      if (isLoading) {
        // Disable the button and show a spinner
        this.buttonDisabled = true;
        this.spin = true;
        // document.querySelector("#spinner").classList.remove("hidden");
        // document.querySelector("#button-text").classList.add("hidden");
      } else {
        this.buttonDisabled = false;
        this.spin = false;
        // document.querySelector("#spinner").classList.add("hidden");
        // document.querySelector("#button-text").classList.remove("hidden");
      }
    },

    close() {
      this.$emit('update:showStripeCheckout', false)
    },
  }
};
</script>
