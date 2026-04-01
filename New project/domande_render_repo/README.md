# Domande Condivise

Questionario web con statistiche condivise.

## Pagine

- `domande.html`
- `statistiche.html`

## Avvio locale

```bash
python3 server.py
```

Poi apri:

- `http://127.0.0.1:8030/domande.html`
- `http://127.0.0.1:8030/statistiche.html`

## Deploy su Render

Il progetto include gia' `render.yaml`.

Quando colleghi questa cartella a Render come Web Service, il server parte con:

```bash
python3 server.py
```

## Nota sui dati

Le risposte vengono salvate in `responses.json`.

Per una conservazione affidabile delle risposte in produzione, usa un disco persistente o un database.
