import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Popconfirm } from 'antd';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@/component/icon_button';

export default (props: {
  value: any,
  style?: any,
  footer?: any,
  children?: any,
  visible: boolean,
  title?: JSX.Element | string,
  onReset?: () => void,
  onCancel?: () => void,
  onFinish: (values: any) => void
}) => {
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
      <IconButton title="重置" icon="Replay" onClick={(e: any) => { form.resetFields(); onReset?.(); }} color="default" />
      <IconButton title="确认" icon="Telegram" onClick={form.submit} color="primary" />
    </DialogActions>
  </Dialog>
}