<template>
  <div class="prices" :class="{ 'wrapper' : !mobileAppMode }">
    <div class="theme--frame-box">

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

      <div class="md:w-6/12 md:ml-auto md:mr-auto pt-10 pb-4">
        <div class="flex justify-center flex-wrap">
          <MainCategoryIcon
              v-for="mainCategory in mainCategories"
              :key="'mainCategory_' + mainCategory.id"
              :mainCategory="mainCategory"
              :selectedMainCategories="selectedMainCategories"
              @selected="mainCategorySelected"
          >
          </MainCategoryIcon>

        </div>

        <VideoSearch v-model="searchQuery"></VideoSearch>

      </div>

      <div :class="{ hidden : view.atTopOfPage }">
        <div class="w-full md:ml-auto md:mr-auto flex md:justify-center flex-wrap sticky-menu">

          <div class="flex w-full justify-center xl:hidden">
            <VideoSearch v-model="searchQuery"></VideoSearch>
          </div>

          <div class="hidden xl:flex w-full justify-center">
            <FilterDropdown
                v-for="(filter, idx) in visibleFilters"
                :key="'filter_' + filter.id"
                :filter="filter"
                :selectedVideoFilterValues="selectedVideoFilterValues"
                :isOpen="openFilterIdx === idx"
                @filterClick="filterClick(idx)"
                @filterValueClick="videoFilterValueClick"
            >
            </FilterDropdown>

            <MoreFiltersDialog
                :filters="moreFilters"
                :selectedVideoFilterValues="selectedVideoFilterValues"
                :isOpen="openFilterIdx === visibleFilters.length"
                @filterClick="filterClick(visibleFilters.length)"
                @filterValueClick="videoFilterValueClick"
            >
            </MoreFiltersDialog>

            <div class="p-2 lg:ml-2 lg:px-6 whitespace-nowrap text-right text-sm flex items-center underline"
            v-if="showClearFiltersButton"
            >
              <a href="#" class="text-gray-600 hover:text-gray-900 font-semibold"
                 @click.prevent="clearFilterValues">
                {{ $t('global.ClearAll') }}
              </a>
            </div>
          </div>

          <div class="flex flex-wrap justify-center w-full">
            <VideoFilterValueChip
              v-for="videoFilterValue in selectedVideoFilterValues"
              :key="'filterValue_' + videoFilterValue.id"
              :filter="getFilterForValue(videoFilterValue)"
              :filterValue="videoFilterValue"
              @deselect="videoFilterValueClick"
            >
            </VideoFilterValueChip>
          </div>
        </div>


      </div>

      <div id="filter-menu" class="md:w-10/12 md:ml-auto md:mr-auto flex md:justify-center flex-wrap mb-2">
          <FilterDropdown
              v-for="(filter, idx) in visibleFilters"
              :key="'filter_' + filter.id"
              :filter="filter"
              :selectedVideoFilterValues="selectedVideoFilterValues"
              :isOpen="openFilterIdx === idx"
              @filterClick="filterClick(idx)"
              @filterValueClick="videoFilterValueClick"
          >
          </FilterDropdown>

          <MoreFiltersDialog
              :filters="moreFilters"
              :selectedVideoFilterValues="selectedVideoFilterValues"
              :isOpen="openFilterIdx === visibleFilters.length"
              @filterClick="filterClick(visibleFilters.length)"
              @filterValueClick="videoFilterValueClick"
          >
          </MoreFiltersDialog>

          <div class="p-2 lg:ml-2 lg:px-6 whitespace-nowrap text-right text-sm flex items-center underline"
          v-if="showClearFiltersButton">
            <a href="#" class="text-gray-600 hover:text-gray-900 font-semibold"
               @click.prevent="clearFilterValues">
              {{ $t('global.ClearAll') }}
            </a>
          </div>

        <div class="flex flex-wrap md:justify-center">
          <VideoFilterValueChip
              v-for="videoFilterValue in selectedVideoFilterValues"
              :key="'filterValue_' + videoFilterValue.id"
              :filter="getFilterForValue(videoFilterValue)"
              :filterValue="videoFilterValue"
              @deselect="videoFilterValueClick"
          >
          </VideoFilterValueChip>
        </div>
      </div>


      <div class="border-b py-4 mb-4"></div>


      <VideoList :videos="videos" :video-filters="videoFilters" @applySearch="applySearch"></VideoList>
    </div>
  </div>
</template>

<script>

