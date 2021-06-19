import React, { useState } from 'react';
import { Steps, Typography, message, Popconfirm, Button, Tooltip } from 'antd';
import { useModel, useRequest, history } from 'umi';
import ProCard from '@ant-design/pro-card';
import Table from '@/pages/main/base/table/table';
import ProForm from '@ant-design/pro-form';
import { PushpinOutlined } from '@ant-design/icons';
import StepForm from '@/component/modal/step_form';

function getSteps() {
  return [{ name: '选择奖证', description: `在右侧奖证列表中勾选准备颁发的奖证` },
  { name: '打印确认', description: `确认奖证信息无误，填入审核意见并确认` }];
}

export default () => {
  // 步骤
  const [step, setStep] = useState(0);
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
    <StepForm
      step={step}
      onChange={setStep}
      steps={getSteps()}
      canNext={step == 0 && id != ''}>
      <Table
        display={step == 0}
        renderSelectionButton={[]}
        renderTableButton={[]}
        canSelect="radio"
        render={['name', 'template', 'file', 'remark', '_']}
        renderColumnButton={['uploadFile']}
        onSelect={(selection: any[]) => {
          setId(selection.length > 0 ? selection[0].id : '');
        }}
        moreColumn={[{
          label: '导入', name: 'id', render: (model: Table) => <Popconfirm
            title="请确保没有重复导入"
            onConfirm={() => importData.run(model.id)}
          ><Typography.Link><PushpinOutlined /></Typography.Link></Popconfirm>
        }]}
      />
      {step == 1 && (
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
    </StepForm>
  );
};
