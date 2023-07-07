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
  uploadFile(filePath, name=null, tag="attachments") {
    if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");
    return new Promise(async (res, rej) => {
      if (!filePath) rej("File path can't be empty");
      let stream = fs.createReadStream(filePath);

      const formData = new FormData();
      formData.append("file", stream);
      res(await this.#uploadRaw(stream, name || filePath, tag));
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
