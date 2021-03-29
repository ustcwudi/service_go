import React, { useState } from 'react';
import { useModel, useRequest, history } from 'umi';
import { Form, Input, Button, Checkbox, notification, Row } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import Captcha from '@/component/captcha'

export default (props: any) => {
  // 验证码ID
  const [captcha, setCaptcha] = useState('');

  // 登录请求
  const loginRequest = useRequest((form: object) => ({
    url: '/api/user/login',
    method: 'post',
    data: form,
    headers: {
      Link: 'role',
    },
  }), {
    manual: true,
    onSuccess: (result: any, params: any) => {
      if (result.success) {
        login(result.data, result.map.role[0]);
        if (result.map.role[0].homepage)
          history.push(result.map.role[0].homepage);
        else history.push('/main/base/user/');
        notification.success({
          message: result.message,
        });
      } else {
        if (result.message) {
          notification.error({
            message: result.message,
          });
        }
      }
    }
  });

  // 用户数据
  const { login } = useModel('auth', model => ({
    login: model.login,
  }));

  return (
    <Form
      size={'large'}
      initialValues={{ remember: true }}
      onFinish={values => loginRequest.run({ ...values, id: captcha })}
    >
      <Form.Item
        name="account"
        rules={[{ required: true, message: '请输入账号' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="账号" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
      </Form.Item>
      <Row gutter={8}>
        <Captcha onChange={(id: string) => setCaptcha(id)} />
      </Row>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>记住我</Checkbox>
        </Form.Item>
        <a style={{ float: 'right', marginLeft: '20px' }} href="">
          忘记密码
        </a>
        <a style={{ float: 'right', marginLeft: '20px' }} href="">
          注册
        </a>
      </Form.Item>
      <Form.Item>
        <Button
          style={{ width: '100%' }}
          icon={<LoginOutlined />}
          type="primary"
          htmlType="submit"
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};
