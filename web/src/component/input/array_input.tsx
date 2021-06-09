import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@/component/icon/icon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    select: {
      flex: 1,
    },
    button: (props: { size?: "small" }) => ({
      marginTop: props.size ? 0 : 8,
      marginLeft: 8,
      height: 40,
      width: 40
    }),
    icon: {
      width: 16,
      height: 16
    }
  }),
);

export default (props: any) => {
  const classes = useStyles(props);
  // 设置模式
  const [editMode, setEditMode] = useState(false);
  // 设置选项列表
  const [text, setText] = useState('');
  // 加入选项
  const getList = (text: string) => {
    let list: string[] = [];
    if (text) {
      text.split(' ').forEach(v => {
        if (v && props.defaultValue.findIndex((i: string) => i == v) < 0 && list.findIndex(i => i == v) < 0) list.push(v)
      })
    }
    return list
  };
  return (
    <Box className={classes.root}>
      {!editMode ? <FormControl className={classes.select} variant="outlined" fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select multiple
          label={props.label}
          disabled={props.disabled}
          onChange={props.onChange}
          defaultValue={props.defaultValue}>
          {props.defaultValue.map((i: any) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
          {getList(text).map((i: any) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>
        : <TextField disabled={props.disabled} className={classes.select} label={`添加${props.label}`} variant="outlined" fullWidth onChange={e => setText(e.target.value)}>
        </TextField>}
      <Tooltip title={editMode ? "选择" : "编辑"}>
        <span><IconButton disabled={props.disabled} className={classes.button} onClick={() => { setEditMode(!editMode); }} >
          <Icon name={editMode ? "Send" : "Edit"} classes={classes} /></IconButton></span></Tooltip>
    </Box>
  );
};
