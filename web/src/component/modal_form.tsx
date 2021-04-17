import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Popconfirm } from 'antd';

export default (props: any) => {
  const [form] = Form.useForm();
  return <Form style={props.style} form={form} layout="vertical" initialValues={props.value} onFinish={(values: any) => props.onFinish(values)}>
    <Row gutter={16}>
      {props.children}
    </Row>
    <Row gutter={16}>
      <Col key="submit">
        <Form.Item style={{ marginBottom: 0 }}>
          <Popconfirm
            title="确认提交？"
            onConfirm={() => form.submit()}
          >
            <Button type="primary" htmlType="submit">确定</Button>
          </Popconfirm>

        </Form.Item>
      </Col>
      <Col key="reset">
        <Form.Item style={{ marginBottom: 0 }}>
          <Button htmlType="reset" onClick={e => { form.resetFields(); props.onReset?.(); }}>重置</Button>
        </Form.Item>
      </Col>
    </Row>
  </Form>
}