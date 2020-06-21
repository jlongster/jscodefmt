<template>
    <div v-bind:id=" 'list-'   +  id "></div>
    <div v-bind:id=" &quot;list-&quot;   +  id "></div>
    <div v-bind:id=" &apos;list-&apos;   +  id "></div>
    <div v-bind:id=" &apos;&quot;&apos;   +  id "></div>
    <div v-bind:id="  rawId | formatId "></div>
    <div v-bind:id=" ok ? 'YES' : 'NO' "></div>
    <button @click=" foo ( arg, 'string' ) "></button>
</template>

