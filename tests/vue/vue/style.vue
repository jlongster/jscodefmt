<script>
</script>

<style>
#foo1{ color: #f00;
}
</style>
<style scoped>
#foo2{ color: #f00;
}
</style>

<style lang="css">
#foo3{ color: #f00;
}
</style>
<style lang="css" scoped>
#foo4{ color: #f00;
}
</style>

<style lang="less">
#foo5{ color: #f00;
}
</style>
<style lang="less" scoped>
#foo6{ 
         @color: #f00;
  color: @color;
}
</style>


<style lang="scss">
#foo8{ 
         $color: #f00;
  color: $color;
}
</style>
<style lang="scss" scoped>
#foo8{ 
         $color: #f00;
  color: $color;
}
</style>

