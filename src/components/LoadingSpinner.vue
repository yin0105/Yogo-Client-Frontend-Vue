<template>
  <div :class="{ 'loader': true, 'loader--centered': centered }">
    <div class="loader__dot"></div>
    <div class="loader__dot"></div>
    <div class="loader__dot"></div>
  </div>
</template>

<style lang="stylus" scoped>
  @keyframes fade
    0%, 100%
      background-color #f0f0f0
    50%
      background-color #333

  .loader
    display inline-block

    &--centered
      position absolute
      top 50%
      left 50%
      transform translate(-50%, -50%)

  .loader__dot
    width 8px
    height 8px
    border-radius 50%
    background #f0f0f0
    display inline-block
    animation fade .8s infinite ease-in-out

    &:nth-child(2)
      margin 0 5px
      animation-delay .1s

    &:nth-child(3)
      animation-delay .2s
</style>

<script>
  export default {
    props: {
      centered: {
        type: Boolean,
        default: true
      }
    }
  }
</script>
