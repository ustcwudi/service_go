import React, { useState, useRef, useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinkSelect from '@/component/link_select';
import NullContainer from '@/component/null_container';
import RenderItem from '@/component/render_item';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Grid from '@material-ui/core/Grid';

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

const renderBool = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const classes = useStyles();

    return <FormControl className={classes.root} fullWidth>
      <FormLabel className={classes.label}>{param.label}</FormLabel>
      <RadioGroup className={classes.group} name={param.name}
        onChange={e => props.onChange?.(param.name, e.currentTarget.value == "null" ? null : e.currentTarget.value == "true")}>
        <FormControlLabel value={'true'} control={<Radio />} label={param.name == 'sex' || param.name == 'gender' ? '男' : '✔'} />
        <FormControlLabel value={'false'} control={<Radio />} label={param.name == 'sex' || param.name == 'gender' ? '女' : '✖'} />
        {param.nullable && <FormControlLabel value={'null'} control={<Radio />} label='未知' />}
      </RadioGroup>
    </FormControl>;
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};


const renderString = (param: SearchItemParam, props: SearchItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }

  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<string | undefined>('');
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value ? value : undefined) } }, [disabled]);

    return param.map ? <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <TextField fullWidth select
        size="small"
        variant="outlined"
        label={param.label}
        value={value}
        disabled={disabled}
        onChange={e => { let v = e.target.value; setValue(v); props.onChange(param.name, v ? v : undefined) }} >
        <MenuItem value="">&nbsp;</MenuItem>
        {choices.map(i => <MenuItem key={i.label} value={i.value}>{i.label}</MenuItem>)}
      </TextField>
    </NullContainer> : <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <TextField fullWidth
        size="small"
        variant="outlined"
        label={param.label}
        disabled={disabled}
        onChange={e => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>;
  }
  return <Grid key={param.name} item xs={2}>
    <C {...props} />
  </Grid>;
};

const renderInt = (param: SearchItemParam, props: SearchItemProps) => {
  let type = param.name.substring(param.name.length - 4) === "Time" ? "time" : '';

  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<number | (number | null)[] | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return type ? <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.TimeBetween
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={v => {
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
      : param.search === "between" ? <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
        <RenderItem.NumberBetween
          size="small"
          label={param.label}
          disabled={disabled}
          onChange={v => {
            props.onChange(param.name, v);
            setValue(v);
          }} />
      </NullContainer>
        : <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
          <TextField fullWidth
            size="small"
            type="number"
            variant="outlined"
            label={param.label}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            onChange={e => { let v = parseInt(e.target.value); props.onChange(param.name, v); setValue(v); }} />
        </NullContainer>
  }
  return <Grid key={param.name} item xs={type ? 4 : param.search === "between" ? 3 : 2}>
    <C {...props} />
  </Grid>;
};

const renderFloat = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<number | (number | null)[] | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return param.search === "between" ? <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.NumberBetween
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={v => {
          props.onChange(param.name, v);
          setValue(v);
        }} />
    </NullContainer>
      : <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
        <TextField fullWidth
          size="small"
          type="number"
          variant="outlined"
          label={param.label}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          onChange={e => { let v = parseFloat(e.target.value); props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>
  }
  return <Grid key={param.name} item xs={param.search === "between" ? 3 : 2}>
    <C {...props} />
  </Grid>;
};

const renderID = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<string | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value) } }, [disabled]);

    return !param.link ?
      <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
        <TextField fullWidth
          size="small"
          variant="outlined"
          label={param.label}
          disabled={disabled}
          onChange={e => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>
      : <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
        <LinkSelect
          allowBlank={true}
          size="small"
          label={param.label}
          link={param.link}
          disabled={disabled}
          onChange={(e: any) => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};

const renderStringArray = (param: SearchItemParam, props: SearchItemProps) => {
  let choices: { label: string, value: any }[] = [];
  if (param.map) {
    for (let key in param.map) {
      choices.push({ label: key, value: param.map[key] })
    }
  }
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<string | undefined>('');
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, null) : props.onChange(param.name, value ? value : undefined) } }, [disabled]);

    return param.map ? <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <TextField fullWidth select
        size="small"
        variant="outlined"
        label={param.label}
        disabled={disabled}
        value={value}
        onChange={e => { let v = e.target.value; setValue(v); props.onChange(param.name, v ? v : undefined) }} >
        <MenuItem value="">&nbsp;</MenuItem>
        {choices.map(i => <MenuItem key={i.label} value={i.value}>{i.label}</MenuItem>)}
      </TextField>
    </NullContainer>
      : <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
        <TextField fullWidth
          size="small"
          variant="outlined"
          label={param.label}
          disabled={disabled}
          onChange={e => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
      </NullContainer>;
  }
  return <Grid key={param.name} item xs={2}>
    <C {...props} />
  </Grid>;
};


