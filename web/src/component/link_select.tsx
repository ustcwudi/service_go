import React, { useState, useEffect } from 'react';
import { useRequest } from 'umi';
import { Select, Input, Badge, Tooltip } from 'antd';
import { SearchOutlined, DashOutlined, LoadingOutlined } from '@ant-design/icons';

export default (props: any) => {
  const getDefaultValue = () => {
    const defaultValue = props.defaultValue
      ? Array.isArray(props.defaultValue) // 数组类型
        ? props.defaultValue.map((i: any) => {
          return { value: i.id, label: i.name, record: i };
        })
        : typeof props.defaultValue === 'string'
          ? [{ value: props.defaultValue, label: <Badge status="warning" />, record: props.defaultValue }] // 字符串
          : [{ value: props.defaultValue.id, label: props.defaultValue.name, record: props.defaultValue }] // 单项
      : undefined;
    return defaultValue;
  }
  // 设置选项列表
  const [options, setOptions] = useState<[]>(getDefaultValue());
  // 设置总数
  const [count, setCount] = useState(0);
  // 设置总数
  const [total, setTotal] = useState(0);
  // 设置分页大小
  const [pageSize, setPageSize] = useState(20);
  // 设置关键词
  const [keyword, setKeyword] = useState("");
  // 获取查询数据
  const { loading, run } = useRequest(
    e => e.keyword ? `/api/admin/${props.link}?pageSize=${pageSize}&page=${e.page}&name=${e.keyword}`
      : `/api/admin/${props.link}?pageSize=${pageSize}&page=${e.page}`,
    {
      debounceInterval: 500,
      manual: true,
      onSuccess: (result, params) => {
        if (result.data) {
          const list = result.data.map((i: { id: any; name: any }) => {
            return { value: i.id, label: i.name ? i.name : i.id, record: i };
          });
          if (params[0].page === 1) {
            setOptions(list);
          } else
            setOptions(options ? [...options, ...list] : list);
        }
        setCount(result.total ? result.total : 0); // 设置数量
        setTotal(total == 0 ? result.total : total); // 设置总数
      },
    },
  );
  return (
    <Select
      defaultValue={getDefaultValue()}
      disabled={props.disabled}
      options={options}
      labelInValue
      mode={props.multiple ? 'multiple' : undefined}
      style={{ width: '100%' }}
      dropdownStyle={{ zIndex: 9999 }}
      loading={loading}
      onFocus={e => run({ keyword: keyword, page: 1 })}
      onChange={(value, option: any) => {
        if (option) {
          props.onChange(
            props.multiple
              ? option
                ? option.map((option: any) => option.record)
                : []
              : option
                ? option.record
                : undefined,
          );
        }
      }}
      dropdownRender={menu => (
        <div>
          {menu}
          {total > pageSize ? <div style={{ margin: '8px 10px 5px' }}>
            {count > options.length
              ? <div style={{ textAlign: 'center', marginTop: '-8px' }}>
                {loading ? <LoadingOutlined /> : <Tooltip title="加载更多">
                  <DashOutlined onClick={e => run({ keyword: keyword, page: options.length / pageSize + 1 })} /></Tooltip>}
              </div>
              : undefined}
            <Input prefix={<SearchOutlined />}
              onChange={e => { let key = e.target.value.trim(); setKeyword(key); run({ keyword: key, page: 1 }) }} />
          </div> : undefined}
        </div>
      )}
    ></Select>
  );
};
