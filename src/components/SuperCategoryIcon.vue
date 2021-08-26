<template>
  <div class="lg:px-8">
    <div
      class="yogo-super-category w-24 text-center font-bold flex flex-column justify-between h-full"
      :class="{ active: isActive }"
      @click="isActive = !isActive"
    >
      <YogaIcon v-if="icon === 'yoga'"></YogaIcon>
      <TalkIcon v-if="icon === 'talk'"></TalkIcon>
      <span class="mt-1">
        {{ mainCategory.name }}
      </span>
    </div>
  </div>
</template>

<script>

  import YogaIcon from "./../graphics/icons/YogaIcon"
  import TalkIcon from "./../graphics/icons/TalkIcon"

  export default {
    name: 'SuperCategory',
    components: {
      YogaIcon,
      TalkIcon
    },
    props: [
      'categoryName',
      'icon'
    ],
    data() {
      return {
        isActive: false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .yogo-super-category.active {
    color: rgba(248,113,113, 1);
    div {
      /*background-color: rgba(254,226,226, 1);*/
      /*background-color: rgba(248,113,113, 1);*/
    }
  }
</style>
