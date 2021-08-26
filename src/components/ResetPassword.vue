<template>

  <div>

    <div class="flex__align-center min-height--100 flex-center">
      <div class="message__modal--bg"></div>

      <div class="message__modal--container">
        <div class="wrap--modal">
          <ModalLogo></ModalLogo>
          <div class="space4"></div>
          <h2>{{ $t('profile.resetPass') }}</h2>
          <div class="space8"></div>
          <div class="flex-column" v-if="!emailSent">
            <p class="center">{{ $t('profile.resetPasswordDesc') }}</p>
            <div class="space8"></div>

            <form novalidate @submit.prevent="submitForm">
              <md-field :class="getValidationClass('email')">
                <label>{{ $t('login.emailLabel') }}</label>
                <md-input required type="email" v-model="form.email"></md-input>
                <span class="md-error" v-if="emailNotFound">{{ $t('login.emailNotInDB') }}</span>
                <span class="md-error" v-else-if="!$v.form.email.required">{{ $t('login.typeEmail') }}</span>
                <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('login.notValidEmail') }}</span>

              </md-field>

              <div class="space8"></div>

              <div class="flex__row--mobile space__between--mobile">
                <button type="submit" class="btn btn-primary">{{ $t('global.sendEmail') }}</button>
                <router-link :to="{ name: 'Login' }" class="whitespace--nowrap">{{ $t('global.backToLogin') }}</router-link>
              </div>

            </form>
          </div>
          <div v-else>
            <p>
              {{ $t('login.sendConfirmEmail') }}
            </p>
            <div class="space2"></div>
            <p>
              {{ $t('login.checkSpamFolder') }}
            </p>
            <div class="space4"></div>
            <p>
              <button type="button" class="btn btn-primary" @click="$router.push({ name: 'Login' })">{{ $t('global.backToLogin') }}</button>
            </p>

          </div>
        </div>
      </div>

    </div>


    <md-dialog-alert
        :md-active.sync="emailNotFound"
        md-content="Emailen findes ikke i systemet. Tjek venligst at du har skrevet den rigtigt."
        md-confirm-text="Ok"/>

  </div>
</template>

<script>

    import {validationMixin} from 'vuelidate'
    import YogoApi from '../gateways/YogoApi'
    import {
        required,
        email,
    } from 'vuelidate/lib/validators'

    import ModalLogo from './ModalLogo'

    export default {
        components: {ModalLogo},
        mixins: [validationMixin],
        data() {
            return {
                emailLabel: 'Email',
                passwordLabel: 'Adgangskode',
                rememberMeLabel: 'Husk mig på denne computer',
                email: '',
                password: '',
                rememberMe: false,
                form: {
                    email: ''
                },
                emailSent: false,
                emailNotFound: false
            }
        },
        mounted: function () {

        },
        methods: {
            async submitForm() {
                try {
                    this.emailNotfound = false
                    this.$v.$touch();

                    if (this.$v.$invalid) return;

                    const location = window.location
                    const route = this.$router.resolve({
                        name: 'ResetPasswordWithToken',
                        params: {email: '{email}', token: '{token}'}
                    })

                    const response = await YogoApi.post('/password-reset-send-token', {
                        email: this.form.email,
                        setNewPasswordLink: location.protocol + '//' + location.host + location.pathname + route.href
                    })

                    if (response === 'E_EMAIL_NOT_FOUND') {
                        this.emailNotFound = true
                        return
                    }

                    this.form.email = '';

                    this.$v.$reset()

                    this.emailSent = true;

                } catch (err) {
                    console.log(err)
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
                email: {
                    required,
                    email
                },
            }
        },
    }
</script>
