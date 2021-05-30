import moment from 'moment';
import Render from '@/component/render';
import FormRender from '@/component/render_form';
import SearchRender from '@/component/render_search';

export default function (): { [key: string]: Column<{{.Name}}> } {
  return {
    /* range fields */
    {{- range .Fields}}
    '{{c .Name}}': {
      title: '{{.Description}}',
      key: '{{c .Name}}',
      ellipsis: true,
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
        {{- if eq .Name "Name"}}
        rules: [{ required: true }],
        {{- end}}
        nullable: {{if .Nullable}}true{{else}}false{{end}}
      }, props),
      {{- if .Search}}
      /* render search */
      renderSearch: () => SearchRender.render{{mt .Type}}({
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
      }),
      {{- end}}{{end}}
    },
    {{- end}}
    'createTime': {
      title: '创建时间',
      key: 'createTime',
      render: (model: {{$.Name}}) => model.createTime ? moment(model.createTime / 1000000).format('YYYY/MM/DD') : "",
      renderSearch: () => SearchRender.renderInt({
        name: 'createTime',
        label: '创建时间',
        search: 'between',
        nullable: false
      })
    }
  }
}
