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
  import IMousePosition from "interfaces/IMousePosition";

  import dragItem from 'mixins/dragItem';

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

      const draggedItem = computed<IItem>(() => store.getters['data/draggedItem']);
      const currentItem = computed<IItem>(() => {
        return {
          categoryItem: props.categoryIndex,
          documentItem: props.index,
        }
      });
      const mouseDown = computed<boolean>(() => store.getters['data/mouseDown']);
      const draggedItemCoords = computed<IItemCoords>(() => store.getters['data/draggedItemCoords']);

      onMounted(() => {
        itemCoords = getItemCoords(documentEl)
      });

      onUpdated(() => {
        itemCoords = getItemCoords(documentEl)
      });

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
          itemCoords = getItemCoords(documentEl)
        }
      })

      function onTransitionEnd(event: any) {
        itemCoords = getItemCoords(documentEl)
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

      const onDragOver = (event: any) => {
        if(!isActive.value && mouseDown.value && draggedItem.value.documentItem !== -1) {
          dropBorder.value = 'document__drop-border-bottom'
        }
      }

      const onDeleteDocument = () => {
        store.dispatch('data/deleteDocument', currentItem.value)
      }

      const {
        onDrag,
        onDragStart,
        onDragLeave,
        onDragEnd,
        getItemCoords,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        onMouseDown,
      } = dragItem({
        clone,
        dropBorder,
        isActive,
        element: documentEl,
        mousePosition,
        offset,
        mouseDown,
        draggedItem,
        currentItem,
        onDrop,
        onDragOver
      });

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