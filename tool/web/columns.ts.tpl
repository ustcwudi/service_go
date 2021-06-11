import moment from 'moment';
import Render from '@/component/render/render';
import FormRender from '@/component/render/render_form';
import SearchRender from '@/component/render/render_search';

export default function (): Column<{{.Name}}, {{$.Name}}Query>[] {
  return [
    /* range fields */
    {{- range .Fields}}
    {
      name: '{{c .Name}}',
      label: '{{.Description}}',
      {{- if .Nullable}}
      nullable: true,
      {{- end}}
      {{- if .Size}}
      size: {{.Size}},
      {{- end}}
      {{- if .Link}}
      link: '{{u .Link}}',
      {{- end}}
      {{- if .Map}}
      map: {
        {{- range .Map}}
        {{.Key}}: '{{.Value}}',{{end}}
      },
      {{- end}}
      {{- if eq .Name "Name"}}
      rules: [{ check: (i: {{$.Name}}) => typeof (i.{{c .Name}}) == 'string' && i.{{c .Name}}.length > 0, message: '{{.Description}}不能为空' }],
      {{- else if eq .Type "id"}}
      rules: [{ check: (i: {{$.Name}}) => typeof (i.{{c .Name}}) == 'string' && i.{{c .Name}}.length == 24, message: '请选择{{.Description}}' }],
      {{- end}}
      {{- if .Upload}}
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
      label: '创建时间',
      search: 'between',
      render: (model: {{$.Name}}) => model.createTime ? moment(model.createTime / 1000000).format('YYYY/MM/DD') : "",
      renderSearch: (column: Column<{{$.Name}}, {{$.Name}}Query>, props: InputProps<{{$.Name}}Query>) => SearchRender.renderInt(column, props)
    }
  ]
}
