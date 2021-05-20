import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@/component/icon'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      whiteSpace: 'nowrap',
      marginLeft: theme.spacing(0.5),
      marginRight: theme.spacing(0.5),
      minWidth: 'initial'
    }
  }),
);

export default function (props: any) {
  const classes = useStyles();
  return (
    <Button
      className={classes.root}
      startIcon={typeof props.icon === 'string' ? <Icon name={props.icon} /> : props.icon}
      onClick={props.onClick}
      size={props.size ? props.size : "small"}
      color={props.color ? props.color : "primary"}
      variant={props.variant ? props.variant : "contained"}>
      {props.title ? props.title : ''}
    </Button>
  );
}
