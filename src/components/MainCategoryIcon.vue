<template>
  <div class="lg:px-4 py-2 lg:py-0">
    <div
        class="yogo-main-category w-24 text-center font-bold flex flex-column justify-between h-full"
        :class="{ selected }"
        @click="click"
    >
      <YogaIcon v-if="mainCategory.name === 'Yoga'"></YogaIcon>
      <TalkIcon v-if="mainCategory.name === 'Talk'"></TalkIcon>
      <span class="mt-1">
        {{ mainCategory.name }}
      </span>
    </div>
  </div>
</template>

<script>

import YogaIcon from "./../graphics/YogaIcon";
import TalkIcon from "./../graphics/TalkIcon";
import _find from 'lodash/find';

export default {
  name: 'MainCategoryIcon',
  components: {
    YogaIcon,
    TalkIcon,
  },
  props: [
    'mainCategory',
    'selectedMainCategories'
  ],
  computed: {
    selected() {
      return !!_find(this.selectedMainCategories, mc => mc.id === this.mainCategory.id);
    }
  },
  methods: {
    click() {
      this.$emit('selected', this.mainCategory, !this.selected);
    },
  },
};
</script>

<style lang="scss" scoped>
.yogo-main-category {

  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
  transition: .2s ease color;

  &:hover {
    color: rgba(248, 113, 113, .5);
  }
  &.selected {
    color: rgba(248, 113, 113, 1);
  }
}
</style>
