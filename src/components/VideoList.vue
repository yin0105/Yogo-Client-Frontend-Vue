<template>
  <div>
    <div class="flex justify-between flex-wrap py-2">
      <span class="text-gray-500 mb-2">
        {{ videos.length }} {{ $t('global.videos') }}
      </span>

      <span class="text-gray-500 relative flex items-center flex-wrap mb-2">
        <label for="sortVideosBy" class="mr-2">{{ $t('global.SortBy') }}:</label>
        <div class="flex items-center">
        <select
          class="block appearance-none w-full bg-grey-lighter border border-grey-lighter text-grey-darker py-2 px-6 pr-8 rounded"
          v-model="sortVideosBy"
          id="sortVideosBy"
        >
          <option value="favorites" v-if="user">{{ $t('global.Favorites') }}</option>
          <option value="popular">{{ $t('global.MostPopular') }}</option>
          <option value="newest">{{ $t('global.Newest') }}</option>
        </select>
          <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </span>
    </div>
    <div class="yogo-video-group-extended flex flex-wrap md:-mx-4">

      <div
          class="w-full md:w-6/12 lg:w-4/12 md:px-2 lg:px-4 flex"
          v-for="video in sortedVideos"
        :key="'video_' + video.id"
      >

        <div class="flex flex-wrap yogo-cards-container w-full flex-1">
          <div class="yogo-video-card cursor-pointer" @click="openVideoModal(video)">
            <div class="yogo-video-thumb-container">
              <div
                  class="yogo-video-thumb"
                  :style="{
                    'background-image':`url('${getThumbnailUrl(video, 600, false)}')`,
                    'padding-bottom': (video.video_provider_data.height / video.video_provider_data.width * 100) + '%'
                  }"
              >
              </div>
              <div class="absolute top-0 right-0 p-3">
                <Heart
                  :filled="video.is_user_favorite"
                  @click.prevent.stop="toggleFavorite(video)"
                >
                </Heart>
              </div>
              <div class="yogo-video-duration">
                {{ formatVideoDuration(video.video_provider_data.duration) }}
              </div>
            </div>
            <div class="p-4">
              <div class="mb-2 text-gray-600">
                <div class="flex items-end text-lg font-bold mr-2 mb-2">
                  {{ video.video_provider_data.name }}
                </div>
                <span class="text-xs mb-4">
                  {{ video.video_filter_values.map(v => v.name).join(' | ') }}
                </span>
              </div>
              <nl2br
                  tag="div"
                  className="yogo-video-description text-black text-sm leading-normal"
                  :text="(video.has_long_description ? video.description_preview : video.video_provider_data.description) || ''"
              >

              </nl2br>
            </div>
              <a
                class="flex h-full flex-col justify-end items-end px-4 pb-4"
                href="#"
                v-if="video.has_long_description"
              >
                {{ $t('global.more') }}
              </a>
          </div>
        </div>
      </div>
    </div>

    <ModalFullScreen
        v-if="modalVideo"
        v-show="showVideoModal"
        @close="closeVideoModal"
    >
      <template slot="header">

        <h2 class="text-3xl flex justify-between items-end lg:px-6 mb-2">
          {{ modalVideo.video_provider_data.name }}

          <Heart
              :filled="modalVideo.is_user_favorite"
              class="w-8 h-8"
              @click.prevent.stop="toggleFavorite(modalVideo)"
              color="black"
          >
          </Heart>
        </h2>

        <div class="yogo-video-thumb-container" ref="modalThumb"
             @click="playButtonClick(modalVideo, 'modalVideo','modalVideoThumb')">
          <div
              class="yogo-video-thumb"
              ref="modalVideoThumb"
              :style="{
                    'background-image':`url('${getThumbnailUrl(modalVideo, 1000)}')`,
                    'padding-bottom': (modalVideo.video_provider_data.height / modalVideo.video_provider_data.width * 100) + '%'
                  }"
          >
          </div>
        </div>
        <div
            class="video-wrap bg-black yogo-embed-container yogo-modal-embed-container cursor-pointer"
            ref="modalVideo">
        </div>
      </template>
      <template slot="body">
        <div class="lg:px-6 py-10 lg:py-20">
          <div class="lg:flex">
            <div class="w-full lg:w-6/12 lg:pr-10 mb-8">
              <h3 class="font-bold text-lg mb-4">
                {{ $t('global.Description') }}
              </h3>
              <p class="leading-normal">
                {{ modalVideo.video_provider_data.description }}
              </p>
              <div class="mt-8">
                <h3 class="font-bold text-lg mb-4">
                  {{ $t('global.Tags') }}:
                </h3>
                <div class="mb-4 lg:mb-10 block">
                  <div v-for="tag in modalVideo.video_tags"
                       class="yogo-filter-inner mr-2 inline-flex border-2 border-gray-400 hover:border-red-200 pointer font-semibold mb-1 text-xs px-3 py-1 rounded-full"
                       @click="applySearch({searchQuery: tag.name})"
                       :key="'tag_' + tag.id"
                  >
                    {{ tag.name }}
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full lg:w-6/12">

              <div>
                <h3 class="font-bold text-lg mb-4">
                  {{ $t('global.Categories') }}:
                </h3>
                <div class="mb-10 block">
                  <div
                      v-for="filter in modalVideoFilterValuesGroupedByFilter"
                      class="yogo-filter-inner mr-2 font-semibold mb-1 text-xm"
                      :key="'filter_' + filter.id"
                  >
                    {{ filter.name }}:
                    <span
                        class="hover:text-red-300 pointer"
                        v-for="(filterValue, idx) in filter.filterValues"
                        @click="applySearch({selectedVideoFilterValueIds: [filterValue.filterId]})"
                        :key="'filterValue_' + filterValue.filterId"
                    >
                    {{ filterValue.name }}<span
                        v-if="idx < filter.filterValues.length - 1">, </span>
                  </span>
                  </div>
                </div>
              </div>

              <div
                  v-for="(teacher, index) in modalVideo.teachers"
                  :class="teacher.teacher_description.trim().length ? 'pointer' : ''"
                  @click.prevent="toggleTeacherInfo(index)"
                  :key="'teacher_' + teacher.id"
              >
                <div class="flex mt-2 items-center mb-4">
                  <img
                      :src="profileImageSrc(teacher.image, {w: 80, h:80, fit:'crop'})"
                      alt=""
                      class="mr-4 h-10 w-10 rounded-full"
                  >
                  <p class="text-gray-600 font-bold">
                    {{ (teacher.first_name + ' ' + teacher.last_name).trim() }}
                  </p>

                  <div
                      class="flex items-center pointer ml-2"
                      v-if="teacher.teacher_description.trim().length"
                  >
                  <span
                      :class="{ 'rotate': showTeacherInfo[index] }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round"
                         class="feather feather-chevron-down"><polyline
                        points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
                  </div>
                </div>

                <transition class="mb-4" name="slide-fade" mode="out-in" appear>
                  <nl2br tag="div" :text="teacher.teacher_description" v-if="showTeacherInfo[index]"
                         className="my-2 leading-normal"></nl2br>
                </transition>

              </div>
            </div>
          </div>
          <div class="yogo-video-group-extended flex flex-wrap md:-mx-4"
               v-if="modalVideo.related_videos.length">
            <h3 class="w-full md:px-2 lg:px-4 text-lg font-bold">
              {{ $t('global.RelatedVideos') }}
            </h3>
            <div class="w-full md:w-6/12 lg:w-4/12 md:px-2 lg:px-4 cursor-pointer"
                 v-for="relatedvideo in modalVideo.related_videos"
                 @click="showSingleVideoInPopup(relatedvideo)"
                 :key="'relatedVideo_' + relatedvideo.id"
            >
              <div class="flex flex-wrap yogo-cards-container">
                <div class="yogo-video-card">
                  <div class="yogo-video-thumb-container">
                    <div
                        class="yogo-video-thumb"
                        :style="{
                    'background-image':`url('${getThumbnailUrl(relatedvideo, 600, false)}')`,
                    'padding-bottom': (relatedvideo.video_provider_data.height / relatedvideo.video_provider_data.width * 100) + '%'
                  }"
                    >
                    </div>
                    <div class="absolute top-0 right-0 p-3">
                      <Heart
                          :filled="relatedvideo.is_user_favorite"
                          @click.prevent.stop="toggleFavorite(relatedvideo)"
                      >
                      </Heart>
                    </div>
                    <div class="yogo-video-duration">
                      {{ formatVideoDuration(relatedvideo.video_provider_data.duration) }}
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="mb-2 text-gray-600">
                      <div class="flex items-end text-lg font-bold mr-2 mb-2">
                        {{ relatedvideo.video_provider_data.name }}
                      </div>
                      <span class="text-xs mb-4">
                </span>
                    </div>
                    <nl2br
                        tag="div"
                        className="yogo-video-description text-black text-sm leading-normal"
                        :text="(relatedvideo.has_long_description ? relatedvideo.description_preview : relatedvideo.video_provider_data.description) || ''"
                    >

                    </nl2br>
                  </div>
                  <a
                    class="flex h-full flex-col justify-end items-end px-4 pb-4"
                    href="#"
                    v-if="relatedvideo.has_long_description"
                  >
                    {{ $t('global.more') }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template slot="footer">


      </template>
    </ModalFullScreen>

    <md-dialog :md-active.sync="showNoAccessDialog" class="z-50">
      <md-dialog-title>{{ $t('global.noAccess') }}</md-dialog-title>
      <md-dialog-content>
        <p>
          {{ $t('global.YouDontHaveAccessToThisVideo') }}
        </p>
        <!-- md-dialog-actions are placed inside md-dialog-content here because otherwise
        the buttons are hidden in the mobile app -->
        <md-dialog-actions>
          <md-button @click="showNoAccessDialog = false">{{ $t('global.cancelButton') }}</md-button>
          <md-button md-primary @click="gotoPrices">{{ $t('global.seePrices') }}</md-button>
        </md-dialog-actions>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>


<script>


import Heart from '../graphics/Heart';
import _padStart from 'lodash/padStart';
import _sortBy from 'lodash/sortBy';
import _find from 'lodash/find';
import _each from 'lodash/each';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import _reverse from 'lodash/reverse';
import VimeoPlayer from '@vimeo/player';
import Imgix from '../services/Imgix';
import ModalFullScreen from './ModalFullScreen';
import { mapGetters } from 'vuex';
import qs from 'qs';
import YogoApi from '../gateways/YogoApi';
import VIDEO_POPULATE_FIELDS from '../constants/VIDEO_POPULATE_FIELDS';
import VideoMixins from '../mixins/VideoMixins';

export default {
  name: 'VideoList',
  components: {
    Heart,
    ModalFullScreen,
  },
  mixins: [Imgix, VideoMixins],
  props: ['videos', 'videoFilters'],
  data() {
    return {
      showVideoModal: false,
      modalVideo: null,
      showTeacherInfo: [],

      sortVideosBy: 'newest',
      sortedVideos: [],

      vimeoPlayers: [],

      showNoAccessDialog: false,
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'client',
    ]),
    modalVideoFilterValuesGroupedByFilter() {
      if (!this.modalVideo) return [];
      const groupedFilterValues = _groupBy(this.modalVideo.video_filter_values, 'video_filter_id');
      const filters = [];
      _each(groupedFilterValues, (filterValues) => {
        const filter = this.getFilterForValue(filterValues[0]);
        filter.filterValues = filterValues;
        filters.push(filter);
      });
      return filters;
    },
  },
  watch: {
    videos() {
      if (this.modalVideo) {
        this.modalVideo = _find(this.videos, { id: this.modalVideo.id });
      }
      this.calculateSortedVideos();

    },
    sortVideosBy() {
      this.calculateSortedVideos();
    }
  },
  mounted() {
    this.showTeacherInfo = [];
  },
  methods: {
    calculateSortedVideos() {
      if (!this.videos.length) {
        this.sortedVideos = [];
        return;
      }
      if (!this.sortVideosBy) {
        this.sortVideosBy = 'newest';
      }
      switch (this.sortVideosBy) {
        case 'favorites':
          this.sortedVideos = _reverse(
              _sortBy(
                  this.videos,
                  ['is_user_favorite', 'video_provider_data.stats.plays'],
              ),
          );
          return;
        case 'popular':
          this.sortedVideos = _reverse(_sortBy(this.videos, ['video_provider_data.stats.plays']));
          return;
        case 'newest':
          this.sortedVideos = _reverse(_sortBy(this.videos, ['updatedAt']));
          return;
      }
    },
    toggleTeacherInfo(index) {
      this.$set(this.showTeacherInfo, index, !this.showTeacherInfo[index]);
    },
    formatVideoDuration(seconds) {
      return _padStart(Math.floor(seconds / 60), 2, '0') + ':' + _padStart(seconds % 60, 2, '0');
    },
    getThumbnailUrl(video, minWidth, withPlaybutton) {
      minWidth = minWidth || 150;
      withPlaybutton = typeof withPlaybutton === 'undefined' ? true : withPlaybutton;
      if (withPlaybutton) {
        const sortedSizes = _sortBy(video.video_provider_data.pictures.sizes, 'width');
        let thumbnail = _find(sortedSizes, size => size.width >= minWidth);
        if (!thumbnail) {
          thumbnail = sortedSizes[sortedSizes.length - 1];
        }
        return thumbnail.link_with_play_button;
      } else {
        if (video.video_provider_data.pictures.type === 'custom') {
          const thumbnailUri = video.video_provider_data.pictures.sizes[0].link;
          const pictureId = /\d{7,}/.exec(thumbnailUri)[0];
          return `https://i.vimeocdn.com/video/${pictureId}_${minWidth}.jpg`;
        } else {
          const height = Math.round(minWidth * 0.5652);
          return `https://i.vimeocdn.com/video/default_${minWidth}x${height}?r=pad`;
        }

      }

    },
    getFilterForValue(filterValue) {
      return _find(this.videoFilters, { id: filterValue.video_filter_id });
    },
    async openVideoModal(video) {
      this.modalVideo = video;
      this.populateModalVideoFilterIds();
      this.modalVideo.video_tags = _sortBy(this.modalVideo.video_tags, 'name');
      this.showVideoModal = true;
      document.body.classList.add('overflow-hidden');
      this.$nextTick(() => {
        document.querySelector('.yogo-modal-fullscreen-scrolling-element').scrollTop = 0;
      });
      if (this.modalVideo.related_videos.length) {
        const relatedVideoQueryString = qs.stringify({
          id: _map(this.modalVideo.related_videos, 'id'),
          populate: VIDEO_POPULATE_FIELDS,
        });
        this.modalVideo.related_videos = await YogoApi.get(`/videos?${relatedVideoQueryString}`);
        this.populateDescriptionPreviews(this.modalVideo.related_videos);
      }
    },
    populateModalVideoFilterIds() {
      _each(this.modalVideo.video_filter_values, (vfv) => {
        const filter = this.getFilterForValue(vfv);
        if (filter.filter_type === 'custom') {
          vfv.filterId = `video_filter_value_${vfv.id}`;
        }
        if (filter.filter_type === 'teachers') {
          vfv.filterId = `teacher_${vfv.id}`;
        }
      });
    },
    async closeVideoModal() {
      if (this.vimeoPlayers['modalVideo']) {
        await this.vimeoPlayers['modalVideo'].destroy();
      }
      this.$refs.modalVideo.style.display = 'none';
      this.$refs.modalVideoThumb.style.display = 'block';
      this.showTeacherInfo = [];
      this.showVideoModal = false;
      document.body.classList.remove('overflow-hidden');
    },

    async playButtonClick(video, containerId, thumbnailId) {
      if (video.video_provider_id) {
        this.playVideo(video, containerId, thumbnailId);
      } else {
        this.showNoAccessDialog = true;
      }
    },

    async playVideo(video, containerId, thumbnailId) {

      const containerElement = this.$refs[containerId];
      const thumbnailElement = this.$refs[thumbnailId];
      const width = thumbnailElement.offsetWidth;
      const height = thumbnailElement.offsetHeight;
      thumbnailElement.style.display = 'none';
      containerElement.style.display = 'block';

      this.$nextTick(async () => {
        this.vimeoPlayers[containerId] = await new VimeoPlayer(
            containerElement,
            {
              id: video.video_provider_id,
              width,
              height,
              autoplay: true,
            },
        );
        this.vimeoPlayers[containerId].element.style.height = height + 'px';

      });
    },

    gotoPrices() {
      this.showNoAccessDialog = false;
      document.body.classList.remove('overflow-hidden');
      this.$router.push({
        name: 'PricesWithDesiredItem',
        params: { desiredItem: 'video_' + this.modalVideo.id },
      });
    },
    applySearch(searchObject) {
      this.closeVideoModal();
      this.$emit('applySearch', searchObject);
    },
    async showSingleVideoInPopup(video) {
      const videoQueryString = qs.stringify({
        populate: VIDEO_POPULATE_FIELDS,
      });
      this.closeVideoModal();
      const singleVideo = await YogoApi.get(`/videos/${video.id}?${videoQueryString}`);
      this.openVideoModal(singleVideo);
    },
    async toggleFavorite(video) {
      if (video.is_user_favorite) {
        await YogoApi.delete(`/user-video-favorites/${this.user.id}/${video.id}`);
      } else {
        await YogoApi.post(`/user-video-favorites/${this.user.id}`, {
          video: video.id,
        });
      }
      video.is_user_favorite = !video.is_user_favorite;
      if (this.showVideoModal) {
        // Could be a related video. In that case, we need to update the main video list
        const videoInSearchResults = _find(this.videos, { id: video.id });
        if (videoInSearchResults) {
          videoInSearchResults.is_user_favorite = video.is_user_favorite;
        }
      }
    },
  },

};

