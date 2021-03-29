import React, { useState } from 'react';
import { Steps, Typography, message, Popconfirm, Button, Tooltip } from 'antd';
import { useModel, useRequest, history } from 'umi';
import ProCard from '@ant-design/pro-card';
import Table from '@/pages/main/base/table/table';
import ProForm from '@ant-design/pro-form';
import { PushpinOutlined } from '@ant-design/icons';

export default () => {
  const [current, setCurrent] = useState<number>(0);
  const [id, setId] = useState<string>('');
  const importData = useRequest(
    (id) => ({
      url: `/api/table/import/0/${id}`,
      method: 'get',
    }),
    {
      manual: true,
      onSuccess: (result, params: any) => {
        if (result.success) {
          message.success(`导入${result.data.length}条数据`);
        } else {
          message.error("导入失败");
        }
      },
    },
  );
  return (
    <>
      <ProCard style={{ marginBottom: 16 }}>
        <Steps
          type="navigation"
          current={current}
          onChange={current => setCurrent(current)}
        >
          <Steps.Step title="选择表格"></Steps.Step>
          <Steps.Step title="打印确认"></Steps.Step>
        </Steps>
      </ProCard>
      <Table
        style={current == 0 ? undefined : { display: 'none' }}
        renderSelectionButton={[]}
        renderTableButton={[]}
        canSelect="radio"
        render={['name', 'template', 'file', 'remark', '_']}
        renderColumnButton={['uploadFile']}
        onSelect={(selection: any[]) => {
          setId(selection[0].id);
          setCurrent(1);
        }}
        moreColumn={[{
          title: '导入', key: 'id', render: (model: Table) => <Popconfirm
            title="请确保没有重复导入"
            onConfirm={() => importData.run(model.id)}
          ><Typography.Link><PushpinOutlined /></Typography.Link></Popconfirm>
        }]}
      />
      {current == 1 && (
        <>
          <ProCard layout="center">
            <ProForm
              submitter={{
                render: (props, dom) => {
                  return [];
                },
              }}
            >
              <Button
                key="print"
                target="_blank"
                href={
                  id
                    ? `/api/table/display/0/${id}`
                    : undefined
                }
              >
                打印
            </Button>
              <Button
                type="link"
                key="view"
                target="_blank"
                href={
                  id
                    ? `/api/table/display/1/${id}`
                    : undefined
                }
              >
                预览
            </Button>
            </ProForm>
          </ProCard>
        </>
      )}
    </>
  );
};
