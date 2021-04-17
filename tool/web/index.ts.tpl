declare class {{.Name}} {
  // ID
  id: string;
  {{- range .Fields}}
  // {{.Description}}
  {{c .Name}}{{- if .Nullable}}?{{end}}: {{st .Type}}{{if .Link}} | {{.Link}}{{if eq .Type "id[]"}}[]{{end}}{{end}};
  {{- end}}
  // 创建时间
  createTime?: number;
  // 修改时间
  updateTime?: number;
  // 废弃时间
  deleteTime?: number;
}

declare class {{.Name}}Query {
  // ID
  id?: string | string[];
  {{- range .Fields}}
  // {{.Description}}
  {{- if eq .Type "bool"}}
  {{c .Name}}?: {{if .Nullable}}null | {{end -}}
  boolean;

  {{- else if or (eq .Type "id") (eq .Type "id[]")}}
  {{c .Name}}?: {{- if .Nullable}}null | {{end -}}
  string | string[];

  {{- else if or (eq .Type "int") (eq .Type "float") (eq .Type "int[]") (eq .Type "float[]")}}
  {{c .Name}}?: {{if .Nullable}}null | {{end}}
  {{- if eq .Search "between"}}[null | number, null | number]
  {{- else}}number | number[]
  {{- end}};

  {{- else if or (eq .Type "string") (eq .Type "string[]")}}
  {{c .Name}}?: {{if .Nullable}}null | {{end}}
  {{- if eq .Search "like"}}string
  {{- else}}string | string[]
  {{- end}};

  {{- else if or (eq .Type "map[string]string") (eq .Type "map[string]string[]")}}
  {{c .Name}}?: {{- if .Nullable}}null | {{end -}}
  { [key: string]: string };

  {{- else if or (eq .Type "map[string]int") (eq .Type "map[string]float")}}
  {{c .Name}}?: {{- if .Nullable}}null | {{end -}}
  { [key: string]: number };

  {{- else}}
  {{c .Name}}?: {{if .Nullable}}null | {{end -}}
  {{st .Type}};

  {{- end}}{{end}}
  // 创建时间
  createTime?: [number, number];
  // 修改时间
  updateTime?: [number, number];
  // 废弃时间
  deleteTime?: [number, number];
}