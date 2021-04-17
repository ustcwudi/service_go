import React, { useState } from 'react';
import { useRequest } from 'umi';
import { Form, Input, Button, Col } from 'antd';
import { NumberOutlined } from '@ant-design/icons';

export default (props: any) => {
  // 刷新验证码
  const [reload, setReload] = useState(0);
  // 获取验证码
  const captcha = useRequest('/api/captcha',
    { onSuccess: (result, params) => { props.onChange?.(result.data) } });
  return <>
    <Col span={15}>
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
        <Input prefix={props.label ? undefined : <NumberOutlined />} placeholder="验证码" />
      </Form.Item>
    </Col>
    <Col span={9}>
      <Button
        onClick={() => setReload(new Date().getTime())}
        style={{
          marginTop: props.label ? '30px' : 0,
          width: '100%',
          backgroundImage: captcha.data &&
            `url(${reload
              ? `/api/captcha/${captcha.data.data}.png?reload=${reload}`
              : `/api/captcha/${captcha.data.data}.png`
            }) `,
          backgroundSize: 'cover'
        }}
      > &nbsp;
    </Button>
    </Col>
  </>
}