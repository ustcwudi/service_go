import React, { useState } from 'react';
import { useRequest } from 'umi';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative'
    },
    captcha: {
      cursor: 'pointer',
      position: 'absolute',
      zIndex: 9,
      right: 2,
      top: 2,
      height: 52
    },
    white: {
      filter: 'brightness(0) invert(1)'
    }
  }),
);

export default (props: { children?: JSX.Element, white?: boolean, onChange: (id: string) => void }) => {
  const classes = useStyles(props);
  // 获取验证码
  const captcha = useRequest(
    '/api/captcha',
    {
      onSuccess: (result, params) => props.onChange(result.data.id)
    });
  return <Box className={classes.root}>
    {props.children}
    <img className={props.white ? `${classes.captcha} ${classes.white}` : classes.captcha}
      onClick={() => captcha.run()}
      src={captcha.data && captcha.data.success && captcha.data.data.image}
    />
  </Box>
}