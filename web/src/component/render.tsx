import React from 'react';
import { Badge, Space } from 'antd';
import Link from '@material-ui/core/Link';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Icon from '@/component/icon'

const renderBool = (value?: boolean) => {
  return (
    value === undefined || value === null ? <Icon color="disabled" name="Remove" /> :
      value === true ?
        <Badge status="success" /> :
        <Badge status="error" />
  );
};

const renderString = (value?: string) => {
  return value === undefined || value === null ? <Badge status="default" /> : value
};

const renderUpload = (value?: string) => {
  if (value === undefined || value === null || value === "") return <Badge status="default" />
  else {
    if ("http" === value.substring(0, 4))
      if ("https://thirdwx.qlogo.cn/" === value.substring(0, 25))
        return <Avatar src={value} />
      else
        return <Link href={value} target="_blank"><Icon color="action" name="ImageOutlined" /></Link>
    else {
      let ext = value.substring(value.lastIndexOf(".") + 1, value.length);
      if (ext === "jpg" || ext === "jpeg" || ext === "gif" || ext === "png")
        return <Link href={"/" + value} target="_blank"><Icon color="action" name="ImageOutlined" /></Link>
      else
        return <Link href={"/" + value} target="_blank"><Icon color="action" name="DescriptionOutlined" /></Link>
    }
  }
};

const renderInt = (value?: number) => {
  return value === undefined || value === null ? <Badge status="default" /> : value
};

const renderFloat = (value?: number) => {
  return value === undefined || value === null ? <Badge status="default" /> : value
};

const renderID = (value?: string | { id: string, name: string }) => {
  return value === undefined || value === null ? <Badge status="default" /> :
    typeof value === "string" ? <Tooltip key={value} title={value}><Chip size="small" /></Tooltip>
      : <Tooltip key={value.id} title={value.id}><Chip size="small" label={value.name} /></Tooltip>
};

const renderStringArray = (value?: string[]) => {
  return value === undefined || value === null ? <Badge status="default" /> : value.map((v, i) => <Chip key={i} size="small" variant="outlined" label={v} />)
};

const renderIntArray = (value?: number[]) => {
  return value === undefined || value === null ? <Badge status="default" /> : value.map((v, i) => <Chip key={i} size="small" variant="outlined" label={v} />)
};

const renderFloatArray = (value?: number[]) => {
  return value === undefined || value === null ? <Badge status="default" /> : value.map((v, i) => <Chip key={i} size="small" variant="outlined" label={v} />)
};

const renderIDArray = (value?: (string | { id: string, name: string })[]) => {
  return value === undefined || value === null ? <Badge status="default" /> : value.map((v: string | { id: string; name: string; }) => renderID(v))
};

const renderStringMap = (value?: Map<string, string>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Chip size="small" label={v} /></Tooltip>)
    }
    return list
  }
};

const renderStringArrayMap = (value?: Map<string, string[]>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Chip size="small" label={v.join(",")} /></Tooltip>)
    }
    return list
  }
};

const renderIntMap = (value?: Map<string, number>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Chip size="small" label={v} /></Tooltip>)
    }
    return list
  }
};

const renderFloatMap = (value?: Map<string, number>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Chip size="small" label={v} /></Tooltip>)
    }
    return list
  }
};

export default { renderBool, renderString, renderUpload, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }