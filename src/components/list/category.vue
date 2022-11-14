<template lang="pug">
.category(
  @transitionend="onTransitionEnd()"
  ref="categoryRoot"
)
  .category__block.flex.items-center.border.border-grey-light(
    :class="[dropBorder, {'opacity-50': isActive}, {'opacity-50': notInSearch}]"
    ref="categoryEl"

  )
    .category__arrow.border.border-grey-light.rounded-full(
      class="w-[2.2rem] h-[2.2rem]"
      @mousedown.stop
      @click.stop="expanded = !expanded"
      :class="[{'-rotate-180': expanded}]"
    )
      g-icon(name="ui/arrow").category__arrow_icon
    .category__title.text-lg.font-medium {{category.title}}
    .category__description.text-grey.text-sm.text-ellipsis.overflow-hidden {{category.description}}
    .category__settings.flex.items-center
      g-icon(name="ui/edit").category__settings_item.cursor-pointer
      g-icon(name="ui/delete" @click="onDeleteCategory").category__settings_item.cursor-pointer
      g-icon(name="ui/replace" @mousedown="onMouseDown($event)").category__settings_item.cursor-pointer.delete
  TransitionGroup(
    :name="transitionName"
    :css="useCss"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  )
    Document(
      :class="[{'opacity-50': isActive}]"
      v-if="!expanded"
      v-for="(document, index) in category.documents"
      :key="document.id"
      :document="document"
      :categoryIndex="category.index"
      :index="document.index"
      class="ml-[1.6rem]"
    )
</template>

