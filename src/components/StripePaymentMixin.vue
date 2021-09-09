<template>
  <div>    
  </div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import GoogleTagManagerMixin from './GoogleTagManagerMixin';
import _pick from 'lodash/pick';
import { loadStripe } from "@stripe/stripe-js"



export default {

    mixins: [GoogleTagManagerMixin],
//   components: { StripeCheckout, },
    data() {
        return {
            stripe: null,
        };
    },

    methods: {
        async stripeStartPayment() {
            this.loading = true;
            const publishableKey = await YogoApi.get('/payments/stripe/get-publishable-key');
            this.stripe = await loadStripe(publishableKey);

            await this.GTMEvent('paymentStarted');

            const result = await YogoApi.post('/payments/stripe/create-order-and-matching-session-type');

            console.log("result = ", result)

            if (result === 'E_INVALID_CART_ITEM') {
                alert(this.$t('checkout.oneOrMoreCartItemsAreNoLongerAvailable'));
                await this.$store.dispatch('updateUser');
                this.loading = false;
                return;
            }

            if (!result.status) {
                throw new Error(
                    'Invalid result from /payments/stripe/create-order-and-matching-session-type');
            }

            const clientSecret = result.clientSecret

            const elements = this.stripe.elements();
            console.log("ele = ", elements)
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
            const card = elements.create("card", { style: style });
            console.log("card = ", card)
            // Stripe injects an iframe into the DOM
            card.mount("#card-element");
            // card.on("change", function (event) {
            //     // Disable the Pay button if there are no card details in the Element
            //     document.querySelector("button").disabled = event.empty;
            //     document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
            // });
            // const form = document.getElementById("payment-form");
            // form.addEventListener("submit", function(event) {
            //     event.preventDefault();
            //     // Complete payment when the submit button is clicked
            //     payWithCard(stripe, card, data.clientSecret);
            // });


            switch (result.status) {

                case 'ORDER_SETTLED':
                await this.$store.dispatch('updateUser');
                await this.GTMTransaction(result.order);
                this.$router.push({ name: 'MyProfile' });
                return;
                
                case 'CHARGE_SESSION_CREATED':
                    
                    console.log("this.stripe = ", this.stripe)
                    

                    this.stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: {}
                        }
                    }).then(function(result) {
                        console.log("intent = ", result)
                        if (result.error) {
                            // Show error to your customer (e.g., insufficient funds)
                            console.log("Error: ", clientSecret)
                            console.log(result.error.message);
                        } else {
                            // The payment has been processed!
                            if (result.paymentIntent.status === 'succeeded') {
                                // Show a success message to your customer
                                // There's a risk of the customer closing the window before callback
                                // execution. Set up a webhook or plugin to listen for the
                                // payment_intent.succeeded event that handles any business critical
                                // post-payment actions.
                            }
                        }
                    });

                //   this.stripeOpenChargeSession(result.clientSecret, result.amount);
                //   this.stripeOpenChargeSession(result.chargeSession);
                return;
                case 'RECURRING_SESSION_CREATED':
                this.stripeOpenRecurringSession(result.recurringSession, result.order);
                return;
            }
        },

        stripeOpenChargeSession(clientSecret, amount) {
            console.log("amount = ", amount)
            console.log("clientSecret = ", clientSecret)
            this.loading = false;
            this.$refs.clientSecret = clientSecret;
            this.$refs.stripe_checkout.checkout(clientSecret, {
                image: "https://i.imgur.com/HhqxVCW.jpg",
                name: "New name",
                description: "Cats forever!",
                currency: "DKK",
                amount: amount,
            });

        },

        stripeOpenRecurringSession(recurringSession, order) {
        console.log('recurringSession:', recurringSession, 'order:', order);
        this.loading = false;

        this.stripeWindow = new window.Stripe.ModalCheckout(recurringSession.id);

        this.stripeWindow.addEventHandler(window.Stripe.Event.Accept, async data => {
            console.log('stripe window accept data:', data);
            this.loading = true;
            await YogoApi.post(
                '/payments/stripe/settle-and-attach-card-to-zero-total-recurring-order',
                {
                order: order.id,
                paymentMethod: data.payment_method,
                },
            );
            await this.$store.dispatch('updateUser');
            await this.GTMTransaction(order.id);
            this.$router.push({ name: 'MyProfile' });
        });

        this.stripeWindow.addEventHandler(window.Stripe.Event.Error, () => {
        });
        this.stripeWindow.addEventHandler(window.Stripe.Event.Cancel, () => {
        });
        this.stripeWindow.addEventHandler(window.Stripe.Event.Close, async () => {
            await this.$store.dispatch('updateUser');
        });
        },

        async stripeStartGiftCardPayment(form) {
        this.loading = true;

        await this.GTMEvent('paymentStarted');

        const result = await YogoApi.post(
            '/payments/stripe/create-order-and-charge-session-for-gift-card',
            _pick(
                form,
                [
                    'amount',
                    'giver_name',
                    'giver_email',
                    'recipient_name',
                    'recipient_email',
                    'message',
                ],
            ),
            {
                headers: {
                'X-Yogo-Client-Accepts-Extended-Error-Format': 1,
                },
            },
        );

        if (result.error) {
            alert(result.error.localized_message + '\n\n' + result.error.localized_message);
            this.loading = false;
            return;
        }

        this.stripeOpenGiftCardChargeSession(result.chargeSession);

        },

        async stripeOpenGiftCardChargeSession(chargeSession) {
        this.loading = false;

        this.stripeWindow = new window.Stripe.ModalCheckout(chargeSession.id);

        this.stripeWindow.addEventHandler(window.Stripe.Event.Accept, async data => {
            console.log('stripe window accept data:', data);
            const orderId = data.invoice.split('_')[0];
            this.loading = true;
            await YogoApi.post('/payments/stripe/invoice/' + data.invoice + '/process-if-paid');
            await this.GTMTransaction(orderId);
            this.giftCardPaid();
        });

        this.stripeWindow.addEventHandler(window.Stripe.Event.Error, () => {
        });
        this.stripeWindow.addEventHandler(window.Stripe.Event.Cancel, () => {
        });
        this.stripeWindow.addEventHandler(window.Stripe.Event.Close, () => {
        });
        },
    },
};

</script>
