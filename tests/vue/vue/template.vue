<!--copied from https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/vue_shared/components/content_viewer/viewers/image_viewer.vue-->
<template>
  <div class="file-container">
    <div class="file-content image_file">
      <img
        ref="contentImg"
        :class="{ 'is-zoomable': isZoomable, 'is-zoomed': isZoomed }"
        :src="path"
        :alt="path"
        @load="onImgLoad"
        @click="onImgClick"/>
      <p
        v-if="renderInfo"
        class="file-info prepend-top-10">
        <template v-if="fileSize>0">
          {{ fileSizeReadable }}
        </template>
        <template v-if="fileSize>0 && width && height">
          |
        </template>
        <template v-if="width && height">
          W: {{ width }} | H: {{ height }}
        </template>
      </p>
    </div>
  </div>
</template>
