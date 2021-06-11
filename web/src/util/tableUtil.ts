// 显示过滤
export function filter<T, Q>(columns: Column<T, Q>[], render: string[] | undefined) {
  return render ? render.map(key => columns.find(column => column.name == key)) : columns
};

// 表单项过滤
export function formFilter<T, Q>(columns: Column<T, Q>[], render: string[] | undefined) {
  let list = render ? render.map(key => columns.find(column => column.name == key)) : columns
  return list.map(column => (props: InputProps<T>) => column?.renderForm?.(column, props))
};

// 搜索项过滤
export function searchFilter<T, Q>(columns: Column<T, Q>[], render: string[] | undefined) {
  let list = render ? render.map(key => columns.find(column => column.name == key)) : columns
  return list.map(column => (props: InputProps<Q>) => column?.renderSearch?.(column, props))
};

// 按钮过滤
export function buttonFilter(columnButtons: { [key: string]: JSX.Element }, render: string[] | undefined, extra?: JSX.Element[]) {
  let buttons = render ? render.map(k => columnButtons[k]) : Object.values(columnButtons)
  return extra ? buttons.concat(extra) : buttons
};