import React, { useState, useEffect } from 'react';
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
  // 设置选项列表
  const [options, setOptions] = useState<string[]>(props.defaultValue);
  // 设置选项列表
  const [text, setText] = useState('');
  return (
    <Box className={classes.root}>
      <FormControl className={classes.select} variant="outlined" fullWidth>
        <InputLabel>{props.label}</InputLabel>
        <Select multiple onFocus={() => { if (text && options.findIndex(i => i && i == text) < 0) { setOptions([text, ...options]) } }}
          label={props.label}
          disabled={props.disabled}
          onChange={props.onChange}
          defaultValue={props.defaultValue ? props.defaultValue : []}>
          {options.map((i: any) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField disabled={props.disabled} className={classes.input} label={`添加${props.label}`} variant="outlined" fullWidth onChange={e => setText(e.target.value)}>
      </TextField>
    </Box>
  );
};
