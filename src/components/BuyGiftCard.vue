<template>

  <loadingspinner v-if="loading"></loadingspinner>
  <div v-else>

      <router-link v-if="mobileAppMode" :to="{ name: 'Prices' }" class="p-2 flex aic">
        <svg
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="feather feather-arrow-left">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="pl-1">
          {{ $t('global.back') }}
        </span>
      </router-link>
    <div class="with__item--right with__item--container">
      <div class="flex__align-center wrapper narrow-wrapper flex-column min-height--100 flex-center">

        <ModalLogo/>
        <div class="space4"></div>
        <h2>{{ $t('global.BuyGiftCard', { clientName: client.name }) }}</h2>
        <div class="space8"></div>

        <div class="flex flex--row-tablet flex__align--start width--100">

          <div class="flex--3 width--100">
            <div class="flex-center">

              <div class="wrapper narrow-wrapper padding__right--20 width--100">
                <form @submit.prevent="buy">
                  <md-field :class="getValidationClass('form.giver_name')">
                    <label>{{ $t('global.YourName') }}</label>
                    <md-input required type="text" v-model="form.giver_name"></md-input>
                    <span class="md-error"
                          v-if="!$v.form.giver_name.required">{{
                        $t('global.Required')
                      }}</span>
                  </md-field>

                  <md-field :class="getValidationClass('form.giver_email')">
                    <label>{{ $t('global.YourEmail') }}</label>
                    <md-input required type="email" v-model="form.giver_email"></md-input>
                    <span class="md-error"
                          v-if="!$v.form.giver_email.required || !$v.form.giver_email.email">{{
                        $t('global.NotAValidEmail')
                      }}</span>
                  </md-field>

                  <md-field :class="getValidationClass('form.recipient_name')">
                    <label>{{ $t('global.RecipientName') }}</label>
                    <md-input required type="text" v-model="form.recipient_name"></md-input>
                    <span class="md-error"
                          v-if="!$v.form.recipient_name.required">{{
                        $t('global.Required')
                      }}</span>
                  </md-field>

                  <!--<md-field :class="getValidationClass('form.recipient_email')">
                    <label>{{ $t('global.RecipientEmail') }}</label>
                    <md-input required type="email" v-model="form.recipient_email"></md-input>
                    <span class="md-error" v-if="!$v.form.recipient_email.required">{{
                        $t('global.Required')
                      }}</span>
                    <span class="md-error"
                          v-else-if="!$v.form.recipient_email.required || !$v.form.recipient_email.email">{{
                        $t('global.NotAValidEmail')
                      }}</span>
                  </md-field>-->

                  <md-field>
                    <label>{{ $t('global.MessageToRecipient') }}</label>
                    <md-textarea v-model="form.message"></md-textarea>
                  </md-field>

                  <md-field :class="getValidationClass('form.amount')">
                    <label>{{ $t('global.Amount') }}</label>
                    <md-input required type="number" v-model="form.amount"></md-input>
                    <span class="md-error" v-if="!$v.form.amount.required">
                    {{ $t('global.Required') }}
                  </span>
                    <span class="md-error" v-if="!$v.form.amount.minimumAmount">
                    {{ $t('giftCard.TheMinimumAmountIs', { amount: minimumAmountText }) }}
                  </span>
                  </md-field>

                  <div class="flex--row">
                    <md-checkbox v-model="termsAccepted">
                      {{ $t('checkout.iHaveReadTheTerms') }}&nbsp;
                      <span class="underline ml-1" @click.prevent.stop="$refs.termsDialogs.openTermsDialog()">
                        &nbsp;{{ $t('checkout.termsAndConditions') }}
                      </span>
                    </md-checkbox>

                    <md-button
                        @click="buy"
                        class="mt-4"
                    >
                      {{ $t('global.BuyGiftCard') }}
                    </md-button>
                  </div>

                </form>
              </div>

            </div>
          </div>


        </div>


      </div>


    </div>

    <TermsDialogs ref="termsDialogs"></TermsDialogs>


  </div>
</template>

<script>
import qs from 'qs';
import { validationMixin } from 'vuelidate';
import ClientSite from '../gateways/ClientSite';
import { mapGetters } from 'vuex';
import Loadingspinner from './LoadingSpinner';
import { email, minValue, required } from 'vuelidate/lib/validators';
import _get from 'lodash/get';

import Imgix from '@/services/Imgix';
import ModalLogo from './ModalLogo';
import ReepayPaymentMixin from './ReepayPaymentMixin';
import TermsDialogs from './TermsDialogs';

export default {
  mixins: [validationMixin, Imgix, ReepayPaymentMixin],
  data() {
    return {
      loading: false,
      form: {
        recipient_name: '',
        //recipient_email: '',
        giver_name: '',
        giver_email: '',
        message: '',
        amount: 500,
      },
      showTermsDialog: false,
      termsAccepted: false,
    };
  },
  components: {
    ModalLogo,
    Loadingspinner,
    TermsDialogs,
  },
  computed: {
    ...mapGetters([
      'client',
      'mobileAppMode',
      'user'
    ]),
    minimumAmountText() {
      return `${this.client.settings.gift_card_minimum_amount} kr`;
    },
  },

  created: async function () {

    const queryString = window.location.search.substr(1);
    const queryParams = qs.parse(queryString);

    if (queryParams.amount) {
      this.form.amount = queryParams.amount;
    }

  },

  mounted: function () {

  },

  methods: {
    getValidationClass(fieldName) {
      const field = _get(this.$v, fieldName);

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
    },


    async buy() {

      this.$v.form.$touch();

      if (this.$v.form.$invalid) return;

      if (!this.termsAccepted) {
        this.$refs.termsDialogs.openForgotToAcceptTermsDialog();
        return;
      }

      this.reepayStartGiftCardPayment(this.form);

    },

    giftCardPaid() {
      const successMessage = this.$t(
          this.client.settings.gift_card_delivery_mode === 'automatic'
              ? 'giftCard.PurchaseSuccessAutoSend'
              : 'giftCard.PurchaseSuccessManualSend',
          { recipientName: this.form.recipient_name, giverEmail: this.form.giver_email },
      );
      alert(successMessage);
      if (ClientSite.isRunningInIframe()) {
        ClientSite.closeOwnPopup();
      } else if (this.user) {
        this.$router.push({name: 'MyProfile'});
      } else if (this.client.website.trim()) {
        document.location = this.client.website;
      }
    },

  },
  validations() {
    return {
      form: {
        recipient_name: {
          required,
        },
        giver_email: {
          required,
          email,
        },
        giver_name: {
          required,
        },
        amount: {
          required,
          minimumAmount: minValue(this.client ? this.client.settings.gift_card_minimum_amount : 0),
        },
      },
    };
  },
};
</script>

<style lang="scss" scoped>


</style>

