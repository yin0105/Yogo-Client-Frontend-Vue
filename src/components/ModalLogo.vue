<template>
  <img :src="imgSrc" alt="" :class="imgClass" v-if="imageType">
</template>

<script>

  import Imgix from '@/services/Imgix'
  import {mapGetters} from 'vuex'

  export default {
    props: {},
    computed: {
      ...mapGetters([
        'client',
      ]),
      imageType() {
        if (!this.client || !this.client.logo) return null
        return this.client.logo.filename.slice(-4) === '.svg' ? 'svg' : 'bitmap'
      },
      imgSrc() {
        if (!this.client || !this.client.logo) return ''
        return this.imageType === 'svg' ?
          Imgix.methods.Imgix(this.client.logo.filename) :
          Imgix.methods.Imgix(this.client.logo.filename, {w: 400, h: 200})
      },
      imgClass() {
        return this.imageType === 'svg' ?
          'logo-svg' :
          'logo-bitmap'
      },
    },
  }

</script>


<style lang="scss" scoped>

  img.logo-svg {
    width: 400px;
    height: 80px;
    padding: 0;
    margin: 20px auto 0;
    display: block;
  }

  img.logo-bitmap {
    width: 160px;
    height: auto;
    padding: 0;
    margin: 20px auto 0;
    display: block;
  }

</style>
