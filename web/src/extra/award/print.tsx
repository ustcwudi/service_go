import React, { useState } from 'react';
import { Steps, Select, Tag, Space, Button, Tooltip } from 'antd';
import ProCard from '@ant-design/pro-card';
import AwardTable from '@/pages/main/base/award/table';
import ProList from '@ant-design/pro-list';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';

export default () => {
  const [current, setCurrent] = useState<number>(0);
  const [awards, setAwards] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [id, setId] = useState<string>('');
  // 过滤非指定模板奖证
  const filter = (list: any[], id: string) => {
    var result: any[] = [];
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].template.id === id) {
          result.push(list[i]);
        }
      }
    }
    return result;
  };
  // 提取模板选项
  const getLabels = (list: any[]) => {
    var templates: any[] = [];
    list.forEach(item => {
      let exist = false;
      for (let i = 0; i < templates.length; i++) {
        if (templates[i].id === item.template.id) {
          exist = true;
          break;
        }
      }
      if (exist === false) templates.push(item.template);
    });
    if (templates && templates.length > 0) {
      return templates.map(item => {
        return { value: item.id, label: item.name };
      });
    } else {
      return [];
    }
  };
  return (
    <>
      <ProCard style={{ marginBottom: 16 }}>
        <Steps
          type="navigation"
          current={current}
          onChange={current => setCurrent(current)}
        >
          <Steps.Step title="选择奖证"></Steps.Step>
          <Steps.Step title="打印确认"></Steps.Step>
        </Steps>
      </ProCard>
      <AwardTable
        style={current == 0 ? undefined : { display: 'none' }}
        where={{ audit: true }}
        renderSelectionButton={['|', 'cancel']}
        canSelect="checkbox"
        renderTableButton={['search']}
        renderSearch={['name', 'code', 'class', 'template', 'table', 'parameter', 'auditor']}
        render={['name', 'code', 'class', 'template', 'table', 'parameter', 'audit', 'remark']}
        onSelect={(selection: any[]) => {
          setAwards(selection);
          setTemplates(getLabels(selection));
        }}
      />
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
                        {entity.name && <Tag color="blue">{entity.name}</Tag>}
                        {entity.class && <Tag color="green">{entity.class}</Tag>}
                        {entity.table && <Tag color="red">{entity.table.name}</Tag>}
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
              submitter={{
                render: (props, dom) => {
                  return [];
                },
              }}
            >
              <Select
                style={{ width: 120, margin: 20 }}
                options={templates}
                onSelect={value => setId(value.toString())}
              />
              <Button
                key="print"
                target="_blank"
                href={
                  id && awards.length > 0
                    ? `/api/award/display_list/0/${filter(awards, id)
                      .map(award => award.id)
                      .join(',')}/${id}`
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
                  id && awards.length > 0
                    ? `/api/award/display_list/1/${filter(awards, id)
                      .map(award => award.id)
                      .join(',')}/${id}`
                    : undefined
                }
              >
                预览
              </Button>
            </ProForm>
          </ProCard>
        </>
      )}
      <div style={{ marginTop: '16px' }}>
        {current < 1 && (
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
