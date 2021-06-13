import React, { useEffect, useState, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinkSelect from '@/component/input/link_select';
import ArrayInput from '@/component/input/array_input';
import MapInput from '@/component/input/map_input';
import NullContainer from '@/component/input/null_container';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'row'
    },
    label: {
      paddingLeft: 14,
      paddingRight: 20,
      display: 'flex',
      textAlign: 'center',
      alignItems: 'center'
    },
    group: {
      flexDirection: 'row'
    }
  }),
);

const renderBool = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const classes = useStyles();

    return <FormControl className={classes.root} fullWidth>
      <FormLabel className={classes.label}>{param.label}</FormLabel>
      <RadioGroup className={classes.group} name={param.name} defaultValue={props.default?.[param.name] == null ? 'null' : props.default[param.name]?.toString()}
        onChange={e => props.onChange?.(param.name, e.currentTarget.value == "null" ? null : e.currentTarget.value == "true")}>
        <FormControlLabel value={'true'} control={<Radio />} label={param.name == 'sex' || param.name == 'gender' ? '男' : '✔'} />
        <FormControlLabel value={'false'} control={<Radio />} label={param.name == 'sex' || param.name == 'gender' ? '女' : '✖'} />
        {param.nullable && <FormControlLabel value={'null'} control={<Radio />} label='未知' />}
      </RadioGroup>
    </FormControl>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderString = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : param.map ? choices[0].value : '')
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    if (param.map)
      return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth select
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value; setValue(v); props.onChange(param.name, v) }} >
          {choices.map(i => <MenuItem key={i.label} value={i.value}>{i.label}</MenuItem>)}
        </TextField>
      </NullContainer>
    else if (param.name == "password")
      return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth
          type="password"
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
    else if (param.rule?.size?.value > 100)
      return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth multiline
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
    else
      return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
  }
  return <Grid key={param.name} item xs={param.name == "remark" || (param.rule?.size?.value > 100) ? 12 : 6}>
    <C {...props} />
  </Grid>;
};

const renderInt = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  let type = param.name.substring(param.name.length - 4) === "Time" ? "time" : '';

  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ?
      (type ? moment(new Date(props.default[param.name])) : props.default[param.name])
      : (type ? moment(new Date()) : 0))
    const [value, setValue] = useState(type ? defaultValue.current.unix() * 1000000 : defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return type ? <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <TextField fullWidth
        type="datetime-local"
        variant="outlined"
        label={param.label}
        InputLabelProps={{ shrink: true }}
        defaultValue={defaultValue.current.format('YYYY-MM-DDTHH:mm:ss')}
        disabled={disabled}
        onChange={e => { let v = moment(e.target.value).unix() * 1000000; props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>
      : <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth
          type="number"
          variant="outlined"
          label={param.label}
          disabled={disabled}
          defaultValue={defaultValue.current}
          InputLabelProps={{ shrink: true }}
          onChange={e => { let v = parseInt(e.target.value); props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderFloat = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : 0)
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <TextField fullWidth
        type="number"
        variant="outlined"
        label={param.label}
        defaultValue={defaultValue.current}
        InputLabelProps={{ shrink: true }}
        disabled={disabled}
        onChange={e => { let v = parseFloat(e.target.value); props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderID = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : '')
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return !param.link ?
      <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>
      : <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <LinkSelect
          label={param.label}
          link={param.link}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderStringArray = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : [])
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return param.map ?
      <FormControl variant="outlined" fullWidth>
        <InputLabel>{param.label}</InputLabel>
        <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
          <Select multiple
            label={param.label}
            defaultValue={defaultValue.current}
            disabled={disabled}
            onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
            {choices.map(i => <MenuItem key={i.label} value={i.value}>{i.label}</MenuItem>)}
          </Select>
        </NullContainer>
      </FormControl >
      : <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <ArrayInput
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
        </ArrayInput></NullContainer>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderIntArray = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : [])
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return param.map ?
      <FormControl variant="outlined" fullWidth>
        <InputLabel>{param.label}</InputLabel>
        <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
          <Select multiple
            label={param.label}
            defaultValue={defaultValue.current}
            disabled={disabled}
            onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
            {choices.map(i => <MenuItem value={i.value}>{i.label}</MenuItem>)}
          </Select>
        </NullContainer>
      </FormControl >
      : <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <ArrayInput
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
        </ArrayInput></NullContainer>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderFloatArray = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : [])
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return param.map ?
      <FormControl variant="outlined" fullWidth>
        <InputLabel>{param.label}</InputLabel>
        <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
          <Select multiple
            label={param.label}
            defaultValue={defaultValue.current}
            disabled={disabled}
            onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
            {choices.map(i => <MenuItem value={i.value}>{i.label}</MenuItem>)}
          </Select>
        </NullContainer>
      </FormControl >
      : <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <ArrayInput
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} >
        </ArrayInput></NullContainer>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderIDArray = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : [])
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <LinkSelect multiple
        label={param.label}
        link={param.link}
        defaultValue={defaultValue.current}
        disabled={disabled}
        onChange={(e: any) => { let v = e.target.value; props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>;
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};


const renderStringMap = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : {})
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <MapInput
        label={param.label}
        defaultValue={defaultValue.current}
        disabled={disabled}
        onChange={(e: any) => {
          let v: any = {};
          e.target.value.forEach((i: string) => {
            let index = i.indexOf(':');
            v[i.substring(0, index)] = i.substring(index + 1);
          });
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderStringArrayMap = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : {})
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <MapInput
        label={param.label}
        defaultValue={defaultValue.current}
        disabled={disabled}
        onChange={(e: any) => {
          let v: any = {};
          e.target.value.forEach((i: string) => {
            let index = i.indexOf(':');
            v[i.substring(0, index)] = i.substring(index + 1).split(',');
          });
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderIntMap = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : {})
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <MapInput
        label={param.label}
        defaultValue={defaultValue.current}
        disabled={disabled}
        onChange={(e: any) => {
          let v: any = {};
          e.target.value.forEach((i: string) => {
            let index = i.indexOf(':');
            let number = parseInt(i.substring(index + 1))
            v[i.substring(0, index)] = number ? number : 0;
          });
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

const renderFloatMap = <T extends { [index: string]: any }, Q>(param: Column<T, Q>, props: InputProps<T>) => {
  const C = (props: InputProps<T>) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default?.[param.name] === null);
    const defaultValue = useRef(props.default?.[param.name] ? props.default[param.name] : {})
    const [value, setValue] = useState(defaultValue.current);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
      <MapInput
        label={param.label}
        defaultValue={defaultValue.current}
        disabled={disabled}
        onChange={(e: any) => {
          let v: any = {};
          e.target.value.forEach((i: string) => {
            let index = i.indexOf(':');
            let number = parseFloat(i.substring(index + 1))
            v[i.substring(0, index)] = number ? number : 0;
          });
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={6}>
    <C {...props} />
  </Grid>;
};

export default { renderBool, renderString, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }