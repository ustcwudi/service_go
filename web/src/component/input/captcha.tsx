import React, { useState } from 'react';
import { useRequest } from 'umi';
import { Form, Input, Button, Col } from 'antd';
import { NumberOutlined } from '@ant-design/icons';

export default (props: any) => {
  // 获取验证码
  const captcha = useRequest(
    '/api/captcha',
    {
      onSuccess: (result, params) => {
        props.onChange?.(result.data.id)
      }
    });
  return <>
    <Col span={24}>
      <Form.Item
        name="captcha"
        label={props.label}
        rules={[
          {
            required: true,
            message: '请输入验证码',
          },
        ]}
      >
        <Input prefix={props.label ? undefined : <NumberOutlined />} placeholder="验证码" maxLength={5} />
      </Form.Item>
      <img
        onClick={() => captcha.run()}
        src={captcha.data && captcha.data.success && captcha.data.data.image}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          zIndex: 9,
          right: 10,
          top: props.label ? '30px' : '0px',
          height: props.label ? '32px' : '40px'
        }}
      />
    </Col>
  </>
}