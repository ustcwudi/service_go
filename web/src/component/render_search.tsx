import React, { useState } from 'react';
import { Select, Radio, Badge, Form, Col, InputNumber, Input, DatePicker } from 'antd';
import LinkSelect from '@/component/link_select';
import NullContainer from '@/component/null_container';
import SearchItem from '@/component/search_item';

// 表单项属性
interface SearchItemProps {
  name: string;
  label: string;
  nullable: boolean;
  map?: { [key: string]: string };
  link?: string;
  search?: string;
}

const renderBool = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <Radio.Group onChange={e => props.onChange(e.target.value)}>
      <Radio value={true}><Badge status="success" /></Radio>
      <Radio value={false}><Badge status="error" /></Radio>
      {param.nullable ? <Radio value={undefined}><Badge status="default" /></Radio> : undefined}
    </Radio.Group>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderString = (param: SearchItemProps) => {
  const C = (props: any) => {
    if (param.map) {
      let choices: { label: string, value: any }[] = [];
      if (param.map) {
        for (let key in param.map) {
          choices.push({ label: key, value: param.map[key] })
        }
      }
      return <NullContainer nullable={param.nullable} {...props} >
        <Select
          options={choices}
          style={{ width: '100%' }}
          disabled={props.value === undefined}
          onChange={value => props.onChange(value)} /></NullContainer>
    } else
      return <NullContainer nullable={param.nullable} {...props}>
        <Input
          maxLength={50}
          disabled={props.value === undefined}
          onChange={e => props.onChange(e.target.value)} /></NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderInt = (param: SearchItemProps) => {
  let type = ""
  if (param.name.substring(param.name.length - 4) === "Time") type = "time"
  const C = (props: any) => {
    if (param.search === "between")
      if (type === "time")
        return <NullContainer nullable={param.nullable} {...props}>
          <SearchItem.TimeBetween disabled={props.value === undefined} {...props} />
        </NullContainer>
      else
        return <NullContainer nullable={param.nullable} {...props}>
          <SearchItem.NumberBetween disabled={props.value === undefined} precision={0} {...props} />
        </NullContainer>
    else
      return <InputNumber
        style={{ width: '100%' }}
        precision={0}
        disabled={props.value === undefined}
        onChange={value => props.onChange(Number(value))} />
  }
  return <Col key={param.name} span={6 * (param.search === "between" ? 2 : 1) * (type === "time" ? 2 : 1)}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderFloat = (param: SearchItemProps) => {
  const C = (props: any) => {
    if (param.search === "between")
      return <NullContainer nullable={param.nullable} {...props}>
        <SearchItem.NumberBetween disabled={props.value === undefined} {...props} />
      </NullContainer>
    else
      return <InputNumber
        style={{ width: '100%' }}
        disabled={props.value === undefined}
        onChange={value => props.onChange(Number(value))} />
  }
  return <Col key={param.name} span={6 * (param.search === "between" ? 2 : 1)}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderID = (param: SearchItemProps) => {
  const C = (props: any) => {
    return !param.link ?
      <NullContainer nullable={param.nullable} {...props} >
        <Input
          disabled={props.value === undefined}
          onChange={e => props.onChange(e.target.value)} /></NullContainer>
      : <NullContainer nullable={param.nullable} {...props} >
        <LinkSelect
          link={param.link}
          disabled={props.value === undefined}
          onChange={(value: any) => props.onChange(value)} /></NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderStringArray = (param: SearchItemProps) => {
  const C = (props: any) => {
    if (param.map) {
      let choices: { label: string, value: any }[] = [];
      if (param.map) {
        for (let key in param.map) {
          choices.push({ label: key, value: param.map[key] })
        }
      }
      return <NullContainer nullable={param.nullable} {...props} >
        <Select
          mode="multiple"
          options={choices}
          style={{ width: '100%' }}
          disabled={props.value === undefined}
          onChange={(value: []) => props.onChange(value.length ? value : null)} />
      </NullContainer>
    } else
      return <NullContainer nullable={param.nullable} {...props} >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          disabled={props.value === undefined}
          onChange={(value: []) => props.onChange(value.length ? value : null)}
          tokenSeparators={[',']} />
      </NullContainer>;
  }
  return <Col key={param.name} span={24}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderIntArray = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props} >
      <Select
        mode="tags"
        style={{ width: '100%' }}
        disabled={props.value === undefined}
        onChange={(value: []) => props.onChange(value.length ? value : null)}
        tokenSeparators={[',']} /></NullContainer>;
  }
  return <Col key={param.name} span={24}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderFloatArray = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props} >
      <Select
        mode="tags"
        style={{ width: '100%' }}
        disabled={props.value === undefined}
        onChange={(value: []) => props.onChange(value.length ? value : null)}
        tokenSeparators={[',']} /> </NullContainer>;
  }
  return <Col key={param.name} span={24}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderIDArray = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props} >
      <LinkSelect multiple
        link={param.link}
        disabled={props.value === undefined}
        onChange={(value: []) => props.onChange(value.length ? value : null)} />
    </NullContainer>;
  }
  return <Col key={param.name} span={24}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderStringMap = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props}>
      <SearchItem.StringPair disabled={props.value === undefined} {...props} />
    </NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderStringArrayMap = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props}>
      <SearchItem.StringPair disabled={props.value === undefined} {...props} />
    </NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderIntMap = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props}>
      <SearchItem.NumberPair disabled={props.value === undefined} precision={0} {...props} />
    </NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

const renderFloatMap = (param: SearchItemProps) => {
  const C = (props: any) => {
    return <NullContainer nullable={param.nullable} {...props}>
      <SearchItem.NumberPair disabled={props.value === undefined} {...props} />
    </NullContainer>;
  }
  return <Col key={param.name} span={12}>
    <Form.Item name={param.name} label={param.label}>
      <C />
    </Form.Item>
  </Col>;
};

export default { renderBool, renderString, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }