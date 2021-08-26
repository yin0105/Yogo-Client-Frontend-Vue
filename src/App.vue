<template>
  <!--
    In order to reflect locale change throughout all components, `locale` is
    used as a key here. `locale` can update after the app is initialized and
    in order to update strings using the `moment` filter, we'll rerender the
    complete component tree.
  -->
  <div id="app" :key="locale">
    <div class="header wrapper" v-if="!$route.meta.fullScreen && !mobileAppMode">
      <div class="tablet--hide header__logo--client ptb10">
        <router-link :to="{ name: 'MyProfile' }">
          <img :src="Imgix(client.logo.filename)"
               v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'"
               class="logo-svg">
          <div v-else-if="client && client.logo"
               :style="{'background-image' : 'url(' + Imgix(client.logo.filename, {w: 200, h:100}) + ')'}"
               class="logo-bitmap"></div>
          <div v-else-if="client" class="logo-substitute-text ptb10">{{ client.name }}</div>
        </router-link>
      </div>
      <div class="menu--desktop">
        <div class="header__logo--client">
          <router-link :to="{ name: 'MyProfile' }">
            <img :src="Imgix(client.logo.filename)"
                 v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'"
                 class="logo-svg">
            <div v-else-if="client && client.logo"
                 :style="{'background-image' : 'url(' + Imgix(client.logo.filename, {w: 200, h:100}) + ')'}"
                 class="logo-bitmap"></div>
            <span v-else-if="client" class="logo-substitute-text">{{ client.name }}</span>
          </router-link>
        </div>
        <ul>
          <li v-if="menuItemCount > 1">
            <router-link :to="{ name: 'MyProfile' }">{{ $t('global.myProfile') }}</router-link>
          </li>
          <li v-if="client.settings.frontend_show_menu_item_calendar">
            <router-link :to="{ name: 'Schedule' }">{{ $t('calendar.schedule') }}</router-link>
          </li>
          <li v-if="client.settings.frontend_show_menu_item_events">
            <router-link :to="{ name: 'Events' }">{{ $t('global.events') }}</router-link>
          </li>
          <li v-if="client.settings.frontend_show_menu_item_prices">
            <router-link :to="{ name: 'Prices' }">{{ $t('global.prices') }}</router-link>
          </li>
        </ul>


        <div class="header__content--right">

          <div class="header__cart--container" v-if="user.cart_items && user.cart_items.length">
            <router-link :to="{ name: 'Checkout' }">
              <span class="icon-shoppingcart"></span>
            </router-link>
          </div>

          <md-menu md-align-trigger class="dropdown-content">
            <div class="header__menu--user dropdown-button" md-menu-trigger>
              <p>{{ userName }}</p>
              <img :src="profileImageUrl" alt="">
              <span class="icon-arrowdown"></span>
            </div>

            <!-- Dropdown Structure -->

            <md-menu-content class="md-menu-content-big" :md-close-on-select="true">
              <md-menu-item class="btn--menu" @click="$router.push({name: 'MyProfile'})"
                            v-if="menuItemCount === 1">
                <img :src="profileImageUrl" alt=""> {{ $t('global.myProfile') }}
              </md-menu-item>
              <md-menu-item class="btn--menu" @click="gotoProfileEdit">
                <span class="icon-edit"></span> {{ $t('profile.editProfile') }}
              </md-menu-item>
              <md-menu-item class="btn--menu" @click="logout"><span class="icon-signout"></span>
                {{ $t('global.signOut') }}
              </md-menu-item>
            </md-menu-content>

          </md-menu>
        </div>

      </div>

      <!-- mobile menu -->

      <div class="menu--mobile" v-if="menuItemCount > 1"
           :class="{'item-4-disabled' : menuItemCount === 3}"
           :number="menuItemCount === 3 ? 4 : menuItemCount">
        <router-link class="item" slot="item_1" to="/min-profil"
                     v-if="client.settings.frontend_show_menu_item_calendar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="item-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ $t('global.myProfile') }}
        </router-link>
        <router-link class="item" :slot="mobileMenuSlotNameProfile" to="/skema">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="item-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ $t('calendar.schedule') }}
        </router-link>
        <router-link class="item" :slot="mobileMenuSlotNameEvents" to='/kurser'
                     v-if="client.settings.frontend_show_menu_item_events">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class="item-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ $t('global.events') }}
        </router-link>
        <router-link class="item" :slot="mobileMenuSlotNamePrices" to="/priser"
                     v-if="client.settings.frontend_show_menu_item_prices">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" class=" item-icon feather feather-info">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="8"></line>
          </svg>
          {{ $t('global.prices') }}
        </router-link>
      </div>

      <!-- mobile profile menu -->

      <div class="flex__top--right tablet--hide ptb10">

        <div class="header__cart--container mr-2" v-if="user.cart_items && user.cart_items.length">
          <router-link :to="{ name: 'Checkout' }">
            <span class="icon-shoppingcart"></span>
          </router-link>
        </div>
        <md-menu md-align-trigger class="dropdown-content">
          <div class="header__menu--user dropdown-button" md-menu-trigger>
            <p>{{ userName }}</p>
            <img :src="profileImageUrl" alt="">
            <span class="icon-arrowdown"></span>
          </div>

          <!-- Dropdown Structure -->

          <md-menu-content>
            <md-menu-item class="btn--menu" v-if="menuItemCount === 1">
              <router-link :to="{name: 'MyProfile'}">
                <img :src="profileImageUrl" alt=""> {{ $t('global.myProfile') }}
              </router-link>
            </md-menu-item>
            <md-menu-item class="btn--menu">
              <router-link :to="{ name: 'ProfileEdit' }"><span class="icon-edit"></span> {{
                  $t('profile.editProfile')
                }}
              </router-link>
            </md-menu-item>
            <md-menu-item class="btn--menu"><a @click="logout"><span class="icon-signout"></span>
              {{ $t('global.signOut') }}</a>
            </md-menu-item>
          </md-menu-content>

        </md-menu>
      </div>

      <!-- end mobile profile menu -->

      <div class="space8"></div>

    </div>


    <router-view></router-view>

    <a class="close-frontend-button" v-if="isRunningInIframe" @click="closeOwnPopup">
      <span class="icon-close"></span>
    </a>

  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import YogoApi from './gateways/YogoApi';
