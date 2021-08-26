<template>
  <div class="flex__align-center min-height--100 flex-center">
    <div class="login narrow-wrapper ie--center" :class="{ 'wrapper' : !mobileAppMode }">
      <div class="theme--frame-box">
        <ModalLogo></ModalLogo>
        <div class="space4"></div>
        <h2>{{ client.settings.login_greeting.replace('[studio_name]', client.name) }}</h2>
      <div class="space8"></div>
      <div class="flex--row space--between">
      <p class="pr-4">{{ $t('login.forSignupCreateProfile') }}</p>
      <router-link class="whitespace--nowrap" :to="{name: 'Signup'}">
        <button class="btn btn-primary">{{ $t('login.createProfile') }}</button>
      </router-link>
      </div>
      <div class="space4"></div>
      <p>{{ $t('login.alreadyHaveProfile') }}</p>

        <div class="flex-column">
          <!--<div class="btn waves-effect waves-light btn--facebook"><span class="icon-facebook"></span>
              Log ind med facebook
          </div>
          <div class="space8"></div>
          <p class="center">Eller log ind med email og password</p>
          <div class="space8"></div>-->
          <form novalidate @submit.prevent="submitForm">
            <md-field :class="getValidationClass('email')">
              <label>{{ $t('login.emailLabel') }}</label>
              <md-input required type="email" v-model="form.email" autocomplete="email"></md-input>
              <span class="md-error" v-if="!$v.form.email.required">{{ $t('login.typeEmail') }}</span>
              <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('login.notValidEmail') }}</span>
            </md-field>

            <div class="space4"></div>

            <md-field :class="getValidationClass('password')" :md-toggle-password="true">
              <label>{{ $t('login.passwordLabel') }}</label>
              <md-input required type="password" v-model="form.password"></md-input>
              <span class="md-error" v-if="!$v.form.password.required">{{ $t('login.passMustBeEntered') }}</span>
            </md-field>

            <div class="login-failed" v-if="loginFailed">{{ $t('login.wrongEmailOrPassword') }}</div>

            <div class="space4"></div>

            <md-checkbox v-model="rememberMe">{{ $t('login.rememberMeLabel') }}</md-checkbox>

            <div class="space8"></div>

          <button class="width--100 btn-primary" type="submit">{{ $t('login.signin') }}</button>
          <div class="space4"></div>
          <div class="flex--row space--between">
            <router-link :to="{name: 'ResetPassword' }">{{ $t('login.forgotPass') }}</router-link>
          </div>
        </form>
        <div class="space8"></div>
      </div>
    </div>


      <md-dialog-alert :md-active.sync="showLoginFailed" :md-title="$t('login.loginFailed')"
                       :md-content="$t('login.wrongEmailorCode')"></md-dialog-alert>
    </div>
  </div>
</template>

<script>
  import qs from 'qs';
  import {validationMixin} from 'vuelidate'
  import YogoApi from '../gateways/YogoApi'
  import {mapGetters} from 'vuex'
  import {
    required,
    email,
  } from 'vuelidate/lib/validators'

  import _pick from 'lodash/pick'

  import ModalLogo from './ModalLogo'
  import ClientSite from "../gateways/ClientSite"

  export default {
    components: {ModalLogo},
    mixins: [validationMixin],
    data() {
      return {
        email: '',
        password: '',
        rememberMe: false,
        loginFailed: false,
        form: {
          email: '',
          password: '',
        },

        showLoginFailed: false,
      }
    },
    computed: {
      ...mapGetters([
        'client',
        'clientLogoFilename',
        'requestedRoute',
        'mobileAppMode',
      ]),
    },
    mounted: function () {

    },
    methods: {
      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      async submitForm() {

        this.$v.$touch()

        if (this.$v.$invalid) return

        const response = await YogoApi.post('/login', this.form)

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

        const queryParams = qs.parse(document.location.search.substr(1));
        if (queryParams && queryParams.closeOwnPopupAfterLogin) {
          ClientSite.closeOwnPopup();
        }
        if (this.requestedRoute) {
          if (this.requestedRoute.name === 'Login' || !this.requestedRoute.name) {
            ClientSite.closeOwnPopup()
          }
          const requestedRoute = _pick(this.requestedRoute, ['name', 'params'])
          this.$store.commit('setRequestedRoute', null)
          this.$router.push(requestedRoute)
        } else {
          this.$router.push({name: 'MyProfile'})
        }
      },
    },
    validations: {
      form: {
        email: {
          required,
          email,
        },
        password: {
          required,
        },
      },
    },
  }
</script>

<style lang="scss" scoped>


</style>
