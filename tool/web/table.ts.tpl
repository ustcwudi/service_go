import React, { useState, useEffect, useContext, useMemo } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { message } from 'antd';
import { useRequest } from 'umi';
import allColumns from './columns';
import { filter, formFilter, searchFilter, buttonFilter } from '@/util/tableUtil'
import Table from '@material-ui/core/Table';
import Collapse from '@material-ui/core/Collapse';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import LinearProgress from '@material-ui/core/LinearProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TableHead from '@/component/table/table_head';
import TableToolbar from '@/component/table/table_toolbar';
import TableBody from '@/component/table/table_body'
import PaginationAction from '@/component/table/pagination_action';
import ModalForm from '@/component/modal/modal_form';
import FileUpload from '@/component/input/file_upload';
import IconButton from '@/component/icon/icon_button';
import context from '@/pages/main/context'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

export default (props: TableProps<{{.Name}}>) => {
  const classes = useStyles();
  const mainContext = useContext(context);
  // 数据源
  const [source, setSource] = useState<{ data: {{.Name}}[]; total: number }>({ data: [], total: 0 });
  // 表格消息
  const [tableSignal, setTableSignal] = useState<{ message?: 'select_all' | 'select_none' }>({});
  // 选中项
  const [selection, setSelection] = useState<{ rows: {{.Name}}[]; keys: string[] }>({ rows: [], keys: [] });
  // 查询参数
  const [trash, setTrash] = useState<boolean>(false);
  const [where, setWhere] = useState<any>({});
  const [sort, setSort] = useState<[]>([]);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({ current: 1, pageSize: 10 });
  // 列属性表
  const columns = useMemo(() => {
    return filter(allColumns(), props.render, props.moreColumn ? [...props.moreColumn, {
      title: '', key: '_', render: (model: {{.Name}}) => buttonFilter(columnButtons(model), props.renderColumnButton, props.moreColumnButton?.(model))
    }] : [{
      title: '', key: '_', render: (model: {{.Name}}) => buttonFilter(columnButtons(model), props.renderColumnButton, props.moreColumnButton?.(model))
    }])
  }, []);
  // 查询状态
  const [search, setSearch] = useState<boolean>(false);
  const searchBar = useMemo(() => {
    return search ? <Toolbar><Grid container className={classes.searchForm} spacing={3}>
      {searchFilter(allColumns(), props.renderSearch).map(v => v({ onChange: (k, v) => { where[k] = v; setWhere({ ...where }) } }))}
    </Grid></Toolbar> : setWhere({})
  }, [search])
  // 新增状态
  const [add, setAdd] = useState<boolean>(false);
  const addModal = useMemo(() => {
    let record: any = new{{.Name}}();
    return add ? <ModalForm title="新增" visible={true} onCancel={() => setAdd(false)} onFinish={() => insert.run(record)}>
      {formFilter(allColumns(), props.renderAdd).map(v => v({ default: record, onChange: (k, v) => record[k] = v }))}
    </ModalForm> : undefined
  }, [add])
  // 修改状态
  const [modify, setModify] = useState<{{.Name}} | undefined>(undefined);
  const modifyModal = useMemo(() => {
    let record: any = {};
    return modify ? <ModalForm title="修改" visible={true} onCancel={() => setModify(undefined)}
      onFinish={() => { update.run({ patch: record, where: { id: modify.id } }); }}>
      {formFilter(allColumns(), props.renderUpdate).map(v => v({ default: modify, onChange: (k, v) => record[k] = v }))}
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
          setTableSignal({ message: "select_none" });
          message.success(`${trash ? '还原' : '删除'}${result.data}项`);
        } else
          message.warning(`${trash ? '还原' : '删除'}${result.data}项`);
      } else {
        message.error(`${trash ? '还原' : '删除'}失败`);
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
          message.success('修改成功');
        } else {
          message.error('修改失败');
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
          message.success('新增成功');
        } else {
          message.error('新增失败');
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
            setTableSignal({ message: "select_none" });
            message.success(`彻底删除${result.data}项`);
          } else
            message.warning(`彻底删除${result.data}项`);
        } else {
          message.error(`彻底删除失败`);
        }
      },
    },
  );
  // 列按钮
  const columnButtons = (model: {{.Name}}): { [key: string]: JSX.Element } => {
    return {
      'update': <IconButton key="upload" title="修改" icon="Edit" color="default" onClick={() => setModify(model)} />,
      {{- if .Upload}}{{range .Fields}}{{if .Upload}}
      'upload{{.Name}}': <FileUpload key="upload{{.Name}}"
        data={ {id: model.id}} action={"/api/admin/{{u $.Name}}/upload/{{u .Name}}"}
        onUpload={(file: any) => { model.{{u .Name}} = file; setSource({ data: [...source.data], total: source.total }); }}>
        <IconButton color="default" title="上传{{.Description}}" icon="CloudUpload" /></FileUpload>,
      {{- end}}{{end}}{{end}}
    }
  }
  // 表格按钮
  const tableButtons = (): { [key: string]: JSX.Element } => {
    return {
      'add': <IconButton key="add" icon="Add" title="新增" onClick={() => setAdd(true)} />,
      'search': <IconButton key="search" icon="Search" title="搜索" color={search ? "primary" : "default"} onClick={() => setSearch(!search)} />,
      'refresh': <IconButton key="refresh" title="刷新" icon="Refresh" onClick={(e: any) => setWhere({ ...where })} />,
      'import': <FileUpload key="import" action={"/api/admin/{{u $.Name}}/import"}
        onUpload={(list: any) => { message.info(`导入${list.length}项数据`); setWhere({}); }}>
        <IconButton title="导入" icon="Publish" />
      </FileUpload>,
      'trash': trash ? <IconButton key="trash" title="回收站" icon="DeleteOutline" onClick={(e: any) => {
        message.info("离开回收站"); setTrash(!trash); setTableSignal({ message: "select_none" });
      }} />
        : <IconButton key="trash" title="回收站" color="default" icon="DeleteOutline" onClick={(e: any) => {
          message.info("进入回收站"); setTrash(!trash); setTableSignal({ message: "select_none" });
        }} />
    }
  }
  // 选中按钮
  const selectionButtons = (): { [key: string]: JSX.Element } => {
    return {
      'trash': <IconButton key="trash" title={trash ? "恢复" : "删除"} color="default"
        icon={trash ? "SettingsBackupRestore" : "Delete"} onClick={(e: any) => {
          if (trash) {
            action.run('restore', { id: selection.keys });
          } else {
            action.run('trash', { id: selection.keys });
          }
        }} />,
      'delete': <IconButton key="delete" title={"彻底删除"} icon="DeleteForever" onClick={() => remove.run({ id: selection.keys })} />
    }
  }

  // 模板
  return <Collapse in={props.display !== false}><Paper elevation={5}>
    <TableToolbar
      title={mainContext.title ? mainContext.title : "用户"}
      numSelected={selection.keys.length}
      tableButtons={buttonFilter(tableButtons(), props.renderTableButton, props.moreTableButton)}
      selectionButtons={buttonFilter(selectionButtons(), props.renderSelectionButton, props.moreSelectionButton)}
    />
    {searchBar}
    {loading ? <LinearProgress color={trash ? "secondary" : "primary"} /> : <LinearProgress color={trash ? "secondary" : "primary"} variant="determinate" value={100} />}
    <TableContainer>
      <Table size="small">
        <TableHead<{{.Name}}> columns={columns} type={props.canSelect}
          onSelectAllClick={(e) => setTableSignal(e.target.checked ? { message: "select_all" } : { message: "select_none" })} />
        <TableBody<{{.Name}}> dataSource={source.data} columns={columns} selectType={props.canSelect} signal={tableSignal}
          onSelectChange={(records: any[]) => { setSelection({ rows: records, keys: records.map(v => v.id) }); props.onSelect?.(records) }}
        />
      </Table>
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