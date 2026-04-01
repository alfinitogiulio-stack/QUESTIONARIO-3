#!/bin/zsh

cd "$(dirname "$0")" || exit 1

LINK_FILE="./runtime/link_condivisi.txt"

if [[ -f "$LINK_FILE" ]]; then
  echo "Link condivisi attivi:"
  echo ""
  cat "$LINK_FILE"
else
  echo "Il link condiviso non e' ancora pronto"
  echo "Avvia prima mantiene_link_attivo.command oppure attendi qualche secondo"
fi

echo ""
echo "Premi Invio per chiudere"
read
