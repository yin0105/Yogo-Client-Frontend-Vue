import qs from 'qs';
import avatar from '@/graphics/avatar'

import envConfig from '../../env_config'

const buildURL = (filename, options) => {
  if (!filename){
    return ''
  }
  return 'https://' + envConfig.imageServerImgix + '/' + filename + '?' + qs.stringify(options)
}

const profileImageSrc = (image, options) => {
  if (!image) {
    return avatar
  }
  return buildURL(image.filename, options)
}

export default {
  methods: {
    Imgix: buildURL,
    profileImageSrc
  }
}


