<template>
  <div ref="videoContainer" class="video-player">
    &nbsp;
  </div>
</template>

<script>

import YogoApi from '../gateways/YogoApi';
import VimeoPlayer from '@vimeo/player';

export default {
  data() {
    return {
      video: null,
      vimeoPlayer: null,
    };
  },
  mounted() {
    this.playVideo();
  },

  methods: {
    async playVideo() {
      const videoId = this.$route.params.videoId;

      this.video = await YogoApi.get('/videos/' + videoId);

      if (!this.video.video_provider_id) {
        alert(this.$t('video.youDontHaveAccessToThisVideo'));
        this.$router.push({
          name: 'Prices',
        });
        return;
      }

      const videoContainerWidth = this.$refs.videoContainer.offsetWidth;
      const aspectRatio = this.video.video_provider_data.width / this.video.video_provider_data.height;
      this.vimeoPlayer = await new VimeoPlayer(
          this.$refs.videoContainer,
          {
            id: this.video.video_provider_id,
            width: videoContainerWidth,
            height: videoContainerWidth / aspectRatio,
            autoplay: true,
          },
      );

      // Ugly hack to circumvent Vue Material css
      this.vimeoPlayer.element.style.height = videoContainerWidth / aspectRatio + 'px';

    },
  },
};

</script>
