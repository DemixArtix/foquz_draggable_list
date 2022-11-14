<template lang="pug">
.docs-list__block(class="mt-[2rem]")
  .container(@transitionend="getDropPlaceCoords")
    TransitionGroup(
      :name="transitionName"
    )
      Category(
        v-for="(category, index) in categoriesList"
        :key="category.id"
        :category="category"
        :index="category.index"
      )
    .docs-list__separator
    TransitionGroup(
      name="fade"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
    )
      Document(
        v-for="(document, index) in documentsList"
        :key="document.id" :document="document"
        :index="document.index"
        )
      .docs-list__drop-place.border-grey-light(ref="dropPlace" key="dropPlace")
</template>

<script lang="ts">
  import _ from 'lodash'
  import $ from 'jquery'
  //@ts-ignore
  import anime from "animejs/lib/anime.es";
  //@ts-ignore
  import Category from './category'
  //@ts-ignore
  import Document from './document'

  import Draggable from 'vuedraggable'

  import { defineComponent, onMounted, onUpdated, computed, ref, reactive } from 'vue'
  import { useStore } from 'vuex'

  import { Ref } from 'vue'
  import ICategory from "interfaces/ICategory";
  import IDocument from "interfaces/IDocument";
  import IItemCoords from "interfaces/IItemCoords";
  import IItem from "interfaces/IItem";

  export default defineComponent({
    name: "index",
    components: { Category, Document, Draggable },
    setup() {
      const store = useStore();

      const transitionName: Ref<string | null> = ref('fade');
      const dropPlace: Ref<any> = ref(null);
      let dropPlaceCoords: IItemCoords = {
        offsetLeft: 0,
        offsetTop: 0,
        offsetWidth: 0,
        offsetHeight: 0,
      }
      let x: boolean = false;
      let y: boolean = false;

      $(document).on('mousedown', function () {
        store.dispatch('data/setMouseDown', true)
      });
      $(document).on('mouseup', function () {
        store.dispatch('data/setMouseDown', false)
      });

      const getItemCoords = (): IItemCoords => {
        return {
          offsetLeft: dropPlace?.value?.offsetLeft ? dropPlace.value.offsetLeft : 0,
          offsetTop: dropPlace?.value?.offsetTop ? dropPlace.value.offsetTop : 0,
          offsetWidth: dropPlace?.value?.offsetWidth ? dropPlace.value.offsetWidth : 0,
          offsetHeight: dropPlace?.value?.offsetHeight ? dropPlace.value.offsetHeight : 0,
        }
      }

      const getDropPlaceCoords = () => {
        dropPlaceCoords = getItemCoords()
      }

      onMounted(() => {
        getDropPlaceCoords()
      });

      onUpdated(() => {
        getDropPlaceCoords()
      });

      function itemInSearchValue(string: string) {
        return string.toLowerCase().indexOf(searchValue.value.toLowerCase()) !== -1
      }

      const searchValue = computed<string>(() => store.getters['data/searchValue']);
      const draggedItem = computed<IItem>(() => store.getters['data/draggedItem']);
      const categoriesList = computed<ICategory[]>(() => {
        let categoriesList = _.cloneDeep(store.getters['data/categoriesList']);
        return searchValue.value.length > 0 ? categoriesList.reduce((acc: ICategory[], item: ICategory, index: number) => {
          item.documents = item.documents!.reduce((acc: IDocument[], item: IDocument, index: number) => {
            item.index = index;
            if(itemInSearchValue(item.title)) {
              acc.push(item)
            }
            return acc;
          }, []);
          item.index = index;
          if(itemInSearchValue(item.title) || item.documents.length > 0) {
            acc.push(item)
          }
          return acc;
        }, []) : categoriesList.map((item: ICategory, index: number) => {
          item.index = index;
          return item
        })
      });
      const documentsList = computed<IDocument[]>(() => {
        let docsList = store.getters['data/documentsList'].map((item: IDocument, index: number) => {
          item.index = index;
          return item
        })
        return searchValue.value.length > 0 ?
          docsList.filter((item: IDocument) => itemInSearchValue(item.title)) :
          docsList
      });
      const mouseDown = computed<boolean>(() => store.getters['data/mouseDown']);
      const draggedItemCoords = computed<IItemCoords>(() => store.getters['data/draggedItemCoords']);

      function onBeforeEnter(el: any) {
        el.style.height = 0
      }

      function onEnter(el: any, done: any) {
        let height = 36
        if($(el).hasClass('category')) {
          height = $(el).children().length * 3 + 16 * 4.96
          console.log(height)
        }
        anime({
          targets: el,
          height: '127' + 'px',
          easing: 'easeInOutQuad',
          duration: 500,
          complete: function(anim) {
            el.style.height = '';
            done();
          }
        });
      }

      function onBeforeLeave(el: any) {
        el.style.height = el.offsetHeight + 'px';
        el.style.overflow = 'hidden';
      }

      function onLeave(el: any, done: any) {
          $(el).slideUp(500, function () {
            done();
          })
      }

      $(document).on('mousemove', function (e) {
        if (mouseDown.value) {

          let a = dropPlaceCoords;
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
        if(x && y && draggedItem.value.documentItem !== -1) {
          onDrop(e)
        }
      })

      const onDrop = (event: any) => {
        onDragLeave(event)
        if(draggedItem.value.documentItem !== -1) {
          store.dispatch('data/replaceDocument', {
            draggedItem: draggedItem.value,
            currentItem: {
              categoryItem: -1,
              documentItem: 0
            },
          })
        }
        x = y = false;
      }

      const onDragOver = (event: any) => {
        if(mouseDown.value && draggedItem.value.documentItem !== -1) {
          $(dropPlace.value).addClass('docs-list__drop-place_active')
        }
      }

      const onDragLeave = (event: any, ) => {
        $(dropPlace.value).removeClass('docs-list__drop-place_active')
      }

      return {
        categoriesList,
        documentsList,

        transitionName,
        dropPlace,
        getDropPlaceCoords,

        onBeforeEnter,
        onBeforeLeave,
        onEnter,
        onLeave,
      }
    }

  })
</script>

<style scoped lang="sass">
.docs-list
  &__
    &block
    &separator
      height: 1.4rem
      & + .docs-list__drop-place
        height: 36px
        @apply border border-dashed
    &drop-place
        transition: height .3s, background-color .3s
        height: 1px
        @apply border-t
        &_active
          background-color: rgba($blue, .1)
          border-color: rgba($blue, .1)





</style>