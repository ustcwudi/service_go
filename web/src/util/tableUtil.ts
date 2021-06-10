// 显示过滤
export function filter<T>(columns: Column<T>[], render: string[] | undefined) {
  return render ? render.map(key => columns.find(column => column.name == key)) : columns
};

// 表单项过滤
export function formFilter<T>(columns: Column<T>[], render: string[] | undefined) {
  return render ? render.map(key => columns.find(column => column.name == key)?.renderForm) : columns.map(column => column.renderForm)
};

// 搜索项过滤
export function searchFilter<T>(columns: Column<T>[], render: string[] | undefined) {
  return render ? render.map(key => columns.find(column => column.name == key)?.renderSearch) : columns.map(column => column.renderSearch)
};

// 按钮过滤
export function buttonFilter(columnButtons: { [key: string]: JSX.Element }, render: string[] | undefined, extra?: JSX.Element[]) {
  let buttons = render ? render.map(k => columnButtons[k]) : Object.values(columnButtons)
  return extra ? buttons.concat(extra) : buttons
};