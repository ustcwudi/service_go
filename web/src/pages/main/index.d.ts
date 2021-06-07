// 菜单项
interface MenuItem {
  key?: string;
  title: string;
  path?: string;
  parent?: string;
  icon?: string;
  children?: MenuItem[];
}

// 表格属性
interface TableProps<T> {
  display?: boolean;
  where?: {};
  moreColumn?: Column<T>[]; // 更多表格列
  moreColumnButton?: (model: T) => JSX.Element[]; // 更多列按钮
  moreTableButton?: JSX.Element[]; // 更多表格按钮
  moreSelectionButton?: JSX.Element[]; // 更多选中按钮
  render?: string[]; // 指定渲染的列
  renderAdd?: string[]; // 指定新增的列
  renderUpdate?: string[]; // 指定修改的列
  renderSearch?: string[]; // 指定搜索的列
  renderColumnButton?: string[]; // 指定列按钮
  renderTableButton?: string[]; // 指定表格按钮
  renderSelectionButton?: string[]; // 指定选中按钮
  canSelect?: 'checkbox' | 'radio';
  onSelect?: (selection: T[]) => void;
}

// 表格列属性
interface Column<M> {
  key: string; // 键名
  title: string; // 表头
  ellipsis?: boolean;
  render?: (model: M) => string | JSX.Element | JSX.Element[]; // 表格内容渲染
  renderForm?: (props: FormItemProps) => string | JSX.Element | JSX.Element[]; // 表单渲染
  renderSearch?: (props: SearchItemProps) => string | JSX.Element | JSX.Element[]; // 搜索表单渲染
}

// 数据查询条件
interface QueryOption<T> {
  where: { trash: boolean } & T;
  sort: { field: string; order: string }[];
  pagination: { current?: number; pageSize?: number };
}

// 表单项属性
interface FormItemParam {
  name: string;
  label: string;
  nullable: boolean;
  map?: { [key: string]: string };
  link?: string;
  size?: number;
  password?: boolean;
  rules?: any[];
}

interface FormItemProps {
  default: any;
  onChange: (name: string, value: any) => void;
}

// 搜索项属性
interface SearchItemParam {
  name: string;
  label: string;
  nullable: boolean;
  map?: { [key: string]: string };
  link?: string;
  search?: string;
  rules?: any[];
}

interface SearchItemProps {
  default: any;
  onChange: (name: string, value: any) => void;
}