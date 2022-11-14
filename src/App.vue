<template lang="pug">
Header
Search
List
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//@ts-ignore
import Header from 'components/header';
//@ts-ignore
import Search from 'components/search';
//@ts-ignore
import List from 'components/list';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Search,
    List
  }
});
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500&display=swap');
html {
  font-size: 10px;
}
#app {
  font-family: 'Fira Sans', sans-serif;
  user-select: none;
}

/* 1. declare transition */

.fade-enter-active,
.fade-leave-active,
.fade-move {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to
{
  opacity: 0;
  transform: scaleY(0.01);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  //position: absolute;
}
</style>