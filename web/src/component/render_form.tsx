import React, { useEffect, useState, useRef } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinkSelect from '@/component/link_select';
import ArrayInput from '@/component/array_input';
import MapInput from '@/component/map_input';
import NullContainer from '@/component/null_container';
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

const renderBool = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const classes = useStyles();

    return <FormControl className={classes.root} fullWidth>
      <FormLabel className={classes.label}>{param.label}</FormLabel>
      <RadioGroup className={classes.group} name={param.name} defaultValue={props.default[param.name] == null ? 'null' : props.default[param.name]?.toString()}
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

const renderString = (param: FormItemParam, props: FormItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : param.map ? choices[0].value : '')
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
    else if (param.password)
      return <NullContainer nullable={param.nullable} disabled={disabled} setDisabled={setDisabled}>
        <TextField fullWidth
          type="password"
          variant="outlined"
          label={param.label}
          defaultValue={defaultValue.current}
          disabled={disabled}
          onChange={e => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
    else if (param.size && param.size > 100)
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
  return <Grid key={param.name} item xs={param.name == "remark" || (param.size && param?.size > 100) ? 12 : 6}>
    <C {...props} />
  </Grid>;
};

const renderInt = (param: FormItemParam, props: FormItemProps) => {
  let type = param.name.substring(param.name.length - 4) === "Time" ? "time" : '';

  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ?
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

const renderFloat = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : 0)
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

const renderID = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : '')
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

const renderStringArray = (param: FormItemParam, props: FormItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : [])
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

const renderIntArray = (param: FormItemParam, props: FormItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : [])
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

const renderFloatArray = (param: FormItemParam, props: FormItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : [])
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

const renderIDArray = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : [])
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


const renderStringMap = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : {})
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

const renderStringArrayMap = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : {})
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

const renderIntMap = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : {})
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

const renderFloatMap = (param: FormItemParam, props: FormItemProps) => {
  const C = (props: FormItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable && props.default[param.name] === null);
    const defaultValue = useRef(props.default[param.name] ? props.default[param.name] : {})
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