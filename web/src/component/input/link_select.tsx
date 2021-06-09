import React, { useState, useEffect } from 'react';
import { useRequest } from 'umi';
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
  const getDefaultOptions = () => {
    return props.defaultValue
      ? Array.isArray(props.defaultValue)
        ? props.defaultValue // 多项
        : typeof props.defaultValue === 'string'
          ? [{ id: props.defaultValue, name: props.defaultValue }] // 字符串
          : [props.defaultValue] // 单项
      : [];
  }
  const [defaultValue] = useState(props.multiple ?
    getDefaultOptions().map((i: any) => i.id)
    : props.defaultValue ?
      props.defaultValue.id ? props.defaultValue.id : props.defaultValue
      : '');
  // 设置模式
  const [editMode, setEditMode] = useState(false);
  // 设置选项列表
  const [options, setOptions] = useState<[{ id: any, name: any }]>(getDefaultOptions());
  // 设置关键词
  const [keyword, setKeyword] = useState("");
  // 获取查询数据
  const { loading, run } = useRequest(
    `/api/admin/${props.link}?pageSize=10&page=0&name=${keyword}`,
    {
      debounceInterval: 500,
      manual: true,
      onSuccess: (result, params) => {
        if (result.data) {
          const list = result.data;
          options.forEach(i => {
            let index = list.findIndex((j: any) => j?.id == i?.id);
            if (index == -1) list.push(i);
          });
          setOptions(list);
        }
      },
    },
  );
  return (
    <Box className={classes.root}>
      {!editMode ? <FormControl className={classes.select} variant="outlined" size={props.size} fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select
          label={props.label}
          disabled={props.disabled}
          multiple={props.multiple}
          onChange={props.onChange}
          defaultValue={defaultValue}>
          {props.allowBlank && <MenuItem value="">&nbsp;</MenuItem>}
          {options?.map((i: any) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
        </Select>
      </FormControl>
        : <TextField disabled={props.disabled} size={props.size} className={classes.select} label={`搜索${props.label}`} variant="outlined" fullWidth onChange={e => setKeyword(e.target.value)}>
        </TextField>}
      <Tooltip title={editMode ? "选择" : "编辑"}>
        <span><IconButton disabled={props.disabled} className={classes.button} onClick={() => { if (keyword && editMode) run(keyword); setEditMode(!editMode); }} >
          <Icon name={editMode ? "Send" : "Edit"} classes={classes} /></IconButton></span></Tooltip>
    </Box>
  );
};
