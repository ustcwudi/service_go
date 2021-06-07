import React, { useState } from 'react';
import clsx from 'clsx';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row'
    },
    left: {
      marginRight: theme.spacing(1),
      flex: 1,
    },
    center: {
      flex: 0,
      lineHeight: '40px',
    },
    small_center: {
      flex: 0,
      lineHeight: '56px',
    },
    right: {
      marginLeft: theme.spacing(1),
      flex: 1,
    }
  }),
);
// 数值区间
const TimeBetween = (props: any) => {
  const classes = useStyles();
  const [leftValue, setLeftValue] = useState<any>();
  const [rightValue, setRightValue] = useState<any>();
  const onChange = (l: any, r: any) => {
    if (l && r)
      props.onChange([moment(l).unix() * 1000000, moment(r).unix() * 1000000])
    else if (r)
      props.onChange([null, moment(r).unix() * 1000000])
    else if (l)
      props.onChange([moment(l).unix() * 1000000, null])
    else
      props.onChange(null)
  }
  return <Box className={clsx(classes.root, props.className)} >
    <TextField InputLabelProps={{ shrink: true }} type="date" variant="outlined" className={classes.left} size={props.size} onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} label={`${props.label}下限`} />
    <Box className={props.size == "small" ? classes.center : classes.small_center}>-</Box>
    <TextField InputLabelProps={{ shrink: true }} type="date" variant="outlined" className={classes.right} size={props.size} onChange={e => { setRightValue(e.target.value); onChange(leftValue, e.target.value); }} label={`${props.label}上限`} />
  </Box>
}

// 数值区间
const NumberBetween = (props: any) => {
  const classes = useStyles();
  const [leftValue, setLeftValue] = useState<any>();
  const [rightValue, setRightValue] = useState<any>();
  const onChange = (l: any, r: any) => {
    if (l && r)
      props.onChange([parseFloat(l), parseFloat(r)])
    else if (r)
      props.onChange([null, parseFloat(r)])
    else if (l)
      props.onChange([parseFloat(l), null])
    else
      props.onChange(null)
  }
  return <Box className={clsx(classes.root, props.className)} >
    <TextField type="number" variant="outlined" className={classes.left} size={props.size} onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} label={`${props.label}下限`} />
    <Box className={props.size == "small" ? classes.center : classes.small_center}>-</Box>
    <TextField type="number" variant="outlined" className={classes.right} size={props.size} onChange={e => { setRightValue(e.target.value); onChange(leftValue, e.target.value); }} label={`${props.label}上限`} />
  </Box>
}

// 字符串键值对
const StringPair = (props: any) => {
  const classes = useStyles();
  const [leftValue, setLeftValue] = useState<string>("");
  const [rightValue, setRightValue] = useState<string>("");
  const onChange = (l: string, r: string) => {
    if (l && r)
      props.onChange(`${l}:${r}`)
    else
      props.onChange('')
  }
  return <Box className={clsx(classes.root, props.className)} >
    <TextField variant="outlined" className={classes.left} value={leftValue} size={props.size} onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} label={props.label} />
    <Box className={props.size == "small" ? classes.center : classes.small_center}>:</Box>
    <TextField variant="outlined" className={classes.right} value={rightValue} size={props.size} onChange={e => { setRightValue(e.target.value); onChange(leftValue, e.target.value); }} label={`${props.label}值`} />
  </Box>
}

// 数字键值对
const NumberPair = (props: any) => {
  const classes = useStyles();
  const [leftValue, setLeftValue] = useState<string>("");
  const [rightValue, setRightValue] = useState<string>("");
  const onChange = (l: string, r: string) => {
    if (l && r)
      props.onChange(`${l}:${r}`)
    else
      props.onChange('')
  }
  return <Box className={clsx(classes.root, props.className)} >
    <TextField variant="outlined" className={classes.left} value={leftValue} size={props.size} onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} label={props.label} />
    <Box className={props.size == "small" ? classes.center : classes.small_center}>:</Box>
    <TextField type="number" variant="outlined" className={classes.right} value={rightValue} size={props.size} onChange={e => { setRightValue(e.target.value); onChange(leftValue, e.target.value); }} label={`${props.label}值`} />
  </Box>
}

export default { TimeBetween, NumberBetween, StringPair, NumberPair }