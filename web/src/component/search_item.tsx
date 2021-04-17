import React, { useState } from 'react';
import { InputNumber, Input, DatePicker } from 'antd';

// 时间区间
const TimeBetween = (props: any) => <DatePicker.RangePicker
  showTime
  style={{ width: '100%' }}
  disabled={props.disabled}
  onChange={(value) => {
    if (value && props.onChange) {
      props.onChange([value[0]?.valueOf(), value[1]?.valueOf()]);
    }
  }} />

// 数值区间
const NumberBetween = (props: any) => {
  const [leftValue, setLeftValue] = useState<any>();
  const [rightValue, setRightValue] = useState<any>();
  const onChange = (l: any, r: any) => {
    if (typeof l == 'number' && typeof r == 'number')
      props.onChange([Number(l), Number(r)])
    else if (typeof r == 'number')
      props.onChange([null, r])
    else if (typeof l == 'number')
      props.onChange([l, null])
    else
      props.onChange(null)
  }
  return <Input.Group compact>
    <InputNumber
      placeholder="下限"
      precision={props.precision}
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center', zIndex: 1 }}
      onChange={e => { setLeftValue(e); onChange(e, rightValue); }} />
    <Input style={{ backgroundColor: '#fff', width: 30, border: 0, pointerEvents: 'none' }} placeholder="~" disabled />
    <InputNumber
      placeholder="上限"
      precision={props.precision}
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center' }}
      onChange={e => { setRightValue(e); onChange(leftValue, e); }} />
  </Input.Group>
}

// 字符串键值对
const StringPair = (props: any) => {
  const [leftValue, setLeftValue] = useState<string>("");
  const [rightValue, setRightValue] = useState<string>("");
  const onChange = (l: string, r: string) => {
    if (l && r)
      props.onChange(Object.fromEntries(new Map([[l, r]])))
    else
      props.onChange(null)
  }
  return <Input.Group compact>
    <Input
      placeholder="键"
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center', zIndex: 1 }}
      onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} />
    <Input style={{ backgroundColor: '#fff', width: 30, border: 0, pointerEvents: 'none' }} placeholder=":" disabled />
    <Input
      placeholder="值"
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center' }}
      onChange={e => { setRightValue(e.target.value); onChange(leftValue, e.target.value); }} />
  </Input.Group>
}

// 数字键值对
const NumberPair = (props: any) => {
  const [leftValue, setLeftValue] = useState<string>("");
  const [rightValue, setRightValue] = useState<any>();
  const onChange = (l: string, r: any) => {
    if (l && typeof r == 'number')
      props.onChange(Object.fromEntries(new Map([[l, r]])))
    else
      props.onChange(null)
  }
  return <Input.Group compact>
    <Input
      placeholder="键"
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center', zIndex: 1 }}
      onChange={e => { setLeftValue(e.target.value); onChange(e.target.value, rightValue); }} />
    <Input style={{ backgroundColor: '#fff', width: 30, border: 0, pointerEvents: 'none' }} placeholder=":" disabled />
    <InputNumber
      placeholder="值"
      precision={props.precision}
      disabled={props.disabled}
      style={{ width: 106, textAlign: 'center' }}
      onChange={e => { setRightValue(e); onChange(leftValue, e); }} />
  </Input.Group>
}

export default { TimeBetween, NumberBetween, StringPair, NumberPair }