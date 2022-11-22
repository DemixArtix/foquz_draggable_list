//for future code drying

import $ from 'jquery'

import { computed, ref, reactive, watch } from 'vue'
import { useStore } from 'vuex'

import { Ref } from 'vue'
import IItemCoords from "interfaces/IItemCoords";
import IItem from "interfaces/IItem";
// @ts-ignore
import IMousePosition from "interfaces/IMousePosition";


interface IMousePosition {
  x: number
  y: number
}

interface dragItemParams {
  clone: any,
  dropBorder: Ref<string | null>,
  isActive: Ref<boolean>,
  element: Ref<any>,
  mousePosition: IMousePosition,
  offset: number[],
  mouseDown: Ref<boolean>,
  currentItem: Ref<IItem>,
  draggedItem: Ref<IItem>,
  onDrop: any,
  onDragOver: any,
}

//export default function (props: any) {
export default function ({
  clone,
  dropBorder,
  isActive,
  element,
  mousePosition,
  offset,
  currentItem,
  onDrop,
  onDragOver,
}: dragItemParams) {

  const store = useStore();

  const getItemCoords = (el: any): IItemCoords => {
    return {
      offsetLeft: el?.value?.offsetLeft ? el.value.offsetLeft : 0,
      offsetTop: el?.value?.offsetTop ? el.value.offsetTop : 0,
      offsetWidth: el?.value?.offsetWidth ? el.value.offsetWidth : 0,
      offsetHeight: el?.value?.offsetHeight ? el.value.offsetHeight : 0,
    }
  }


  const onDragStart = (event: any) => {
    $(document.body).css('user-select', 'none').css('overflow-x', 'hidden')
    clone = $(element.value)
      .clone()
      .css('left', (element.value.offsetLeft) + 'px')
      .css('top', (element.value.offsetTop) + 'px')
      .css('z-index', '1')
      .css('background-color', '#fff')
      .css('transition', 'box-shadow 0.2s ease-in-out')
      .css('box-shadow', '0px 0px 8px #0066FF')
      .css('width', $(element.value).prop('clientWidth') + 2 + 'px')
    clone.find('svg.delete path').css('fill', '#0066FF')
    $(document.body).before(clone);
    clone.css('position', 'absolute')
    isActive.value = true;
  }


  const onDragEnd = () => {
    $(document.body).css('user-select', 'all').css('overflow-x', 'auto')
    clone.remove()
    store.dispatch('data/setDraggedItemCoords', {
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    })
  }

  const onDragLeave = (event: any, ) => {
    dropBorder.value = null
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

  const onMouseDown = (event: any) => {
    store.dispatch('data/setDraggedItem', currentItem);
    offset = [
      element.value.offsetLeft - event.pageX,
      element.value.offsetTop - event.pageY
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

  return {
    onDrag,
    onDragStart,
    onDragLeave,
    onDragEnd,
    getItemCoords,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onMouseDown,
  }

}