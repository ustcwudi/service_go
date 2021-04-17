import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';

// 空值输入框容器，以undefined表示空值
export default (props: any) => {
  const [lastValue, setLastValue] = useState(null); // 空值切换时，保存上次非空值
  const style: React.CSSProperties = { position: 'absolute', top: -5, right: -5, zIndex: 100, fontSize: 12 }
  return props.nullable ? <div style={{ position: 'relative' }}>
    <Tooltip title={props.value === undefined ? "取消空值" : "设为空值"}>
      <CloseCircleFilled style={props.value === undefined ? { color: '#08c', ...style } : { color: '#555', ...style }} onClick={() => {
        if (props.onChange) {
          if (props.value === undefined) {
            props.onChange(lastValue) // 读取上次非空值
          } else {
            setLastValue(props.value) // 保存上次非空值
            props.onChange(undefined) // 设置当前值为空值
          }
        }
      }} /></Tooltip>
    {props.children}
  </div> : props.children;
}