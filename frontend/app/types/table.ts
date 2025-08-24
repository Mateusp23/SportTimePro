export interface TableColumn<T> {
  key: keyof T;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableAction<T> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (item: T) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}