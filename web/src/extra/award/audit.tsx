import React, { useState } from 'react';
import { Steps, message, Tag, Space, Tooltip, Button } from 'antd';
import ProCard from '@ant-design/pro-card';
import AwardTable from '@/pages/main/base/award/table';
import ProList from '@ant-design/pro-list';
import ProForm, { ProFormText, ProFormRadio } from '@ant-design/pro-form';
import { useRequest, useModel } from 'umi';
import StepForm from '@/component/modal/step_form';

function getSteps() {
  return [{ name: '选择奖证', description: `在右侧奖证列表中勾选准备颁发的奖证` },
  { name: '审核确认', description: `确认奖证信息无误，填入审核意见并确认` },
  { name: '审核记录', description: `查看以往审核记录` }];
}

export default () => {
  // 步骤
  const [step, setStep] = useState(0);
  const [awards, setAwards] = useState<any[]>([]);
  // 用户信息
  const { user } = useModel('auth', model => ({
    user: model.user,
  }));
  // 请求
  const { loading, run } = useRequest(
    (remark, pass) => ({
      url: `/api/admin/award`,
      method: 'put',
      data: {
        patch: { remark: remark, audit: pass, auditor: user.name },
        where: { id: awards.map(award => award.id) },
      },
    }),
    {
      manual: true,
      onSuccess: (result, params) => {
        message.success('奖证审核完成');
      },
    },
  );
  return (
    <StepForm
      step={step}
      onChange={setStep}
      steps={getSteps()}
      canNext={(step == 0 && awards.length > 0) || (step == 1 && awards.length > 0) || (step == 2) || (step == 3)}>
      {step == 0 && (
        <AwardTable
          renderSelectionButton={['unselect']}
          renderTableButton={['search']}
          canSelect="checkbox"
          where={{ audit: false }}
          render={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'audit', 'remark']}
          renderSearch={['name', 'code', 'class', 'parameter', 'audit']}
          onSelect={(selection: any[]) => {
            setAwards(selection);
          }}
        />
      )}
      {step == 1 && (
        <>
          <ProCard style={{ marginBottom: 16 }}>
            <ProList<any>
              rowKey="id"
              headerTitle="奖证列表"
              dataSource={awards}
              pagination={
                awards.length > 10
                  ? {
                    defaultPageSize: 10,
                    showSizeChanger: false,
                  }
                  : undefined
              }
              metas={{
                subTitle: {
                  render: (dom, entity) => {
                    return (
                      <Space size={0}>
                        <Tag color="blue">{entity.name}</Tag>
                        <Tag color="green">{entity.class}</Tag>
                        <Tag>{entity.issuer.name}</Tag>
                        <Tag color="red">{entity.template.name}</Tag>
                        {Object.keys(entity.parameter).map((key: string) => (
                          <Tooltip title={key} key={key}>
                            <Tag>{entity.parameter[key]}</Tag>
                          </Tooltip>
                        ))}
                      </Space>
                    );
                  },
                },
                actions: {
                  render: (text, row) => [
                    <a
                      href={`/api/award/display/${row.id}`}
                      target="_blank"
                      key="priview"
                    >
                      预览
                    </a>,
                  ],
                },
              }}
            />
          </ProCard>
          <ProCard layout="center">
            <ProForm
              onFinish={async values => {
                if (awards && awards.length > 0) {
                  run(values.remark, values.pass === '通过');
                } else {
                  message.warn('未选择奖证');
                }
              }}
            >
              <ProForm.Group>
                <ProFormRadio.Group
                  label="审核结果"
                  name="pass"
                  initialValue="通过"
                  options={['通过', '拒绝']}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormText
                  name="remark"
                  label="备注"
                  placeholder="请输入备注"
                />
              </ProForm.Group>
            </ProForm>
          </ProCard>
        </>
      )}
      {step == 2 && (
        <AwardTable
          renderSelectionButton={[]}
          renderTableButton={['search']}
          renderSearch={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'remark']}
          render={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'audit', 'auditor', 'remark']}
          where={{ audit: true }}
        />
      )}
    </StepForm>
  );
};
