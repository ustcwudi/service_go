import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Icon from '@/component/icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      marginBottom: 0
    },
    actions: {
      marginTop: -4,
      marginBottom: 16,
      marginRight: 16
    }
  }),
);

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
  const classes = useStyles();
  const { title, visible, value, onFinish, onCancel, onReset, children } = props;
  return <Dialog fullWidth={true} scroll="body" maxWidth="md" open={visible} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Grid className={classes.grid} container spacing={3}>
        {children}
      </Grid>
    </DialogContent>
    <DialogActions className={classes.actions}>
      <Button variant="contained" color="default" startIcon={<Icon name="Replay" />} onClick={onCancel}>取消</Button>
      <Button variant="contained" color="primary" startIcon={<Icon name="Telegram" />} onClick={onFinish}>提交</Button>
    </DialogActions>
  </Dialog >
}