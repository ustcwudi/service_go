import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Popconfirm } from 'antd';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default (props: { title?: JSX.Element | string, visible: boolean, onReset?: () => void, onCancel?: () => void, onFinish: (values: any) => void, children?: any, footer?: any, style?: any, value: any }) => {
  const { style, title, visible, value, onFinish, onCancel, onReset, children } = props;
  const [form] = Form.useForm();
  return <Dialog open={visible} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Form style={style} form={form} layout="vertical" initialValues={value} onFinish={onFinish}>
        <Row gutter={16}>
          {children}
        </Row>
      </Form>
    </DialogContent>
    <DialogActions>
      <Button onClick={e => { form.resetFields(); onReset?.(); }} color="primary">
        重置
        </Button>
      <Button onClick={form.submit} color="primary">
        提交
        </Button>
    </DialogActions>
  </Dialog>
}