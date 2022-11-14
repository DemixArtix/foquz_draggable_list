import ICategory from "@/interfaces/ICategory";
import IDocument from "@/interfaces/IDocument";
import IItem from "interfaces/IItem";
import IItemCoords from "interfaces/IItemCoords";

type replaceCategoryParams = {
  draggedItem: number,
  currentItem: number,
}
type replaceDocumentParams = {
  draggedItem: IItem,
  currentItem: IItem,
}

function createId() {
  return Math.round(+Math.random().toFixed(6) * 10000000)
}


export default ({
  namespaced: true,
  state: {
    categoriesList: [
    {
      id: createId(),
      title: 'Обязательные для всех',
      description: 'Документы, обязательные для всех сотрудников без исключения',
      documents: [
        {
          id: createId(),
          title: 'Паспорт',
          description: 'Для всех',
          required: true
        },
        {
          id: createId(),
          title: 'Инн',
          description: 'Для всех',
          required: true
        }
      ]
    },
    {
      id: createId(),
      title: 'Обязательные для трудоустройства',
      description: 'Документы, без которых невозможно трудоустройство человека на какую бы то ни было должность в компании вне зависимости от граж',
      documents: [
        {
          id: createId(),
          title: 'Тестовое задание кандидата',
          description: 'Россия, Белоруссия, Украина, администратор филиала, повар-сушист, повар-пиццмейкер, повар горячего цеха',
          required: true
        }
      ]
    },
    {
      id: createId(),
      title: 'Прочее',
      description: 'На какую бы то ни было должность в компании вне зависимости от граж',
      documents: [
        {
          id: createId(),
          title: 'Тестовое задание кандидата',
          description: 'Россия, Белоруссия, Украина, администратор филиала, повар-сушист, повар-пиццмейкер, повар горячего цеха',
          required: true
        },
        {
          id: createId(),
          title: 'Инн',
          description: 'Для всех',
          required: true
        }

      ]
    },] as ICategory[],
    documentsList: [
      {
        id: createId(),
        title: 'Тестовое задание кандидата',
        description: 'Россия, Белоруссия, Украина, администратор филиала, повар-сушист, повар-пиццмейкер, повар горячего цеха',
        required: false
      }, {
        id: createId(),
        title: 'Трудовой договор',
        description: '',
        required: false
      },
    ] as unknown as IDocument[],
    draggedItem: {
      categoryItem: -1,
      documentItem: -1,
    } as IItem,
    mouseDown: false as boolean,
    isColliding: false as boolean,
    draggedItemCoords: {
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    },
    searchValue: '',
  },
  getters: {
    categoriesList: ({categoriesList}: any) => categoriesList,
    documentsList: ({documentsList}: any) => documentsList,
    draggedItem: ({draggedItem}: any) => draggedItem,
    mouseDown: ({mouseDown}: any) => mouseDown,
    draggedItemCoords: ({draggedItemCoords}: any) => draggedItemCoords,
    searchValue: ({searchValue}: any) => searchValue,
  },
  mutations: {
    REPLACE_CATEGORY(state: any, {draggedItem, currentItem}: replaceCategoryParams) {
      state.categoriesList.splice(
        currentItem - (draggedItem > currentItem ? 1 : 0),
        0,
        JSON.parse(JSON.stringify(state.categoriesList.splice(draggedItem, 1)))[0]
      )
    },
    REPLACE_DOCUMENT(state: any, {draggedItem, currentItem}: replaceDocumentParams) {

      let draggedItemProcess = JSON.parse(JSON.stringify(eval(`state
      ${draggedItem.categoryItem == -1 ? `.documentsList` : `.categoriesList`}
      ${draggedItem.categoryItem == -1 ? `.splice(${draggedItem.documentItem}, 1)` : `[draggedItem.categoryItem].documents.splice(${draggedItem.documentItem}, 1)`}
      `)));

      eval(`state
      ${currentItem.categoryItem == -1 ? 
        `.documentsList` : 
        `.categoriesList`
      }
      ${currentItem.categoryItem == -1 ? 
        `.splice(${currentItem.documentItem}, 0, draggedItemProcess[0])` : 
        `[currentItem.categoryItem].documents.splice(${currentItem.documentItem}, 0, 
      draggedItemProcess[0])`
      }
      `);
    },
    SET_DRAGGED_ITEM(state: any, data: IItem) {
      state.draggedItem = data;
    },
    SET_MOUSE_DOWN(state: any, bool: boolean) {
      state.mouseDown = bool;
    },
    SET_DRAGGED_ITEM_COORDS(state: any, coords: IItemCoords) {
      state.draggedItemCoords = coords;
    },
    DELETE_CATEGORY(state: any, index: number) {
      state.categoriesList.splice(index, 1)
    },
    DELETE_DOCUMENT(state: any, item: IItem) {
      if(item.categoryItem == -1) {
        state.documentsList.splice(item.documentItem, 1)
      } else {
        state.categoriesList[item.categoryItem].documents.splice(item.documentItem, 1)
      }
    },
    SET_SEARCH_VALUE(state: any, value: string) {
      state.searchValue = value;
    },
  },
  actions: {
    replaceCategory({commit, state}: any, data: replaceCategoryParams) {
      commit('REPLACE_CATEGORY', data)
    },
    replaceDocument({commit, state}: any, data: replaceDocumentParams) {
      commit('REPLACE_DOCUMENT', data)
    },
    setDraggedItem({commit, state}: any, data: IItem) {
      commit('SET_DRAGGED_ITEM', data)
    },
    setMouseDown({commit, state}: any, bool: boolean) {
      commit('SET_MOUSE_DOWN', bool)
    },
    setDraggedItemCoords({commit, state}: any, coords: IItemCoords) {
      commit('SET_DRAGGED_ITEM_COORDS', coords)
    },
    deleteCategory({commit, state}: any, index: number) {
      commit('DELETE_CATEGORY', index)
    },
    deleteDocument({commit, state}: any, item: IItem) {
      commit('DELETE_DOCUMENT', item)
    },
    setSearchValue({commit, state}: any, value: string) {
      commit('SET_SEARCH_VALUE', value)
    },
  },
})