const renderIntArray = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<number | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <TextField fullWidth
        size="small"
        type="number"
        variant="outlined"
        label={param.label}
        disabled={disabled}
        InputLabelProps={{ shrink: true }}
        onChange={e => { let v = parseInt(e.target.value); props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>;
  }
  return <Grid key={param.name} item xs={2}>
    <C {...props} />
  </Grid>;
};


const renderFloatArray = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<number | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <TextField fullWidth
        size="small"
        type="number"
        variant="outlined"
        label={param.label}
        disabled={disabled}
        InputLabelProps={{ shrink: true }}
        onChange={e => { let v = parseInt(e.target.value); props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>;
  }
  return <Grid key={param.name} item xs={2}>
    <C {...props} />
  </Grid>;
};

const renderIDArray = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<string | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <LinkSelect
        allowBlank={true}
        size="small"
        label={param.label}
        link={param.link}
        disabled={disabled}
        onChange={(e: any) => { let v = e.target.value ? e.target.value : undefined; props.onChange(param.name, v); setValue(v); }} />
    </NullContainer>;
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};


const renderStringMap = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<object | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.StringPair
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={(v: string) => {
          if (v) {
            let index = v.indexOf(':');
            let value: any = {};
            if (index > -1) { value[v.substring(0, index)] = v.substring(index + 1) }
            props.onChange(param.name, value);
            setValue(value);
          } else {
            props.onChange(param.name, undefined);
            setValue(undefined);
          }
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};

const renderStringArrayMap = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<object | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.StringPair
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={(v: string) => {
          if (v) {
            let index = v.indexOf(':');
            let value: any = {};
            if (index > -1) { value[v.substring(0, index)] = v.substring(index + 1) }
            props.onChange(param.name, value);
            setValue(value);
          } else {
            props.onChange(param.name, undefined);
            setValue(undefined);
          }
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};

const renderIntMap = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<object | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.NumberPair
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={(v: string) => {
          if (v) {
            let index = v.indexOf(':');
            let value: any = {};
            if (index > -1) { value[v.substring(0, index)] = parseInt(v.substring(index + 1)) }
            props.onChange(param.name, value);
            setValue(value);
          } else {
            props.onChange(param.name, undefined);
            setValue(undefined);
          }
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};

const renderFloatMap = (param: SearchItemParam, props: SearchItemProps) => {
  const C = (props: SearchItemProps) => {
    const [disabled, setDisabled] = useState(param.nullable);
    const [value, setValue] = useState<object | undefined>(undefined);
    const init = useRef(0);
    useEffect(() => { if (init.current++) { disabled ? props.onChange(param.name, undefined) : props.onChange(param.name, value) } }, [disabled]);

    return <NullContainer nullable={param.nullable} disabled={disabled} small={true} setDisabled={setDisabled}>
      <RenderItem.NumberPair
        size="small"
        label={param.label}
        disabled={disabled}
        onChange={(v: string) => {
          if (v) {
            let index = v.indexOf(':');
            let value: any = {};
            if (index > -1) { value[v.substring(0, index)] = parseFloat(v.substring(index + 1)) }
            props.onChange(param.name, value);
            setValue(value);
          } else {
            props.onChange(param.name, undefined);
            setValue(undefined);
          }
        }} />
    </NullContainer>
  }
  return <Grid key={param.name} item xs={3}>
    <C {...props} />
  </Grid>;
};

export default { renderBool, renderString, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }