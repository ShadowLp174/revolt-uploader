const fetch = require('node-fetch');
const FormData = require("form-data");
const fs = require("fs");

class Uploader {
    constructor(client, forceReady=false) {
        this.client = client;
        this.ready = forceReady;
        if (forceReady) {
          this.url = client.configuration.features.autumn.url;
          return this;
        }
        this.client.on("ready", () => {
            this.url = client.configuration.features.autumn.url;
            this.ready = true;
        });
        return this;
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
                    "Content-Lenght": stats.size,
                    "x-session-token": this.client.api.auth.headers["X-Session-Token"]
                },
                body: formData
            }).then(response => response.json()).then(json => {
                res(json.id);
            });
        });
    }
    upload(file, fileName, tag="attachments") {
      if (!this.ready) throw new Error("Client is not ready yet. Login it with client.login() first.");

      return new Promise((res) => {
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
}



module.exports = Uploader;