</script>

<style lang="scss">

.yogo-video-duration {
  background: rgba(0, 0, 0, .5);
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: #fff;
  padding: 3px 5px;
  border-radius: 2px;
  font-size: .8em;
  line-height: 1.2;
}

.yogo-video-description-more-switch {
  display: block;
  text-align: right;
}

.yogo-embed-container {
  position: relative;
  padding-bottom: 56.25%;
  overflow: hidden;
  max-width: 100%;
  height: auto;
}

.yogo-modal-embed-container {
  display: none;
}

.yogo-embed-container iframe,
.yogo-embed-container object,
.yogo-embed-container embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.yogo-heart {
  /*position: absolute;
  right: 15px;
  top: 15px;*/
}

.yogo-video-title {
  font-size: 1.1em;
}

.yogo-cards-container {
  margin-left: -15px;
  margin-right: -15px;
}

.yogo-video-card {
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  border: 1px solid #ece8e8;
  width: 100%;
  background: #fff;
  margin: 15px;

}

.yogo-video-thumb-container {
  position: relative;
  cursor: pointer;
}

.yogo-video-thumb {
  background-size: cover;
  background-position: center;
  width: 100%;
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

.select-simple {
  display: flex;
  padding: 0 8px;
  vertical-align: middle;
  border-radius: 2px;
  min-width: 120px;
  font-weight: bold;
  border-bottom: 2px solid;
  background: transparent;
  margin-left: 10px;
  transition: all 0.2s ease-in-out 0s;

  &:focus {
    outline: none;
  }
}


.input-simple {
  border: none !important;

  label {
    font-size: 14px;
    min-width: 80px;
  }
}


</style>
