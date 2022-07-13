const express = require("express");
const google = require("googleapis").google;
const jwt = require("jsonwebtoken");
const OAuth2 = google.auth.OAuth2;
const CONFIG = require("./config");
const cookieparser = require("cookie-parser");

const app = express();
app.use(cookieparser());

app.set("view engine", "ejs");
app.set("views", __dirname);

app.listen(CONFIG.port, () => {
  console.log(`Listening on port: ${CONFIG.port}`);
});

app.get("/", (req, res) => {
  const oauth2Client = new OAuth2(
    CONFIG.oauth2Credentials.client_id,
    CONFIG.oauth2Credentials.client_secret,
    CONFIG.oauth2Credentials.redirect_uris[0]
  );
  const loginLink = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: CONFIG.oauth2Credentials.scopes,
  });
  return res.render("index", { loginLink: loginLink });
});

app.get("/auth/google/callback", function (req, res) {
  // Create an OAuth2 client object from the credentials in our config file
  const oauth2Client = new OAuth2(
    CONFIG.oauth2Credentials.client_id,
    CONFIG.oauth2Credentials.client_secret,
    CONFIG.oauth2Credentials.redirect_uris[0]
  );
  if (req.query.error) {
    // The user did not give us permission.
    return res.redirect("/");
  } else {
    oauth2Client.getToken(req.query.code, function (err, token) {
      if (err) return res.redirect("/");

      // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'
      res.cookie("jwt", jwt.sign(token, CONFIG.JWTsecret));
      return res.redirect("/get_some_data");
    });
  }
});

app.get("/get_some_data", function (req, res) {
  if (!req.cookies.jwt) {
    // We haven't logged in
    return res.redirect("/");
  }
  // Create an OAuth2 client object from the credentials in our config file
  const oauth2Client = new OAuth2(
    CONFIG.oauth2Credentials.client_id,
    CONFIG.oauth2Credentials.client_secret,
    CONFIG.oauth2Credentials.redirect_uris[0]
  );
  // Add this specific user's credentials to our OAuth2 client
  oauth2Client.credentials = jwt.verify(req.cookies.jwt, CONFIG.JWTsecret);
  // Get the youtube service
  const service = google.youtube("v3");
  // Get five of the user's subscriptions (the channels they're subscribed to)

  //   service.subscriptions
  //     .list({
  //       auth: oauth2Client,
  //       mine: true,
  //       part: "snippet,contentDetails",
  //       maxResults: 5,
  //     })
  //     .then((response) => {
  //       // Render the data view, passing the subscriptions to it
  //       return res.render("data", { subscriptions: response.data.items });
  //     });

  service.playlists
    .list({
      auth: oauth2Client,
      part: "snippet",
      mine: true,
      maxResults: 50,
    })
    .then((response) => {
      let html = processData(response.data.items);
      //   res.json(response);
      res.send(html);
    });
});

const processData = (playlists) => {
  console.log(playlists.length);
  let arr = [];
  let counter = 0;
  playlists.map((playlist) => {
    counter++;
    snippet = playlist.snippet;
    let url = `https://www.youtube.com/playlist?list=${playlist.id}`;
    let title = snippet.title;
    let thumbnail = snippet.thumbnails.high.url;
    let html = ` <br/> <div>
         <a href="${url}"> 
         <div> 
         <h3> ${counter + " " + title} </h3> <br/> <br/> 
         <img src="${thumbnail}" alt="${title}">
         </div> 
         </a> 
         </div> <br/> `;
    arr.push(html);
  });
  let final = arr.join(" ");
  let html1 =
    '<!DOCTYPE html> <html lang="en"><head><title>Playlists</title> </head> <body></body>';

  let html2 = "</body> </html>";
  final = html1 + final + html2;
  return final;
};
