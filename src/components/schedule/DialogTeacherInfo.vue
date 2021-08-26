<template>
  <div class="modal__teacher--info">
    <div
      class="my-2"
      v-for="(teacher, index) in teachers"
      :style="{cursor: teacher.teacher_description.trim() !== '' ? 'pointer' : 'default'}"
      :key="'teacher_' + teacher.id"
    >
      <div class="flex pr1 items-center" :class="teacher.teacher_description.trim().length ? 'pointer' : ''" @click.prevent="toggleTeacherInfo(index)">
        <img :src="teacher.image ? Imgix(teacher.image.filename, {w:200, h:200, fit: 'crop'}) : avatar()" alt="">
        <p>
          {{ $t('global.teacher') }}: {{ teacher.first_name + ' ' + teacher.last_name }}
        </p>
        <div class="flex items-center pointer ml2" v-if="teacher.teacher_description.trim().length">
          <span :class="{ 'rotate': showTeacherInfo[index] }" class="block icon-arrowdown"></span>
        </div>
      </div>

      <!-- dropdown content -->
      <transition name="slide-fade" mode="out-in" appear>
        <nl2br tag="div" :text="teacher.teacher_description" v-if="showTeacherInfo[index]" className="my-2"></nl2br>
      </transition>
      <!-- end dropdown content -->

    </div>
  </div>

</template>

<script>

  import avatar from '@/graphics/avatar'
  import Imgix from "../../services/Imgix"

  export default {
    props: ['teachers'],
    mixins: [Imgix],
    data() {
      return {
        showTeacherInfo: [],
      }
    },
    mounted() {
      this.showTeacherInfo = []
    },
    methods: {
      avatar() {
        return avatar
      },
      toggleTeacherInfo(index) {
        this.$set(this.showTeacherInfo, index, !this.showTeacherInfo[index])
      },
    }
  }

</script>

<style lang="scss" scoped>

  .teacher {
    margin-right: 20px;
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
