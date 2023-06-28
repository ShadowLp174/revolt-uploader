const fetch = require('node-fetch');
const FormData = require("form-data");
const https = require("https");
const fs = require("fs");

class Uploader {
  constructor(client, forceReady = false) {
    this.client = client;
    this.ready = forceReady;
    if (client.configuration) {
      this.url = client.configuration.features.autumn.url;
      this.ready = true;
      return this;
    }
    this.client.on("ready", () => {
      this.url = client.configuration.features.autumn.url;
      this.ready = true;
    });
    return this;
  }
  #uploadRaw(file, fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    return new Promise((res, rej) => {
      if (!fileName) rej("Filename can't be empty");
      const form = new FormData();
      form.append("file", file, {
        filename: fileName,
        name: "file"
      });

      fetch(this.url + "/" + tag, {
        method: "POST",
        body: form
      }).then(response => response.json()).then(json => {
        res(json.id);
      });
    });
  }
  uploadFile(fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    return new Promise((res, rej) => {
      if (!fileName) rej("Filename can't be empty");
      const stats = fs.statSync(fileName);
      let stream = fs.createReadStream(fileName);

      const formData = new FormData();
      formData.append("file", stream);

      fetch(this.url + "/" + tag, {
        method: "POST",
        headers: {
          "Content-Length": stats.size,
          "x-session-token": this.client.api.auth.headers["X-Session-Token"]
        },
        body: formData
      }).then(response => response.json()).then(json => {
        res(json.id);
      });
    });
  }
  uploadUrl(url, fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    return new Promise((res) => {
      https.get(url, async (response) => {
        res(await this.#uploadRaw(response, fileName, tag));
      })
    });
  }
  upload(file, fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");

    return this.#uploadRaw(file, fileName, tag);
  }
}



module.exports = Uploader;
