import React, { useState } from 'react';
import { Card, Steps, message, Tag, Space, Button, Typography } from 'antd';
import ProCard from '@ant-design/pro-card';
import StudentTable from '@/pages/main/base/student/table';
import TemplateTable from '@/pages/main/base/template/table';
import AwardTable from '@/pages/main/base/award/table';
import ProList from '@ant-design/pro-list';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useRequest, useModel } from 'umi';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';

export default () => {
  // 用户信息
  const { user } = useModel('auth', model => ({
    user: model.user,
  }));
  // 步骤
  const [current, setCurrent] = useState<number>(0);
  // 学生列表
  const [students, setStudents] = useState<any[]>([]);
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
        if (label !== '姓名' && label !== '学校' && label !== '班级' && label !== '学号') {
          inputs.push(
            <ProFormText
              rules={[{ required: true }]}
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
    (students, template, form) => ({
      url: `/api/admin/award`,
      method: 'post',
      data: createData(students, template, form),
    }),
    {
      manual: true,
      onSuccess: (result, params) => {
        message.success('奖证提交成功');
        setStudents([]);
      },
    },
  );
  const createData = (students: any[], template: any, form: any) => {
    return students.map((student: any) => {
      return {
        name: student.name,
        code: student.code,
        class: student.class,
        template: template.id,
        school: student.school.id,
        issuer: user.id,
        parameter: form,
        audit: false,
      };
    });
  };
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Steps
          type="navigation"
          current={current}
          onChange={current => setCurrent(current)}
        >
          <Steps.Step title="选择模板"></Steps.Step>
          <Steps.Step title="选择获奖者"></Steps.Step>
          <Steps.Step title="提交审核"></Steps.Step>
          <Steps.Step title="提交记录"></Steps.Step>
        </Steps>
      </Card>
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
        moreColumn={[{
          title: '预览', key: 'id', render: (model: Template) => <Typography.Link href={`/api/template/display/${model.id}`} target="_blank"><EyeOutlined /></Typography.Link>
        }]}
      />
      <StudentTable
        display={current == 1}
        canSelect="checkbox"
        render={['name', 'class', 'code', 'sex', 'remark']}
        renderTableButton={['search']}
        renderSelectionButton={['|', 'cancel']}
        renderSearch={['name', 'class', 'code', 'remark']}
        onSelect={(selection: any[]) => setStudents(selection)}
      />
      {current == 2 && (
        <ProCard gutter={8}>
          <ProCard colSpan={8} bordered>
            <ProList<any>
              rowKey="id"
              headerTitle="获奖列表"
              dataSource={students}
              pagination={
                students.length > 10
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
                      </Space>
                    );
                  },
                },
              }}
            />
          </ProCard>
          <ProCard
            colSpan={16}
            layout="center"
            bordered
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
              initialValues={template ? template.parameter : undefined}
              onFinish={async values => {
                if (students && students.length > 0 && template && values) {
                  run(students, template, values);
                } else {
                  message.warn('未选择学生或模板');
                }
              }}
              validateMessages={{ required: '${label}不能为空' }}
            >
              <ProForm.Group>{inputs}</ProForm.Group>
            </ProForm>
          </ProCard>
        </ProCard>
      )}
      {current == 3 && (
        <AwardTable
          renderTableButton={[]}
          render={['name', 'code', 'class', 'template', 'table', 'parameter', 'audit', 'auditor', 'remark']}
          where={{ issuer: user.id }}
        />
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
