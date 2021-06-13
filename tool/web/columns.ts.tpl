import moment from 'moment';
import Render from '@/component/render/render';
import FormRender from '@/component/render/render_form';
import SearchRender from '@/component/render/render_search';

export default function (): Column<{{.Name}}, {{$.Name}}Query>[] {
  return [
    /* range fields */
    {{- range $index, $elem := .Fields}}
    {
      name: '{{c .Name}}',
      type: '{{.Type}}',
      label: '{{.Description}}',
      {{- if .Nullable}}
      nullable: true,
      {{- end}}
      {{- if .Link}}
      link: '{{u .Link}}',
      {{- end}}
      {{- if .Map}}
      map: {
        {{- range $key, $value := .Map}}
        {{$key}}: '{{$value}}',{{end}}
      },
      {{- end}}
      rule: {
        {{- if eq .Name "Name"}}
        // 名称不能为空
        'require': { value: true, check: (i: {{$.Name}}) => typeof (i.{{c .Name}}) == 'string' && i.{{c .Name}}.length > 0, message: '{{.Description}}不能为空' },
        {{- else if eq .Type "id"}}
        // ID不能为空
        'require': { value: true, check: (i: {{$.Name}}) => typeof (i.{{c .Name}}) == 'string' && i.{{c .Name}}.length == 24, message: '请选择{{.Description}}' },
        {{- else if .Rule}}{{range $key, $value := .Rule}}
        {{- if and (eq $key "Size") (eq $elem.Type "string")}}
        // 大小限制
        '{{c $key}}': { value: '{{$value}}', check: (i: {{$.Name}}) => typeof (i.{{c $elem.Name}}) == 'string' && i.{{c $elem.Name}}.length < {{$value}}, message: '{{$elem.Description}}长度超过限制' },
        {{- end}}{{end}}{{end}}
      },
      {{- if or (eq .Type "upload") (eq .Type "upload[]")}}
      /* if upload */
      render: (model: {{$.Name}}) => Render.renderUpload(model.{{c .Name}}),
      {{- else}}
      /* render */
      render: (model: {{$.Name}}) => Render.render{{if or (eq .Name "Sex") (eq .Name "Gender")}}Sex{{else}}{{mt .Type}}{{end}}(model.{{c .Name}}),
      /* render form */
      renderForm: (column: Column<{{$.Name}}, {{$.Name}}Query>, props: InputProps<{{$.Name}}>) => FormRender.render{{mt .Type}}(column, props),
      {{- end}}
      {{- if .Search}}
      /* render search */
      search: '{{.Search}}',
      renderSearch: (column: Column<{{$.Name}}, {{$.Name}}Query>, props: InputProps<{{$.Name}}Query>) => SearchRender.render{{mt .Type}}(column, props),
      {{- end}}
    },
    {{- end}}
    {
      name: 'createTime',
      type: 'int',
      label: '创建时间',
      search: 'between',
      render: (model: {{$.Name}}) => model.createTime ? moment(model.createTime / 1000000).format('YYYY/MM/DD') : "",
      renderSearch: (column: Column<{{$.Name}}, {{$.Name}}Query>, props: InputProps<{{$.Name}}Query>) => SearchRender.renderInt(column, props)
    }
  ]
}
