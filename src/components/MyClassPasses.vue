<template>
  <div class="activity">
    <div class="theme--frame-box">
      <h2>{{ $t('profile.myClassPasses') }}</h2>
      <div class="space2"></div>
      <ul>
        <li v-for="classPass in classPasses" :key="'classPass_' + classPass.id">
          <div class="space2"></div>
          <h3>{{ classPass.class_pass_type.name }}</h3>
          <div v-if="classPass.class_pass_type.pass_type === 'fixed_count'">
            <p>{{ $t('calendar.classesLeft') }}: {{ classPass.classes_left
            }}/{{ classPass.class_pass_type.number_of_classes }}</p>

            <div class="classpass__clip--container">
              <div class="classpass__clip--inner" v-for="i in classPass.class_pass_type.number_of_classes"
              :class="{'classpass--used' : i > classPass.classes_left }" :key="'clip_'+i"></div>
            </div>

            <div class="space4"></div>
            <div class="classpass__clip--container space__between--none">
              <div class="square--blue">{{ $t('profile.validClipsLabel') }}</div>
              <div class="square--gray">{{ $t('profile.usedClipsLabel') }}</div>
            </div>
          </div>

          <p>{{ $t('profile.validUntil') }}: {{ classPass.valid_until | moment('D. MMMM YYYY') }} </p>

        </li>
      </ul>

    </div>
    <div class="space4"></div>
  </div>
</template>

<script>

    export default {
        name: 'myclasspasses',
        components: {},
        data() {
            return {
                myVoucherLabel: 'Mine adgangskort',

            }
        },
        props: ['classPasses']
    }
</script>


<style>


</style>
