import IDocument from "./IDocument";

export default interface ICategory {
  id: number,
  index?: number,
  title: string,
  description: string,
  isCategory: boolean,
  expanded: boolean,
  documents: IDocument[],
}