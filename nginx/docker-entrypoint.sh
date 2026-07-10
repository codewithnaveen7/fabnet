#!/bin/sh
set -eu

export PANEL_DOMAIN="${PANEL_DOMAIN:-panel.fabnetsystems.com}"
export API_DOMAIN="${API_DOMAIN:-api.fabnetsystems.com}"
export CDN_DOMAIN="${CDN_DOMAIN:-cdn.fabnetsystems.com}"

render_template() {
  template="$1"
  output="$2"
  envsubst '${PANEL_DOMAIN} ${API_DOMAIN} ${CDN_DOMAIN}' < "${template}" > "${output}"
}

mkdir -p /etc/nginx/conf.d

for template in /etc/nginx/templates/*.http.template; do
  [ -f "${template}" ] || continue
  base="$(basename "${template}" .http.template)"
  render_template "${template}" "/etc/nginx/conf.d/${base}.http.conf"
done

for template in /etc/nginx/templates/*.https.template; do
  [ -f "${template}" ] || continue
  base="$(basename "${template}" .https.template)"
  domain_var="$(echo "${base}" | tr '[:lower:]' '[:upper:]')_DOMAIN"
  domain="$(eval "printf '%s' \"\${${domain_var}}\"")"

  if [ -f "/etc/letsencrypt/live/${domain}/fullchain.pem" ]; then
    render_template "${template}" "/etc/nginx/conf.d/${base}.https.conf"
  else
    rm -f "/etc/nginx/conf.d/${base}.https.conf"
  fi
done

exec "$@"
