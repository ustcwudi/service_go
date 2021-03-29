import React, { useState } from 'react';
import { Select, Radio, Badge, Form, Col, InputNumber, Input } from 'antd';
import LinkSelect from '@/component/link_select';
import NullContainer from '@/component/null_container';

// 表单项属性
interface FormItemParam {
    name: string;
    label: string;
    nullable: boolean;
    map?: { [key: string]: string };
    link?: string;
    size?: number;
    password?: boolean;
    rules?: any[];
}

// 表单项属性
interface BoolFormItemProps {
    value?: boolean;
    onChange?: (value?: boolean) => void;
}

const renderBool = (param: FormItemParam) => {
    const C = (props: BoolFormItemProps) => {
        return <Radio.Group defaultValue={props.value} onChange={e => props.onChange?.(e.target.value)}>
            <Radio value={true}><Badge status="success" /></Radio>
            <Radio value={false}><Badge status="error" /></Radio>
            {param.nullable ? <Radio value={undefined}><Badge status="default" /></Radio> : undefined}
        </Radio.Group>;
    }
    return <Col key={param.name} span={12}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface StringFormItemProps {
    value?: string;
    onChange?: (value?: string | null) => void; // 空密码框返回null
}

const renderString = (param: FormItemParam) => {
    const C = (props: StringFormItemProps) => {
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
                    defaultValue={props.value}
                    style={{ width: '100%' }}
                    disabled={props.value === undefined}
                    onChange={value => props.onChange?.(value)} /></NullContainer>
        }
        else if (param.password)
            return <NullContainer nullable={param.nullable} {...props}>
                <Input.Password
                    maxLength={20}
                    disabled={props.value === undefined}
                    onChange={e => props.onChange?.(e.target.value ? e.target.value : null)} /></NullContainer>;
        else if (param.size && param.size > 100)
            return <NullContainer nullable={param.nullable} {...props}>
                <Input.TextArea
                    maxLength={param.size}
                    showCount={true}
                    defaultValue={props.value}
                    disabled={props.value === undefined}
                    rows={param.size > 400 ? param.size > 1000 ? 10 : param.size / 100 : 4}
                    onChange={e => props.onChange?.(e.target.value)} />
            </NullContainer>;
        else
            return <NullContainer nullable={param.nullable} {...props}>
                <Input
                    maxLength={100}
                    disabled={props.value === undefined}
                    defaultValue={props.value}
                    onChange={e => props.onChange?.(e.target.value)} /></NullContainer>;
    }
    return <Col key={param.name} span={param.name == "remark" || (param.size && param.size > 100) ? 24 : 12}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface IntFormItemProps {
    value?: number;
    onChange?: (value?: number) => void;
}

const renderInt = (param: FormItemParam) => {
    let type = ''
    if (param.name.substring(param.name.length - 4) === "Time") {
        type = "time"
    }
    const C = (props: IntFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props}>
            <InputNumber
                style={{ width: '100%' }}
                precision={0}
                defaultValue={props.value}
                disabled={props.value === undefined}
                onChange={value => props.onChange?.(Number(value))} /></NullContainer>
    }
    return <Col key={param.name} span={6}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface FloatFormItemProps {
    value?: number;
    onChange?: (value?: number) => void;
}

const renderFloat = (param: FormItemParam) => {
    const C = (props: FloatFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <InputNumber
                style={{ width: '100%' }}
                defaultValue={props.value}
                disabled={props.value === undefined}
                onChange={value => props.onChange?.(Number(value))} /></NullContainer>;
    }
    return <Col key={param.name} span={6}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface IDFormItemProps {
    value?: string | { id: string, name: string };
    onChange?: (value?: string | { id: string, name: string }) => void;
}

const renderID = (param: FormItemParam) => {
    const C = (props: IDFormItemProps) => {
        return !param.link ?
            <NullContainer nullable={param.nullable} {...props} >
                <Input defaultValue={props.value?.toString()}
                    disabled={props.value === undefined}
                    onChange={e => props.onChange?.(e.target.value)} /></NullContainer>
            : <NullContainer nullable={param.nullable} {...props} >
                <LinkSelect
                    link={param.link}
                    defaultValue={props.value}
                    disabled={props.value === undefined}
                    onChange={(value: any) => props.onChange?.(value)} /></NullContainer>;
    }
    return <Col key={param.name} span={12}>
        <Form.Item name={param.name} label={param.label} rules={param.nullable ? [] : [{ required: true }]}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface StringArrayFormItemProps {
    value?: string[];
    onChange?: (value?: string[]) => void;
}

const renderStringArray = (param: FormItemParam) => {
    let choices: { label: string, value: any }[] = [];
    if (param.map) {
        for (let key in param.map) {
            choices.push({ label: key, value: param.map[key] })
        }
    }
    const C = (props: StringArrayFormItemProps) => {
        return param.map ?
            <NullContainer nullable={param.nullable} {...props} >
                <Select
                    options={choices}
                    defaultValue={props.value}
                    mode="multiple"
                    style={{ width: '100%' }}
                    disabled={props.value === undefined}
                    onChange={value => props.onChange?.(value)} />
            </NullContainer>
            : <NullContainer nullable={param.nullable} {...props} >
                <Select
                    defaultValue={props.value}
                    mode="tags"
                    style={{ width: '100%' }}
                    disabled={props.value === undefined}
                    onChange={value => props.onChange?.(value)}
                    tokenSeparators={[',']} /></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface IntArrayFormItemProps {
    value?: number[];
    onChange?: (value?: number[]) => void;
}

const renderIntArray = (param: FormItemParam) => {
    const C = (props: IntArrayFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Select
                defaultValue={props.value}
                mode="tags"
                style={{ width: '100%' }}
                disabled={props.value === undefined}
                onChange={value => props.onChange?.(value)}
                tokenSeparators={[',']} /></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface FloatArrayFormItemProps {
    value?: number[];
    onChange?: (value?: number[]) => void;
}

const renderFloatArray = (param: FormItemParam) => {
    const C = (props: FloatArrayFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Select
                defaultValue={props.value}
                mode="tags"
                style={{ width: '100%' }}
                disabled={props.value === undefined}
                onChange={value => props.onChange?.(value)}
                tokenSeparators={[',']} /> </NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface IDArrayFormItemProps {
    value?: (string | { id: string, name: string })[];
    onChange?: (value?: (string | { id: string, name: string })[]) => void;
}

const renderIDArray = (param: FormItemParam) => {
    const C = (props: IDArrayFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <LinkSelect multiple
                link={param.link}
                defaultValue={props.value}
                disabled={props.value === undefined}
                onChange={(value: any) => props.onChange?.(value)} /></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface StringMapFormItemProps {
    value?: { [key: string]: string };
    onChange?: (value?: { [key: string]: string }) => void;
}

const renderStringMap = (param: FormItemParam) => {
    const C = (props: StringMapFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Input.TextArea
                disabled={props.value === undefined}
                defaultValue={props.value ? JSON.stringify(props.value) : ''}
                onChange={e => {
                    let object = JSON.parse(e.target.value);
                    if (object) props.onChange?.(object);
                }}
            ></Input.TextArea></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface StringArrayMapFormItemProps {
    value?: { [key: string]: string[] };
    onChange?: (value?: { [key: string]: string[] }) => void;
}

const renderStringArrayMap = (param: FormItemParam) => {
    const C = (props: StringArrayMapFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Input.TextArea
                disabled={props.value === undefined}
                defaultValue={props.value ? JSON.stringify(props.value) : ''}
                onChange={e => {
                    let object = JSON.parse(e.target.value);
                    if (object) props.onChange?.(object);
                }}
            ></Input.TextArea></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface IntMapFormItemProps {
    value?: { [key: string]: number };
    onChange?: (value?: { [key: string]: number }) => void;
}

const renderIntMap = (param: FormItemParam) => {
    const C = (props: IntMapFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Input.TextArea
                disabled={props.value === undefined}
                defaultValue={props.value ? JSON.stringify(props.value) : ''}
                onChange={e => {
                    let object = JSON.parse(e.target.value);
                    if (object) props.onChange?.(object);
                }}
            ></Input.TextArea></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

// 表单项属性
interface FloatMapFormItemProps {
    value?: { [key: string]: number };
    onChange?: (value?: { [key: string]: number }) => void;
}

const renderFloatMap = (param: FormItemParam) => {
    const C = (props: FloatMapFormItemProps) => {
        return <NullContainer nullable={param.nullable} {...props} >
            <Input.TextArea
                disabled={props.value === undefined}
                defaultValue={props.value ? JSON.stringify(props.value) : ''}
                onChange={e => {
                    let object = JSON.parse(e.target.value);
                    if (object) props.onChange?.(object);
                }}
            ></Input.TextArea></NullContainer>;
    }
    return <Col key={param.name} span={24}>
        <Form.Item name={param.name} label={param.label} rules={param.rules}>
            <C />
        </Form.Item>
    </Col>;
};

export default { renderBool, renderString, renderInt, renderFloat, renderID, renderStringArray, renderIntArray, renderFloatArray, renderIDArray, renderStringMap, renderStringArrayMap, renderIntMap, renderFloatMap }