<template>

  <div class="profileedit" :class="{ 'wrapper' : !mobileAppMode }">
    <div class="theme--frame-box">

      <div v-if="!mobileAppMode">
        <h1>{{ $t('profile.editProfile') }}</h1>
        <div class="space8"></div>
      </div>

      <loadingspinner v-if="loading"></loadingspinner>

      <form novalidate @submit.prevent="submitForm" v-else>

        <div v-if="!mobileAppMode" class="space4"></div>

        <router-link v-if="mobileAppMode" :to="{ name: 'MyProfile' }" class="flex aic">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="feather feather-arrow-left">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span class="pl-1">
          {{ $t('global.back') }}
          </span>
        </router-link>

        <imagefield :imageId.sync="form.image" imageFormat="profile"></imagefield>

        <div class="flex--row space--between">

          <div class="flex__1-2">

            <md-field :class="getValidationClass('first_name')">
              <label>{{ $t('login.firstNameLabel') }}</label>
              <md-input required type="text" v-model="form.first_name" autocomplete="given-name"></md-input>
              <span class="md-error" v-if="!$v.form.first_name.required">{{ $t('login.firstNameMust') }}</span>
            </md-field>

          </div>

          <div class="flex__1-2">

            <md-field :class="getValidationClass('last_name')">
              <label>{{ $t('login.lastNameLabel') }}</label>
              <md-input required type="text" v-model="form.last_name" autocomplete="family-name"></md-input>
              <span class="md-error" v-if="!$v.form.last_name.required">{{ $t('login.lastNameMust') }}</span>
            </md-field>

          </div>
        </div>

        <div class="flex--row space--between">

          <div class="flex__1-2">
            <md-field>
              <label class="active">{{ $t('login.addressLabel') }}</label>
              <md-input v-model="form.address_1"></md-input>
            </md-field>
          </div>

          <div class="flex__1-2">
            <label class="absolute">{{ $t('login.birthdayLabel') }}</label>
            <md-datepicker v-model="form.date_of_birth" md-immediately/>
          </div>

        </div>

        <div class="flex--row space--between">

          <div class="flex__1-2">
            <md-field>
              <label class="active">{{ $t('login.address2Label') }}</label>
              <md-input v-model="form.address_2"></md-input>
            </md-field>
          </div>

          <div class="flex__1-2">
            <md-field>
              <label class="active">{{ $t('login.zipLabel') }}</label>
              <md-input v-model="form.zip_code" autocomplete="postal-code"></md-input>
            </md-field>
          </div>

        </div>

        <div class="flex--row space--between">

          <div class="flex__1-2">
            <md-field>
              <label>{{ $t('login.cityLabel') }}</label>
              <md-input v-model="form.city" autocomplete="address-line3"></md-input>
            </md-field>
          </div>

          <div class="flex__1-2">
            <md-field>
              <label>{{ $t('login.countryLabel') }}</label>
              <countryselect :country.sync="form.country"></countryselect>
            </md-field>
          </div>

        </div>

        <div class="flex--row space--between">

          <div class="flex__1-2">
            <md-field :class="getValidationClass('email')">
              <label>{{ $t('login.emailLabel') }}</label>
              <md-input required type="email" v-model="form.email" autocomplete="email"></md-input>
              <span class="md-error" v-if="!$v.form.email.required">{{ $t('login.typeEmail') }}</span>
              <span class="md-error" v-else-if="!$v.form.email.email">{{ $t('login.emailNotValid') }}</span>
            </md-field>
          </div>

          <div class="flex__1-2">

            <md-field :class="getValidationClass('phone')">
              <label>{{ $t('login.phoneLabel') }}</label>
              <md-input type="text" v-model="form.phone" autocomplete="tel"></md-input>
              <!--<span class="md-error" v-if="!$v.form.phone.required">Telefonnummer skal indtastes</span>-->
            </md-field>

          </div>

        </div> <!-- flex-row space-between -->

        <div class="space4"></div>

        <div class="flex--row space--between">

          <div class="flex__1-2">

            <md-field :class="getValidationClass('password')">
              <label>{{ $t('login.passwordLabel') }}</label>
              <md-input id="password" type="password" v-model="form.password" autocomplete="new-password"></md-input>
              <span class="md-error"
                    v-if="!$v.form.password.passwordStrength">{{ $t('login.passwordDescription') }}</span>
            </md-field>
          </div>

          <div class="flex__1-2">

            <md-field :class="getValidationClass('confirm_password')">
              <label>{{ $t('login.passwordConfirmLabel') }}</label>
              <md-input type="password" v-model="form.confirm_password" autocomplete="new-password"></md-input>
              <span class="md-error"
                    v-if="!$v.form.confirm_password.sameAsPassword">{{ $t('login.passwordMatch') }}</span>
            </md-field>

          </div>

        </div> <!-- flex-row space-between -->

        <div v-if="client.settings.customer_profile_use_additional_info_field">
          <div class="space4"></div>

          <p class="bold">{{ $t('login.additionalInfoFieldSubtitle') }}</p>
          <label v-if="client.settings.customer_profile_additional_info_field_subtitle">
            {{ client.settings.customer_profile_additional_info_field_subtitle }}
          </label>
          <md-field>
            <md-textarea v-model="form.customer_additional_info"></md-textarea>
          </md-field>
        </div>

        <div class="space8"></div>

        <button type="submit" class="btn btn-primary">{{ $t('global.update') }}</button>

        <div class="space8"></div>
        <div class="space8"></div>

        <md-snackbar :md-position="snackbarPosition" :md-duration="snackbarIsInfinity ? Infinity : snackbarDuration"
                     :md-active.sync="showSnackbar" md-persistent>
          <span>{{ $t('profile.profileUpdated') }}</span>
        </md-snackbar>

      </form>
    </div>

    <div class="space8"></div>

  </div>

