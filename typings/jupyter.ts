export interface INotebook {
  metadata: any;
  nbformat: number;
  nbformat_minor: number;
  cells: ICell[];
}

export interface ICell {
  cell_type: string;
  metadata: any;
  execution_count?: number;
  outputs?: any;
  output_type?: any;
  source: string | string[];
}
