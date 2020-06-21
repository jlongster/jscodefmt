<template>
  <h2
    class="title"
    :class="{ 'issue-realtime-pre-pulse': preAnimation,
 'issue-realtime-trigger-pulse': pulseAnimation}"
    v-html="titleHtml"
  >
  </h2>
</template>
