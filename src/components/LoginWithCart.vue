<template>

  <loadingspinner v-if="loading"></loadingspinner>
  <div v-else>

    <div class="with__item--right with__item--container">
      <div class="flex__align-center wrapper narrow-wrapper flex-column min-height--100 flex-center">

        <ModalLogo />
        <div class="space4"></div>
        <h2>{{ client.settings.login_greeting.replace('[studio_name]', client.name) }}</h2>
        <div class="space8"></div>
        <div class="space8"></div>

        <div class="flex flex--row-tablet flex__align--start width--100">

          <div class="flex--3 width--100">
            <div class="flex-center">

              <div class="padding__right--20" v-if="loginMode === 'login'">

                <div class="flex--row space--between">
                  <p class="margin__none--tablet mr2">{{ $t('login.forSignupCreateProfile') }}</p>
                  <button class="btn btn-primary" @click="loginMode = 'signup'">{{
                    $t('login.createProfile') }}
                  </button>
                </div>
                <div class="space4"></div>
                <p>{{ $t('login.alreadyHaveProfile') }}</p>

                <div class="flex-column">

                  <form novalidate @submit.prevent="submitForm">
                    <md-field :class="getLoginValidationClass('email')">
                      <label>{{ $t('login.emailLabel') }}</label>
                      <md-input required type="email" v-model="loginForm.email" autocomplete="email"></md-input>
                      <span class="md-error" v-if="!$v.loginForm.email.required">{{ $t('login.typeEmail') }}</span>
                      <span class="md-error"
                            v-else-if="!$v.loginForm.email.email">{{ $t('login.notValidEmail') }}</span>
                    </md-field>

                    <div class="space4"></div>

                    <md-field :class="getLoginValidationClass('password')" :md-toggle-password="true">
                      <label>{{ $t('login.passwordLabel') }}</label>
                      <md-input required type="password" v-model="loginForm.password"></md-input>
                      <span class="md-error"
                            v-if="!$v.loginForm.password.required">{{ $t('login.passMustBeEntered') }}</span>
                    </md-field>

                    <div class="login-failed" v-if="loginFailed">{{ $t('login.wrongEmailOrPassword') }}</div>

                    <div class="space4"></div>

                  </form>

                </div>
              </div> <!-- wrapper narrow-wrapper padding__right--20 -->

              <div class="wrapper narrow-wrapper padding__right--20 width--100" v-if="loginMode === 'signup'">

                <md-field :class="getSignupValidationClass('first_name')">
                  <label>{{ $t('login.firstNameLabel') }}</label>
                  <md-input required type="text" v-model="signupForm.first_name" autocomplete="given-name"></md-input>
                  <span class="md-error"
                        v-if="!$v.signupForm.first_name.required">{{ $t('login.firstNameMust') }}</span>
                </md-field>

                <md-field :class="getSignupValidationClass('last_name')">
                  <label>{{ $t('login.lastNameLabel') }}</label>
                  <md-input required type="text" v-model="signupForm.last_name" autocomplete="family-name"></md-input>
                  <span class="md-error" v-if="!$v.signupForm.last_name.required">{{ $t('login.lastNameMust') }}</span>
                </md-field>

                <md-field :class="getSignupValidationClass('email')">
                  <label>{{ $t('login.emailLabel') }}</label>
                  <md-input required type="email" v-model="signupForm.email" autocomplete="email"></md-input>
                  <span class="md-error" v-if="!$v.signupForm.email.required">{{ $t('login.typeEmail') }}</span>
                  <span class="md-error" v-else-if="!$v.signupForm.email.email">{{ $t('login.notValidEmail') }}</span>
                </md-field>

                <div class="md-field" :class="getSignupValidationClass('date_of_birth')"
                     v-if="client.settings.signup_show_date_of_birth_field">
                  <label class="text__gray--medium">{{ $t('login.birthdayLabel') }}<span
                    v-if="client.settings.signup_date_of_birth_field_required"> *</span></label>
                  <md-datepicker v-model="signupForm.date_of_birth" class="text__gray--medium">
                    <span class="md-error"
                          v-if="client.settings.signup_date_of_birth_field_required && !$v.signupForm.date_of_birth.required">{{ $t('login.birthdayMust') }}</span>
                  </md-datepicker>
                </div>

                <md-field :class="getSignupValidationClass('phone')" v-if="client.settings.signup_show_phone_field">
                  <label>{{ $t('login.phoneLabel') }}</label>
                  <md-input :required="client.settings.signup_phone_field_required" type="text"
                            v-model="signupForm.phone" autocomplete="tel"></md-input>
                  <span class="md-error"
                        v-if="client.settings.signup_phone_field_required && !$v.signupForm.phone.required">{{ $t('login.phoneMust') }}</span>
                </md-field>

                <md-field :class="getSignupValidationClass('password')">
                  <label>{{ $t('login.passwordLabel') }}</label>
                  <md-input required id="password" type="password" v-model="signupForm.password"
                            autocomplete="off"></md-input>
                  <span class="md-error"
                        v-if="!$v.signupForm.password.required">{{ $t('login.passwordMustBeCreated') }}</span>
                  <span class="md-error"
                        v-else-if="!$v.signupForm.password.passwordStrength">{{ $t('login.passwordDescription') }}</span>
                </md-field>

                <div class="space4"></div>

              </div> <!-- signup -->

              <md-dialog-alert :md-active.sync="showLoginFailed" :md-title="$t('login.loginFailed')"
                               :md-content="$t('login.wrongEmailorCode')"></md-dialog-alert>
            </div>
          </div>

          <div class="flex--2 wrapper narrow-wrapper item__side--card">
            <ul class="item__side--card-ul">

              <li v-if="localCartItem" class="width--100">

                <ul v-if="cartItemType === 'product'" class="width--100">
                  <li v-for="cartItem in localCartItem" class="flex width--100 space__between--mobile product-item" :key="'cartItem_' + cartItem.id">
                    <div>
                      <img
                        v-if="cartItem.product && cartItem.product.image"
                        style="width:40px;"
                        :src="Imgix(cartItem.product.image.filename, {w:80,h:80})"
                        alt=""
                      >
                      &nbsp;{{ cartItem.item_count}} x {{ cartItem.product ? cartItem.product.name : '' }}
                    </div>
                    <div>
                      &nbsp;{{ cartItem.product ? cartItem.item_count * cartItem.product.price : 0 | currency_dkk }} kr
                    </div>
                  </li>
                </ul>

                <div v-else>
                  <img
                    v-if="cartItemImage"
                    class="width--100"
                    :src="Imgix(cartItemImage.filename, cartItemImageDimensions === 'landscape' ? {w:600, h:150, fit: 'crop'} : {w:600, h:600, fit: 'crop'})"
                    alt="">
                  <br v-if="cartItemImage">
                  <h3>{{ cartItemName }} <span v-if="cartItemType === 'class_livestream'"><br>- LIVESTREAM -</span></h3>
                  <br/>
                  <div v-if="cartItemSubtitle">{{ cartItemSubtitle }}</div>
                  {{ cartItemInfo }}
                </div>


                <!--<h3
                  v-if="localCartItem.itemType !== 'class'">{{ cartItemPrice | currency_dkk({ decimals : 0 }) }},- DKK
                </h3>-->

              </li>

            </ul>

            <h3 v-if="cartItemRequiresPayment"
                class="flex width--100 space__between--mobile total">
              Total: <span>{{ cartItemPrice | currency_dkk }} kr</span>
            </h3>

            <form action="" @submit.stop="applyDiscountCode" v-if="showDiscountCodeInput">
              <md-field>
                <label>{{ $t('checkout.discountCode') }}</label>
                <md-input v-model="discountCodeInput"></md-input>
              </md-field>
              <button class="btn btn-primary mb-btn-align" type="button" @click.stop="applyDiscountCode">
                {{ $t('checkout.applyDiscountCode') }}
              </button>
            </form>

            <div class="flex width--100 space__between--mobile flex__align-center" v-if="appliedDiscountCode"
                 style="margin-top:20px;">
              <h3>{{ $t('checkout.discountCode') }}: {{ appliedDiscountCode }}</h3>
              <button @click="removeAppliedDiscountCode" class="btn btn-small btn-primary">{{ $t('global.remove') }}
              </button>
            </div>


          </div>


        </div>

        <div class="space4"></div>

        <div class="flex flex--row-tablet space--between align__self--start">
          <div class="hidden-md-down">
            <md-checkbox v-model="rememberMe">{{ $t('login.rememberMeLabel') }}</md-checkbox>
          </div>
          <md-checkbox v-model="termsAccepted"
                       v-if="cartItemRequiresPayment || loginMode === 'signup'">{{
            $t('checkout.iHaveReadTheTerms') }} <a class="underline ml-1"
                                                   @click.prevent.stop="showTermsDialog=true">{{
              $t('checkout.termsAndConditions') }}</a>
          </md-checkbox>
        </div>

        <div class="space4"></div>

        <button class="btn width--100 btn-primary" type="submit" @click="submitForm">
          {{ submitButtonText }}
        </button>
        <div class="space4"></div>
        <div v-if="loginMode == 'login'" class="flex--row space--between align__self--start">
          <router-link :to="{name: 'ResetPassword' }">{{ $t('login.forgotPass') }}?</router-link>
        </div>
        <div v-if="loginMode == 'signup'" class="flex--row space--between align__self--start">
          <a href="#" @click.prevent="loginMode = 'login'">{{ $t('login.backToLogin') }}</a>
        </div>
        <div class="space4"></div>

      </div>

      <md-dialog :md-active.sync="showAlreadySignedUpForEventDialog">
        <md-dialog-content>{{ $t('calendar.youAreAlreadySignedUp') }}.</md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="backToEventList">{{ $t('global.back') }}</button>
          <button class="btn btn-primary" @click="backToMyProfile">{{ $t('global.showMyProfile') }}</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog :md-active.sync="showTermsDialog" class="terms-dialog">
        <md-dialog-title></md-dialog-title>
        <md-dialog-content class="terms-and-conditions">
          <h1>{{ $t('global.terms') }}</h1>
          <div v-html="client.settings.terms"></div>
        </md-dialog-content>

        <md-dialog-actions>
          <button class="btn btn-primary" @click="showTermsDialog = false">OK</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog-alert :md-active.sync="showForgotToAcceptTermsDialog"
                       :md-content="$t('checkout.YouMustAcceptOurTerms')">
      </md-dialog-alert>

      <md-dialog :md-active.sync="showUserExists">
        <md-dialog-title>{{ $t('login.emailExcist') }}</md-dialog-title>
        <md-dialog-content>
          <p>{{ $t('login.emailExcistDesc') }} "{{ signupForm.email }}".</p>
          <p>{{ $t('global.please') }}
            <a href="#" @click="loginMode = 'login'; showUserExists = false">{{ $t('login.signin') }}</a>.
          </p>
          <p>
            {{ $t('login.ifYouForgotYourPass') }}
            <router-link :to="{ name: 'ResetPassword' }" class="whitespace--nowrap">{{ $t('login.resetItHere') }}
            </router-link>
          </p>

        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="showUserExists = false">OK</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog :md-active.sync="showMembershipExistsDialog" v-if="existingMembership">
        <md-dialog-title>{{ $t('login.youAlreadyHaveMembership') }} {{ existingMembership.membership_type.name }}.
        </md-dialog-title>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="cancelMembershipExistsDialog">{{ $t('global.cancelButton') }}
          </button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog :md-active.sync="showClassSignupSuccessDialog" v-if="requestedClass">
        <md-dialog-title>{{ $t('login.thanksForYourSubmit') }}</md-dialog-title>
        <md-dialog-content>
          {{ $t('calendar.youAreNowSignedUpFor') }}<br>
          {{ requestedClass.class_type.name }}<br>
          <span v-if="requestedClass.subtitle">{{ requestedClass.subtitle }}<br></span>
          {{
          moment(requestedClass.date).format('dddd D. MMMM YYYY') }} kl. {{ requestedClass.start_time
          }}
        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="backToCalendar">{{ $t('global.back') }}</button>
          <button class="btn btn-primary" @click="$router.push({name:'MyProfile'})">{{ $t('global.showMyProfile') }}
          </button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog
        :md-active.sync="showUserHasNoAccessToClassDialog"
        v-if="requestedClass"
        @md-closed="userHasNoAccessToClassDialogClosed"
        @md-click-outside="userHasNoAccessToClassDialogClickOutside"
      >
        <md-dialog-title v-if="loginMode === 'login'">{{ $t('login.youAreMissingValidMembership') }}</md-dialog-title>
        <md-dialog-title v-if="loginMode === 'signup'">{{ $t('login.profileCreated') }}</md-dialog-title>
        <md-dialog-content>
          {{ $t('login.youNeedValidMembershipDesc') }} {{ requestedClass.class_type.name }} {{
          moment(requestedClass.date).format('dddd D. MMMM YYYY') }}, {{ requestedClass.start_time
          }}
        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="$router.push({name: 'Prices'})">{{ $t('global.seePrices') }}</button>
          <button class="btn btn-primary" @click="$router.push({name: 'MyProfile'})">{{ $t('global.showMyProfile') }}
          </button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog
        :md-active.sync="showEventSignupSuccessDialog"
        v-if="requestedEvent"
        @md-closed="closeOwnPopup"
        @md-click-outside="closeOwnPopup"
      >
        <md-dialog-title v-if="loginMode === 'login'">{{ $t('login.thanksForYourSubmit') }}</md-dialog-title>
        <md-dialog-title v-if="loginMode === 'signup'">{{ $t('login.yourProfileIsCreatedAndSubmitted') }}
        </md-dialog-title>
        <md-dialog-content>
          {{ $t('calendar.youAreNowSignedUpFor') }} {{ requestedEvent.name }}
        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="closeOwnPopup">{{ $t('global.back') }}</button>
          <button class="btn btn-primary" @click="$router.push({name: 'MyProfile'})">{{ $t('global.showMyProfile') }}
          </button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog-alert
        :md-active.sync="showAlertDialog"
        :md-content="alertDialogText"
        :md-confirm-text="alertDialogConfirmText"
        @md-closed="alertDialogClosed()"/>

    </div>

    <ClassSignup
      :user="user"
      :showErrorsToUser="false"
      @classSignupSuccess="classSignupSuccess"
      @classSignupFailure="classSignupFailure"
      ref="classSignupComponent"
    >
    </ClassSignup>

  </div>
</template>

<script>
  import qs from 'qs';
  import {validationMixin} from 'vuelidate'
  import YogoApi from '../gateways/YogoApi'
  import ClientSite from '../gateways/ClientSite'
  import {mapGetters} from 'vuex'
  import Loadingspinner from './LoadingSpinner'
  import moment from 'moment'
  import {email, required} from 'vuelidate/lib/validators'

  import _pick from 'lodash/pick'
  import _find from 'lodash/find'
  import _capitalize from 'lodash/capitalize'
  import _filter from 'lodash/filter'
  import _isArray from 'lodash/isArray'
  import _map from 'lodash/map'
  import _includes from 'lodash/includes'

  import ClassSignup from '@/components/ClassSignup.vue'

  import Imgix from '@/services/Imgix'
  import ModalLogo from './ModalLogo';
  import ReepayPaymentMixin from './ReepayPaymentMixin';

  export default {
    mixins: [validationMixin, Imgix, ReepayPaymentMixin],
    data() {
      return {
        emailLabel: 'Email',
        passwordLabel: 'Adgangskode',
        rememberMeLabel: 'Husk mig på denne computer',
        firstNameLabel: 'Fornavn',
        lastNameLabel: 'Efternavn',
        termsLabel: 'betingelser',
        birthdayLabel: 'Fødselsdato',
        phoneLabel: 'Telefon',
        email: '',
        password: '',
        rememberMe: false,
        termsAccepted: false,
        loginFailed: false,
        loading: false,
        loginForm: {
          email: '',
          password: '',
        },
        signupForm: {},
        showMembershipExistsDialog: false,
        existingMembership: null,
        showLoginFailed: false,
        cartItemImage: null,
        cartItemImageDimensions: '',
        cartItemName: '',
        cartItemSubtitle: '',
        cartItemInfo: '',
        cartItemPrice: 0,

        loginMode: qs.parse(document.location.search.substr(1)).signupMode ? 'signup' : 'login',
        localCartItem: null, // This can be an array of products, but not of other item types
        cartItemType: '',
        showAlreadySignedUpForEventDialog: false,
        showForgotToAcceptTermsDialog: false,
        showTermsDialog: false,
        showUserExists: false,

        requestedClass: null,

        userMemberships: [],
        userClassPasses: [],
        userClassSignups: [],
        showClassSignupSuccessDialog: false,

        showUserHasNoAccessToClassDialog: false,

        requestedEvent: null,
        showEventSignupSuccessDialog: false,

        showAlertDialog: false,
        alertDialogText: '',
        alertDialogConfirmText: 'Ok',
        alertDialogClosedAction: '',

        discountCodeInput: '',
        appliedDiscountCode: '',
      }
    },
    components: {
      ModalLogo,
      Loadingspinner,
      ClassSignup,
    },
    computed: {
      ...mapGetters([
        'client',
        'clientLogoFilename',
        'requestedRoute',
        'user',
      ]),
      showDiscountCodeInput() {
        return !this.appliedDiscountCode && this.cartItemRequiresPayment
      },
      cartItemRequiresPayment() {
        return _includes(['event', 'class_pass_type', 'membership_type', 'product'], this.cartItemType)
      },
      submitButtonText() {
        const textParts = [
          this.loginMode === 'login' ? this.$t('login.signin') : this.$t('login.createProfile'),
          ' ',
          this.$t('global.and'),
          ' ',
        ];

        if (this.cartItemType === 'class') {
          textParts.push(this.$t('global.signup').toLocaleLowerCase());
        } else if (this.cartItemType === 'class_livestream') {
          textParts.push(this.$t('global.signUpForLivestream').toLocaleLowerCase());
        } else {
          textParts.push(this.$t('global.buy').toLocaleLowerCase())
        }
        return textParts.join('')
      }
    },

    created: async function () {

      const urlCartItemJson = this.$route.params.cartItemJson
      if (urlCartItemJson) {
        this.localCartItem = JSON.parse(urlCartItemJson)
      } else {
        const queryString = window.location.search.substr(1)
        this.localCartItem = qs.parse(queryString);
        if (!this.localCartItem) {
          return;
        }
      }

      if (_isArray(this.localCartItem)) {
        this.cartItemType = 'product'
      } else {
        this.cartItemType = this.localCartItem.itemType
        if (this.cartItemType === 'product') {
          this.localCartItem = [{
            item_type: 'product',
            item_id: this.localCartItem.itemId,
            item_count: 1,
          }]
        }
      }

      switch (this.cartItemType) {
        case 'event' : {
          const eventQueryParams = {
            populate: [
              'image',
              'event_group',
              'event_group.image',
              'signup_count',
              'signups'
            ]
          }
          if (this.user) {
            eventQueryParams.populate.push('user_is_signed_up_for_event')
          }
          const eventQueryString = qs.stringify(eventQueryParams);
          const event = await YogoApi.get(`/events/${this.localCartItem.itemId}?${eventQueryString}`);
          if (parseInt(event.client_id || event.client) !== parseInt(this.client.id)) {
            alert('Invalid event ID!');
            ClientSite.closeOwnPopup();
          }
          if (event.signup_count >= event.seats) {
            alert(this.$t('global.EventIsFullyBooked'));
            ClientSite.closeOwnPopup();
          }
          if (moment.tz(event.start_date, 'Europe/Copenhagen').isBefore(moment.tz(
              'Europe/Copenhagen'), 'day')) {
            alert(this.$t('global.EventHasStarted'));
            ClientSite.closeOwnPopup();
          }
          if (this.user) {
            if (_find(event.signups, { user: this.user.id })) {
              alert(this.$t('global.YouAreAlreadySignedUpForTheEvent'));
              ClientSite.closeOwnPopup();
            }
            await this.addToCart({
              item_type: 'event',
              item_id: this.localCartItem.itemId,
              user: this.user.id
            });
            return;
          }
          this.cartItemName = event.name
          this.cartItemPrice = event.price

          if (event.image) {
            this.cartItemImage = event.image
            this.cartItemImageDimensions = 'landscape'
          } else {
            this.cartItemImage = null
            this.cartItemImageDimensions = 'square'
          }

          break;
        }
        case 'class_pass_type' : {
          const classPassType = await YogoApi.get('/class-pass-types/' + this.localCartItem.itemId + '?populate[]=image')
          if (classPassType.archived) {
            alert(this.$t('checkout.ThisProductIsNoLongerAvailable'));
            ClientSite.closeOwnPopup();
          }
          this.cartItemName = classPassType.name
          this.cartItemPrice = classPassType.price
          this.cartItemImage = null
          this.cartItemImageDimensions = 'square'
          break;
        }
        case 'membership_type' : {
          const membershipType = (await YogoApi.get('/membership-types' +
              '?id=' + this.localCartItem.itemId +
              '&populate[]=payment_options' +
              '&populate[]=payment_options.nameThatUserSees' +
              '&populate[]=payment_options.priceTextThatUserSees' +
              '&populate[]=image' +
              '&populate[]=active_campaign',
          ))[0]
          if (!membershipType) {
            alert(this.$t('checkout.ThisProductIsNoLongerAvailable'));
            ClientSite.closeOwnPopup();
          }
          let paymentOption = this.localCartItem.paymentOption
          ? _find(
              membershipType.payment_options,
              { id: parseInt(this.localCartItem.paymentOption), for_sale: true }
              )
              : null;
          if (!paymentOption) {
            paymentOption = _find(
              membershipType.payment_options,
              {
                number_of_months_payment_covers: 1,
                for_sale: true
              }
            );
          }
          if (!paymentOption) {
            alert(this.$t('checkout.ThisProductIsNoLongerAvailable'));
            ClientSite.closeOwnPopup();
          }

          const doApplyCampaign = parseInt(paymentOption.number_of_months_payment_covers) === 1 && membershipType.active_campaign;
          this.cartItemName = membershipType.name + ' (' + paymentOption.name + ')' + (doApplyCampaign ? (' - ' + membershipType.active_campaign.name) : '')
          this.cartItemPrice = doApplyCampaign ? membershipType.active_campaign.reduced_price : paymentOption.payment_amount
          this.cartItemImage = null
          this.cartItemImageDimensions = 'square'
          break;
        }
        case 'class' :
        case 'class_livestream': {
          this.requestedClass = await YogoApi.get(`/classes/${this.localCartItem.itemId}?populate[]=class_type&populate[]=class_type.image`)
          const classStartDate = moment(this.requestedClass.date, 'YYYY-MM-DD')
          this.cartItemName = this.requestedClass.class_type.name
          this.cartItemSubtitle = this.requestedClass.subtitle
          this.cartItemInfo += _capitalize(classStartDate.format('dddd D. MMMM YYYY') + ' kl. ' + this.requestedClass.start_time)
          this.cartItemImage = this.requestedClass.class_type.image
          this.cartItemImageDimensions = 'landscape'
          break;
        }
        case 'product': {
          for (let i = 0; i < this.localCartItem.length; i++) {
            const cartItem = this.localCartItem[i]
            cartItem.product = await YogoApi.get(`/products/${cartItem.item_id}?populate[]=image`)
          }
          this.cartItemPrice = this.localCartItem.reduce((total, cartItem) => {
            return total + cartItem.item_count * cartItem.product.price
          }, 0)
          this.$forceUpdate()
          break;
        }
        default:
          this.$router.replace({name: 'Login'})
          break
      }
    },

    mounted: function () {

    },

    methods: {
      getSignupValidationClass(fieldName) {
        const field = this.$v.signupForm[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      getLoginValidationClass(fieldName) {
        const field = this.$v.loginForm[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      submitForm() {
        if (this.loginMode == 'login') {
          this.login()
        } else if (this.loginMode == 'signup') {
          this.signup()
        }
      },
      async signup() {
        this.showUserExists = false

        this.$v.signupForm.$touch()

        if (this.$v.signupForm.$invalid) return

        if (!this.termsAccepted) {
          this.showForgotToAcceptTermsDialog = true
          return
        }

        let userData = _pick(
          this.signupForm, [
            'first_name',
            'last_name',
            'email',
            'password',
            'phone',
          ],
        )

        userData.date_of_birth = this.signupForm.date_of_birth ? moment(this.signupForm.date_of_birth).format('YYYY-MM-DD') : null

        // This is for the welcome email with email confirmation link.
        userData.emailConfirmationLink = this.emailConfirmationLink

        this.loading = true

        const response = await YogoApi.post('/users', userData)

        if (response === 'E_USER_EXISTS' || response === 'E_EMAIL_EXISTS') {
          this.loading = false
          this.userExistsDialogEmail = userData.email
          this.showUserExists = true
          return
        }

        if (this.rememberMe) {
          window.localStorage.setItem('accessToken', response.token)
          window.sessionStorage.removeItem('accessToken')
        } else {
          window.localStorage.removeItem('accessToken')
          window.sessionStorage.setItem('accessToken', response.token)
        }

        const user = await YogoApi.get('/users/' + response.user.id + '?populate=image')

        await this.$store.dispatch('updateUser', user.id)
        this.processLocalCart()
      },

      async login() {

        this.$v.loginForm.$touch()

        if (this.$v.loginForm.$invalid) return

        if (!this.termsAccepted && this.cartItemRequiresPayment) {
          this.showForgotToAcceptTermsDialog = true
          return
        }

        const response = await YogoApi.post('/login', this.loginForm)

        if (response === 'E_LOGIN_FAILED') {
          this.showLoginFailed = true
          return
        }

        if (response === 'E_USER_IS_NOT_CUSTOMER') {
          alert(this.$t('login.passCorrectButNotClient'))
          return
        }

        if (!response.user || !response.token) {
          return
        }

        if (this.rememberMe) {
          window.localStorage.setItem('accessToken', response.token)
          window.sessionStorage.removeItem('accessToken')
        } else {
          window.localStorage.removeItem('accessToken')
          window.sessionStorage.setItem('accessToken', response.token)
        }
        await this.$store.dispatch('updateUser', response.user.id)
        this.processLocalCart()
      },

      async processLocalCart() {
        switch (this.cartItemType) {
          case 'event' : {
            this.requestedEvent = await YogoApi.get('/events/' + this.localCartItem.itemId)

            const eventUser = await YogoApi.get('/users/' + this.user.id + '?populate[]=event_signups')

            if (_find(
                eventUser.event_signups,
                (signup) => {
                  return signup.event == this.localCartItem.itemId
                },
            )) {
              this.loading = false
              this.showAlreadySignedUpForEventDialog = true
              return
            }
            if (parseInt(this.requestedEvent.price) === 0) {
              const response = await YogoApi.post('/event-signups', {
                user: this.user.id,
                event: this.requestedEvent.id,
              })
              if (response === 'E_EVENT_IS_FULL') {
                alert(this.$t('global.fullyBooked'))
                ClientSite.closeOwnPopup()
                return
              }
              if (response === 'E_USER_IS_ALREADY_SIGNED_UP_FOR_EVENT') {
                alert(this.$t('calendar.youAreAlreadySignedUp'))
                ClientSite.closeOwnPopup()
                return
              }
              this.loading = false
              this.showEventSignupSuccessDialog = true
              return
            }
            await YogoApi.post('/cart-items?destroyOthers=1', {
              item_type: 'event',
              item_id: this.localCartItem.itemId,
              user: this.user.id,
            })

            break;
          }

          case 'class_pass_type' : {
            this.loading = true
            const classPassType = await YogoApi.get('/class-pass-types/' + this.localCartItem.itemId)
            const userClassPasses = await YogoApi.get('/class-passes?user=' + this.user.id)
            const classPassesOfSameType = _filter(userClassPasses,
                classPass => classPass.class_pass_type == classPassType.id)

            // First check if user is allowed to aquire this class pass
            if (
                classPassType.limited_number_per_customer &&
                classPassesOfSameType.length >= classPassType.max_number_per_customer
            ) {
              this.loading = false
              this.alertDialogText = 'Du kan ikke købe flere "' + classPassType.name + '"'
              this.alertDialogConfirmText = 'Ok'
              this.alertDialogClosedAction = 'closeOverlay'
              this.showAlertDialog = true
              return
            }

            if (parseInt(classPassType.price) === 0) {

              await YogoApi.post('/class-passes', {
                user: this.user.id,
                class_pass_type: classPassType.id,
              })

              this.loading = false
              this.alertDialogText = '"' + classPassType.name + '" er oprettet på din profil'
              this.alertDialogConfirmText = 'Ok'
              this.showAlertDialog = true
              this.alertDialogClosedAction = 'goToProfile'

              return

            }

            await YogoApi.post('/cart-items?destroyOthers=1', {
              item_type: 'class_pass_type',
              item_id: this.localCartItem.itemId,
              user: this.user.id,
            })
            break;
          }

          case 'membership_type' : {
            const userMemberships = await YogoApi.get('/memberships?user=' + this.user.id + '&populate[]=membership_type');
            this.existingMembership = _find(userMemberships,
                membership => membership.membership_type.id == this.localCartItem.itemId && membership.status !== 'ended');
            if (this.existingMembership) {
              this.showMembershipExistsDialog = true
              return
            }
            const [membershipType] = await YogoApi.get(`/membership-types?id=${this.localCartItem.itemId}&populate[]=active_campaign&populate[]=payment_options`)
            await YogoApi.post('/cart-items?destroyOthers=1', {
              item_type: 'membership_type',
              item_id: this.localCartItem.itemId,
              user: this.user.id,
              payment_option: this.localCartItem.paymentOption || _find(
                  membershipType.payment_options,
                  {number_of_months_payment_covers: 1, for_sale: true}
              ).id,
              membership_campaign: membershipType.active_campaign_id || undefined,
            })
            break;
          }

          case 'class' :
          case 'class_livestream': {
            if (this.loginMode === 'signup') {
              this.loading = false
              this.showUserHasNoAccessToClassDialog = true
              return
            }

            this.requestedClass = (await YogoApi.get('/classes?id=' + this.localCartItem.itemId + '&populate[]=class_type')).classes[0]

            console.log('this.requestedClass', this.requestedClass)

            this.loading = false

            switch (this.cartItemType) {
              case 'class':
                this.$refs.classSignupComponent.$emit('signUpForClass', this.requestedClass);
                break;
              case 'class_livestream':
                this.$refs.classSignupComponent.$emit('signUpForLivestream', this.requestedClass);
                break;
            }

            break;
          }

          case 'product': {
            if (_isArray(this.localCartItem)) {
              this.localCartItem = _map(this.localCartItem, item => {
                item.user = this.user.id
                return item
              })
              await YogoApi.post('/cart-items?destroyOthers=1', this.localCartItem[0])
              await Promise.all(_map(this.localCartItem.slice(1),
                  cartItem => YogoApi.post('/cart-items', cartItem)))
            } else {
              this.localCartItem.user = this.user.id
              await YogoApi.post('/cart-items?destroyOthers=1', this.localCartItem)
            }

            break;
          }
        }

        if (this.cartItemRequiresPayment) {

          if (this.appliedDiscountCode) {
            const response = await YogoApi.post('/cart-items', {
              item_type: 'discount_code',
              discount_code: this.appliedDiscountCode,
              user: this.user.id,
            })
            if (response === 'E_DISCOUNT_CODE_NOT_FOUND') {
              this.loading = false
              alert(this.$t('checkout.discountCodeNotFound'))
              return
            }
            if (response === 'E_DISCOUNT_CODE_CUSTOMER_LIMIT_REACHED') {
              this.loading = false
              alert(this.$t('checkout.thisDiscountCodeIsNoLongerAvailable'))
              return
            }
            if (response === 'E_DISCOUNT_CODE_USE_PER_CUSTOMER_LIMIT_REACHED') {
              this.loading = false
              alert(this.$t('checkout.youHaveAlreadyUsedThisDiscountCodeTheMaximumNumberOfTimes'))
              return
            }
            if (response.substr(0, 2) === 'E_') {
              this.loading = false
              alert(response)
              return
            }
          }

          window.localStorage.removeItem('localCart')
          this.reepayStartPayment()
        }

      },

      alertDialogClosed() {
        switch (this.alertDialogClosedAction) {
          case 'goToProfile':
            this.$router.push({name: 'MyProfile'})
            break
          case 'reset':
            this.showAlertDialog = false
            this.logout()
            break
          case 'closeOverlay':
            ClientSite.closeOwnPopup()
            break
        }
      },

      classSignupSuccess() {
        this.showClassSignupSuccessDialog = true
      },

      classSignupFailure(error) {
        switch (error) {
          case 'E_CLASS_HAS_STARTED':
            alert(this.$t('calendar.classHasStarted'))
            this.backToCalendar()
            break
          case 'E_CLASS_CANCELLED':
            alert(this.$t('calendar.classIsCancelled'))
            this.backToCalendar()
            break
          case 'E_NO_ACCESS_TO_CLASS':
          case 'E_CUSTOMER_HAS_NO_VALID_CLASS_PASS_OR_MEMBERSHIP':
            this.showUserHasNoAccessToClassDialog = true
            break
          case 'E_USER_CANCELLED_SIGNUP':
            this.logout()
            break
          case 'E_ALREADY_SIGNED_UP':
            alert(this.$t('calendar.youAreAlreadySignedUp'))
            this.backToCalendar()
            break
          default: {
            this.logout()
            const message = this.$t('calendar.classSignupError', {
              errorMessage: error,
            })
            alert(message)
            break;
          }
        }
      },

      cancelMembershipExistsDialog() {
        this.logout()
        this.showMembershipExistsDialog = false
      },

      userHasNoAccessToClassDialogClosed() {
        // TODO: Is this working?
        this.logout()
      },

      userHasNoAccessToClassDialogClickOutside() {
        // TODO: Is this working?
      },

      logout() {
        this.$store.commit('clearUser')
        window.sessionStorage.removeItem('accessToken')
        window.localStorage.removeItem('accessToken')
      },

      backToEventList() {
        if (ClientSite.isRunningInIframe()) {
          ClientSite.closeOwnPopup()
        } else {
          this.$router.push({
            name: 'Events',
          })
        }
      },
      backToCalendar() {
        if (ClientSite.isRunningInIframe()) {
          ClientSite.closeOwnPopup()
        } else {
          this.$router.push({
            name: 'Schedule',
          })
        }
      },
      closeOwnPopup() {
        if (ClientSite.isRunningInIframe()) {
          ClientSite.closeOwnPopup()
        }
      },
      backToMyProfile() {
        this.$router.push({
          name: 'MyProfile',
        })
      },
      async applyDiscountCode() {
        if (!this.discountCodeInput) return

        this.appliedDiscountCode = this.discountCodeInput
        this.discountCodeInput = ''
      },
      removeAppliedDiscountCode() {
        this.discountCodeInput = ''
        this.appliedDiscountCode = ''
      },
      async addToCart(cartItem) {

        this.loading = true

        await YogoApi.post('/cart-items', cartItem)
        await this.$store.dispatch('updateUser')

        this.$router.push({name: 'Checkout'})
        this.loading = false

      },
      moment: moment,
    },
    validations() {
      const v = {
        loginForm: {
          email: {
            required,
            email,
          },
          password: {
            required,
          },
        },
        signupForm: {
          first_name: {
            required,
          },
          last_name: {
            required,
          },
          email: {
            required,
            email,
          },
          password: {
            required,
            passwordStrength(value) {
              const length = value.length >= 6
              if (!length) return false
              const upperCase = !!value.match(/[A-Z]+/)
              const lowerCase = !!value.match(/[a-z]+/)
              const numbers = !!value.match(/[0-9]+/)
              return upperCase && lowerCase && numbers
            },
          },
        },
      }
      if (this.client.settings.signup_phone_field_required) {
        v.signupForm.phone = {
          required,
        }
      }
      if (this.client.settings.signup_date_of_birth_field_required) {
        v.signupForm.date_of_birth = {
          required,
        }
      }
      return v
    },
  }
</script>

<style lang="stylus" scoped>

  .product-item {
    padding-bottom: 5px;
  }

  .total {
    padding-top: 5px;
  }

</style>

