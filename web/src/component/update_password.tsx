
import React, { useState, useEffect } from 'react';
import { useRequest } from 'umi';
import { message, Modal, Col, Form, Input, Typography } from 'antd';
import ModalForm from '@/component/modal_form'
import Captcha from '@/component/captcha'

export default (props: any) => {
  // 验证码ID
  const [captcha, setCaptcha] = useState('');
  // 登录请求
  const updateRequest = useRequest((form: object) => ({
    url: '/api/user/update_password',
    method: 'post',
    data: form,
  }), {
    manual: true,
    onSuccess: (result: any, params: any) => {
      if (result.success) {
        props.onCancel?.();
        message.success(result.message);
      } else {
        if (result.message) {
          message.error(result.message);
        }
      }
    }
  });
  return <Modal onCancel={() => props.onCancel?.()} width={'350px'} title={<Typography.Text strong>修改密码</Typography.Text>} visible={true} footer={null}>
    <ModalForm onFinish={(values: any) => updateRequest.run({ ...values, id: captcha })}>
      <Col span={24}>
        <Form.Item name="old_password" label='旧密码' rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="new_password" label='新密码' rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="re_password" label='重复' rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
      </Col>
      <Captcha label='验证码' onChange={(id: string) => setCaptcha(id)} />
    </ModalForm>
  </Modal >
}