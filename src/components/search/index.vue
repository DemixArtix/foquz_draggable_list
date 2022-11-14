<template lang="pug">

.container
  .search__block
    g-icon(name="ui/find" class="mr-[1.2rem]")
    input.search__input.text-lg(placeholder='Поиск' v-model.trim="searchValue")
    g-icon(name="ui/close" class="mr-[1.2rem]").ml-auto.cursor-pointer(v-if="searchValue.length > 0" @click="searchValue = ''")
</template>

<script lang="ts">
  import { defineComponent, computed } from 'vue'
  import { useStore } from 'vuex'

  export default defineComponent({
    name: "index",
    setup(props, context) {
      const store = useStore();
      const searchValue = computed<string>({
        get: () => store.getters['data/searchValue'],
        set: (value: string): void => {
          store.dispatch('data/setSearchValue', value)
        }
      });

      return {
        searchValue
      }
    }
  })
</script>

<style scoped lang="sass">

.search
  &__block
    @apply flex items-center pb-[1.2rem] w-1/2 mr-auto
    border-bottom: 1px solid $blue
  &__input
    &:focus-visible
      outline: none
</style>