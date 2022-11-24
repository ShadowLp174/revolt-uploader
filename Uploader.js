const fetch = require('node-fetch');
const FormData = require("form-data");
const fs = require("fs");

class Uploader {
    constructor(client) {
        this.client = client;
        this.ready = false;
        this.client.on("ready", () => {
            this.url = client.configuration.features.autumn.url;
            this.ready = true;
        });
        return this;
    }
    upload(fileName, tag="attachments") {
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
}



module.exports = Uploader;