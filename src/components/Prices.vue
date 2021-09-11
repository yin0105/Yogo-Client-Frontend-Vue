<template>
  <div class="prices" :class="{ 'wrapper' : !mobileAppMode }">

    <h1 class="hidden-sm mb-8">
      <span>{{ $t('global.prices') }}</span>
    </h1>

    <div class="space8"></div>

    <loadingspinner v-if="loading"></loadingspinner>

    <ul v-else>

      <div v-if="visiblePriceGroups.length > 1" :class="{ 'bg-white mb-12' : mobileAppMode }">
        <div class="flex__1-3--margin">
          <md-field>
            <md-select v-model="selectedPriceGroup">
              <md-option v-for="priceGroup in visiblePriceGroups" :value="priceGroup.id" :key="priceGroup.id">{{
                priceGroup.name }}
              </md-option>
            </md-select>
          </md-field>
        </div>

        <div v-if="!mobileAppMode">
          <div class="space4"></div>
          <div class="space8"></div>
        </div>
      </div>

      <li v-if="showGiftCard" class="theme--frame-box">
        <div class="flex__grid--thirds align--top">
          <div class="flex__1-3--margin">
            <img :src="Imgix(giftCardPricesImage.filename, {w:320, h:320, fit: 'crop'})"
                 alt=""
                 v-if="giftCardPricesImage">
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">
            <h3>{{ client.settings.gift_card_prices_title }}</h3>
            <nl2br tag="p" :text="client.settings.gift_card_prices_description"></nl2br>
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">
            <button
                @click="buyGiftCard()"
                class="btn btn-primary">
              {{ $t('global.buy') }}
            </button>
          </div>
        </div>
        <div class="space4"></div>
      </li>

      <li v-for="membershipType in filteredMembershipTypes" class="membership-type theme--frame-box"
          :key="membershipType.id">
        <div class="flex__grid--thirds align--top">
          <div class="flex__1-3--margin">
            <img class="width--100" :src="Imgix(membershipType.image.filename, {h:640, w:640, fit:'crop'})" alt=""
                 v-if="membershipType.image">
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">
            <h3>{{ membershipType.name }}</h3>
            <nl2br tag="p" :text="membershipType.description"></nl2br>
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">

            <div class="space2"></div>

            <div v-if="membershipType.payment_options.length > 1">
              <md-field>
                <label>{{ $t('prices.paymentOptions') }}</label>
                <md-select v-model="selectedPaymentOption[membershipType.id]"
                           v-on:input="$forceUpdate()">
                  <md-option v-for="paymentOption in membershipType.payment_options" :value="paymentOption.id"
                             :key="paymentOption.id">
                    {{ paymentOption.nameThatUserSees }}
                  </md-option>
                </md-select>
              </md-field>
              <p class="bold upper">
                {{ getSelectedMembershipTypePaymentOption(membershipType).priceTextThatUserSees }}
              </p>
            </div>

            <div v-else>
              <label>{{ $t('prices.payment') }}: {{
                membershipType.payment_options[0].nameThatUserSees }} </label>
              <p class="bold upper">{{ membershipType.payment_options[0].priceTextThatUserSees }} </p>
            </div>


            <div class="customer-has-this line-height--20" v-if="customerHasMembershipType(membershipType)">
              {{ $t('global.haveMembership') }}
              <br>
              <div v-if="!mobileAppMode">
                <div v-for="membership in getCustomerMembershipsForMembershipType(membershipType)"
                :key="'membership_' + membership.id">
                  <router-link
                    class="underline"
                    :to="{name: 'Membership', params: {id: membership.id}}">{{ $t('prices.seeMembership') }}
                  </router-link>
                </div>
              </div>
            </div>

            <div class="space2"></div>
            <div
              v-if="membershipType.has_max_number_of_memberships &&
              membershipType.membershipCount >= membershipType.max_number_of_memberships &&
              !customerHasMembershipType(membershipType)">
              <a
                :href="'mailto:' + client.email + '?subject=Venteliste%20til%20' + encodeURIComponent(membershipType.name)"
                class="md-primary">{{ $t('global.waitingList') }}</a>
            </div>


            <div v-else-if="!customerHasMembershipType(membershipType)">

              <button @click="buyMembershipType(membershipType)" class="btn btn-primary">
                {{ $t('global.buy') }}
              </button>

            </div>

            <div class="space4"></div>
          </div>
        </div>
        <div class="space4"></div>
      </li>

      <li v-for="classPassType in filteredClassPassTypes"
          class="class-pass-type theme--frame-box"
          :key="classPassType.id">
        <div class="flex__grid--thirds align--top">
          <div class="flex__1-3--margin">
            <img class="width--100" :src="Imgix(classPassType.image.filename, {w:640,h:640,fit: 'crop'})" alt=""
                 v-if="classPassType.image">
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">
            <h3>{{ classPassType.name }}</h3>
            <nl2br tag="p" :text="classPassType.description"></nl2br>
          </div>
          <div class="space4"></div>
          <div class="flex__1-3--margin">


            <p class="bold upper">{{ classPassType.price | currency_dkk }} kr</p>
            <div class="space2"></div>

            <div class="list__space--between">

              <button @click="buyClassPassType(classPassType)" class="btn btn-primary"
                      v-if="canBuyClassPassType(classPassType, customerClassPasses)">
                {{ $t('global.buy') }}
              </button>
              <div v-if="limitedNumberPerCustomerUsedUp(classPassType, customerClassPasses)">{{
                $t('prices.youCantBuyMoreClassPasses') }}
              </div>

            </div>
          </div>
        </div>
        <div class="space4"></div>
      </li>

    </ul>
    <div class="space8"></div>


    <md-dialog-alert :md-content="alertDialogText"
                     :md-confirm-text="alertDialogConfirmText"
                     :md-active.sync="showAlertDialog"
    />

  </div>
