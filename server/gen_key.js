const fs = require('fs');
const key = fs.readFileSync('key.pem', 'utf8');
const json = {
  "type": "service_account",
  "project_id": "fake-project-id",
  "private_key_id": "fake-private-key-id",
  "private_key": key,
  "client_email": "fake-client-email@fake-project-id.iam.gserviceaccount.com",
  "client_id": "fake-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/fake-client-email%40fake-project-id.iam.gserviceaccount.com"
};
fs.writeFileSync('firebaseServiceAccountKey.json', JSON.stringify(json, null, 2));
