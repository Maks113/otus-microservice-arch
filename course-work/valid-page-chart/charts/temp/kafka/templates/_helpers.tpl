{{- define "kafka.fullname" -}}
{{- .Release.Name }}-{{ .Chart.Name }}
{{- end -}}

{{- define "kafka.headless-service" -}}
{{- printf "%s-headless" (include "kafka.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "kafka.quorum-voters" -}}
{{- $name := include "kafka.fullname" . -}}
{{- $service := include "kafka.headless-service" . -}}
{{- range $i, $e := until (.Values.replicaCount | int) -}}
{{- if $i }},{{ end -}}
{{ $i }}@{{ $name }}-{{ $i }}.{{ $service }}:9093
{{- end -}}
{{- end -}}