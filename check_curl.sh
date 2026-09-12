#!/bin/bash
broken=0
total=0
for url in $(grep -o 'src="https://img.cdn.famobi.com[^"]*"' index.html | cut -d '"' -f 2 | head -n 100); do
  status=$(curl -o /dev/null -s -w "%{http_code}\n" "$url")
  if [ "$status" != "200" ]; then
    echo "Broken: $url (Status: $status)"
    broken=$((broken+1))
  fi
  total=$((total+1))
done
echo "Checked $total, Broken: $broken"
