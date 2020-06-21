<!-- #7396 -->
<template>
<MyComponent :attr="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo} template literal value`"/>
</template>
<template>
<MyComponent :attr="`${first} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`
+`${second} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`"/>
</template>
<template>
<MyComponent :attr="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo +               bar} template literal value`"/>
</template>
<template>
<MyComponent :src="'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog literal string value'"/>
</template>
<template>
<MyComponent :src="'first loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog' + 'second loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog'"/>
</template>
<template>
<MyComponent :src="100000000000000000000000000000000000000000000000000000000000000000000000000"/>
</template>
