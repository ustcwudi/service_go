import React, { useState, useEffect, useContext, useMemo } from 'react';
import { makeStyles, lighten, Theme, createStyles } from '@material-ui/core/styles';
import { useRequest } from 'umi';
import allColumns from './columns';
import { filter, formFilter, searchFilter, buttonFilter } from '@/util/tableUtil'
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import LinearProgress from '@material-ui/core/LinearProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@/component/table/table'
import PaginationAction from '@/component/table/pagination';
import ModalForm from '@/component/modal/modal_form';
import FileUpload from '@/component/input/file_upload';
import IconButton from '@/component/icon/icon_button';
import context from '@/pages/main/context'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flex: '1 1 100%',
    },
    searchForm: {
      margin: 0,
    }
  }),
);

const new{{.Name}} = () => {
  return {
    {{- range .Fields}}{{if not .Nullable}}
    {{- if eq .Type "string"}}
    {{c .Name}}: "",
    {{- else if eq .Type "bool"}}
    {{c .Name}}: false,
    {{- else if or (eq .Type "int") (eq .Type "float")}}
    {{c .Name}}: 0,
    {{- else if or (eq .Type "int[]") (eq .Type "float[]") (eq .Type "string[]") (eq .Type "id[]")}}
    {{c .Name}}: [],
    {{- else if or (eq .Type "map[string]int") (eq .Type "map[string]float") (eq .Type "map[string]string") (eq .Type "map[string]string[]")}}
    {{c .Name}}: {},
    {{- else}}
    {{c .Name}}: null,
    {{- end}}{{end}}{{end}}
  }
}

// 映射关联字段
const mapData = (result: any) => {
  {{- range .Fields}}
  {{- if eq .Name "Password"}}
  result.data.forEach((i: any) => i.password = null);
  {{- else if .Link}}
  /* 处理外键-{{.Description}} */
  {{- if eq .Type "id[]"}}
  result.data.forEach((i: any) => {
    i.{{c .Name}} = i.{{c .Name}} ? i.{{c .Name}}.map((value: any) => {
      let find = result.map.{{c .Name}} ? result.map.{{c .Name}}.find((n: {{.Link}}) => n.id === value) : undefined;
      return find ? find : value;
    }) : [];
  });
  {{- else if eq .Type "id"}}
  result.data.forEach((i: {{$.Name}}) => {
    let find = result.map.{{c .Name}} ? result.map.{{c .Name}}.find((n: {{.Link}}) => n.id === i.{{c .Name}}) : undefined;
    if (find) i.{{c .Name}} = find;
  });
  {{- end}}{{end}}{{end}}
}