import ClientSite from './gateways/ClientSite';

import Imgix from '@/services/Imgix';
import GoogleTagManagerMixin from './components/GoogleTagManagerMixin';

export default {
  mixins: [Imgix, GoogleTagManagerMixin],
  async created() {
    await this.$store.dispatch('init');

    const vueMaterialCssTag = document.createElement('link');
    vueMaterialCssTag.rel = 'stylesheet';
    vueMaterialCssTag.setAttribute('type', 'text/css');
    vueMaterialCssTag.href = this.envConfig.vueMaterialThemeCssServer +
        '/vue-material-theme-css-primarycolor-' + this.client.settings.theme_primary_color.substr(1) + '-accentcolor-' + this.client.settings.theme_primary_color.substr(
            1) + '.css';
    document.head.appendChild(vueMaterialCssTag);

    let bodyFontFamily;

    switch (this.client.settings.theme_font_type) {
      case 'google_web_font': {
        const googleFontHeadTag = document.createElement('link');
        googleFontHeadTag.setAttribute('rel', 'stylesheet');
        googleFontHeadTag.setAttribute('type', 'text/css');
        googleFontHeadTag.setAttribute('href',
            'https://fonts.googleapis.com/css?family=' + this.client.settings.theme_google_web_font.replace(
            / /g,
            '+'));
        document.head.appendChild(googleFontHeadTag);
        bodyFontFamily = "'" + this.client.settings.theme_google_web_font + "'";
        break;
      }
      case 'custom': {
        const customFontCssTag = document.createElement('link');
        customFontCssTag.setAttribute('rel', 'stylesheet');
        customFontCssTag.setAttribute('type', 'text/css');
        customFontCssTag.setAttribute('href',
            this.client.settings.theme_custom_font_stylesheet_url);
        document.head.appendChild(customFontCssTag);
        bodyFontFamily = this.client.settings.theme_font_family;
        break;
      }
    }
    const themeFrameBoxBoxShadow = this.client.settings.theme === 'framed' ? '1px 2px 10px -2px #979797' : 'none';
    const themeFrameBoxPadding =
        this.client.settings.theme === 'framed' ||
        this.client.settings.theme_background_color.toLowerCase() !== '#ffffff' ?
            '20px' : '20px 0';

    let yogoCss = `

        body {
          font-family: ${bodyFontFamily}, Arial, sans-serif;
        }
        #app {
          /*font-family: ${this.client.settings.theme_font_family}, "Open Sans", Arial, sans-serif;*/
          background-color: ${this.client.settings.theme_background_color};
        }
        .buorg {
          font-family: ${this.client.settings.theme_font_family} !important;
        }
        .buorg div a,
        .buorg div avisite {
          background: ${this.client.settings.theme_primary_color} !important;
        }
        .primary-color-border {
          border-color: ${this.client.settings.theme_primary_color};
          color: ${this.client.settings.theme_primary_color};
        }
        .primary-color-border:hover {
          background: ${this.client.settings.theme_primary_color};
        }
        .theme--frame-box {
          box-shadow: ${themeFrameBoxBoxShadow};
          background: white;
          padding: 20px;
          border-radius: 3px;
        }
        @media (min-width: 768px) {
          .theme--frame-box {
            padding: ${themeFrameBoxPadding};
          }
        }
        a {
          color: ${this.client.settings.theme_primary_color};
        }
        .classpass__clip--inner {
          background: ${this.client.settings.theme_primary_color};
        }
        .square--blue:before {
          background: ${this.client.settings.theme_primary_color};
        }
        .md-menu-content-container .md-list {
          font-family: ${this.client.settings.theme_font_family}, Arial, sans-serif;
        }

        a.router-link-active {
          color: ${this.client.settings.theme_primary_color} !important;
          opacity: 1;
        }

      `;


    const yogoCssTag = document.createElement('style');
    yogoCssTag.appendChild(document.createTextNode(yogoCss));
    document.head.appendChild(yogoCssTag);

    const rootStyleObject = document.documentElement.style;
    rootStyleObject.setProperty('--md-theme-default-primary',
        this.client.settings.theme_primary_color);
    rootStyleObject.setProperty('--md-theme-default-accent',
        this.client.settings.theme_primary_color);

    this.$material.locale.firstDayOfAWeek = 1;
    document.title = this.client.name;

    this.GTMInitTag();
  },
  mounted: function () {

  },
  computed: {
    ...mapGetters([
      'userIsLoggedIn',
      'userName',
      'profileImageFilename',
      'client',
      'clientLogoFilename',
      'user',
      'envConfig',
      'mobileAppMode',
    ]),
    ...mapGetters('appSettings', [
      'locale',
    ]),
    profileImageUrl() {
      return this.user && this.user.image ? this.Imgix(this.profileImageFilename,
          { w: 80, h: 80, fit: 'crop' }) : require('./assets/img/account.svg');
    },
    isRunningInIframe() {
      return ClientSite.isRunningInIframe();
    },
    menuItemCount() {
      return 1 + (this.client.settings.frontend_show_menu_item_calendar ? 1 : 0) + (this.client.settings.frontend_show_menu_item_prices ? 1 : 0) + (this.client.settings.frontend_show_menu_item_events ? 1 : 0);
    },
    mobileMenuSlotNameProfile() {
      return this.client.settings.frontend_show_menu_item_calendar ? 'item_2' : 'item_1';
    },
    mobileMenuSlotNamePrices() {
      return this.client.settings.frontend_show_menu_item_calendar ? 'item_3' : 'item_2';
    },
    mobileMenuSlotNameEvents() {
      const index = 2 + (this.client.settings.frontend_show_menu_item_calendar ? 1 : 0) + (this.client.settings.frontend_show_menu_item_prices ? 1 : 0);
      return 'item_' + index;
    },
  },
  methods: {
    logout() {
      YogoApi.post('/logout')
          .then(() => {
            this.$store.dispatch('logout');
          })
          .catch((err) => {
            console.log('Error logging out: ', err);
          });
    },
    gotoProfileEdit() {
      this.$router.push({ name: 'ProfileEdit' });
    },
    closeOwnPopup: ClientSite.closeOwnPopup,
  },
};
</script>

<style lang="stylus">

#app
  /*font-family "Gotham SSm A", "Gotham SSm B", 'Open Sans', sans-serif*/
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  position relative
  z-index 0

.menu--desktop
  #dropdown1
    right 0

.buorg /* Browser update notification */
  border-bottom 1px solid none !important
  background-color #fff !important
  /*font-family "Gotham SSm A", "Gotham SSm B", sans-serif !important*/
  border-bottom none !important

.buorg div a,
.buorg div avisite
  color #fff !important
  text-transform uppercase
  padding 5px 15px !important
  font-size 14px !important
  border-radius 2px !important

/*background #12169c !important*/

.menu--mobile.item-4-disabled .oy-menu-item_4
  opacity 0 !important


</style>
