import React, { useState } from 'react';
import { Steps, message, Tag, Space, Tooltip, Button } from 'antd';
import ProCard from '@ant-design/pro-card';
import AwardTable from '@/pages/main/base/award/table';
import ProList from '@ant-design/pro-list';
import ProForm, { ProFormText, ProFormRadio } from '@ant-design/pro-form';
import { useRequest, useModel } from 'umi';

export default () => {
  const [current, setCurrent] = useState<number>(0);
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
    <>
      <ProCard style={{ marginBottom: 16 }}>
        <Steps
          type="navigation"
          current={current}
          onChange={current => setCurrent(current)}
        >
          <Steps.Step title="选择奖证"></Steps.Step>
          <Steps.Step title="审核确认"></Steps.Step>
          <Steps.Step title="审核记录"></Steps.Step>
        </Steps>
      </ProCard>
      {current == 0 && (
        <AwardTable
          renderSelectionButton={['|', 'cancel']}
          renderTableButton={['search']}
          canSelect="checkbox"
          where={{ audit: false }}
          render={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'audit', 'remark']}
          renderSearch={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'remark']}
          onSelect={(selection: any[]) => {
            setAwards(selection);
          }}
        />
      )}
      {current == 1 && (
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
      {current == 2 && (
        <AwardTable
          renderSelectionButton={[]}
          renderTableButton={['search']}
          renderSearch={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'remark']}
          render={['name', 'code', 'class', 'issuer', 'template', 'parameter', 'audit', 'auditor', 'remark']}
          where={{ audit: true }}
        />
      )}
      <div style={{ marginTop: '16px' }}>
        {current < 2 && (
          <Button type="primary" onClick={() => setCurrent(current + 1)}>
            下一步
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => setCurrent(current - 1)}>
            上一步
          </Button>
        )}
      </div>
    </>
  );
};
