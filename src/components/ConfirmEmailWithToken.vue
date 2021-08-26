<template>
  <div>
    <div class="message__modal--bg"></div>

    <div class="message__modal--container">
      <div class="wrapper narrow-wrapper ie--center flex-column">
        <div class="space8"></div>
        <loadingspinner class="relative" v-if="status === 'LOADING'"></loadingspinner>
        <div class="flex-column" v-else-if="status === 'EMAIL_CONFIRMED'">
          <h2>{{ $t('login.thankYouConfirm') }} {{ email }}</h2>
          <div class="space4"></div>
          <div class="flex--row">
          <router-link class="margin__right--10"  v-if="user && user.cart_items && user.cart_items.length" :to="{ name: 'Checkout' }">Gå til checkout</router-link>
          <router-link class="margin__right--10" :to="{name: 'MyProfile'}" v-if="user">{{ $t('global.myProfile') }}</router-link>
          <router-link :to="{name: 'Login'}" class="whitespace--nowrap align__self--baseline">{{ $t('global.backToLogin') }}</router-link>
          </div>
        </div>
        <div class="flex-column" v-else-if="status === 'TOKEN_NOT_FOUND'">
          <h2>
            {{ $t('login.notValidLink') }}.
          </h2>
          <div class="space4"></div>
          <p>
            {{ $t('login.didYouAskForMoreLogins') }}
          </p>
          <div class="space4"></div>
          <router-link :to="{name: 'Login'}" class="whitespace--nowrap align__self--baseline">{{ $t('global.backToLogin') }}</router-link>
        </div>

        <form novalidate @submit.prevent="submitForm" v-else-if="status === 'TOKEN_EXPIRED'">

          <div class="space8"></div>

          <h2>{{ $t('login.oldLink') }}</h2>
          <br />
          <p>
            {{ $t('login.pleaseSendNew') }}
          </p>
          <p>
            {{ $t('login.emailIsSendTo') }} {{ email }}
          </p>

          <div class="space4"></div>
          <div class="flex-column">
          <button type="submit" class="btn btn-primary">{{ $t('global.sendEmail') }}</button>
          <div class="space4"></div>
          <router-link :to="{name: 'Login'}" class="whitespace--nowrap">{{ $t('global.backToLogin') }}</router-link>
          </div>
        </form>
        <div v-else-if="status === 'NEW_EMAIL_SENT'">
          <h2>
            {{ $t('login.weHaveSendNewEmail') }} {{ email }}
            }
          </h2>
          <div class="space4"></div>
          <router-link :to="{name: 'Login'}" class="whitespace--nowrap align__self--baseline">{{ $t('global.backToLogin') }}</router-link>
        </div>
        <div class="space8"></div>



      </div>

      </div>
    </div>

</template>

<script>

    import {mapGetters} from 'vuex'
    import YogoApi from '../gateways/YogoApi'
    import {
        required,
        sameAs,
        minLength
    } from 'vuelidate/lib/validators'

    import LoadingSpinner from './LoadingSpinner';

    export default {
        name: 'resetPasswordWithToken',
        components: {
            loadingspinner: LoadingSpinner
        },
        data() {
            return {
                status: 'LOADING',
                email: '',
                token: '',
            }
        },
        computed: {
            ...mapGetters([
                'emailConfirmationLink',
                'user'
            ])
        },
        async created() {
            try {

                this.email = this.$route.params.email;
                this.token = this.$route.params.token;

                const response = await YogoApi.post('/confirm-email-with-token', {
                    email: this.email,
                    token: this.token
                });

                switch (response) {
                    case 'E_TOKEN_NOT_FOUND':
                        this.status = 'TOKEN_NOT_FOUND';
                        break;
                    case 'E_TOKEN_EXPIRED':
                        this.status = 'TOKEN_EXPIRED';
                        break;
                    default:
                        this.status = 'EMAIL_CONFIRMED';
                        break;
                }

            } catch (err) {
                console.log(err)
            }
        },
        methods: {
            async submitForm() {

                try {

                    await YogoApi.post('/confirm-email-resend-welcome-email', {
                        email: this.email,
                        emailConfirmationLink: this.emailConfirmationLink
                    });

                    this.status = 'NEW_EMAIL_SENT'

                } catch (err) {
                    console.log(err)
                }

            },
            getValidationClass(fieldName) {
                const field = this.$v.form[fieldName];

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
                    minLength: minLength(8)
                },
                confirm_password: {
                    sameAsPassword: sameAs('password')
                }
            }
        },
    }
</script>
