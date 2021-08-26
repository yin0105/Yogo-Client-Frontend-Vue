import Vue from 'vue';
import Router from 'vue-router';
import Init from '@/components/Init';
import MyProfile from '@/components/MyProfile';
import Events from '@/components/Events';
import Prices from '@/components/Prices';
import Schedule from '@/components/Schedule';
import SignupForClass from '@/components/SignupForClass';
import ProfileEdit from '@/components/ProfileEdit';
import Signup from '@/components/Signup';
import Login from '@/components/Login';
import LoginWithCart from '@/components/LoginWithCart';
import ResetPassword from '@/components/ResetPassword';
import ResetPasswordWithToken from '@/components/ResetPasswordWithToken';
import ConfirmEmailWithToken from '@/components/ConfirmEmailWithToken';
import Checkout from '@/components/Checkout';
import Membership from '@/components/Membership';
import StartMembershipChangeCreditCard from '@/components/StartMembershipChangeCreditCard';
import MembershipChangeCreditCardSuccess from '@/components/MembershipChangeCreditCardSuccess';

import PaymentSuccess from '@/components/PaymentSuccess';

import SystemRoute from '@/components/SystemRoute';
import VideoExtended from '@/components/VideoExtended';

import store from '@/store';
import VideoPlayer from "../components/VideoPlayer";
// LivestreamClass is lazy-loaded because the fm.liveswitch npm module is big
import LivestreamClassPreloader from '../components/LivestreamClassPreloader';
import PurchaseHistory from '../components/PurchaseHistory';
import BuyGiftCard from '../components/BuyGiftCard';

const LivestreamClass = () => import('../components/LivestreamClass');

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Init',
      component: Init,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    { path: '/min-profil', redirect: '/my-profile' },
    {
      path: '/my-profile',
      name: 'MyProfile',
      component: MyProfile,
    },
    { path: '/kurser', redirect: '/events' },
    {
      path: '/events',
      name: 'Events',
      component: Events,
    },
    { path: '/skema', redirect: '/schedule' },
    {
      path: '/schedule',
      name: 'Schedule',
      component: Schedule,
    },
    { path: '/priser', redirect: '/prices' },
    {
      path: '/prices',
      name: 'Prices',
      component: Prices,
    },
    {
      path: '/prices/show-price-group-for/:desiredItem',
      name: 'PricesWithDesiredItem',
      component: Prices,
    },
    {
      path: '/video-extended',
      name: 'VideoExtended',
      component: VideoExtended,
    },
    { path: '/medlemskab/:id', redirect: '/membership/:id' },
    {
      path: '/membership/:id',
      name: 'Membership',
      component: Membership,
    },
    {
      path: '/start-medlemskab-skift-betalingskort/:membershipId',
      redirect: '/start-change-membership-credit-card/:membershipId',
    },
    {
      path: '/start-change-membership-credit-card/:membershipId',
      name: 'StartMembershipChangeCreditCard',
      component: StartMembershipChangeCreditCard,
    },
    {
      path: '/medlemskab-skift-betalingskort-succes/:membershipId',
      name: 'MembershipChangeCreditCardSuccess',
      component: MembershipChangeCreditCardSuccess,
    },
    { path: '/rediger-profil', redirect: '/edit-profile' },
    {
      path: '/edit-profile',
      name: 'ProfileEdit',
      component: ProfileEdit,
    },
    {
      path: '/purchase-history',
      name: 'PurchaseHistory',
      component: PurchaseHistory,
    },
    { path: '/tilmeld-klasse/:classId', redirect: '/sign-up-for-class/:classId' },
    {
      path: '/sign-up-for-class/:classId',
      name: 'SignupForClass',
      component: SignupForClass,
    },
    { path: '/video-afspiller/:videoId', redirect: '/video-player/:videoId' },
    {
      path: '/video-player/:videoId',
      name: 'VideoPlayer',
      component: VideoPlayer,
      meta: {
        fullScreen: true,
      },
    },
    {
      path: '/livestream/class/:classId/preloader',
      name: 'LivestreamClassPreloader',
      component: LivestreamClassPreloader,
    },
    {
      path: '/livestream/class/:classId',
      name: 'LivestreamClass',
      component: LivestreamClass,
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: Checkout,
    },
    {
      path: '/betaling-succes/:orderId',
      name: 'PaymentSuccess',
      component: PaymentSuccess,
    },
    { path: '/tilmeld', redirect: '/signup' },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    { path: '/login-med-vare/:cartItemJson?', redirect: '/login-with-cart/:cartItemJson?' },
    {
      path: '/login-with-cart/:cartItemJson?',
      name: 'LoginWithCart',
      component: LoginWithCart,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    {
      path: '/gift',
      name: 'BuyGiftCard',
      component: BuyGiftCard,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    { path: '/nulstil-password', redirect: '/reset-password' },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    { path: '/nulstil-password/:email/:token', redirect: '/reset-password/:email/:token' },
    {
      path: '/reset-password/:email/:token',
      name: 'ResetPasswordWithToken',
      component: ResetPasswordWithToken,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    {
      // NOTICE!! If the following path changes, it should be updated in the API, controllers/Auth/password-reset-send-token
      // TODO: Better solution
      path: '/bekraeft-email/:email/:token',
      name: 'ConfirmEmailWithToken',
      component: ConfirmEmailWithToken,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },
    {
      path: '/system-route/:routeName/:routeParamsAsJson',
      name: 'SystemRoute',
      component: SystemRoute,
      meta: {
        fullScreen: true,
        requireAuth: false,
      },
    },

  ],
  base: store.routerBase,
});

router.beforeEach((to, from, next) => {

  // Is state not ready yet? Go to Init page and remember where we were going
  if (!store.state.ready && to.name !== 'Init') {
    store.commit('setRequestedRoute', to);
    return next({
      name: 'Init',
      replace: true,
    });
  }


  // So state IS ready

  // Some routes are open. In that case, carry on
  if (to.meta.requireAuth === false) {
    return next();
  }

  // So route requires login

  // Logged in?
  if (store.getters.userIsLoggedIn) {
    return next();
  }

  // Not logged in


  // Closed route and not logged in
  // Redirect to Login and remember where we were going
  store.commit('setRequestedRoute', to);
  return next({
    name: 'Login',
    replace: true,
  });
});

router.afterEach(() => {
  try {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  } catch { null; }
});

export default router;