</template>

<script>
  import YogoApi from '../gateways/YogoApi'
  import LoadingSpinner from './LoadingSpinner.vue'
  import {mapGetters} from 'vuex'
  import _keyBy from 'lodash/keyBy'
  import _map from 'lodash/map'
  import _isObject from 'lodash/isObject'
  import _each from 'lodash/each'
  import _find from 'lodash/find'
  import _filter from 'lodash/filter'
  import _includes from 'lodash/includes'
  import _sortBy from 'lodash/sortBy';
  import _intersectionBy from 'lodash/intersectionBy';

  import Imgix from "../services/Imgix"

  export default {
    components: {
      loadingspinner: LoadingSpinner,
    },
    mixins: [Imgix],
    data() {
      return {
        prices: 'Priser',
        buyLabel: 'Køb',
        membershipTypes: [],
        classPassTypes: [],

        customerMembershipTypeIds: [],
        customerClassPassTypeIds: [],

        customerMemberships: [],
        customerClassPasses: [],

        loading: false,
        chooseLabel: 'Vælg',
        paymentOptionsLabel: 'Vælg betalingsperiode',
        selectedPaymentOption: {},
        price: 'Pris',
        monthlyPrice: 'Pris pr måned',

        priceGroups: [],
        selectedPriceGroup: null,

        showAlertDialog: false,
        alertDialogText: '',
        alertDialogConfirmText: '',

        giftCardPricesImage: null,
      }
    },
    computed: {
      ...mapGetters([
        'userIsLoggedIn',
        'userName',
        'profileImageFilename',
        'stateReady',
        'user',
        'client',
        'mobileAppMode',
      ]),
      selectedPriceGroupName() {
        if (!this.selectedPriceGroup || !this.priceGroups.length) return ''
        const priceGroup = _find(this.priceGroups, priceGroup => priceGroup.id === this.selectedPriceGroup)
        return priceGroup.name
      },
      visiblePriceGroups() {
        return _filter(this.priceGroups, priceGroup => priceGroup.show_in_default_price_list)
      },
      filteredMembershipTypes() {
        if (!this.priceGroups.length) return this.membershipTypes
        if (!this.selectedPriceGroup) return []
        return _filter(this.membershipTypes, membershipType => _includes(_map(membershipType.price_groups, 'id'), this.selectedPriceGroup))
      },
      filteredClassPassTypes() {
        console.log("this.priceGroups.length = ", this.priceGroups.length)
        if (!this.priceGroups.length) return this.classPassTypes
        console.log("this.selectedPriceGroup = ", this.selectedPriceGroup)
        if (!this.selectedPriceGroup) return []
        console.log("this.selectedPriceGroup = ", this.selectedPriceGroup)
        console.log("fitered data = ", _filter(this.classPassTypes, classPassType => _includes(_map(classPassType.price_groups, 'id'), this.selectedPriceGroup)))
        return _filter(this.classPassTypes, classPassType => _includes(_map(classPassType.price_groups, 'id'), this.selectedPriceGroup))
      },
      showGiftCard() {
        const showGiftCardInPriceGroups = JSON.parse(this.client.settings.gift_card_show_in_price_groups);
        return this.client.settings.gift_card_show_in_prices
            && (
                !this.priceGroups.length
                ||
                _includes(showGiftCardInPriceGroups, this.selectedPriceGroup)
            );
      },
    },
    mounted: function () {
      if (this.stateReady) this.fetchMembershipsAndClassPasses()
    },
    watch: {
      async stateReady(newReadyState) {
        if (newReadyState) this.fetchMembershipsAndClassPasses()
      },
    },
    methods: {
      async fetchMembershipsAndClassPasses() {

        this.loading = true

        let membershipTypes, classPassTypes, user;

        [membershipTypes, classPassTypes, user, this.priceGroups] = await Promise.all([
          YogoApi.get('/membership-types' +
            '?populate[]=image' +
            '&populate[]=payment_options' +
            '&populate[]=price_groups' +
            '&populate[]=membershipCount' +
            '&populate[]=active_campaign' +
            '&populate[]=userIsEligibleForCampaign' +
            '&populate[]=payment_options.nameThatUserSees' +
            '&populate[]=payment_options.priceTextThatUserSees',
          ),
          YogoApi.get('/class-pass-types' +
            '?populate[]=image' +
            '&populate[]=price_groups',
          ),
          YogoApi.get('/users/' + this.user.id +
            '?populate[]=memberships' +
            '&populate[]=class_passes',
          ),
          YogoApi.get('/price-groups' +
            '?populate[]=membership_types' +
            '&populate[]=class_pass_types',
          ),
        ])

        console.log("membershipTypes = ", membershipTypes)
        console.log("classPassTypes = ", classPassTypes)

        this.membershipTypes = _keyBy(membershipTypes, 'id')

        this.classPassTypes = _keyBy(classPassTypes, 'id')

        console.log("membershipTypes = ", this.membershipTypes)
        console.log("classPassTypes = ", this.classPassTypes)

        this.customerMemberships = user.memberships
        this.customerClassPasses = user.class_passes

        this.customerMembershipTypeIds = user.memberships.filter(
          membership => membership.status !== 'ended',
        ).map(
          membership => parseInt(_isObject(membership.membership_type) ? membership.membership_type.id : membership.membership_type),
        )
        this.customerClassPassTypeIds = _map(user.class_passes, (class_pass) => {
          return parseInt(_isObject(class_pass.class_pass_type) ? class_pass.class_pass_type.id : class_pass.class_pass_type)
        })

        this.membershipTypes = _filter(
          this.membershipTypes,
          mt => _find(mt.payment_options, 'for_sale'),
        )

        _each(this.membershipTypes, (membershipType) => {
          membershipType.payment_options = _filter(membershipType.payment_options, paymentOption => paymentOption.for_sale)
          membershipType.payment_options = _sortBy(membershipType.payment_options, 'number_of_months_payment_covers')
          this.selectedPaymentOption[membershipType.id] = membershipType.payment_options[0].id
        })

        this.selectedPriceGroup = null;

        console.log('this.$route.params:', this.$route.params);

        if (this.visiblePriceGroups.length > 1) {
          this.selectedPriceGroup = null;

          if (this.$route.params && this.$route.params.desiredItem) {

            const priceGroupsWithDesiredItem = await YogoApi.get('/price-groups?desiredItem=' + this.$route.params.desiredItem);
            console.log('priceGroupsWithDesiredItem', priceGroupsWithDesiredItem);

            if (priceGroupsWithDesiredItem.length) {
              const matchingPriceGroups = _intersectionBy(
                  this.visiblePriceGroups,
                  priceGroupsWithDesiredItem,
                  'id'
              )
              if (matchingPriceGroups.length) {
                this.selectedPriceGroup = matchingPriceGroups[0].id;
              }
            }

          }
        }
        if (!this.selectedPriceGroup && this.visiblePriceGroups.length) {
          this.selectedPriceGroup = this.visiblePriceGroups[0].id
        }


        if (this.client.settings.gift_card_show_in_prices && this.client.settings.gift_card_prices_image_id) {
          this.giftCardPricesImage = await YogoApi.get('/images/' + this.client.settings.gift_card_prices_image_id)
        }

        this.loading = false

      },

      async buyMembershipType(membershipType) {
        const paymentOption = _find(membershipType.payment_options, ['id', this.selectedPaymentOption[membershipType.id]])

        this.addToCart({
          item_type: 'membership_type',
          item_id: membershipType.id,
          user: this.user.id,
          payment_option: paymentOption.id,
          membership_campaign: (parseInt(paymentOption.number_of_months_payment_covers) === 1 &&
            membershipType.userIsEligibleForCampaign &&
            membershipType.active_campaign_id) ?
            membershipType.active_campaign_id :
            undefined,
        })
      },

      canBuyClassPassType(classPassType, existingClassPasses) {
        return !this.limitedNumberPerCustomerUsedUp(classPassType, existingClassPasses)
      },

      limitedNumberPerCustomerUsedUp(classPassType, existingClassPasses) {
        if (!classPassType.limited_number_per_customer) return false
        const numberOfExistingClassPassesWithClassPassType = _filter(existingClassPasses, classPass => classPass.class_pass_type == classPassType.id).length

        return numberOfExistingClassPassesWithClassPassType >= classPassType.max_number_per_customer
      },

      async buyClassPassType(classPassType) {
        if (parseInt(classPassType.price) === 0) {
          this.loading = true
          await YogoApi.post('/class-passes', {
            user: this.user.id,
            class_pass_type: classPassType.id,
          })
          const user = await YogoApi.get('/users/' + this.user.id +
            '?populate[]=class_passes',
          )
          this.customerClassPasses = user.class_passes
          this.loading = false
          this.alertDialogText = this.$t('global.isCreatedOnProfile', {
            classPassTypeName: classPassType.name,
          })
          this.alertDialogConfirmText = 'Ok'
          this.showAlertDialog = true

          return
        }

        this.addToCart({
          item_type: 'class_pass_type',
          item_id: classPassType.id,
          user: this.user.id,
        })
      },

      async addToCart(cartItem) {

        this.loading = true

        await YogoApi.post('/cart-items', cartItem)
        await this.$store.dispatch('updateUser')

        this.$router.push({name: 'Checkout'})
        this.loading = false

      },
      customerHasMembershipType(membershipType) {
        return this.customerMembershipTypeIds.indexOf(parseInt(membershipType.id)) > -1
      },
      getCustomerMembershipsForMembershipType(membershipType) {
        return _filter(this.customerMemberships, membership => membership.membership_type === membershipType.id)
      },
      customerHasClassPassType(classPassType) {
        return this.customerClassPassTypeIds.indexOf(parseInt(classPassType.id)) > -1
      },
      getSelectedMembershipTypePaymentOption(membershipType) {
        const paymentOptionId = this.selectedPaymentOption[membershipType.id]
        return _find(membershipType.payment_options, paymentOption => paymentOption.id === paymentOptionId)
      },
      async buyGiftCard() {
        this.$router.push({name: 'BuyGiftCard'});
      },
    },
  }
</script>

<style lang="stylus">

  .modal
    background: white !important;
    padding 20px

  .md-select-menu
    background white
    z-index: 600


</style>
