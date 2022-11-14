<template>
  <component v-if="currentIcon" :is="currentIcon" />
</template>

<script>
  import { defineComponent, shallowRef } from 'vue'

  export default defineComponent({
    props: {
      name: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const currentIcon = shallowRef('');
      import('icons/' + props.name + '.vue').then(val => {
        currentIcon.value = val.default
      });

      return {
        currentIcon
      }
    }
  })
</script>


