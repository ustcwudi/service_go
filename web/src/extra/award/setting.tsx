import React, { useState } from 'react';
import { Steps, message, Tag, Space, Button } from 'antd';
import ProCard from '@ant-design/pro-card';
import TemplateTable from '@/pages/main/base/template/table';
import ClassTable from '@/pages/main/base/class/table';
import ProForm, { ProFormText, ProFormDigit } from '@ant-design/pro-form';
import ProList from '@ant-design/pro-list';
import { useRequest, useModel } from 'umi';
import { SearchOutlined } from '@ant-design/icons';

export default () => {
  // 用户信息
  const { user } = useModel('auth', model => ({
    user: model.user,
  }));
  const [clazz, setClazz] = useState<Class[]>([]);
  const [parameter, setParameter] = useState<any>(undefined);
  // 步骤
  const [current, setCurrent] = useState<number>(0);
  // 模板
  const [template, setTemplate] = useState<any>(undefined);
  // 输入框
  const [inputs, setInputs] = useState<any[]>([]);
  const createInputs = (content: string): JSX.Element[] => {
    let inputs = [];
    var reg = /\{\{\.([^\x00-\xff]+)\}\}/g;
    let labels = content.match(reg);
    if (labels && labels.length > 0) {
      for (let i = 0; i < labels.length; i++) {
        let label = labels[i];
        label = label.substring(3, label.length - 2);
        if (label !== '姓名' && label !== '学校' && label !== '学号' && label !== '班级') {
          inputs.push(
            <ProFormText
              name={label}
              key={label}
              label={label}
              placeholder={`请输入${label}`}
            />,
          );
        }
      }
    }
    return inputs;
  };
  // 请求
  const { loading, run } = useRequest(
    (template, form) => ({
      url: `/api/admin/template`,
      method: 'put',
      data: createData(template, form),
    }),
    {
      manual: true,
      onSuccess: (result, params) => {
        setParameter(params[1]);
        message.success('模板设置成功');
      },
    },
  );
  const createData = (template: any, form: any) => {
    return {
      where: { id: template.id },
      patch: { parameter: form },
    };
  };
  // 发布请求
  const publish = useRequest(
    (clazz, parameter, template, num) => ({
      url: `/api/admin/award`,
      method: 'post',
      data: createPublish(clazz, parameter, template, num),
    }),
    {
      manual: true,
      onSuccess: (result, params) => {
        message.success(`发布${result.data.length}项`);
        setClazz([]);
      },
    },
  );
  const createPublish = (clazz: any, parameter: any, template: any, num: any) => {
    let all = clazz.map((i: Class) => {
      let list = []
      for (var n = 0; n < num; n++) {
        list[n] = {
          name: null,
          code: null,
          class: i.name,
          template: template.id,
          school: template.school.id,
          issuer: user.id,
          parameter: parameter,
          audit: false,
        }
      };
      return list;
    });
    return all.flat();
  };
  return (
    <>
      <ProCard style={{ marginBottom: 16 }}>
        <Steps
          type="navigation"
          current={current}
          onChange={current => setCurrent(current)}
        >
          <Steps.Step title="选择模板"></Steps.Step>
          <Steps.Step title="设置参数"></Steps.Step>
          <Steps.Step title="选择班级"></Steps.Step>
          <Steps.Step title="确认发布"></Steps.Step>
        </Steps>
      </ProCard>
      <TemplateTable
        display={current == 0}
        renderSelectionButton={[]}
        renderTableButton={[]}
        canSelect="radio"
        render={['name', 'width', 'height', 'parameter', 'remark']}
        onSelect={(selection: any[]) => {
          setTemplate(selection[0]);
          setInputs(createInputs(selection[0] ? selection[0].content : ''));
        }}
      />
      {current == 1 && (
        <ProCard gutter={8}>
          <ProCard
            layout="center"
            title={
              template && (
                <Button
                  type="dashed"
                  target="_blank"
                  href={`/api/template/display/${template.id}`}
                  icon={<SearchOutlined />}
                >
                  预览模板
                </Button>
              )
            }
          >
            <ProForm
              onFinish={async values => {
                if (template && values) {
                  run(template, values);
                } else {
                  message.warn('未选择模板');
                }
              }}
              initialValues={template ? template.parameter : undefined}
            >
              <ProForm.Group>{inputs}</ProForm.Group>
            </ProForm>
          </ProCard>
        </ProCard>
      )}
      <ClassTable
        display={current == 2}
        renderSelectionButton={[]}
        renderTableButton={[]}
        render={['name', 'teacher', 'phone']}
        canSelect='checkbox'
        onSelect={(selection) => setClazz(selection)}
      />
      {current == 3 && (
        <ProCard gutter={8}>
          <ProCard bordered colSpan={8} >
            <ProList<any>
              rowKey="id"
              headerTitle="班级列表"
              dataSource={clazz}
              pagination={
                clazz.length > 10
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
                        <Tag color="green">{entity.teacher}</Tag>
                        <Tag>{entity.phone}</Tag>
                      </Space>
                    );
                  },
                },
              }}
            />
          </ProCard>
          <ProCard bordered colSpan={16} layout="center">
            <ProForm
              onFinish={async values => {
                if (template && parameter) {
                  if (template && parameter && clazz && clazz.length > 0) {
                    if (values.num > 0)
                      publish.run(clazz, parameter, template, values.num)
                    else
                      message.warn('未设置人数');
                  } else {
                    message.warn('未选择班级');
                  }
                } else {
                  message.warn('未提交模板参数');
                }
              }}
            >
              <ProForm.Group>
                <ProFormDigit
                  width='sm'
                  min={1}
                  name="num"
                  label="人数"
                  placeholder="请输入每班获奖人数"
                />
              </ProForm.Group>
            </ProForm>
          </ProCard>
        </ProCard>
      )}
      <div style={{ marginTop: '16px' }}>
        {current < 3 && (
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
