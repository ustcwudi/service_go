
// 重定义Nullable字段，因为空值定义与useRequest相反
export function exchangeNullable(model: any) {
    let map = new Map(Object.entries(model));
    map.forEach((value: any, key) => {
        if (value === null) map.delete(key)
        else if (value === undefined) map.set(key, null)
    });
    return Object.fromEntries(map);
}

// 显示过滤
export function filter<T>(allColumns: { [key: string]: Column<T> }, render: string[] | undefined, extra?: Column<T>[]) {
    let columns: Column<T>[] = []
    if (render !== undefined) {
        render.forEach(k => {
            let value = allColumns[k]
            if (value && value.render)
                columns.push(value)
        })
        if (extra) {
            columns.push(...extra)
        }
        if (!render.includes('_')) {
            columns.pop()
        }
    } else {
        for (let value of Object.values(allColumns)) {
            if (value.render)
                columns.push(value)
        }
        if (extra) {
            columns.push(...extra)
        }
    }
    return columns;
};

// 表单项过滤
export function formFilter<T>(allColumns: { [key: string]: Column<T> }, render: string[] | undefined) {
    let columns = []
    if (render !== undefined) {
        render.forEach(k => {
            let value = allColumns[k]
            if (value && value.renderForm)
                columns.push(value.renderForm)
        })
    } else {
        for (let value of Object.values(allColumns)) {
            if (value.renderForm)
                columns.push(value.renderForm)
        }
    }
    return columns;
};

// 搜索项过滤
export function searchFilter<T>(allColumns: { [key: string]: Column<T> }, render: string[] | undefined) {
    let columns = []
    if (render !== undefined) {
        render.forEach(k => {
            let value = allColumns[k]
            if (value && value.renderSearch)
                columns.push(value.renderSearch)
        })
    } else {
        for (let value of Object.values(allColumns)) {
            if (value.renderSearch)
                columns.push(value.renderSearch)
        }
    }
    return columns;
};

// 按钮过滤
export function buttonFilter(columnButtons: { [key: string]: JSX.Element }, render: string[] | undefined, extra?: JSX.Element[]) {
    if (render !== undefined) {
        let buttons: JSX.Element[] = [];
        render.forEach(k => {
            let value = columnButtons[k]
            if (value)
                buttons.push(value)
        });
        if (extra)
            buttons.push(...extra)
        return buttons;
    } else {
        if (extra) {
            let buttons = Object.values(columnButtons);
            buttons.push(...extra)
            return buttons;
        }
        else
            return Object.values(columnButtons)
    }
};