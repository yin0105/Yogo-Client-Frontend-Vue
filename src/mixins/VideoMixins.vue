<template>
<div></div>
</template>

<script>

import _each from 'lodash/each';

export default {
  methods: {
    populateDescriptionPreviews(videos) {
      _each(videos, video => {
        video.has_long_description = video.video_provider_data.description && video.video_provider_data.description.length > 140;
        if (video.has_long_description) {
          const lastSpacePosition = video.video_provider_data.description.lastIndexOf(' ', 140);
          video.description_preview = video.video_provider_data.description.substr(0,
              lastSpacePosition) + '...';
        }
      });
    },
  },
};
</script>
