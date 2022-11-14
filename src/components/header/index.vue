<template lang="pug">
.header_block.container.flex.justify-between(class="mt-[3.8rem] mb-[3rem]")
  .header__title
    h2.text-xl.font-medium Документы
  .header__buttons.flex
    .header__buttons_item
      g-icon(name="ui/bookmark")
    .header__buttons_item
      g-icon(name="ui/plus")
      span.header__buttons_text Новый тип
    .header__buttons_item
      g-icon(name="ui/plus")
      span.header__buttons_text Новый документ
</template>

<script>
  export default {
    name: "index"
  }
</script>

<style scoped lang="sass">
.header__buttons
  & > *
    &:not(:last-child)
      margin-right: 1rem
.header__buttons_item
  @apply rounded-full font-medium flex py-[1rem] px-[1.3rem] items-center cursor-pointer
  border: 1px solid #D3D8DF
  & > *
    &:not(:last-child)
      margin-right: 1rem
.header__buttons_text
  @apply text-md pr-[0.9rem]
</style>