import _findIndex from 'lodash/findIndex';
import _find from 'lodash/find';
import _uniqBy from 'lodash/uniqBy';
import _differenceBy from 'lodash/differenceBy';
import _filter from 'lodash/filter';
import _each from 'lodash/each';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';
import _map from 'lodash/map';
import _intersectionBy from 'lodash/intersectionBy';
import _includes from 'lodash/includes';
import _flatten from 'lodash/flatten';
import VideoSearch from "./VideoSearch";
import FilterDropdown from "./FilterDropdown";
import MoreFiltersDialog from "./MoreFiltersDialog";
import MainCategoryIcon from "./MainCategoryIcon";
import VideoFilterValueChip from "./VideoFilterValueChip";
import YogoApi from '../gateways/YogoApi';
import qs from 'qs';
import VideoList from './VideoList';
import { mapGetters } from 'vuex';
import VIDEO_POPULATE_FIELDS from '../constants/VIDEO_POPULATE_FIELDS';
import VideoMixins from '../mixins/VideoMixins';

export default {
  name: 'VideoExtended',
  components: {
    VideoList,
    VideoFilterValueChip,
    VideoSearch,
    FilterDropdown,
    MainCategoryIcon,
    MoreFiltersDialog,
  },
  mixins: [VideoMixins],
  data() {
    return {
      mainCategories: [],
      selectedMainCategories: [],

      searchQuery: '',

      videoFilters: [],
      selectedVideoFilterValues: [],
      teachers: [],

      openFilterIdx: null,

      videos: [],
      view: {
        atTopOfPage: true
      }
    };
  },
  computed: {
    visibleFilters() {
      return _filter(
          this.videoFilters,
          f => this.videoFilterVisible(f)
              && !f.show_in_more_filters,
      );
    },
    moreFilters() {
      return _filter(
          this.videoFilters,
          f => this.videoFilterVisible(f)
              && f.show_in_more_filters,
      );
    },
    showClearFiltersButton() {
      return this.selectedMainCategories.length
          || this.searchQuery
          || this.selectedVideoFilterValues.length
    },
    ...mapGetters([
      'mobileAppMode'
    ]),
  },
  watch: {
    selectedMainCategories() {
      this.clearIrrelevantFilterValues();
      this.fetchVideos();
    },
    searchQuery() {
      this.fetchVideos();
    },
    selectedVideoFilterValues() {
      this.fetchVideos();
    },
  },
  async created() {
    await this.init();
  },
  beforeDestroy() {
    document.removeEventListener('click', this.documentClick);
  },
  beforeMount () {
    window.addEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.filterMenu = document.getElementById('filter-menu');
    this.filterMenuOffset = this.filterMenu.offsetTop;
  },
  methods: {
    handleScroll() {
      if (window.pageYOffset > this.filterMenuOffset + 200) {
        this.openFilterIdx = null;
        if (this.view.atTopOfPage) this.view.atTopOfPage = false;
      } else {
        if (!this.view.atTopOfPage) this.view.atTopOfPage = true;
      }
    },
    async init() {
      [this.mainCategories, this.videoFilters, this.teachers] = await Promise.all([
        YogoApi.get('/video-main-categories'),
        YogoApi.get('/video-filters?populate[]=filter_values&populate[]=show_for_main_categories'),
        YogoApi.get('/users?isTeachingVideo=1'),
      ]);
      _each(this.videoFilters, (videoFilter) => {
        if (videoFilter.filter_type === 'teachers') {
          videoFilter.filter_values = _sortBy(
              _map(
                  this.teachers,
                  (teacher) => {
                    teacher.name = `${teacher.first_name} ${teacher.last_name}`.trim();
                    teacher.filterId = `teacher_${teacher.id}`;
                    teacher.video_filter_id = videoFilter.id;
                    return teacher;
                  },
              ),
              'name',
          );
        } else {
          _each(
              videoFilter.filter_values,
              (filterValue) => {
                filterValue.filterId = `video_filter_value_${filterValue.id}`;
              },
          );
        }
      });
      document.addEventListener('click', this.documentClick);
      await this.fetchVideos();
    },
    async fetchVideos() {
      console.log('fetchVideos');

      const query = {
        populate: VIDEO_POPULATE_FIELDS,
      };
      if (this.selectedMainCategories.length) {
        query.mainCategoryIds = _map(this.selectedMainCategories, 'id');
      }
      if (this.searchQuery) {
        query.searchQuery = this.searchQuery;
      }
      if (this.selectedVideoFilterValues.length) {
        const customFilterValues = _filter(this.selectedVideoFilterValues,
            vfv => vfv.filterId.substr(0, 19) === 'video_filter_value_');
        if (customFilterValues.length) {
          query.filterValueIds = _map(customFilterValues, 'id');
        }
        const selectedFilterTeachers = _filter(this.selectedVideoFilterValues,
            vfv => vfv.filterId.substr(0, 8) === 'teacher_');
        if (selectedFilterTeachers) {
          query.teacherIds = _map(selectedFilterTeachers, 'id');
        }
      }
      const queryString = qs.stringify(query);
      this.videos = await YogoApi.get(`/videos?${queryString}`);

      this.videos = _sortBy(this.videos, 'createdAt');
      this.vides = _reverse(this.videos);

      this.populateDescriptionPreviews(this.videos)

    },
    filterClick(idx) {
      if (this.openFilterIdx === idx) {
        this.openFilterIdx = null;
      } else {
        this.openFilterIdx = idx;
      }
    },
    videoFilterValueClick(filterValue) {
      console.log(filterValue);
      const existingSelectedVideoFilterIndex = _findIndex(
          this.selectedVideoFilterValues,
          {
            filterId: filterValue.filterId,
          },
      );
      console.log('existingSelectedVideoFilterIndex:', existingSelectedVideoFilterIndex);
      if (existingSelectedVideoFilterIndex > -1) {
        this.selectedVideoFilterValues.splice(existingSelectedVideoFilterIndex, 1);
      } else {
        this.selectedVideoFilterValues.push(filterValue);
      }
    },
    clearFilterValues() {
      this.selectedMainCategories = [];
      this.searchQuery = '';
      this.selectedVideoFilterValues = [];
      this.openFilterIdx = null;
      this.fetchVideos();
    },
    mainCategorySelected(mainCategory, selected) {
      console.log(mainCategory, selected);
      if (selected) {
        this.selectedMainCategories.push(mainCategory);
        this.selectedMainCategories = _uniqBy(
            this.selectedMainCategories,
            'id',
        );
      } else {
        this.selectedMainCategories = _differenceBy(
            this.selectedMainCategories,
            [mainCategory],
            'id',
        );
      }
    },
    getFilterForValue(filterValue) {
      return _find(this.videoFilters, { id: filterValue.video_filter_id });
    },

    documentClick(e) {
      if (!e || !e.target || !e.target.closest) return;
      if (e.target.closest(
          '.yogo-filter-dropdown, .yogo-filter-dropdown-inner, .yogo-more-filters-modal',
      )) {
        return;
      }

      this.openFilterIdx = null;
    },

    applySearch(searchObject) {
      console.log('applySearch: ', searchObject);
      this.selectedMainCategories = _filter(
          this.mainCategories,
          mc => _includes(searchObject.mainCategoryIds || [], mc.id),
      );
      this.searchQuery = searchObject.searchQuery || '';
      const allVideoFilterValues = _flatten(
          _map(this.videoFilters, 'filter_values'),
      );
      console.log(allVideoFilterValues);
      this.selectedVideoFilterValues = _filter(
          allVideoFilterValues,
          vfv => _includes(searchObject.selectedVideoFilterValueIds || [], vfv.filterId),
      );
    },

    videoFilterVisible(videoFilter) {
      return !videoFilter.show_only_for_specific_main_categories
          || !this.selectedMainCategories.length
          || _intersectionBy(
              videoFilter.show_for_main_categories,
              this.selectedMainCategories,
              'id',
          ).length;
    },

    clearIrrelevantFilterValues() {
      this.selectedVideoFilterValues = _filter(
          this.selectedVideoFilterValues,
          vfv => this.videoFilterVisible(
              this.getFilterForValue(vfv),
          ),
      );
    },
  },

};
</script>

<style lang="scss">
  .sticky-menu {
    position: fixed;
    top: 0;
    left: 0;
    padding: 10px 20px;
    width: 100%;
    background: #fff;
    transition: .3s ease;
    z-index: 11;
    -webkit-animation: slide-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: slide-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  }

  .slide-bottom {
    -webkit-animation: slide-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: slide-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  }

  @-webkit-keyframes slide-bottom {
    0% {
      -webkit-transform: translateY(-60px);
      transform: translateY(-60px);
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }
  }
  @keyframes slide-bottom {
    0% {
      -webkit-transform: translateY(-60px);
      transform: translateY(-60px);
    }
    100% {
      -webkit-transform: translateY(0);
      transform: translateY(0);
    }
  }

</style>

