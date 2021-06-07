import React, { useState, useEffect } from 'react';
import { useRequest } from 'umi';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    select: {
      flex: 2,
    },
    input: {
      marginLeft: theme.spacing(2),
      flex: 1,
    }
  }),
);

export default (props: any) => {
  const classes = useStyles();
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
      <FormControl className={classes.select} variant="outlined" size={props.size} fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select
          onFocus={() => { if (keyword) run(keyword) }}
          label={props.label}
          disabled={props.disabled}
          multiple={props.multiple}
          onChange={props.onChange}
          defaultValue={defaultValue}>
          {options?.map((i: any) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField disabled={props.disabled} size={props.size} className={classes.input} label={`搜索${props.label}`} variant="outlined" fullWidth onChange={e => setKeyword(e.target.value)}>
      </TextField>
    </Box>
  );
};
