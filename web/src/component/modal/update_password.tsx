
import React, { useState, useEffect } from 'react';
import request from 'umi-request';
import ModalForm from '@/component/modal/modal_form'
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Captcha from '@/component/input/captcha'

export default (props: any) => {
  // 组件
  const [model, setModel] = useState<{ id?: string, captcha?: string, old_password?: string, new_password?: string, re_password?: string }>({});
  // 请求
  const updateRequest = () => request('/api/user/update_password', {
    method: 'post',
    data: model,
  })
    .then(function (response) {
      props.setAlert({ type: response.success ? 'success' : 'error', message: response.message ? response.message : response.success ? '修改成功' : '操作失败' })
    })
    .catch(function (error) {
      props.setAlert({ type: 'error', message: error.response ? error.response.statusText : error.message })
    });
  return <ModalForm visible={true} onCancel={props.onCancel} onFinish={() => updateRequest()}>
    <Grid item xs={12}>
      <TextField fullWidth
        type="password"
        variant="outlined"
        label={"旧密码"}
        onChange={e => { setModel({ ...model, old_password: e.target.value }) }} />
    </Grid>
    <Grid item xs={6}>
      <TextField fullWidth
        type="password"
        variant="outlined"
        label={"新密码"}
        onChange={e => { setModel({ ...model, new_password: e.target.value }) }} />
    </Grid>
    <Grid item xs={6}>
      <TextField fullWidth
        type="password"
        variant="outlined"
        label={"重复"}
        onChange={e => { setModel({ ...model, re_password: e.target.value }) }} />
    </Grid>
    <Grid item xs={12}>
      <Captcha onChange={id => setModel({ ...model, id: id })} >
        <TextField fullWidth variant="outlined" label="验证码" onChange={e => setModel({ ...model, captcha: e.target.value })} />
      </Captcha>
    </Grid>
  </ModalForm>

}