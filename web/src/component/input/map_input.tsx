import React, { useState, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import RenderItem from '@/component/render/render_item';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@/component/icon/icon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    select: {
      flex: 2,
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
  const divide = (object: any) => {
    let array = [];
    for (
      const [key, value] of Object.entries(object)) {
      array.push(`${key}: ${value}`)
    }
    return array
  }
  // 设置模式
  const [editMode, setEditMode] = useState(false);
  // 设置选项列表
  const [options, setOptions] = useState(divide(props.defaultValue));
  // 设置选项列表
  const [text, setText] = useState('');
  return (
    <Box className={classes.root}>
      {!editMode ? <FormControl className={classes.select} variant="outlined" size={props.size} fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select multiple
          label={props.label}
          disabled={props.disabled}
          onChange={props.onChange}
          defaultValue={divide(props.defaultValue)}>
          {options.map((i: any) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>
        : <RenderItem.StringPair size={props.size} disabled={props.disabled} className={classes.select} label={`添加${props.label}`} onChange={(v: string) => setText(v)} />}
      <Tooltip title={editMode ? "选择" : "编辑"}>
        <span><IconButton disabled={props.disabled} className={classes.button} onClick={() => {
          if (editMode && text.indexOf(':') > 0 && options.findIndex(i => i && i == text) < 0) { setOptions([text, ...options]) }
          setEditMode(!editMode)
        }} >
          <Icon name={editMode ? "Send" : "Edit"} classes={classes} /></IconButton></span></Tooltip>
    </Box>
  );
};
