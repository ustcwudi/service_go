import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Icon from '@/component/icon';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      marginRight: 44
    },
    button: (props: { small?: boolean }) => ({
      position: 'absolute',
      top: props.small ? 0 : 8,
      height: 40,
      right: -44
    }),
    icon: {
      width: 16,
      height: 16
    }
  }),
);

// 空值输入框容器，以undefined表示空值
export default (props: any) => {
  const classes = useStyles(props);
  return props.nullable ? <Box className={classes.root}>
    <Tooltip title={props.disabled ? "取消空值" : "设为空值"}>
      <IconButton className={classes.button} onClick={() => props.setDisabled(!props.disabled)} >
        <Icon name="Cancel" color={props.disabled ? 'primary' : 'action'} classes={classes} /></IconButton></Tooltip>
    {props.children}
  </Box> : props.children;
}