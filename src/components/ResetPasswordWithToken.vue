<template>
  <div>
    <div class="message__modal--bg"></div>

    <div class="message__modal--container">
      <div class="wrap--modal">
        <ModalLogo></ModalLogo>
        <div class="space4"></div>
        <h2>{{ $t('profile.resetPassFor') }}<br>{{ $route.params.email }}</h2>
        <div class="space8"></div>

        <loadingspinner v-if="loading"></loadingspinner>

        <div class="flex-column" v-else>
          <p class="center">{{ $t('profile.typeNewPass') }}</p>
          <div class="space8"></div>

          <form novalidate @submit.prevent="submitForm">
            <md-field :class="getValidationClass('password')">
              <label>{{ $t('login.passwordLabel') }}</label>
              <md-input required type="password" v-model="form.password"></md-input>
              <span class="md-error" v-if="!$v.form.password.required">{{ $t('login.passMustBeEntered') }}</span>
              <span class="md-error"
                    v-else-if="!$v.form.password.passwordStrength">{{ $t('login.passwordDescription') }}</span>
            </md-field>

            <div class="space4"></div>

            <md-field :class="getValidationClass('confirm_password')">
              <label>{{ $t('login.passwordConfirmLabel') }}</label>
              <md-input required type="password"
                        v-model="form.confirm_password"></md-input>
              <span class="md-error" v-if="!$v.form.password.sameAsPassword">{{ $t('login.passwordMatch') }}</span>
            </md-field>

            <div class="space4"></div>

            <button type="submit" class="btn btn-primary">{{ $t('login.saveNewPass') }}</button>
          </form>
          <div class="space4"></div>

        </div>
        <div class="flex--row space--between">
          <p>
            <router-link :to="{name: 'Login'}" class="whitespace--nowrap">{{ $t('global.backToLogin') }}</router-link>
          </p>
        </div>
      </div>
    </div>

    <md-dialog-alert :md-active.sync="showAlert" :md-title="alertTitle"
                     :md-content="alertText" @md-closed="alertClosed"></md-dialog-alert>
  </div>
</template>

<script>
    import {validationMixin} from 'vuelidate'
    import YogoApi from '../gateways/YogoApi'
    import {
        required,
        sameAs,
    } from 'vuelidate/lib/validators'
    import Loadingspinner from "./LoadingSpinner";

    import ModalLogo from './ModalLogo'

    export default {
        components: {ModalLogo, Loadingspinner},
        name: 'resetPasswordWithToken',
        mixins: [validationMixin],
        data() {
            return {
                passwordLabel: 'Adgangskode',
                confirmPasswordLabel: 'Gentag adgangskode',
                form: {
                    password: '',
                    confirm_password: ''
                },

                showAlert: false,
                alertTitle: '',
                alertText: '',

                loading: true
            }
        },
        async mounted() {
            try {
                const email = this.$route.params.email
                const token = this.$route.params.token

                const response = await YogoApi.post('/password-reset-check-token', {
                    email: email,
                    token: token
                })

                if (this.handleResponseErrors(response)) {
                    this.loading = false
                }

            } catch (err) {
                console.log(err)
            }
        },
        methods: {
            async submitForm() {
                try {
                    this.$v.$touch()

                    if (this.$v.$invalid) {
                        return;
                    }

                    const email = this.$route.params.email
                    const token = this.$route.params.token

                    this.loading = true

                    const response = await YogoApi.post('/password-reset-set-password-with-token', {
                        email: email,
                        token: token,
                        password: this.form.password
                    })

                    if (this.handleResponseErrors(response)) {
                        this.alertTitle = this.$t('login.passHasBeenUpdated')
                        this.alertText = this.$t('login.youCanNowLogin')
                        this.showAlert = true
                    }

                } catch (err) {
                    console.log('Caught error:', err.response)
                }
            },
            handleResponseErrors(response) {
                if (response === 'E_EMAIL_NOT_FOUND') {
                    this.alertTitle = this.$t('login.emailDoesNotExcist')
                    this.alertText = this.$route.params.email + ' ' + this.$t('login.isNotInSystem')
                    this.showAlert = true
                    return false
                } else if (response === 'E_PASSWORD_TOO_WEAK') {
                    this.alertTitle = this.$t('login.emailPassNotGood')
                    this.alertText = this.$t('login.passwordDescription')
                    this.showAlert = true
                    return false
                } else if (response === 'E_INVALID_TOKEN') {
                    this.alertTitle = this.$t('login.notValidLink')
                    this.alertText = this.$t('login.didYouAskForMoreLogins')
                    this.showAlert = true
                    return false
                } else if (response === 'E_TOKEN_EXPIRED') {
                    this.alertTitle = this.$t('login.linkExpired')
                    this.alertText = this.$t('login.linkExpiredDesc')
                    this.showAlert = true
                    return false
                } else {
                    return true
                }
            },
            alertClosed() {
                if (this.loading) {
                    this.$router.push({name: 'Login'})
                }
            },
            getValidationClass(fieldName) {
                const field = this.$v.form[fieldName]

                if (field) {
                    return {
                        'md-invalid': field.$invalid && field.$dirty
                    }
                }
            },

        },
        validations: {
            form: {
                password: {
                    required,
                    passwordStrength(value) {
                        const upperCase = !!value.match(/[A-Z]+/)
                        const lowerCase = !!value.match(/[a-z]+/)
                        const numbers = !!value.match(/[0-9]+/)
                        const length = value.length >= 6
                        return upperCase && lowerCase && numbers && length
                    }
                },
                confirm_password: {
                    sameAsPassword: sameAs('password')
                }
            }
        },
    }
</script>
