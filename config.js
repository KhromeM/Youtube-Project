const port = 3002;
const baseURL = `http://localhost:${port}`;
module.exports = {
  JWTsecret: "mysecret",
  baseURL: baseURL,
  port: port,
  oauth2Credentials: {
    client_id:
      "288004478969-47h37o4comfkaqjg0lv2esu73vvo8nq5.apps.googleusercontent.com",
    project_id: "youtube-project-356022",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "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",
    redirect_uris: [`${baseURL}/auth/google/callback`],
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
  },
};
