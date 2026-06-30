#!/bin/sh

# Create a temporary file for the new .env contents
tmpfile=$(mktemp)

# Read each line in .env file
# Each line represents key=value pairs
while IFS= read -r line || [ -n "$line" ];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi
  temp=$(eval echo \${$varname})
  value=$(printf '%s\n' "${temp}")
  # Otherwise use value from .env file
  [ -z "$value" ] && value=${varvalue}

  # Append configuration property to temporary file
  echo "$varname=\"$value\"" >> "$tmpfile"
done < .env

# Replace the original .env file with the temporary file
mv "$tmpfile" .env