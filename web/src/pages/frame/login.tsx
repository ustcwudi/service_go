import React, { useState, useContext } from 'react';
import request from 'umi-request';
import styled from "styled-components";
import { useModel, useRequest, history } from 'umi';
import context from '@/context'
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import Captcha from '@/component/input/captcha'

const WhiteTextField = styled(TextField)`
  .MuiFormLabel-root {
    color: white;
  },
  .MuiOutlinedInput-root {
    fieldset {
      border-color: white;
    }
    &:hover fieldset {
      border-color: white;
    }
    input {
      color: white;
    }
  }
`;

export default (props: any) => {
  const mainContext = useContext(context);
  // 组件
  const [model, setModel] = useState<{ id?: string, captcha?: string, account?: string, password?: string, remember?: boolean }>({});
  // 请求
  const loginRequest = () => request('/api/user/login', {
    method: 'post',
    data: model,
    headers: {
      Link: 'role',
    },
  })
    .then(function (response) {
      console.log(response)
      if (response.success) {
        login(response.data, response.map.role[0]);
        if (response.map.role[0].homepage)
          history.push(response.map.role[0].homepage);
        else history.push('/main/base/user/');
      } else {
        mainContext.alert?.({ type: 'error', message: response.message ? response.message : '请求失败' })
      }
    })
    .catch(function (error) {
      mainContext.alert?.({ type: 'error', message: error.response ? error.response.statusText : error.message })
    });

  // 用户数据
  const { login } = useModel('auth', model => ({
    login: model.login,
  }));

  return <Grid container spacing={3}>
    <Grid item xs={12}>
      <WhiteTextField fullWidth
        variant="outlined"
        label={"账号"}
        onChange={e => { setModel({ ...model, account: e.target.value }) }} />
    </Grid>
    <Grid item xs={12}>
      <WhiteTextField fullWidth
        type="password"
        variant="outlined"
        label={"密码"}
        onChange={e => { setModel({ ...model, password: e.target.value }) }} />
    </Grid>
    <Grid item xs={12}>
      <Captcha white onChange={id => setModel({ ...model, id: id })} >
        <WhiteTextField fullWidth
          variant="outlined" label="验证码" onChange={e => setModel({ ...model, captcha: e.target.value })} />
      </Captcha>
    </Grid>
    <Grid item xs={12}>
      <Button onClick={loginRequest} size="large" color="primary" startIcon={<VpnKeyIcon />} fullWidth>登录云端</Button>
    </Grid>
  </Grid>
};
