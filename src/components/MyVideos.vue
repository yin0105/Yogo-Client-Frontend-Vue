<template>
  <div class="my-videos">
    <div class="theme--frame-box">

      <div v-if="client.extended_video_enabled">

        <h2>
          {{ client.settings.customer_profile_video_widget_title }}
        </h2>

        <router-link :to="{ name: 'VideoExtended' }">
          <button class="my-4 inline-block btn btn-primary">
            {{ $t('global.ShowVideos') }}
          </button>
        </router-link>

      </div>

      <div v-else>

        <div class="flex space-between pointer" @click.prevent="toggleShowVideos">
          <h2>
            {{ client.settings.customer_profile_video_widget_title }}
          </h2>

          <div class="flex items-center pointer ml2">
            <span :class="{ 'rotate': showVideos }" class="block icon-arrowdown"></span>
          </div>
        </div>

        <transition name="slide-fade" mode="out-in" v-if="showVideos">

          <div v-if="noVideos" class="my-4">
            {{ $t('profile.noVideos') }}
          </div>

          <md-field v-if="selectedVideoGroupId">
            <md-select v-model="selectedVideoGroupId">
              <md-option
                v-for="(videoGroup) in videoGroups"
                :value="videoGroup.id"
                :key="'videoGroup_' + videoGroup.id"
              >
                {{ videoGroup.name }}
              </md-option>
            </md-select>
          </md-field>
        </transition>

        <transition name="slide-fade" mode="out-in" v-if="showVideos">

          <div v-if="activeVideoGroup" :key="updateVideoComponent">
            <div class="flex flex-wrap cards-container">
              <div v-for="(video, videoIdx) in activeVideoGroup.videos" class="video-card" :key="'video_' + video.id">
                <div class="video-thumb-container" :ref="'videoContainer_' + videoIdx">

                  <div
                    class="video-thumb thumbnail"
                    :ref="'videoThumbnail_' + videoIdx"
                    :style="{'background-image':'url(\'' + getThumbnailUrl(video, 800) + '\')', 'padding-bottom': video.video_provider_data.height / video.video_provider_data.width * 100 + '%'}"
                    @click="playVideo(activeVideoGroup, videoIdx)"
                  >

                  </div>
                  <div
                    class="video-duration"
                    :ref="'videoDuration_' + videoIdx"
                  >
                    {{ formatVideoDuration(video.video_provider_data.duration ) }}
                  </div>
                </div>
                <div class="p-4">
                  <div class="video-title mb-2 bold text-gray">
                    {{ video.video_provider_data.name }}
                  </div>
                  <div class="text-black text-sm leading-normal">
                    <nl2br
                    tag="div"
                    className="video-description"
                    v-if="activeVideoGroup.show_video_descriptions && video.video_provider_data.description"
                    :text="video.has_long_description && !video.show_full_description ? video.description_preview : video.video_provider_data.description"
                    >
                    </nl2br>
                    <a
                      class="video-description-more-switch mt-2"
                      href="#"
                      @click.prevent="switchShowFullVideoDescription(video)"
                      v-if="activeVideoGroup.show_video_descriptions && video.has_long_description"
                    >
                      {{ video.show_full_description ? $t('global.less') : $t('global.more') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </transition>
      </div>

    </div>
  </div>
</template>

<script>

  import _flatten from 'lodash/flatten'
  import _map from 'lodash/map'
  import _sortBy from 'lodash/sortBy'
  import _each from 'lodash/each'
  import _find from 'lodash/find'
  import _padStart from 'lodash/padStart'

  import VimeoPlayer from '@vimeo/player'
  import { mapGetters } from 'vuex';

  export default {
    data() {
      return {
        vimeoPlayers: {},
        selectedVideoGroupId: null,
        updateVideoComponent: 0,
        videoExtended: true,
        showVideos: false,
      }
    },
    mounted() {
      this.selectedVideoGroupId = this.selectedVideoGroupId || (this.videoGroups.length ? this.videoGroups[0].id : null);
    },
    props: ['videoGroups'],
    computed: {
      ...mapGetters([
          'client',
          'user'
      ]),
      noVideos() {
        return !_flatten(_map(this.videoGroups, 'videos')).length
      },
      activeVideoGroup() {
        const video = _find(this.videoGroups, {id: this.selectedVideoGroupId})
        return video ? video : this.videoGroups[0]
      },

    },
    beforeDestroy() {
      this.destroyAllPlayers()
    },
    watch: {
      selectedVideoGroupId() {
        this.destroyAllPlayers()
        this.updateVideoComponent++
      }
    },
    methods: {

      toggleShowVideos() {
        // this.$set(this.showVideos)
        this.showVideos = !this.showVideos
      },


      destroyAllPlayers() {
        _each(this.vimeoPlayers, (player, key) => {
          player.destroy()
          delete this.vimeoPlayers[key]
        })
      },
      getThumbnailUrl(video, minWidth) {
        const sortedSizes = _sortBy(video.video_provider_data.pictures.sizes, 'width')
        let thumbnail = _find(sortedSizes, size => size.width >= minWidth)
        if (!thumbnail) {
          thumbnail = sortedSizes[sortedSizes.length - 1]
        }
        return thumbnail.link_with_play_button
      },

      formatVideoDuration(seconds) {
        return _padStart(Math.floor(seconds / 60), 2, '0') + ':' + _padStart(seconds % 60, 2, '0')
      },

      switchShowFullVideoDescription(video) {
        video.show_full_description = !video.show_full_description
        this.$forceUpdate()
      },

      async playVideo(activeVideoGroup, videoIdx) {

        const video = this.activeVideoGroup.videos[videoIdx]

        this.vimeoPlayers['player_' + videoIdx] = await new VimeoPlayer(

          this.$refs['videoContainer_' + videoIdx][0],
          {
            id: video.video_provider_id,
            width: this.$refs['videoThumbnail_' + videoIdx][0].offsetWidth,
            height: this.$refs['videoThumbnail_' + videoIdx][0].offsetHeight,
            autoplay: true,
          },
        )
        this.vimeoPlayers['player_' + videoIdx].element.style.height = this.$refs['videoThumbnail_' + videoIdx][0].offsetHeight + 'px'
        this.$refs['videoThumbnail_' + videoIdx][0].style.display = 'none'
        this.$refs['videoDuration_' + videoIdx][0].style.display = 'none'
        //this.$refs['videoGroupName_' + videoIdx][0].style.display = 'none'
      },

    },
  }
</script>


<style lang="scss" scoped>

  .video-title {
    font-size: 1.2em;
  }

  img.thumbnail {
    width: 100%;
  }

  .video-description {
    margin-top: 10px;
  }

  .cards-container {
    margin-left: -15px;
    margin-right: -15px;
  }

  .video-card {
    border-radius: 3px;
    border: 1px solid #ece8e8;
    width: 100%;
    background: #fff;
    margin: 15px;
    @media (min-width: 1024px) {
      width: calc(50% - 30px);
    }
  }

    .video-thumb-container {
      position: relative;
    }

    .video-thumb {
      background-size: cover;
      background-position: center;
      width: 100%;
      height: 0;
      cursor: pointer;
    }

    .video-group-name {
      background: rgba(0,0,0,.5);
      position: absolute;
      top: 15px;
      left: 15px;
      color: #fff;
      padding: 3px 5px;
      border-radius: 2px;
      font-size: .8em;
    }

    .video-duration {
      background: rgba(0,0,0,.5);
      position: absolute;
      bottom: 15px;
      right: 15px;
      color: #fff;
      padding: 3px 5px;
      border-radius: 2px;
      font-size: .8em;
    }

    .video-description-more-switch {
      display: block;
      text-align: right;
    }

    .slide-fade-enter-active {
    transition: all .3s ease;
    z-index: 2;
    position: relative;
  }

  .slide-fade-leave-active {
    transition: all .2s ease;
    z-index: 2;
    position: relative;
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-30px);
    z-index: 2;
    position: relative;
  }

  .slide-fade-enter {
    opacity: 0;
    transform: translateY(-30px);
    z-index: 2;
    position: relative;
  }

</style>
