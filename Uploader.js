const fetch = require('node-fetch');
const FormData = require("form-data");
const https = require("https");
const fs = require("fs");

class Uploader {
  constructor(client, token, forceReady = false) {
    this.client = client;
    this.ready = forceReady;
    this.token = token
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
    if (!this.token) throw new Error("Bot token is not set.");
    return new Promise((res, rej) => {
      if (!fileName) rej("Filename can't be empty");
      const form = new FormData({
        maxDataSize: Infinity
      });
      form.append("file", file, {
        filename: fileName,
        name: "file"
      });

      fetch(this.url + "/" + tag, {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
          "X-Bot-Token": this.token
        }
      }).then(response => response.json()).then(json => {
        res(json.id);
      });
    });
  }
  uploadFile(filePath, name=null, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    if (!this.token) throw new Error("Bot token is not set.");
    return new Promise(async (res, rej) => {
      if (!filePath) rej("File path can't be empty");
      let stream = fs.createReadStream(filePath);
      res(await this.#uploadRaw(stream, name || filePath, tag));
    });
  }
  uploadUrl(url, fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    if (!this.token) throw new Error("Bot token is not set.");
    return new Promise((res) => {
      https.get(url, async (response) => {
        res(await this.#uploadRaw(response, fileName, tag));
      })
    });
  }
  upload(file, fileName, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    if (!this.token) throw new Error("Bot token is not set.");

    return this.#uploadRaw(file, fileName, tag);
  }
}



module.exports = Uploader;
