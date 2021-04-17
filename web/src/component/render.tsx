import React from 'react';
import { Typography, Badge, Tooltip, Space, Avatar } from 'antd';
import { PaperClipOutlined, FileOutlined, FileImageOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined, FilePptOutlined, FileZipOutlined, ProfileOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const renderBool = (value?: boolean) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      value === true ?
        <Badge status="success" /> :
        <Badge status="error" />
  );
};

const renderString = (value?: string) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Text>{value}</Text>
  );
};

const renderUpload = (value?: string) => {
  if (value === undefined || value === null || value === "") return <Badge status="default" />
  else {
    if ("http" === value.substring(0, 4))
      if ("https://thirdwx.qlogo.cn/" === value.substring(0, 25))
        return <Avatar src={value} />
      else
        return <Link href={value} target="_blank"><PaperClipOutlined /></Link>
    else {
      let ext = value.substring(value.lastIndexOf(".") + 1, value.length);
      console.log(value)
      if (ext === "jpg" || ext === "jpeg" || ext === "gif" || ext === "png")
        return <Link href={"/" + value} target="_blank"><FileImageOutlined /></Link>
      else if (ext === "pdf")
        return <Link href={"/" + value} target="_blank"><FilePdfOutlined /></Link>
      else if (ext === "xls" || ext === "xlsx")
        return <Link href={"/" + value} target="_blank"><FileExcelOutlined /></Link>
      else if (ext === "doc" || ext === "docx")
        return <Link href={"/" + value} target="_blank"><FileWordOutlined /></Link>
      else if (ext === "ppt" || ext === "pptx")
        return <Link href={"/" + value} target="_blank"><FilePptOutlined /></Link>
      else if (ext === "zip" || ext === "rar")
        return <Link href={"/" + value} target="_blank"><FileZipOutlined /></Link>
      else if (ext === "json" || ext === "md")
        return <Link href={"/" + value} target="_blank"><ProfileOutlined /></Link>
      else
        return <Link href={"/" + value} target="_blank"><FileOutlined /></Link>
    }
  }
};

const renderInt = (value?: number) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Text>{value}</Text>
  );
};

const renderFloat = (value?: number) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Text>{value}</Text>
  );
};

const renderID = (value?: string | { id: string, name: string }) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      typeof value === "string" ? <Tooltip title={value}><Badge status="warning" /></Tooltip> : <Text code key={value.id}>{value.name}</Text>
  );
};

const renderStringArray = (value?: string[]) => {
  return <Space wrap>{
    value === undefined || value === null ? <Badge status="default" /> :
      value.map((v, i) => <Text key={i}>{v}</Text>)
  }</Space>;
};

const renderIntArray = (value?: number[]) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Space wrap>{value.map((v, i) => <Text key={i}>{v}</Text>)}</Space>
  );
};

const renderFloatArray = (value?: number[]) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Space wrap>{value.map((v, i) => <Text key={i}>{v}</Text>)}</Space>
  );
};

const renderIDArray = (value?: (string | { id: string, name: string })[]) => {
  return (
    value === undefined || value === null ? <Badge status="default" /> :
      <Space wrap>{value.map((v: string | { id: string; name: string; }) => renderID(v))}</Space>
  );
};

const renderStringMap = (value?: Map<string, string>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Text code>{v}</Text></Tooltip>)
    }
    return <Space wrap>{list}</Space>
  }
};

const renderStringArrayMap = (value?: Map<string, string[]>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Text code>{v.join(",")}</Text></Tooltip>)
    }
    return <Space wrap>{list}</Space>
  }
};

const renderIntMap = (value?: Map<string, number>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Text code>{v}</Text></Tooltip>)
    }
    return <Space wrap>{list}</Space>
  }
};

const renderFloatMap = (value?: Map<string, number>) => {
  if (value === undefined || value === null) return <Badge status="default" />
  else {
    var list = []
    if (!(value instanceof Map)) value = new Map(Object.entries(value));
    for (let [k, v] of value) {
      list.push(<Tooltip key={k} title={k}><Text code>{v}</Text></Tooltip>)
    }
    return <Space wrap>{list}</Space>
  }
};

export default { renderBool, renderString, renderUpload, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }