<template>

  <loadingspinner v-if="loading"></loadingspinner>
  <div v-else>

    <div class="flex__align-center min-height--100 flex-center">
      <div class="ie--center wrapper narrow-wrapper" :class="{ 'width--100 p0' : mobileAppMode }">
        <div class="theme--frame-box">
          <ModalLogo></ModalLogo>
          <div class="space4"></div>
          <h2>{{ $t('login.createProfile') }}</h2>
          <div class="space8"></div>
          <div class="flex-column">

            <form novalidate @submit.prevent="submitForm">

              <md-field :class="getValidationClass('first_name')">
                <label>{{ $t('login.firstNameLabel') }}</label>
                <md-input required type="text" v-model="form.first_name" autocomplete="given-name"></md-input>
                <span class="md-error" v-if="!$v.form.first_name.required">{{ $t('login.firstNameMust') }}</span>
              </md-field>

              <md-field :class="getValidationClass('last_name')">
                <label>{{ $t('login.lastNameLabel') }}</label>
                <md-input required type="text" v-model="form.last_name" autocomplete="family-name"></md-input>
                <span class="md-error" v-if="!$v.form.last_name.required">{{ $t('login.lastNameMust') }}</span>
              </md-field>

              <md-field :class="getValidationClass('email')">
                <label>{{ $t('login.emailLabel') }}</label>
                <md-input required type="email" v-model="form.email" autocomplete="email"></md-input>
                <span class="md-error" v-if="!$v.form.email.required">{{ $t('login.typeEmail') }}</span>
                <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('login.emailNotValid') }}</span>
              </md-field>

              <div class="md-field" :class="getValidationClass('date_of_birth')"
              v-if="client.settings.signup_show_date_of_birth_field">
              <label class="text__gray--medium">{{ $t('login.birthdayLabel') }}<span
                v-if="client.settings.signup_date_of_birth_field_required"> *</span></label>
                <md-datepicker v-model="form.date_of_birth" class="text__gray--medium">
                  <span class="md-error"
                  v-if="client.settings.signup_date_of_birth_field_required && !$v.form.date_of_birth.required">{{ $t('login.birthdayMust') }}</span>
                </md-datepicker>
              </div>

              <md-field :class="getValidationClass('phone')"
              v-if="client.settings.signup_show_phone_field">
              <label>{{ $t('login.phoneLabel') }}</label>
              <md-input v-model="form.phone" :required="client.settings.signup_phone_field_required"
              autocomplete="tel"></md-input>
              <span class="md-error" v-if="client.settings.signup_phone_field_required && !$v.form.phone.required">{{ $t('login.phoneMust') }}</span>
            </md-field>

            <md-field :class="getValidationClass('password')">
              <label>{{ $t('login.passwordLabel') }}</label>
              <md-input required id="password" type="password" v-model="form.password"
              autocomplete="off"></md-input>
              <span class="md-error" v-if="!$v.form.password.required">{{ $t('login.passwordMustBeCreated') }}</span>
              <span class="md-error"
              v-else-if="!$v.form.password.passwordStrength">{{ $t('login.passwordDescription') }}</span>
            </md-field>

            <md-checkbox v-model="acceptTerms">
              {{ $t('login.acceptLabel') }}
              <a class="underline ml-1" href="#" @click.prevent.stop="showTerms = true">{{ client.name }}s {{ $t('login.terms') }}</a>
            </md-checkbox>

            <div class="space8"></div>

            <button type="submit" class="btn width--100 btn-primary">{{ $t('login.createProfile') }}</button>
            <div class="space4"></div>
            <router-link :to="{name: 'Login'}" v-if="!mobileAppMode">{{ $t('login.backToLogin') }}</router-link>

          </form>
          <div class="space8"></div>
        </div>
      </div>

      <md-dialog :md-active.sync="showUserExists">
        <md-dialog-title>{{ $t('login.emailExcist') }}</md-dialog-title>
        <md-dialog-content>
          <p>{{ $t('login.emailExcistDesc') }} "{{ userExistsDialogEmail}}".</p>
          <p>{{ $t('global.please') }}
            <router-link :to="{ name: 'Login' }" class="whitespace--nowrap">{{ $t('login.signin') }}</router-link>
          </p>
          <p>{{ $t('login.ifYouForgotYourPass') }}
            <router-link :to="{ name: 'ResetPassword' }" class="whitespace--nowrap">{{ $t('login.resetItHere') }}</router-link>
          </p>

        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="showUserExists = false">OK</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog :md-active.sync="showSignupSuccess" @md-closed="signupSuccessDialogClose">
        <md-dialog-title>{{ $t('login.thanksForYourSubmit') }}</md-dialog-title>
        <md-dialog-content>
          <p>{{ $t('login.youCanNowBuyCoursesEtc') }}</p>
          <p v-if="!mobileAppMode">{{ $t('login.youWillBeRedirected') }}</p>
          <p v-if="mobileAppMode">{{ $t('login.mobileAppPleaseNavigateBackToLogin') }}</p>
        </md-dialog-content>
        <md-dialog-actions v-if="!mobileAppMode">
          <button class="btn btn-primary" @click="showSignupSuccess = false">OK</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog :md-active.sync="showTerms">
        <md-dialog-content class="terms-and-conditions">
          <h1>{{ $t('global.terms') }}</h1>
          <div v-html="client.settings.terms"></div>
        </md-dialog-content>
        <md-dialog-actions>
          <button class="btn btn-primary" @click="showTerms = false">{{ $t('global.close') }}</button>
        </md-dialog-actions>
      </md-dialog>

      <md-dialog-alert
      :md-active.sync="showMustAcceptTerms"
      :md-content="$t('login.haveToAccept')"
      md-confirm-text="Ok"/>

    </div>
  </div>
</div>


</template>

<script>

  import YogoApi from '../gateways/YogoApi'
  import {validationMixin} from 'vuelidate'
  import {mapGetters} from 'vuex'
  import moment from 'moment'
  import _pick from 'lodash/pick'
  import {
    required,
    email,
  } from 'vuelidate/lib/validators'
  import Loadingspinner from "./LoadingSpinner"
  import ModalLogo from './ModalLogo'

  export default {
    mixins: [validationMixin],
    data() {
      return {
        saveLabel: 'Opret profil',
        firstNameLabel: 'Fornavn',
        lastNameLabel: 'Efternavn',
        editLabel: 'Rediger',
        acceptLabel: 'Jeg accepterer',
        termsLabel: 'betingelser',
        birthdayLabel: 'Fødselsdato',
        addressLabel: 'Adresse',
        address2Label: 'Adresse2',
        zipLabel: 'Postnummer',
        cityLabel: 'By',
        countryLabel: 'Land',
        emailLabel: 'E-mail',
        phoneLabel: 'Telefon',
        passwordLabel: 'Adgangskode',
        passwordConfirmLabel: 'Bekræft adgangskode',
        labelClose: 'luk',

        form: {},

        loading: true,

        showUserExists: false,
        userExistsDialogEmail: '',

        showSignupSuccess: false,

        acceptTerms: false,
        showTerms: false,
        showMustAcceptTerms: false,
      }
    },
    components: {
      Loadingspinner,
      ModalLogo
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
        'profileImageFilename',
        'clientLogoFilename',
        'emailConfirmationLink',
        'mobileAppMode'
      ]),
    },
    mounted() {
      if (this.stateReady) {
        this.loading = false
      }
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) {
          this.loading = false
        }
      },
    },
    methods: {
      async submitForm() {

        this.showUserExists = false

        this.$v.$touch()

        if (this.$v.$invalid) return

        if (!this.acceptTerms) {
          this.showMustAcceptTerms = true
          return
        }


        let userData = _pick(
          this.form, [
            'first_name',
            'last_name',
            'email',
            'password',
            'date_of_birth',
            'phone',
          ],
        )

        userData.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).format('YYYY-MM-DD') : null

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

        window.localStorage.setItem('accessToken', response.token)

        const user = await YogoApi.get('/users/' + response.user.id + '?populate=image')

        await this.$store.dispatch('updateUser', user.id)

        this.loading = false
        this.showSignupSuccess = true

      },

      signupSuccessDialogClose() {
        if (this.mobileAppMode) return
        this.$router.push({name: 'Prices'})
      },

      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
    },
    validations() {
      let v = {
        form: {
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
      if (this.client.settings.signup_show_date_of_birth_field && this.client.settings.signup_date_of_birth_field_required) {
        v.form.date_of_birth = {
          required,
        }
      }
      if (this.client.settings.signup_show_phone_field && this.client.settings.signup_phone_field_required) {
        v.form.phone = {
          required,
        }
      }
      return v
    },
  }
</script>

<style lang="stylus">

  .client-logo
    width: 120px
    height: 120px
    display: block;
    margin: 20px auto

</style>
