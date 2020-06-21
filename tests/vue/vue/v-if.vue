<template>
<root>
  <and v-if="
long_long_long_long_long_long_long_condition_1 && long_long_long_long_long_long_long_condition_2 && short_1 && short_2 &&
long_long_long_long_long_long_long_condition_3 &&
long_long_long_long_long_long_long_condition_4
"></and>
  <and v-if="
(long_long_long_long_long_long_long_condition_1 && long_long_long_long_long_long_long_condition_2 && (short_1 && short_2) ) &&
long_long_long_long_long_long_long_condition_3 &&
long_long_long_long_long_long_long_condition_4
"></and>
  <or v-if="
long_long_long_long_long_long_long_condition_1 || long_long_long_long_long_long_long_condition_2 ||short_1 || short_2 ||
long_long_long_long_long_long_long_condition_3 ||
long_long_long_long_long_long_long_condition_4
"></or>
  <or v-if="
(long_long_long_long_long_long_long_condition_1 || long_long_long_long_long_long_long_condition_2 || (short_1 || short_2) ||
long_long_long_long_long_long_long_condition_3) ||
long_long_long_long_long_long_long_condition_4
"></or>
  <mixed v-if="
long_long_long_long_long_long_long_condition_1 && long_long_long_long_long_long_long_condition_2 ||  ((short_1 && short_2) &&
long_long_long_long_long_long_long_condition_3 &&
long_long_long_long_long_long_long_condition_4)
"></mixed>
  <mixed v-if="
long_long_long_long_long_long_long_condition_1 && long_long_long_long_long_long_long_condition_2 || short_1 && short_2 &&
long_long_long_long_long_long_long_condition_3 ||
long_long_long_long_long_long_long_condition_4
"></mixed>
</root>
</template>
