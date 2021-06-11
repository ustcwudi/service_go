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
interface TableProps<T, Q> {
  display?: boolean;
  where?: Q;
  moreColumn?: Column<T, Q>[]; // 更多表格列
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
interface Column<T, Q> {
  name: string; // 键名
  label: string; // 表头
  nullable?: boolean; // 可空
  map?: { [key: string]: string }; // 键值对
  link?: string; // 外链
  size?: number; // 大小
  search?: string; // 搜索
  rules?: { check: (model: T) => boolean, message: string }[]; // 校验规则
  render?: (model: T) => string | number | JSX.Element | JSX.Element[]; // 表格内容渲染
  renderForm?: (column: Column<T, Q>, props: InputProps<T>) => string | number | JSX.Element | JSX.Element[]; // 表单渲染
  renderSearch?: (column: Column<T, Q>, props: InputProps<Q>) => string | number | JSX.Element | JSX.Element[]; // 搜索表单渲染
}

// 数据查询条件
interface QueryOption<T> {
  where: { trash: boolean } & T;
  sort: { field: string; order: string }[];
  pagination: { current?: number; pageSize?: number };
}

interface InputProps<T> {
  default?: T;
  onChange: (name: string, value: any) => void;
}