export default (props: TableProps<{{.Name}}, {{.Name}}Query>) => {
  const classes = useStyles();
  const mainContext = useContext(context);
  // 数据源
  const [source, setSource] = useState<{ data: {{.Name}}[]; total: number }>({ data: [], total: 0 });
  // 选中项
  const [selection, setSelection] = useState<{{.Name}}[]>([]);
  // 查询参数
  const [trash, setTrash] = useState<boolean>(false);
  const [where, setWhere] = useState<{{.Name}}Query>({});
  const [sort, setSort] = useState<[]>([]);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({ current: 1, pageSize: 10 });
  // 查询状态
  const [search, setSearch] = useState<boolean>(false);
  const searchBar = useMemo(() => {
    return search ? <Toolbar><Grid container className={classes.searchForm} spacing={3}>
      {searchFilter(allColumns(), props.renderSearch).map(v => v ? v({ onChange: (k, v) => { where[k] = v; setWhere({ ...where }) } }) : undefined)}
    </Grid></Toolbar> : setWhere({})
  }, [search])
  // 新增状态
  const [add, setAdd] = useState<boolean>(false);
  const addModal = useMemo(() => {
    let record: any = new{{.Name}}();
    return add ? <ModalForm title="新增" visible={true} onCancel={() => setAdd(false)} onFinish={() => { if (verify(record)) insert.run(record) }}>
      {formFilter(allColumns(), props.renderAdd).map(v => v ? v({ default: record, onChange: (k, v) => record[k] = v }) : undefined)}
    </ModalForm> : undefined
  }, [add])
  // 修改状态
  const [modify, setModify] = useState<{{.Name}} | undefined>(undefined);
  const modifyModal = useMemo(() => {
    let record: any = {};
    return modify ? <ModalForm title="修改" visible={true} onCancel={() => setModify(undefined)}
      onFinish={() => { if (verify(record)) update.run({ patch: record, where: { id: modify.id } }); }}>
      {formFilter(allColumns(), props.renderUpdate).map(v => v ? v({ default: modify, onChange: (k, v) => record[k] = v }) : undefined)}
    </ModalForm> : undefined
  }, [modify])
  // [废弃/还原]请求
  const action = useRequest((action: string, form: object) => ({
    url: `/api/admin/{{u .Name}}/${action}`,
    method: 'put',
    data: form,
  }), {
    manual: true,
    onSuccess: (result: any, params: any) => {
      // 确认数量
      if (result.success) {
        if (result.data == params[1].id.length) {
          params[1].id.forEach((id: string) => {
            source.data.splice(source.data.findIndex(row => row.id === id), 1);
          });
          setSource({ data: [...source.data], total: source.total - result.data });
          setSelection([]);
          mainContext.alert?.({ type: 'success', message: `${trash ? '还原' : '删除'}${result.data}项` })
        } else
          mainContext.alert?.({ type: 'warning', message: `${trash ? '还原' : '删除'}${result.data}项` })
      } else {
        mainContext.alert?.({ type: 'error', message: `${trash ? '还原' : '删除'}失败` })
      }
    },
  });
  // 查询请求
  const { loading } = useRequest({
    url: '/api/admin/{{u .Name}}/list',
    method: 'post',
    data: { where: { trash: trash, ...where, ...props.where }, sort: sort, pagination: pagination },
    {{- if .Link}}
    headers: {
      Link: "{{range .Fields}}{{if .Link}}{{c .Name}},{{end}}{{end}}" // 关联查询
    }
    {{- end}}
  }, {
    refreshDeps: [trash, where, sort, pagination], // 自动触发
    debounceInterval: 500,
    onSuccess: (result: any) => {
      if (result.data != null) {
        mapData(result);
        setSource({ data: result.data, total: result.total });
      } else {
        setSource({ data: [], total: 0 });
      }
    },
  });
  // 修改请求
  const update = useRequest(
    data => ({
      url: `/api/admin/{{u .Name}}`,
      method: 'put',
      data: data,{{if .Link}}
      headers: {
        Link: "{{range .Fields}}{{if .Link}}{{c .Name}},{{end}}{{end}}"
      }{{end}}
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        if (result.success) {
          mapData(result);
          result.data.forEach((element: {{.Name}}) => {
            const index = source.data.findIndex((row: any) => row.id === element.id);
            if (index !== -1) source.data[index] = element;
          });
          setSource({ data: [...source.data], total: source.total });
          setModify(undefined);
          mainContext.alert?.({ type: 'success', message: '修改成功' })
        } else {
          mainContext.alert?.({ type: 'error', message: '修改失败' })
        }
      },
    },
  );
  // 新增请求
  const insert = useRequest(
    data => ({
      url: `/api/admin/{{u .Name}}`,
      method: 'post',
      data: data,
      {{- if .Link}}
      headers: {
        Link: "{{range .Fields}}{{if .Link}}{{c .Name}},{{end}}{{end}}"
      }
      {{- end}}
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        if (result.success) {
          if (source.data.length === pagination.pageSize) source.data.pop();
          mapData({ data: [result.data], map: result.map });
          source.data.unshift(result.data);
          setSource({ data: [...source.data], total: source.total + 1 });
          setAdd(false);
          mainContext.alert?.({ type: 'success', message: '新增成功' })
        } else {
          mainContext.alert?.({ type: 'error', message: '新增失败' })
        }
      },
    },
  );
  // 删除请求
  const remove = useRequest(
    data => ({
      url: `/api/admin/{{u .Name}}`,
      method: 'delete',
      data: data
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        // 确认数量
        if (result.success) {
          if (result.data == params[0].id.length) {
            params[0].id.forEach((id: string) => {
              source.data.splice(source.data.findIndex(row => row.id === id), 1);
            });
            setSource({ data: [...source.data], total: source.total - result.data });
            setSelection([]);
            mainContext.alert?.({ type: 'success', message: `彻底删除${result.data}项` })
          } else
            mainContext.alert?.({ type: 'warning', message: `彻底删除${result.data}项` })
        } else {
          mainContext.alert?.({ type: 'error', message: '彻底删除失败' })
        }
      },
    },
  );

  // 列表
  const columns = useMemo(() => {
    let operation = {
      name: '_', label: '', render: (model: {{.Name}}) => buttonFilter({
        'update': <IconButton key="upload" title="修改" icon="Edit" color="default" onClick={() => setModify(model)} />,
        {{- if .Upload}}{{range .Fields}}{{if .Upload}}
        'upload{{.Name}}': <FileUpload key="upload{{.Name}}"
          data={ {id: model.id }} action={"/api/admin/{{u $.Name}}/upload/{{u .Name}}"}
          onUpload={(file: any) => { model.{{u .Name}} = file; setSource({ data: [...source.data], total: source.total }); }}>
          <IconButton color="default" title="上传{{.Description}}" icon="CloudUpload" /></FileUpload>,
        {{- end}}{{end}}{{end}}
      }, props.renderColumnButton, props.moreColumnButton?.(model))
    }
    return filter(props.moreColumn ? [...allColumns(), ...props.moreColumn, operation] : [...allColumns(), operation], props.render)
  }, []);

  // 工具栏
  const tableBar = useMemo(() => {
    let buttons = {
      'add': <IconButton key="add" icon="Add" title="新增" onClick={() => setAdd(true)} />,
      'search': <IconButton key="search" icon="Search" title="搜索" color={search ? "primary" : "default"} onClick={() => setSearch(!search)} />,
      'refresh': <IconButton key="refresh" title="刷新" icon="Refresh" onClick={(e: any) => setWhere({ ...where })} />,
      'import': <FileUpload key="import" action={"/api/admin/{{u $.Name}}/import"}
        onUpload={(list: any) => { mainContext.alert?.({ type: 'info', message: `导入${list.length}项数据` }); setWhere({}); }}>
        <IconButton title="导入" icon="Publish" />
      </FileUpload>,
      'trash': <IconButton key="trash" title="回收站" color={trash ? "primary" : "default"} icon="DeleteOutline"
        onClick={() => { mainContext.alert?.({ type: 'warning', message: trash ? "离开回收站" : "进入回收站" }); setTrash(!trash); setSelection([]); }} />
    }
    return <Toolbar>
      <Typography className={classes.title} variant="h6" component="div">
        {mainContext.title}
      </Typography>
      {buttonFilter(buttons, props.renderTableButton, props.moreTableButton)}
    </Toolbar>
  }, [trash, search])

  // 选择工具栏
  const selectionBar = useMemo(() => {
    let buttons: { [key: string]: JSX.Element } = trash ? {
      'unselect': <IconButton key="unselect" color="default" title="取消" icon="Replay" onClick={() => setSelection([])} />,
      'trash': <IconButton key="trash" title="恢复" color="default" icon="SettingsBackupRestore" onClick={() => action.run('restore', { id: selection.map(i => i.id) })} />,
      'delete': <IconButton key="delete" title="彻底删除" icon="DeleteForever" onClick={() => remove.run({ id: selection.map(i => i.id) })} />
    } : {
      'unselect': <IconButton key="unselect" color="default" title="取消" icon="Replay" onClick={() => setSelection([])} />,
      'trash': <IconButton key="trash" title="删除" icon="Delete" onClick={() => action.run('trash', { id: selection.map(i => i.id) })} />,
    }
    return <Toolbar>
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        选中 {selection.length} 项
      </Typography>
      {buttonFilter(buttons, props.renderSelectionButton, props.moreSelectionButton)}
    </Toolbar>
  }, [trash, selection])

  // 验证字段
  const verify = (record: any) => {
    let columns = allColumns()
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      let value = record[column.name]
      if (column.nullable && value === null) {
        // allow null
      } else if (value === undefined) {
        // modify allow undefined
      } else if (column.rules) {
        for (let index = 0; index < column.rules.length; index++) {
          const rule = column.rules[index];
          if (!rule.check(record)) {
            mainContext.alert?.({ type: 'error', message: rule.message })
            return false
          }
        }
      }
    }
    return true
  }

  // 模板
  return <Collapse in={props.display !== false}><Paper elevation={5}>
    {selection.length ? selectionBar : tableBar}
    {searchBar}
    {loading ? <LinearProgress color={trash ? "secondary" : "primary"} /> : <LinearProgress color={trash ? "secondary" : "primary"} variant="determinate" value={100} />}
    <TableContainer>
      <Table<{{.Name}}, {{.Name}}Query> size="small" dataSource={source.data} selection={selection} columns={columns} selectType={props.canSelect}
        onSelectChange={(records: {{.Name}}[]) => { setSelection(records); props.onSelect?.(records) }} />
    </TableContainer>
    <TablePagination
      component="div"
      labelRowsPerPage="分页"
      labelDisplayedRows={() => `${pagination.current} / ${Math.ceil(source.total / pagination.pageSize)}`}
      page={pagination.current - 1}
      count={source.total}
      rowsPerPage={pagination.pageSize}
      rowsPerPageOptions={[10, 20, 50, 100]}
      ActionsComponent={PaginationAction}
      onChangePage={(event: unknown, page: number) => {
        setPagination({ current: page + 1, pageSize: pagination.pageSize })
      }}
      onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) => {
        setPagination({ current: 1, pageSize: parseInt(event.target.value, 10) })
      }}
    />
    {addModal}
    {modifyModal}
  </Paper></Collapse>
};