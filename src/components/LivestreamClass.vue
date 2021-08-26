<template>
  <div class="wrapper">
    <div class="theme--frame-box">
      <div v-if="loading">
        <loading-spinner v-if="loading"></loading-spinner>
        <div v-if="showSafariPermissionBugMessage">
          <div>
            {{ $t('livestream.safariPermissionBugMessage') }}
          </div>
          <div class="space8"></div>
          <a class="btn btn-primary" @click.prevent="reload">{{ $t('global.tryAgain') }}</a>
        </div>
      </div>

      <div v-else>

        <h1 class="text-center pt-4 pb-2">
          Livestream - {{ classObj.class_type.name }}
        </h1>

        <div class="flex justify-center items-center">
          <p class="bold text-center">
            {{ dbDateToHumanDate(classObj.date) }} kl.
            {{ classObj.start_time.substr(0, 5) }}
          </p>
          <div @click="openTipsModal()">
            <InfoIcon class="mx-2 cursor-pointer"></InfoIcon>
          </div>
        </div>

        <div class="flex flex-col md:flex-row justify-center my-4">
          <div class="chat-height order-2 md:order-1 md:w-4/12 shadow">
            <!--
             Hacks in CometChat UI:
             - Sound muted
             - User action messages hidden
             - Stickers button hidden
             - Video/Audio/file/poll, etc buttons hidden
             -->
            <CometChatMessages
                v-if="showChat"
                :logged-in-user="cometChatLoggedInUser"
                :item="cometChatItem"
                :group-messages="[]"
                type="group"
                :sidebar="false"
            >
            </CometChatMessages>
          </div>

          <div class="flex relative justify-center items-center order-1 md:order-2 md:w-8/12">

            <div v-if="timeInformationText" class="absolute z-10 align-center">
              <h2 class="time-information flex justify-center mb-4">
                {{ timeInformationText }}
              </h2>
              <div
                  class="btn btn-primary bg-white inline-block"
                  v-if="showConnectToLivestreamButton"
                  @click.prevent="connectToLivestreamButtonClick"
              >
                {{ $t('global.ConnectToLivestream') }}
              </div>
            </div>


            <div class="livestream-container" ref="livestreamContainer"
                 :class="{standby: !connection}">
              <div class="video-fullscreen px-2 py-2 rounded-md" @click.prevent="goFullScreen"
                   v-if="connection">
                <FullscreenIcon/>
              </div>
            </div>
            <div v-if="showReconnectingMessage" class="reconnect-overlay">
              <div>{{ $t('livestream.NetworkError') }}</div>
              <button
                  type="button"
                  class="btn btn-secondary"
                  @click="reload">
                {{ $t('livestream.ReloadPage') }}
              </button>
            </div>
            <div v-if="showRegistrationError" class="reconnect-overlay">
              <div>{{ registrationErrorText }}</div>
              <button
                  type="button"
                  class="btn btn-secondary"
                  @click="$router.push({name: 'MyProfile'})">
                {{ $t('global.showMyProfile') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal v-show="tipsModal" @close="tipsModal = false">
      <template v-slot:header>
        <h3 class="mb-5 font-bold">
          {{ $t('global.LivestreamTipsTitle') }}
        </h3>
      </template>
      <template v-slot:body>
        {{ $t('global.LivestreamTipsInfo') }}
      </template>
      <template v-slot:footer>
        <button
            type="button"
            class="btn btn-secondary"
            @click="tipsModal = false"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

  </div>
</template>

<script>

import LoadingSpinner from "./LoadingSpinner";
import YogoApi from '@/gateways/YogoApi';
import Imgix from '../services/Imgix';
import { mapGetters } from 'vuex';

import fmLiveswitch from 'fm.liveswitch';
import dateTimeFunctions from '../mixins/dateTimeFunctions';

import Modal from '../components/Modal';
import InfoIcon from '../graphics/icons/InfoIcon';
import _padStart from 'lodash/padStart';
import _includes from 'lodash/includes';
import FullscreenIcon from '../graphics/icons/FullscreenIcon';
import moment from 'moment-timezone';

import { CometChat } from '@cometchat-pro/chat';
import { CometChatMessages } from '../cometchat-pro-vue-chat-ui-kit';

export default {
  components: {
    CometChatMessages,
    FullscreenIcon,
    LoadingSpinner,
    Modal,
    InfoIcon,
  },
  mixins: [dateTimeFunctions, Imgix],
  data() {
    return {
      loading: true,
      classObj: null,
      applicationId: null,
      gatewayURL: null,
      liveswitchRegisterClientToken: '',
      liveswitchClient: null,
      layoutManager: null,
      remoteMedia: null,
      channel: null,
      connection: null,
      connectionState: 0,
      reconnectTimeout: null,
      showReconnectingMessage: false,
      tipsModal: false,
      audioStream: null,
      videoStream: null,

      showConnectToLivestreamButton: false,
      livestreamIsRunning: false,
      lastLivestreamRunningNotificationTimestamp: 0,
      tickInterval: null,
      timeInformationText: '',

      // Handle Safari permissions bug
      localMedia: null,
      showSafariPermissionBugMessage: false,
      remoteConnectionInfo: null,

      // CometChat
      showChat: false,
      cometChatLoggedInUser: null,
      cometChatItem: null,

      // Registration error
      showRegistrationError: false,
      registrationErrorText: '',
    };
  },
  computed: {
    ...mapGetters([
      'liveswitchDeviceId',
      'user',
      'client',
    ]),
    showFullscreenButton() {
      return this.connectionState === fmLiveswitch.ConnectionState.Connected;
    },
  },

  async mounted() {
    console.log('mounted');
    this.initLiveswitch();
    this.initCometChat();
    this.tickInterval = setInterval(
        this.tick,
        1000,
    );
  },

  async beforeDestroy() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.localMedia && this.localMedia.stop) {
      // localMedia is needed to work around the Safari permissions bug
      await this.localMedia.stop();
      this.localMedia.destroy();
      this.localMedia = null;
    }
    if (this.remoteMedia && this.remoteMedia.stop) {
      await this.remoteMedia.stop();
      this.remoteMedia.destroy();
      this.remoteMedia = null;
    }
    if (this.channel) {
      this.channel.removeOnMessage(this.receivedChannelMessage);
      await this.channel.closeAll();
      await this.channel.leave();
    }
    if (this.liveswitchClient) {
      this.liveswitchClient.removeOnStateChange(this.liveswitchClientStateChange);
      console.log('unregistering client');
      await this.liveswitchClient.unregister();
      console.log('unregistered client');
    }
  },

  methods: {

    async initCometChat() {
      const {
        authToken,
        appId: cometChatAppId,
        region: cometChatRegion,
      } = await YogoApi.post(
          '/integrations/cometchat/init-class-livestream-chat',
          { class: this.$route.params.classId },
      );
      const appSetting = new CometChat.AppSettingsBuilder()
          .subscribePresenceForAllUsers()
          .setRegion(cometChatRegion)
          .build();

      CometChat.init(cometChatAppId, appSetting).then(
          () => {
            console.log('CometChat Initialization completed successfully');
            CometChat.login(authToken).then(
                (user) => {
                  console.log('CometChat Login Successful:', { user });
                  this.cometChatLoggedInUser = user;
                  CometChat.getGroup(`class-${this.$route.params.classId}`).then(
                      (group) => {
                        console.log('Group details fetched successfully:', group);
                        this.cometChatItem = group;
                        this.showChat = true;
                      },
                      (error) => {
                        console.log('Group details fetching failed with exception:', error);
                      },
                  );
                },
                (error) => {
                  console.log('CometChat Login failed with exception:', { error });
                },
            );
            // You can now call login function.
          },
          (error) => {
            console.log('Initialization failed with error:', error);
            // Check the reason for error and take appropriate action.
          },
      );
    },

    openTipsModal() {
      this.tipsModal = true;
    },

    async initLiveswitch() {
      console.log('init');
      fmLiveswitch.Log.registerProvider(new fmLiveswitch.ConsoleLogProvider(fmLiveswitch.LogLevel.Debug));

      const classId = this.$route.params.classId;

      const [
        classItem,
        { gatewayURL, applicationId },
      ] = await Promise.all([
        YogoApi.get('/classes/' + classId + '?populate[]=class_type'),
        YogoApi.get('/livestream/liveswitch-info'),
      ]);

      this.gatewayURL = gatewayURL;
      this.applicationId = applicationId;
      this.classObj = classItem;

      // Handle Safari permissions bug
      if (fmLiveswitch.Util.isSafari()) {
        this.localMedia = new fmLiveswitch.LocalMedia(true, false);
        try {
          await this.localMedia.start();
        } catch (e) {
          // Assuming the user did not allow access to the microphone
          this.showSafariPermissionBugMessage = true;
          return;
        }
        if (fmLiveswitch.Util.isiOS()) {
          // Safari iOS requires local media access to play audio
          // Audio will not be sent to remote clients but muting the mic as a precautionary measure
          this.localMedia.setAudioMuted(true);
        } else {
          // Safari (not iOS) requires to start then stop the local media to play audio
          await this.localMedia.stop();
          this.localMedia.destroy();
          this.localMedia = null;
        }
      }

      this.joinChannel();
    },

    async setupLiveswitchClient() {
      if (this.liveswitchClient) {
        try {
          this.liveswitchClient.removeOnStateChange(this.liveswitchClientStateChange);
          await this.liveswitchClient.closeAll();
          this.liveswitchClient.leave();
        } catch (e) {
          null;
        }
      }

      this.liveswitchClient = new fmLiveswitch.Client(
          this.gatewayURL,
          this.applicationId,
          'user-' + this.user.id,
          this.liveswitchDeviceId,
      );

      this.liveswitchClient.addOnStateChange(this.liveswitchClientStateChange);
    },

    async joinChannel() {

      console.log('joinChannel');

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      await this.setupLiveswitchClient();

      try {

        const registerResult = await YogoApi.post(
            '/livestream/get-register-client-for-class-auth-token',
            {
              classId: this.classObj.id,
              deviceId: this.liveswitchDeviceId,
              clientId: this.liveswitchClient.getId(),
            },
            {
              headers: {
                'X-Yogo-Client-Accepts-Extended-Error-Format': 1,
              },
            },
        );

        if (registerResult.error) {
          this.registrationErrorText = registerResult.error.localized_title;
          this.showRegistrationError = true;
          this.showReconnectingMessage = false;
          clearInterval(this.tickInterval);
          this.timeInformationText = '';
          this.loading = false;
          return;
        }

        const { token } = registerResult;

        console.log(this.classObj, token, this.applicationId);

        this.liveswitchRegisterClientToken = token;

        this.loading = false;

        if (this.channel) {
          this.channel.removeOnMessage(this.receivedChannelMessage);
          await this.channel.closeAll();
          this.channel.leave();
        }
        const registerResponse = await this.liveswitchClient.register(this.liveswitchRegisterClientToken);
        console.log(registerResponse);
        [this.channel] = registerResponse;
        console.log('connected to channel: ' + this.channel.getId());
        this.showReconnectingMessage = false;
        this.channel.addOnMessage(this.receivedChannelMessage);
      } catch (e) {
        console.log(e);
        console.log('registration failed, setting reconnectTimeout');
        this.reconnectTimeout = setTimeout(
            this.joinChannel,
            4000,
        );
        this.showReconnectingMessage = true;
        return;
      }

      if (!this.layoutManager) {
        this.layoutManager = new fmLiveswitch.DomLayoutManager(this.$refs.livestreamContainer);
      }
    },


    async connectToLivestreamButtonClick() {
      await this.establishConnection();
    },

    async establishConnection() {

      this.remoteMedia = new fmLiveswitch.RemoteMedia();
      this.layoutManager.setLocalView(this.remoteMedia.getView());

      const audioStream = new fmLiveswitch.AudioStream(null, this.remoteMedia);
      const videoStream = new fmLiveswitch.VideoStream(null, this.remoteMedia);

      this.connection = this.channel.createSfuDownstreamConnection(
          `class-${this.$route.params.classId}`,
          audioStream,
          videoStream,
      );

      this.connection.addOnStateChange(c => {
        this.connectionState = c.getState();
        console.log('state change:', this.connectionState);
        if (
            this.connectionState === fmLiveswitch.ConnectionState.Closing ||
            this.connectionState === fmLiveswitch.ConnectionState.Failing ||
            this.connectionState === fmLiveswitch.ConnectionState.Closed ||
            this.connectionState === fmLiveswitch.ConnectionState.Failed
        ) {
          console.log('reset layoutManager');
          this.layoutManager.reset();
        }
      });

      try {
        await this.connection.open();
        console.log('Downstream connection established');
      } catch (e) {
        console.log('Error establishing downstream connection');
        throw e;
      }
    },

    async goFullScreen() {
      const video = this.$refs.livestreamContainer.querySelector('video');
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      } else if (video.webkitSupportsFullscreen) {
        video.webkitEnterFullscreen();
      }
    },
    async liveswitchClientStateChange(client) {
      console.log('liveswitchClientStateChange, new state: ', client.getState());
      console.log(fmLiveswitch.ClientState.Unregistered);
      console.log(this.liveswitchClient.getId() === client.getId());
      if (client.getState() === fmLiveswitch.ClientState.Unregistered) {
        this.showReconnectingMessage = true;
        this.joinChannel();
      }
    },
    receivedChannelMessage(clientInfo, message) {
      if (message === 'LIVESTREAM_RUNNING') {
        console.log('LIVESTREAM_RUNNING message received');
        this.livestreamIsRunning = true;
        this.lastLivestreamRunningNotificationTimestamp = Date.now();
      }
    },
    tick() {
      console.log('tick');
      this.checkIfLivestreamHasStopped();
      this.updateTimeInformationText();
      this.updateShowConnectToLivestreamButton();
    },
    async checkIfLivestreamHasStopped() {
      if (this.lastLivestreamRunningNotificationTimestamp === 0) return; // Never started
      const now = Date.now();
      console.log('now:', now);
      console.log('this.lastLivestreamRunningNotificationTimestamp:',
          this.lastLivestreamRunningNotificationTimestamp);
      const timeSinceLastLivestreamNotification = now - this.lastLivestreamRunningNotificationTimestamp;
      console.log('timeSinceLastLivestreamNotification:', timeSinceLastLivestreamNotification);
      if (timeSinceLastLivestreamNotification > 15000) {
        console.log('Closing connection');
        this.livestreamIsRunning = false;
        if (
            this.connection
            && _includes(
            [
              fmLiveswitch.ConnectionState.Connected,
              fmLiveswitch.ConnectionState.Connecting,
            ],
            this.connection.getState(),
            )
        ) {
          await this.channel.closeAll();
        }
      }
    },
    updateTimeInformationText() {
      if (this.showReconnectingMessage) {
        this.timeInformationText = '';
        return;
      }
      if (this.livestreamIsRunning) {
        if (this.connection && this.connectionState === fmLiveswitch.ConnectionState.Connected) {
          this.timeInformationText = '';
        } else {
          this.timeInformationText = this.$t('livestream.LivestreamHasStarted');
        }
      } else {
        const classStartTimestamp = moment.tz(this.classObj.date + ' ' + this.classObj.start_time,
            'Europe/Copenhagen').format('X');
        const now = Math.round(Date.now() / 1000);
        if (now < classStartTimestamp) {
          const secondsBeforeClassStarts = classStartTimestamp - now;
          this.timeInformationText = this.$t(
              'livestream.ClassStartsInX',
              { time: this.secondsToHoursMinutesSeconds(secondsBeforeClassStarts) },
          );
        } else {
          this.timeInformationText = this.$t('livestream.WaitingForLivestream');
        }
      }
    },
    updateShowConnectToLivestreamButton() {
      console.log('showConnectToLivestreamButton:', this.showConnectToLivestreamButton);
      this.showConnectToLivestreamButton = this.liveswitchClient
          && this.liveswitchClient.getState() === fmLiveswitch.ClientState.Registered
          && this.livestreamIsRunning
          && (
              !this.connection
              || this.connectionState === fmLiveswitch.ConnectionState.Failed
              || this.connectionState === fmLiveswitch.ConnectionState.Closed
          );
    },
    secondsToHoursMinutesSeconds(seconds) {
      const displayHours = Math.floor(seconds / 3600);
      const displayMinutes = Math.floor((seconds - displayHours * 3600) / 60);
      const displaySeconds = seconds - displayHours * 3600 - displayMinutes * 60;
      return [
        _padStart(displayHours, 2, '0'),
        ':',
        _padStart(displayMinutes, 2, '0'),
        ':',
        _padStart(displaySeconds, 2, '0'),
      ].join('');
    },
    reload() {
      window.location.reload();
    },
  },
};

</script>

<style lang="scss" scoped>

.livestream-container {
  width: 100%;
  height: 240px;
  background: black;
  position: relative;
  @media (min-width: 468px) {
    height: 340px;
  }
  @media (min-width: 668px) {
    height: 400px;
  }
  @media (min-width: 768px) {
    width: 640px;
    height: 480px;
  }

  &.standby {
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-fullscreen {
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 2;
    background: white;
    cursor: pointer;
    border-radius: 3px !important;

    svg {
      display: block;
    }
  }

  .standby-picture {
    height: 50%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin: 0 auto;
    z-index: 2;
    position: absolute;
    right: 0;
    left: 0;
  }
}

.chat-height {
  height: 20rem;
  @media (min-width: 768px) {
    height: 30rem;
  }
}

.reconnect-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

</style>

<style lang="scss">
.cometchat__main__chat {
  .cometchat_chat_option {
    display: none !important;
  }

  @media (min-width: 468px) {
    .emoji-mart {
      left: 120px !important;
    }
  }

  .composer__attachment_icon {
    display: none;
  }

  div[title="Stickers"] {
    display: none;
  }

  .message__actions {
    display: none !important;
  }

}
</style>
