# Safehouse Solutions API

Safehouse Solutions API er den centrale backend for Safehouse-platformen.  
API’et er bygget i **Node.js (Express)** og fungerer som forbindelsesled mellem webklienten, IoT-enhederne og databasen.  
Det håndterer autentifikation, enhedskommunikation, video- og adgangslogning samt styring af sensorer og aktører gennem MQTT.

---

## Tekniske specifikationer
- **Platform:** Node.js (v18+)  
- **Framework:** Express  
- **Database:** MySQL  
- **IoT-kommunikation:** MQTT (TLS)  
- **Cloud-lagring:** Azure Blob Storage  
- **Autentifikation:** JWT (JSON Web Tokens)  
- **CI/CD:** Azure DevOps Pipelines  
- **Filhåndtering:** Multer + FFmpeg  

---

## Funktionelle moduler

### 1. Autentifikation (`/auth`)
- Login og registrering af brugere.
- Token-baseret session via JWT.
- Bcrypt bruges til hashing af adgangskoder.
- Middleware sikrer beskyttelse af private endpoints.

### 2. Bruger- og lokationsstyring (`/users`, `/locations`)
- CRUD-endpoints til administration af brugere og placeringer (f.eks. “stue”, “garage”).
- Brugere kan knyttes til specifikke enheder og lokationer.
- Bruges af dashboardet til at vise og administrere brugernes IoT-enheder.

### 3. Adgangskontrol (`/keycards`)
- Håndtering af RFID-nøgler og adgangslogs.
- Logger adgangsforsøg fra RFID-enheder.
- Understøtter oprettelse, sletning og autorisation af kort.
- Kommunikerer med `mqttHandlers/rfidHandlers.js` for realtidsvalidering.

### 4. Temperatur & Ventilator (`/temperature`)
- Modtager data fra SHS_Temperatur-enheden via MQTT.
- Gemmer temperaturmålinger i databasen.
- Sender konfigurationsændringer (f.eks. grænseværdier) tilbage til IoT-enheden.
- Kan aktivere ventilator via MQTT gennem `fanHandler.js`.

### 5. Kamera & Video (`/camera`, `/videos`)
- Modtager beskeder fra SHS_Security_Camera via MQTT.
- Uploadede videoer lagres i **Azure Blob Storage**.
- Thumbnails genereres via `ffmpeg` og vises i dashboardet.
- `/videos`-routen muliggør visning og download af tidligere optagelser.

---

## MQTT-integration

### Konfiguration
MQTT-forbindelsen initialiseres i `src/config/mqtt.js`:
```js
import mqtt from 'mqtt';
const client = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  port: 8883,
  protocol: 'mqtts',
});
```

## Håndterede topics
API’et fungerer som broker-klient og modtager beskeder fra forskellige enheder:

```
{UserID}/rfid/#
{UserID}/temperature/#
{UserID}/fan/#
{UserID}/camera/#
```

## Handlere
* rfidHandlers.js: verificerer UID fra RFID-enhed mod database.
* temperatureHandlers.js: opdaterer temperatur og fugtighed i databasen.
* fanHandler.js: styrer ventilatorstatus og sender MQTT-feedback.
* cameraHandler.js: håndterer notifikationer fra kameraer ved bevægelse og upload.
* MQTT-integration muliggør real-time synkronisering mellem enheder og dashboard, så brugeren kan se ændringer øjeblikkeligt uden at genindlæse websiden.

## Databasestruktur

API’et anvender en MySQL-database med følgende centrale tabeller:
* users – brugerkonti og adgangsdata
* rfid_cards – registrerede adgangskort
* access_logs – historik over adgangsforsøg
* temperatures – temperaturmålinger pr. lokation
* videos – metadata for optagede videoer
* locations – rum / områder tilknyttet brugerens hjem

Databaseforbindelsen håndteres via src/config/database.js med pullede forbindelser for performance.

## Sikkerhed
* JWT til API-adgang og sessionhåndtering.
* Bcrypt til hashing af adgangskoder.
* TLS 1.2 på MQTT-kommunikation.
* CORS aktiveret med restriktive regler for frontenddomæner.
* Azure Blob Storage SAS-token bruges til midlertidig adgang til videoer.
* Alle uploads gemmes i en isoleret uploads/-mappe med automatisk filvalidering.

## Projektstruktur
```
SafehouseSolutionsApi/
├── src/
│   ├── config/           # Database- og MQTT-konfiguration
│   ├── controllers/      # Forretningslogik (Auth, Kamera, Temperatur osv.)
│   ├── middleware/       # JWT-validering og upload-håndtering
│   ├── mqttHandlers/     # IoT-specifik logik for hver enhedstype
│   ├── routes/           # REST-endpoints
│   ├── utils/            # Hjælpefunktioner (FFmpeg, SQL, logning)
│   └── app.js            # Hovedserver
├── azure-pipelines-*.yml # CI/CD konfiguration (staging & production)
├── package.json          # Afhængigheder og scripts
└── README.md
```

## Installation og opsætning

Krav:
* Node.js 18+
* MySQL-server
* MQTT-broker (Mosquitto el. lign.)
* Azure Blob Storage container

Miljøvariabler (.env):
```ini
PORT=4000
HOST=localhost
DB_HOST=localhost
DB_USER=root
DB_PASS=secret
DB_NAME=safehouse
MQTT_BROKER_URL=mqtts://broker.safehouse.local
MQTT_USER=shs_user
MQTT_PASS=shs_pass
AZURE_CONNECTION_STRING=<azure_conn>
AZURE_CONTAINER=security-videos
JWT_SECRET=<random_secret>
```

```bash
npm install
npm run dev
```

## CI/CD og deployment

Projektet er integreret i Azure DevOps med to pipeline-filer:

* azure-pipelines-staging.yml
* azure-pipelines-production.yml

Disse pipelines håndterer:
* Automatisk test og build.
* Deployment til IIS på Windows Server.
* Versionsstyring og rollback.
* Variabelstyring via Azure Key Vault.

## Fremtidige udvidelser

* WebSocket-gateway til endnu hurtigere realtidsdata.
* Automatisk rapportgenerering for IoT-logs.
* Webhook-understøttelse for tredjepartsintegration.
* Rate limiting og request logging via middleware.