</template>

<script>

  import YogoApi from '../gateways/YogoApi'
  import {mapGetters} from 'vuex'
  import _pick from 'lodash/pick'
  import CountrySelect from './CountrySelect.vue'
  import moment from 'moment'
  import {validationMixin} from 'vuelidate'
  import {
    required,
    email,
    sameAs,
  } from 'vuelidate/lib/validators'
  import Loadingspinner from "./LoadingSpinner.vue"

  import imagesLoaded from 'vue-images-loaded'
  import Imagefield from "./ImageField"

  export default {
    name: 'profileedit',
    mixins: [validationMixin],
    components: {
      Imagefield,
      Loadingspinner,
      countryselect: CountrySelect,
    },
    directives: {
      imagesLoaded,
    },
    data() {
      return {
        firstNameLabel: 'Fornavn',
        lastNameLabel: 'Efternavn',
        editLabel: 'Rediger',
        birthdayLabel: 'Fødselsdato',
        addressLabel: 'Adresse',
        address2Label: 'Adresse2',
        zipLabel: 'Postnummer',
        cityLabel: 'By',
        countryLabel: 'Land',
        emailLabel: 'E-mail',
        phoneLabel: 'Tlf',
        passwordLabel: 'Adgangskode',
        passwordConfirmLabel: 'Bekræft adgangskode',
        saveLabel: 'Opdater',

        userFromApi: {},

        form: {},

        windowWidth: 0,

        showSnackbar: false,
        snackbarPosition: 'center',
        snackbarDuration: 4000,
        snackbarIsInfinity: false,

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'client',
        'user',
        'profileImageFilename',
        'stateReady',
        'mobileAppMode',
      ]),
      initialProfileImagePreviewSrc() {
        return this.Imgix(this.profileImageFilename, {w: 400, h:400, fit: 'crop'})
      },
      imageUploaderSize() {
        return this.windowWidth >= 768 ? 100 : 75
      },
    },
    methods: {
      async submitForm() {

        this.$v.$touch()

        if (this.$v.$invalid) return

        let userData = _pick(
          this.form, [
            'first_name',
            'last_name',
            'address_1',
            'address_2',
            'zip_code',
            'city',
            'country',
            'email',
            'phone',
            'image',
          ],
        )

        if (this.client.settings.customer_profile_use_additional_info_field) {
          userData.customer_additional_info = this.form.customer_additional_info
        }

        userData.date_of_birth = this.form.date_of_birth
            ? moment(this.form.date_of_birth, 'DD-MM-YYYY').format('YYYY-MM-DD')
            : null;

        if (this.form.password) {
          userData.password = this.form.password
        }

        let newUser = await YogoApi.put('/users/' + this.user.id, userData)

        if (newUser === 'E_EMAIL_EXISTS') {
          alert(this.$t('profile.emailExists').replace('{email}', userData.email))
          return
        }


        newUser = await YogoApi.get('/users/' + this.user.id + '?populate=image')


        this.form.password = ''
        this.form.confirm_password = ''

        await this.$store.dispatch('updateUser', newUser.id)

        this.populateForm.bind(this)(newUser)

        this.showSnackbar = true


      },
      getValidationClass(fieldName) {
        const field = this.$v.form[fieldName]

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
      populateForm() {
        this.form = _pick(this.user, [
            'first_name',
            'last_name',
            'address_1',
            'address_2',
            'email',
            'phone',
            'zip_code',
            'city',
            'country',
            'customer_additional_info',
          ],
        )

        this.form.date_of_birth = this.user.date_of_birth
            ? moment(this.user.date_of_birth).format('DD-MM-YYYY')
            : null;

        this.form.image = this.user.image ? this.user.image.id : null
      },
      getWindowWidth() {
        this.windowWidth = document.documentElement.clientWidth
      },
      imageDidLoad() {
        if (this.imageIsWaiting) {
          this.imageIsWaiting = false
        }
      },
    },
    mounted() {
      this.$nextTick(function () {
        window.addEventListener('resize', this.getWindowWidth)
        this.getWindowWidth()
      })
      if (this.stateReady) {
        this.populateForm()
        this.loading = false
      }

    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) {
          this.populateForm()
          this.loading = false
        }
      },
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.getWindowWidth)
    },
    validations: {
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
          passwordStrength(value) {
            if (!value) return true
            const upperCase = !!value.match(/[A-Z]+/)
            const lowerCase = !!value.match(/[a-z]+/)
            const numbers = !!value.match(/[0-9]+/)
            const length = value.length >= 6
            return upperCase && lowerCase && numbers && length
          },
        },
        confirm_password: {
          sameAsPassword: sameAs('password'),
        },
      },
    },
  }
</script>
