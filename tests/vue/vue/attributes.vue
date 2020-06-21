<template>
<div
  v-for="  item  in  items "
  v-for="  item  of  items "
  v-for="(    item    , index)    in    items"
  v-for="value    in     object"
  v-for="(value,    key)    in    object"
  v-for="(value,    key)    of    object"
  v-for="(value  ,   key,   index)    in   object"
  v-for="   n    in   evenNumbers"
  v-for=" n in even   ( numbers) "
  v-for=" n    in    10"
  v-for=" { a }    in    [0].map(()=>({a:1}))   "
  v-for=" ({ a }, [c  ])    in    [0].map(()=>1)   "
  v-for=" n in items.map(x => { return x }) "
  @click="  /* hello */   "
  @click="   /* 1 */ $emit( /* 2 */ 'click' /* 3 */ ) /* 4 */ ; /* 5 */   "
  @click="   $emit(   'click'   )   "
  @click="   $emit(   'click'   )  ;"
  @click="   $emit(   'click'   )  ;if(something){for(let i=j;i<100;i++){}}else{}"
  slot-scope="{row}"
  slot-scope="{destructuring:{a:{b}}}"
  :class="{ longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong: true }"
  :class="(() => { return 'hello' })()"
  :key="index /* hello */ "
  :key="index // hello "
  @click="() => {console.log(test)}"
  @click="
    () => {
      console.log(test);
    }
  "
  @click="doSomething()"
  @click="doSomething;"
></div>
</template>
