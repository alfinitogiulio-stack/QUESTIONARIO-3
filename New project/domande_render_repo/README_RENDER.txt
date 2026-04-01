Deploy stabile senza dominio con Render

1. Crea un repository GitHub con i file di questa cartella `domande`.
2. Su Render crea un nuovo Web Service collegando quel repository.
3. Se Render legge `render.yaml`, usa direttamente questa configurazione.
4. Alla fine avrai un link fisso tipo `https://nome-servizio.onrender.com`.

Note importanti

- Il server e' gia' pronto per Render: legge automaticamente la porta dall'ambiente.
- Il file delle risposte viene salvato in `responses.json`.
- Su Render piano `free` il link e' stabile, ma i file locali non sono garantiti in modo permanente dopo restart o redeploy.
- Se vuoi mantenere le risposte in modo piu' affidabile, devi aggiungere un disco persistente o un database.

Link utili ufficiali

- https://render.com/docs
- https://render.com/docs/blueprint-spec
