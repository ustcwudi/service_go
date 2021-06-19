import React, { useState } from 'react';
import { message, Tag, Space } from 'antd';
import ProCard from '@ant-design/pro-card';
import StudentTable from '@/pages/main/base/student/table';
import TemplateTable from '@/pages/main/base/template/table';
import AwardTable from '@/pages/main/base/award/table';
import ProList from '@ant-design/pro-list';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useRequest, useModel } from 'umi';
import Link from '@material-ui/core/Link';
import StepForm from '@/component/modal/step_form';

function getSteps() {
  return [{ name: '选择模板', description: `在右侧奖证列表中勾选需要颁发的奖证模板` },
  { name: '选择获奖者', description: `在右侧人员列表中勾选指定获奖者，可以多选` },
  { name: '提交审核', description: `填写奖证基本信息，提交确认后等待校领导或管理员电子盖章` },
  { name: '提交记录', description: `查看奖证提交发布的记录，确认审核通过情况` }];
}

export default () => {
  // 步骤
  const [step, setStep] = useState(0);
  // 用户信息
  const { user } = useModel('auth', model => ({
    user: model.user,
  }));
  // 奖证模板
  const [template, setTemplate] = useState<any>(undefined);
  // 学生列表
  const [students, setStudents] = useState<any[]>([]);
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
    <StepForm
      step={step}
      onChange={setStep}
      steps={getSteps()}
      canNext={(step == 0 && template) || (step == 1 && students.length > 0) || (step == 2) || (step == 3)}>
      <TemplateTable
        display={step == 0}
        renderSelectionButton={['unselect']}
        renderTableButton={[]}
        canSelect="radio"
        render={['name', 'width', 'height', 'parameter', 'remark', 'preview']}
        onSelect={(selection: any[]) => {
          setTemplate(selection.length > 0 ? selection[0] : undefined);
          setInputs(createInputs(selection[0] ? selection[0].content : ''));
        }}
        moreColumn={[{
          label: '预览', name: 'preview', render: (model: Template) => <Link target="_blank" href={`/api/template/display/${model.id}`}>预览</Link>
        }]}
      />
      <StudentTable
        display={step == 1}
        canSelect="checkbox"
        render={['name', 'class', 'code', 'sex', 'remark']}
        renderTableButton={['search']}
        renderSelectionButton={['unselect']}
        renderSearch={['name', 'class', 'code', 'remark']}
        onSelect={(selection: any[]) => setStudents(selection)}
      />
      {step == 2 && (
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
            title={template && <Link target="_blank" href={`/api/template/display/${template.id}`}>预览模板</Link>}
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
      {step == 3 && (
        <AwardTable
          renderTableButton={[]}
          render={['name', 'code', 'class', 'template', 'table', 'parameter', 'audit', 'auditor', 'remark']}
          where={{ issuer: user.id }}
        />
      )}</StepForm>
  );
};
