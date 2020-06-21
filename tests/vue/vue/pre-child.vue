<template>
<!-- copied from https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/ide/components/jobs/detail.vue -->
<pre
  ref="buildTrace"
  class="build-trace mb-0 h-100"
  @scroll="scrollBuildLog"
>
  <code
    v-show="!detailJob.isLoading"
    class="bash"
    v-html="jobOutput"
  >
  </code>
  <div
    v-show="detailJob.isLoading"
    class="build-loader-animation"
  >
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</pre>
</template>

<!-- copied from https://github.com/gitlabhq/gitlabhq/blob/master/app/assets/javascripts/vue_shared/components/code_block.vue -->
<template>
  <pre class="code-block rounded">
    <code class="d-block">{{ code }}</code>
  </pre>
</template>

<template>
<pre class='woot'>
  {{ stuff }}
  </pre>
</template>

<template>
<pre class='woot'>
  123{{ wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq }}123
  123{{ wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq || wqeqwwqwqweqweqwewwq }}123
    </pre>
</template>
