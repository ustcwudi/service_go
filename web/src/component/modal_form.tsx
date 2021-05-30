import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@/component/icon_button';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grid: {
      marginBottom: 0
    },
    actions: {
      marginBottom: 16,
      marginRight: 12
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
  const { style, title, visible, value, onFinish, onCancel, onReset, children } = props;
  return <Dialog fullWidth={true} scroll="body" maxWidth="md" open={visible} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Grid className={classes.grid} container spacing={3}>
        {children}
      </Grid>
    </DialogContent>
    <DialogActions className={classes.actions}>
      <IconButton title="重置" icon="Replay" color="default" />
      <IconButton title="确认" icon="Telegram" color="primary" />
    </DialogActions>
  </Dialog>
}