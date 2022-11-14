<template lang="pug">
.document(
  ref="documentEl"
)
  .document__block.flex.items-center.border.border-grey-light(
    :class="[dropBorder, {'opacity-50': isActive}]"
  )
    .document__title.text-base.font-medium {{document.title}}
    .document__title.text-pink.text-sm(v-if="document.required") Обязательный
    .document__description.text-grey.text-sm.text-ellipsis.overflow-hidden {{document.description}}
    .document__settings.flex.items-center
      g-icon(name="ui/edit").document__settings_item.cursor-pointer
      g-icon(name="ui/delete" @click="onDeleteDocument").document__settings_item.cursor-pointer
      g-icon(name="ui/replace" @mousedown="onMouseDown($event)").document__settings_item.cursor-pointer.delete
</template>

<script lang="ts">
  import $ from 'jquery'

  import { defineComponent, onMounted, onUpdated, computed, ref, reactive, watch } from 'vue'
  import { useStore } from 'vuex'

  import { Ref } from 'vue'
  import IDocument from "interfaces/IDocument";
  import IItem from "interfaces/IItem";
  import IItemCoords from "interfaces/IItemCoords";
  interface IMousePosition {
    x: number
    y: number
  }

  export default defineComponent({
    name: "document",
    props: {
      document: {
        type: Object,
        default: () => ({})
      },
      categoryIndex: {
        type: Number,
        default: -1
      },
      index: {
        type: Number,
        default: 0
      },
    },
    setup(props, {emit}) {
      const store = useStore();

      const documentEl: Ref<any> = ref(null);
      const isActive: Ref<boolean> = ref(false);
      const dropBorder: Ref<string | null> = ref(null);
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
          offsetLeft: documentEl?.value?.offsetLeft ? documentEl.value.offsetLeft : 0,
          offsetTop: documentEl?.value?.offsetTop ? documentEl.value.offsetTop : 0,
          offsetWidth: documentEl?.value?.offsetWidth ? documentEl.value.offsetWidth : 0,
          offsetHeight: documentEl?.value?.offsetHeight ? documentEl.value.offsetHeight : 0,
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
          categoryItem: props.categoryIndex,
          documentItem: props.index,
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

      $(document).on('mousedown', () => {
        if(!isActive.value) {
          itemCoords = getItemCoords()
        }
      })

      function onTransitionEnd(event: any) {
        itemCoords = getItemCoords()
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
          documentEl.value.offsetLeft - event.pageX,
          documentEl.value.offsetTop - event.pageY
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

          clone.css('left', (mousePosition.x + offset[0]) + 'px')
          clone.css('top', (mousePosition.y + offset[1]) + 'px')
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
        clone = $(documentEl.value)
          .clone()
          .css('margin-left', '0')
          .css('left', (documentEl.value.offsetLeft) + 'px')
          .css('top', (documentEl.value.offsetTop) + 'px')
          .css('z-index', '1')
          .css('background-color', '#fff')
          .css('transition', 'box-shadow 0.2s ease-in-out')
          .css('box-shadow', '0px 0px 8px #0066FF')
          .css('width', $(documentEl.value).prop('clientWidth') + 2 + 'px')
        clone.find('svg.delete path').css('fill', '#0066FF')
        $(document.body).before(clone);
        clone.css('position', 'absolute')
        isActive.value = true;
      }

      const onDrop = (event: any) => {
        dropBorder.value = null
        if(!isActive.value) {
          if(draggedItem.value.documentItem !== -1 && !isActive.value) {
            store.dispatch('data/replaceDocument', {
              draggedItem: draggedItem.value,
              currentItem: {
                categoryItem: currentItem.value.categoryItem,
                documentItem: currentItem.value.documentItem + 1
              },
            })
          }
        }
        x = y = false;
      }

      const onDragEnd = (event: any) => {
        $(document.body).css('user-select', 'all').css('overflow-x', 'auto')
        isActive.value = false;
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
        if(!isActive.value && mouseDown.value && draggedItem.value.documentItem !== -1) {
          dropBorder.value = 'document__drop-border-bottom'
        }
      }

      const onDragLeave = (event: any, ) => {
        dropBorder.value = null
      }

      const onDeleteDocument = () => {
        store.dispatch('data/deleteDocument', currentItem.value)
      }

      return {
        documentEl,
        isActive,
        dropBorder,

        onDeleteDocument,
        onTransitionEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,

        onDragStart,
        onDragEnd,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
        getItemCoords,

        draggedItem,
        currentItem
      };
    }
  })
</script>

<style scoped lang="sass">
.document
  overflow-y: hidden
  transition: opacity 0.3s ease-in-out
  &__
    &block
      overflow-y: hidden
      padding: .8rem 1.5rem
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
      &_icon
        position: absolute
        left: 50%
        top: 50%
        transform: translate(-50%, -50%)
    &description
      white-space: nowrap
    &settings
      margin-left: auto

.fade-move
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1)

</style>