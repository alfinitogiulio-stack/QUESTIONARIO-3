PUBBLICAZIONE SU RAILWAY

1. Carica su GitHub tutti i file di questa cartella, compreso railway.json
2. In Railway crea un nuovo progetto dal repository GitHub
3. Apri il servizio creato e controlla:
   - Root Directory: vuoto
   - Start Command: python3 server.py
4. Dopo il primo deploy genera il dominio pubblico dal pannello Networking
5. Per conservare le risposte, aggiungi un Volume al servizio
6. Monta il Volume su /data

Nota:
- server.py usera' automaticamente il mount path del Volume Railway
- se non c'e' un Volume, le risposte restano su filesystem temporaneo
