import React, { useState, useEffect } from 'react';
import { message, Table, Button, Tooltip, Space, Typography, Card, Divider, Modal, Popover, Popconfirm } from 'antd';
import { useRequest, history, useModel } from 'umi';
import allColumns from './columns';
import ModalForm from '@/component/modal_form'
import FileUpload from '@/component/file_upload'
import { exchangeNullable, filter, formFilter, searchFilter, buttonFilter } from '@/util/tableUtil'
import { SearchOutlined, PlusOutlined, CloseOutlined, DeleteOutlined, LoginOutlined, RedoOutlined, LogoutOutlined, RollbackOutlined, CloudUploadOutlined, MinusOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const null{{.Name}} = () => {
  return {
    {{- range .Fields}}{{if .Search}}
    {{c .Name}}: null,
    {{- end}}{{end}}
    createTime: null
  }
}

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

// 反映射关联字段
const reverseMap = (model: any) => {
  {{- range .Fields}}{{if .Link}}
  // {{.Description}}
  {{- if eq .Type "id"}}
  if (model.{{c .Name}}) model.{{c .Name}} = model.{{c .Name}}.id ? model.{{c .Name}}.id : model.{{c .Name}};
  {{- else if eq .Type "id[]"}}
  if (model.{{c .Name}}) {
    let ids: string[] = [];
    model.{{c .Name}}.forEach((v: any) => v.id ? ids.push(v.id) : ids.push(v));
    model.{{c .Name}} = ids;
  }
  {{- end}}{{end}}{{end}}
  return model;
}

export default (props: TableProps<{{.Name}}>) => {
  // 数据源
  const [source, setSource] = useState<{ data: {{.Name}}[]; total: number }>({ data: [], total: 0 });
  // 选中项
  const [selection, setSelection] = useState<{ rows: {{.Name}}[]; keys: string[] }>({ rows: [], keys: [] });
  // 对话框
  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);
  // 查询参数
  const [trash, setTrash] = useState<boolean>(false);
  const [where, setWhere] = useState<object>(null{{.Name}}());
  const [sort, setSort] = useState<[]>([]);
  const [pagination, setPagination] = useState<{current: number; pageSize: number}>({ current: 1, pageSize: 15 });
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
          setSelection({ rows: [], keys: [] });
          message.success(`${trash?'还原':'删除'}${result.data}项`);
        } else
          message.warning(`${trash?'还原':'删除'}${result.data}项`);
      } else {
        message.error(`${trash?'还原':'删除'}失败`);
      }
    },
  });
  // 查询请求
  const { loading } = useRequest({
    url: '/api/admin/{{u .Name}}/list',
    method: 'post',
    data: { where: { trash: trash, ...reverseMap(exchangeNullable(where)), ...props.where }, sort: sort, pagination: pagination },
    {{- if .Link}}
    headers: {
      Link: "{{range .Fields}}{{if .Link}}{{c .Name}},{{end}}{{end}}" // 关联查询
    }
    {{- end}}
  }, {
    refreshDeps: [trash, where, sort, pagination], // 自动触发
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
          setModal(undefined);
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
          mapData({data: [result.data], map: result.map});
          source.data.unshift(result.data);
          setSource({ data: [...source.data], total: source.total + 1 });
          setModal(undefined);
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
            setSelection({ rows: [], keys: [] });
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
      'update': <Tooltip key="upload" title="修改"><EditOutlined onClick={e => {
        setModal(<Modal title={<Text strong>修改</Text>} visible={true} footer={null} onCancel={() => setModal(undefined)}>
          <ModalForm value={model} onFinish={(record: {{.Name}}) => { update.run({ patch: reverseMap(exchangeNullable(record)), where: {id: model.id} });} }>
            {formFilter(allColumns(), props.renderUpdate).map(v => v())}</ModalForm></Modal>)
        } }/></Tooltip>,
      {{- if .Upload}}{{range .Fields}}{{if .Upload}}
      'upload{{.Name}}': <FileUpload key="upload{{.Name}}"
        data={ {id: model.id}} action={"/api/admin/{{u $.Name}}/upload/{{u .Name}}"}
        onUpload={(file: any) => { model.{{u .Name}} = file; setSource({ data: [...source.data], total: source.total }); }}>
        <Tooltip title="上传{{.Description}}"><UploadOutlined /></Tooltip></FileUpload>,
      {{- end}}{{end}}{{end}}
    }
  }
  // 表格按钮
  const tableButtons = (): { [key: string]: JSX.Element } => {
    return {
      'add': <Tooltip key="add" title="新增">
        <Button shape="circle"
          icon={<PlusOutlined />}
          onClick={e => setModal(<Modal title={<Text strong>新增</Text>} visible={true} footer={null} onCancel={() => setModal(undefined)}>
            <ModalForm value={ new{{.Name}}() } onFinish={(record: {{.Name}}) => { insert.run(reverseMap(exchangeNullable(record)));} }>{formFilter(allColumns(), props.renderAdd).map(v => v())}</ModalForm></Modal>)}/>
      </Tooltip>,
      'search': <Popover key="search" placement="bottomRight" title={<Title style={ {marginTop: "8px"} } level={5}>搜索</Title>} trigger="click"
        content={<ModalForm style={ {width: '500px'} }
          onFinish={(values: any) => { setWhere(values) } }
          onReset={() => setWhere(null{{.Name}}())}
          value={null{{.Name}}()} >{searchItems}</ModalForm>}>
        <Tooltip title="搜索"><Button type={Object.keys(exchangeNullable(where)).length ? "primary" : undefined} shape="circle" icon={<SearchOutlined />} /></Tooltip>
      </Popover>,
      'refresh': <Tooltip key="refresh" title="刷新">
        <Button shape="circle" icon={<RedoOutlined />} onClick={e => setWhere({ ...where })} />
      </Tooltip>,
      'import': <FileUpload key="import" action={"/api/admin/{{u $.Name}}/import"}
        onUpload={(list: any) => { message.info(`导入${list.length}项数据`);setWhere(null{{.Name}}()); }}>
        <Tooltip title="导入"><Button shape="circle" icon={<CloudUploadOutlined />} /></Tooltip>
      </FileUpload>,
      'trash': <Tooltip key="trash" title={trash ? "离开回收站" : "进入回收站"}>
        {trash ? <Button shape="circle" icon={<LogoutOutlined />} onClick={e => {
          message.info("进入回收站"); setTrash(!trash); setSelection({ rows: [], keys: [] });
        }} />
          : <Button shape="circle" danger={true}
            icon={<LoginOutlined />} onClick={e => {
              message.info("离开回收站"); setTrash(!trash); setSelection({ rows: [], keys: [] });
            }} />}</Tooltip>
    }
  }
  // 选中按钮
  const selectionButtons = (): { [key: string]: JSX.Element } => {
    return {
      '|': <Divider key="|" type="vertical" />,
      'trash': <Tooltip key="trash" title={trash ? "恢复" : "回收"}>
        <Button danger={!trash ? true : undefined}
          icon={!trash ? <DeleteOutlined /> : <RollbackOutlined />}
          shape="circle" onClick={e => {
            if (trash) {
              action.run('restore', { id: selection.keys });
            } else {
              action.run('trash', { id: selection.keys });
            }
          }} />
      </Tooltip>,
      'delete': <Tooltip key="delete" title={"彻底删除"}>
        <Popconfirm placement="left" title="彻底删除后无法还原，继续操作？" onConfirm={() => remove.run({ id: selection.keys })}>
          <Button danger={true} shape="circle" icon={<MinusOutlined />} />
        </Popconfirm>
      </Tooltip>,
      'cancel': <Tooltip key="cancel" title={"取消选择"}>
        <Button shape="circle" icon={<CloseOutlined />} onClick={e => setSelection({ rows: [], keys: [] })} />
      </Tooltip>
    }
  }
  // 初始化搜索控件
  const [searchItems] = useState(searchFilter(allColumns(), props.renderSearch).map(v => v()));
  // 模板
  return (
    <Card style={props.style} title={<Title type={trash ? "danger" : undefined} level={4}> {{.Description}} </Title>}
      // 工具条
      extra={<Space>
        {buttonFilter(tableButtons(), props.renderTableButton, props.moreTableButton)}
        {
          // 选中工具条
          selection.rows.length > 0 ? buttonFilter(selectionButtons(), props.renderSelectionButton, props.moreSelectionButton) : undefined
        }
      </Space>}>
      <Table<{{.Name}}>
        size="small"
        columns={filter(allColumns(), props.render, props.moreColumn ? [...props.moreColumn, {
          title: '', key: '_', render: (model: {{.Name}}) => <Space>{buttonFilter(columnButtons(model), props.renderColumnButton, props.moreColumnButton?.(model))}</Space>
        }] : [{
          title: '', key: '_', render: (model: {{.Name}}) => <Space>{buttonFilter(columnButtons(model), props.renderColumnButton, props.moreColumnButton?.(model))}</Space>
        }])}
        dataSource={ source.data }
        rowKey="id"
        loading={ loading }
        pagination={ {
          size: "small",
          defaultPageSize: 15,
          total: source.total,
          showTotal: (total) => <Text type="secondary">共 {total} 条数据</Text>,
          // 分页事件
          onChange: (page, size) => setPagination({ current: page, pageSize: size ? size: pagination.pageSize }),
          pageSizeOptions: ["15", "50", "100"],
          position: ["bottomRight"],
          showSizeChanger: true,
          hideOnSinglePage: false
        } }
        rowSelection={ props.canSelect ? {
          type: props.canSelect,
          // 单选事件
          onSelect: (record, selected) => {
            if (props.canSelect === "checkbox") {
              let index = selection.rows.findIndex(item => item.id === record.id)
              selected ? selection.rows.push(record)
                : index > -1 ? selection.rows.splice(index, 1) : undefined
              setSelection({ rows: selection.rows, keys: selection.rows.map(v => v.id) })
              props.onSelect?.(selection.rows)
            } else {
              setSelection({ rows: [record], keys: [record.id] })
              props.onSelect?.([record])
            }
          },
          // 全选事件
          onSelectAll: (selected, selectedRows, changeRows) => {
            selected ? selection.rows.push(...changeRows)
              : changeRows.forEach(record => {
                let index = selection.rows.findIndex(item => item.id === record.id)
                index > -1 ? selection.rows.splice(index, 1) : undefined
              })
            setSelection({ rows: selection.rows, keys: selection.rows.map(v=>v.id) })
            props.onSelect?.(selection.rows)
          },
          selectedRowKeys: selection.keys
        } : undefined }
      />
      {modal}
    </Card>
  );
};