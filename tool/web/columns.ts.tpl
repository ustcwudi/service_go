import moment from 'moment';
import Render from '@/component/render/render';
import FormRender from '@/component/render/render_form';
import SearchRender from '@/component/render/render_search';

export default function (): Column<{{.Name}}>[] {
  return [
    /* range fields */
    {{- range .Fields}}
    {
      name: '{{c .Name}}',
      label: '{{.Description}}',
      {{- if .Nullable}}
      nullable: true,
      {{- end}}
      {{- if eq .Name "Name"}}
      rules: [{ check: i => typeof i.{{c .Name}} == "string" && i.{{c .Name}}.length > 0, message: '{{.Description}}不能为空' }],
      {{- else if eq .Type "id"}}
      rules: [{ check: i => typeof i.{{c .Name}} == "string" && i.{{c .Name}}.length == 24, message: '请选择{{.Description}}' }],
      {{- end}}
      {{- if eq .Name "Password"}}
      /* if password */
      renderForm: (props: FormItemProps) => FormRender.render{{mt .Type}}({
        name: '{{c .Name}}',
        label: '{{c .Description}}',
        password: true,
        nullable: {{if .Nullable}}true{{else}}false{{end}}
      }, props)
      {{- else if .Upload}}
      /* if upload */
      render: (model: {{$.Name}}) => Render.renderUpload(model.{{c .Name}}),
      {{- else}}
      /* render */
      render: (model: {{$.Name}}) => Render.render{{if or (eq .Name "Sex") (eq .Name "Gender")}}Sex{{else}}{{mt .Type}}{{end}}(model.{{c .Name}}),
      /* render form */
      renderForm: (props: FormItemProps) => FormRender.render{{mt .Type}}({
        name: '{{c .Name}}',
        label: '{{c .Description}}',
        {{- if .Size}}
        size: {{.Size}},
        {{- end}}
        {{- if .Map}}
        map: {
          {{- range .Map}}
          {{.Key}}: '{{.Value}}',{{end}}
        },
        {{- end}}
        {{- if .Link}}
        link: '{{u .Link}}',
        {{- end}}
        nullable: {{if .Nullable}}true{{else}}false{{end}}
      }, props),
      {{- if .Search}}
      /* render search */
      renderSearch: (props: SearchItemProps) => SearchRender.render{{mt .Type}}({
        name: '{{c .Name}}',
        label: '{{c .Description}}',
        search: '{{c .Search}}',
        {{- if .Map}}
        map: {
          {{- range .Map}}
          {{.Key}}: '{{.Value}}',{{end}}
        },
        {{- end}}
        {{- if .Link}}
        link: '{{u .Link}}',
        {{- end}}
        nullable: {{if .Nullable}}true{{else}}false{{end}}
      }, props),
      {{- end}}{{end}}
    },
    {{- end}}
    {
      name: 'createTime',
      label: '创建时间',
      nullable: false,
      render: (model: {{$.Name}}) => model.createTime ? moment(model.createTime / 1000000).format('YYYY/MM/DD') : "",
      renderSearch: (props: SearchItemProps) => SearchRender.renderInt({
        name: 'createTime',
        label: '创建时间',
        search: 'between',
        nullable: false
      }, props)
    }
  ]
}
