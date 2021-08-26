<template>
  <md-field v-bind:class="{'md-invalid': showImageDimensionsError, 'image-upload-field':true}"
            :data-image-format="imageFormat">

    <div :class="imageFormat + '__image--edit'">
      <img :src="imagePreviewSrc" v-images-loaded="imageDidLoad">
      <div class="overlay--edit">
        <span class="icon-camera_alt"></span>
        <input @change="uploadImage" type="file" accept="image/*" tabindex="100">
      </div>
      <span class="md-error"
          v-if="showImageDimensionsError">{{ $t('global.imageMustBe') }} {{ imageFormatMinSizes[imageFormat].width + 'x' + imageFormatMinSizes[imageFormat].height
      }} {{ $t('global.imageFormats') }}</span>

    <md-progress-spinner
        v-if="imageFormat === 'profile' && imageIsLoading"
        md-mode="determinate"
        :md-value="imageUploadProgress"
        class="image-upload-progress"
        :md-diameter="imageUploaderSize"
    ></md-progress-spinner>

      <md-progress-spinner
          v-if="imageFormat === 'profile' && imageIsWaiting"
          md-mode="indeterminate"
          class="image-upload-progress"
          :md-diameter="imageUploaderSize"
      ></md-progress-spinner>

    </div>


  </md-field>
</template>

<script>

    import YogoApi from '@/gateways/YogoApi'
    import avatar from '@/assets/img/account.svg'
    import imagesLoaded from 'vue-images-loaded'
    import Imgix from "../services/Imgix"

    export default {
        mixins: [Imgix],
        props: ['imageFormat', 'imageId'],
        directives: {
            imagesLoaded,
        },
        data() {
            return {
                fileInputValue: '',
                imagePreviewSrc: avatar,
                showImageDimensionsError: false,
                imageIsLoading: false,
                imageIsWaiting:false,
                imageUploadProgress: 0,

                imageFormatMinSizes: {
                    profile: {
                        width: 400,
                        height: 400
                    },
                    landscape: {
                        width: 1580,
                        height: 400
                    },
                    square: {
                        width: 640,
                        height: 640
                    }
                },

                windowWidth: 0,

                internalImageId: 0
            }
        },
        computed: {
            imageUploaderSize() {
                switch (this.imageFormat) {
                    case 'profile':
                        return 100;
                    case 'landscape':
                        return 100;
                    case 'square':
                        return 100;
                    default:
                      return 100;
                }

            }
        },
        mounted() {
            if (this.imageId) {
                this.internalImageId = this.imageId
                this.fetchInitialImage()
            }
            this.$nextTick(function () {
                window.addEventListener('resize', this.getWindowWidth);
                this.getWindowWidth()
            })
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.getWindowWidth);
        },
        watch: {
            imageId(newImageId) {
                if (newImageId && newImageId !== this.internalImageId) {
                    this.internalImageId = newImageId
                    this.fetchInitialImage()
                }
            }
        },
        methods: {
            async fetchInitialImage() {

                const image = await YogoApi.get('/images/' + this.internalImageId)

                this.imagePreviewSrc = this.Imgix(image.filename, {
                  w: this.imageFormatMinSizes[this.imageFormat].width,
                  h: this.imageFormatMinSizes[this.imageFormat].height,
                  fit: 'crop'
                })

            },
            uploadImage: async function (e) {

                this.showImageDimensionsError = false;

                let files = e.target.files;
                if (!files[0]) {
                    return;
                }

                try {

                    this.imageIsWaiting = true

                    let readerResult = await this.getFileReaderResult(files[0])

                    let imageSize = await this.getImageSizeFromReaderResult(readerResult);

                    if (imageSize.width < this.imageFormatMinSizes[this.imageFormat].width || imageSize.height < this.imageFormatMinSizes[this.imageFormat].height) {
                        this.showImageDimensionsError = true;
                        this.imageIsWaiting = false;
                        return;
                    }


                    let data = new FormData();
                    data.append('image', files[0]);

                    this.imageIsWaiting = false
                    this.imageIsLoading = true
                    this.imageUploadProgress = 0


                    const image = await YogoApi.request({
                        url: '/images',
                        method: 'post',
                        data: data,
                        headers: {'Content-Type': 'multipart/form-data'},
                        onUploadProgress: (progressEvent) => {
                            this.imageUploadProgress = Math.round(progressEvent.loaded / progressEvent.total * 100)
                            if (this.imageUploadProgress === 100) {
                                this.imageIsLoading = false
                                this.imageIsWaiting = true
                            }
                        }
                    })

                    this.imagePreviewSrc = this.Imgix(
                      image.filename,
                      {
                        w: this.imageFormatMinSizes[this.imageFormat].width,
                        h: this.imageFormatMinSizes[this.imageFormat].height,
                        fit: 'crop'
                      }
                    )

                    this.internalImageId = image.id

                    this.$emit('update:imageId', image.id)

                    this.imageIsLoading = false
                    this.imageIsWaiting = true

                } catch (err) {

                    console.log(err.message)

                }

            },
            async getFileReaderResult(file) {
                return new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = () => {
                        resolve(reader.result)
                    }
                    reader.readAsDataURL(file);
                })
            },
            async getImageSizeFromReaderResult(readerResult) {
                return new Promise((resolve) => {
                    let i = new Image();
                    i.onload = () => {
                        resolve({
                            width: i.width,
                            height: i.height
                        })
                    }
                    i.src = readerResult;
                })
            },
            getWindowWidth() {
                this.windowWidth = document.documentElement.clientWidth;
            },
            imageDidLoad() {
                if (this.imageIsWaiting) {
                    this.imageIsWaiting = false
                }
            }
        },


    }

</script>