<script lang="ts">
  import $ from 'jquery'
  //@ts-ignore
  import anime from "animejs/lib/anime.es";
  //@ts-ignore
  import Document from './document'

  import ICategory from "interfaces/ICategory";
  import IItemCoords from "interfaces/IItemCoords";
  import IItem from "interfaces/IItem";
  import { Ref } from 'vue'
  interface IMousePosition {
    x: number
    y: number
  }

  import { defineComponent, onMounted, onUpdated, onBeforeUpdate, computed, ref, reactive, watch } from 'vue'
  import {createLogger, useStore} from 'vuex'

  export default defineComponent({
    name: "category",
    components: { Document },
    mounted() {
    },
    props: {
      category: {
        type: Object,
        default: () => ({})
      },
      index: {
        type: Number,
        default: 0
      },
    },
    setup(props, context) {

      const store = useStore();
      const categoryRoot: Ref<any> = ref(null);
      const categoryEl: Ref<any> = ref(null);
      const isActive: Ref<boolean> = ref(false);
      const expanded: Ref<boolean> = ref(false);
      const dropBorder: Ref<string | null> = ref(null);
      const notInSearch: Ref<boolean> = ref(false);

      const transitionName: Ref<string | null> = ref('fade');
      const useCss: Ref<boolean> = ref(true);
      let staticIndex = props.index;

      let offset: number[] = [0,0];
      let mousePosition: IMousePosition = reactive({x: 0, y: 0});
      let clone: any;
      let itemCoords: IItemCoords = {
        offsetLeft: 0,
        offsetTop: 0,
        offsetWidth: 0,
        offsetHeight: 0,
      }
      let x: boolean = false;
      let y: boolean = false;

      const getItemCoords = (): IItemCoords => {
        return {
          offsetLeft: categoryEl?.value?.offsetLeft ? categoryEl.value.offsetLeft : 0,
          offsetTop: categoryEl?.value?.offsetTop ? categoryEl.value.offsetTop : 0,
          offsetWidth: categoryEl?.value?.offsetWidth ? categoryEl.value.offsetWidth : 0,
          offsetHeight: categoryEl?.value?.offsetHeight ? categoryEl.value.offsetHeight : 0,
        }
      }

      onMounted(() => {
        itemCoords = getItemCoords()
      });
      onUpdated(() => {
        itemCoords = getItemCoords()
      });

      const draggedItem = computed<IItem>(() => store.getters['data/draggedItem']);
      const currentItem = computed<IItem>(() => {
        return {
          categoryItem: props.index,
          documentItem: -1,
        }
      });
      const mouseDown = computed<boolean>(() => store.getters['data/mouseDown']);
      const draggedItemCoords = computed<IItemCoords>(() => store.getters['data/draggedItemCoords']);

      watch(isActive, (val) => {
        if(val) {
          $(document).on('mousemove', onDrag)
          $(document).on('mouseup', onDragEnd)
        } else {
          $(document).off('mousemove', onDrag)
          $(document).off('mouseup', onDragEnd)
        }
      });

      const searchValue = computed<string>(() => store.getters['data/searchValue']);

      watch(searchValue, (val) => {
          if(val && !itemInSearchValue(props.category.title)) {
            notInSearch.value = true
          } else {
            notInSearch.value = false
          }
        }
      );

      function itemInSearchValue(string: string) {
        return string.toLowerCase().indexOf(searchValue.value.toLowerCase()) !== -1
      }

      onBeforeUpdate(() => {

        if(staticIndex !== props.index) {
          transitionName.value = '';
          staticIndex = props.index
          setTimeout(() => {
            transitionName.value = 'fade';
          }, 500)
        }
      })

      function slideDown(callback: any = () => {}) {
        $(categoryEl.value).slideDown(500, function () {
          itemCoords = getItemCoords()
          callback();
        })
      }

      function slideUp(callback: any = () => {}) {
        $(categoryEl.value).slideUp(500, function () {
          itemCoords = getItemCoords();
          callback();
        })
      }

      function onTransitionEnd(event: any) {
        itemCoords = getItemCoords()
      }

      function onBeforeEnter(el: any) {
        el.style.height = 0
      }

      function onEnter(el: any, done: any) {
        anime({
          targets: el,
          height: '36px',
          easing: 'easeInOutQuad',
          duration: 500,
          complete: function(anim) {
            el.style.height = '';
            done();
          }
        });
      }

      function onBeforeLeave(el: any) {
        el.style.height = '36px';
        transitionName.value = ''
      }

      function onLeave(el: any, done: any) {
        anime({
          targets: el,
          height: '0',
          easing: 'easeInOutQuad',
          duration: 500,
          complete: function(anim) {
            transitionName.value = 'fade'
            done();
          }
        });
      }

      $(document).on('mousemove', function (e) {
        if (!isActive.value && mouseDown.value) {

          let a = itemCoords;
          let b = draggedItemCoords.value;
          x = (a.offsetWidth / 2) > Math.abs((a.offsetWidth + a.offsetLeft) - (b.offsetWidth + b.offsetLeft));
          y = (a.offsetHeight / 3) > Math.abs((a.offsetHeight + a.offsetTop) - (b.offsetHeight + b.offsetTop));
          if(x && y) {
            onDragOver(e)
          } else {
            onDragLeave(e)
          }
        }
      });

      $(document).on('mouseup', function (e) {
        if(!isActive.value && x && y) {
          onDrop(e)
        }
        isActive.value = false;
      })

      const onMouseDown = (event: any) => {
        store.dispatch('data/setDraggedItem', currentItem);
        offset = [
          categoryEl.value.offsetLeft - event.pageX,
          categoryEl.value.offsetTop - event.pageY
        ];
        onDragStart(event)
      }

      const onMouseMove = (event: any) => {
        onDragOver(event)
      }

      const onMouseUp = (event: any) => {
        onDrop(event)
      }

      const onMouseLeave = (event: any) => {
        onDragLeave(event)
      }

      const onDrag = (event: any) => {
        if (isActive.value) {
          mousePosition.x = event.pageX;
          mousePosition.y = event.pageY;

          clone
            .css('left', (mousePosition.x + offset[0]) + 'px')
            .css('top', (mousePosition.y + offset[1]) + 'px')
          store.dispatch('data/setDraggedItemCoords', {
            offsetLeft: clone[0].offsetLeft,
            offsetTop: clone[0].offsetTop,
            offsetWidth: clone[0].offsetWidth,
            offsetHeight: clone[0].offsetHeight,
          })
        }
      }

      const onDragStart = (event: any) => {
        $(document.body).css('user-select', 'none').css('overflow-x', 'hidden')
        clone = $(categoryEl.value)
          .clone()
          .css('left', (categoryEl.value.offsetLeft) + 'px')
          .css('top', (categoryEl.value.offsetTop) + 'px')
          .css('z-index', '1')
          .css('background-color', '#fff')
          .css('transition', 'box-shadow 0.2s ease-in-out')
          .css('box-shadow', '0px 0px 8px #0066FF')
          .css('width', $(categoryEl.value).prop('clientWidth') + 2 + 'px')
        clone.find('svg.delete path').css('fill', '#0066FF')
        $(document.body).before(clone);
        clone.css('position', 'absolute')
        isActive.value = true;
      }

      const onDrop = (event: any) => {
        dropBorder.value = null;
        if(!isActive.value) {
          if(draggedItem.value.documentItem === -1 && draggedItem.value.categoryItem !== -1) {
            store.dispatch('data/replaceCategory', {
              draggedItem: draggedItem.value.categoryItem,
              currentItem: currentItem.value.categoryItem < draggedItem.value.categoryItem ? currentItem.value.categoryItem - 1 : currentItem.value.categoryItem,
            })
          } else {
            store.dispatch('data/replaceDocument', {
              draggedItem: draggedItem.value,
              currentItem: {
                categoryItem: currentItem.value.categoryItem,
                documentItem: 0
              },
            })
          }

        }
        x = y = false;
      }

      const onDragEnd = (event: any) => {
        $(document.body).css('user-select', 'all').css('overflow-x', 'auto')
        clone.remove()
        store.dispatch('data/setDraggedItemCoords', {
          offsetLeft: 0,
          offsetTop: 0,
          offsetWidth: 0,
          offsetHeight: 0,
        })
      }

      const onDragEnter = (event: any) => {
      }

      const onDragOver = (event: any) => {
        if(!isActive.value && mouseDown.value) {
          dropBorder.value = 'category__drop-border-bottom'
        }
      }

      const onDragLeave = (event: any, ) => {
        dropBorder.value = null
      }

      const onDeleteCategory = () => {
        $(categoryRoot.value).slideUp(500, function () {
          store.dispatch('data/deleteCategory', currentItem.value.categoryItem)
        })
      }

      return {
        categoryRoot,
        categoryEl,
        isActive,
        dropBorder,
        expanded,
        currentItem,
        notInSearch,
        searchValue,

        useCss,
        transitionName,
        onBeforeEnter,
        onBeforeLeave,
        onEnter,
        onLeave,

        onDeleteCategory,
        onTransitionEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,

        onDrag,
        onDragStart,
        onDragEnd,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop
      };
    }
  })
</script>

<style scoped lang="sass">
.category
  background-color: #fff
  overflow: hidden
  &__
    &block
      padding: 1.3rem 1.6rem
      transition: border-width 0.2s ease-in-out, opacity 0.3s ease-in-out
    &drop-border
      &-top
        @apply border-t-[0.5rem]
        border-top-color: $blue
      &-bottom
        @apply border-b-[0.5rem]
        border-bottom-color: $blue
    &block,&settings
      gap: 1.5rem
    &title
      min-width: fit-content
    &arrow
      position: relative
      cursor: pointer
      min-width: fit-content
      padding: 1.1rem
      transition: transform 0.2s ease-in-out
      &_icon
        position: absolute
        left: 50%
        top: 50%
        transform: translate(-50%, -50%)
    &description
      white-space: nowrap
      overflow: hidden
    &settings
      margin-left: auto

.fade-move
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1)



</style>