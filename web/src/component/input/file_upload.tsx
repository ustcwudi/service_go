import React, { useState } from 'react';
import { Upload, message } from 'antd';

export default (props: any) => {
  const { data, action, children, onUpload } = props;
  return (
    <Upload
      name="upload"
      data={data}
      action={action}
      itemRender={() => <></>}
      onChange={info => {
        if (info.file.status === 'done') {
          if (info.file.response.success) {
            onUpload?.(info.file.response.data);
            message.success(`${info.file.name}上传成功`);
          } else {
            message.error(`${info.file.name}操作失败`);
          }
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name}上传失败`);
        }
      }}
    >
      { children}
    </Upload>
  );
};
