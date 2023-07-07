# Revolt Uploader

Revolt.js doesn't offer the ability to upload attachments, so here is a utility package to allow easy file uploads.

## Installation

`npm install revolt-uploader`

It's as easy as that! :)

## Usage

First, you have to import and initialize an uploader object.

```javascript
// import the uploader library
const Uploader = require("revolt-uploader");

// you have to initialize a revolt.js client object as well.
// Then initialize the uploader and provide it with the client
const uploader = new Uploader(client);
```

Now you've got your uploader. All you have to do is to login your bot client using `client.login("token")`

After that, you can upload files to revolt's servers using the `uploadFile` method.

```javascript
// you need to attach this to a message, meaning you need to have a message object
// you can get this by listening for the `message` event on the client object but this is up to you
client.on("message", (message) => {
  // the upload method will return an attachment id that you can add to the message
  Promise.allSettled([
    uploader.uploadFile("path/to/file", "file"),
    uploader.uploadFile("path/to/another/file", "another-file"),
  ]).then(attachments => { // we're using Promise.allSettled to asynchronously upload all of them
    attachments = attachments.map(attachment => attachment.value); // extracting the value from the promises
    // send the attachment to the channel
    message.channel.sendMessage({
        content: "Here is your file!",
        attachments: attachments // Note that attachments always has to be an array, even if you're only uploading one file
    });
    // All done!
  });

  // async/await approach:
  message.channel.sendMessage({
    content: "Here is your file!",
    attachments: [await uploader.uploadFile("/path/to/another/file", "file-name")]
  });
});
```

#### Uploading URLs

You can upload files from urls by using the `uploadUrl` method. It will stream the file from the url to autumn without saving the image on your machine.
It works just like a normal file upload:

```javascript
const id = await uploader.uploadUrl("url", "fileName");
```

### Advanced usage

If you need to upload anything else than existing files, use the `.upload(fileData, fileName)` method.
You can use any kind of data object for the fileData but have to specify the file name.

For example using a stream:

```javascript
const https = require("https");

client.on("message", (message) => {
  https.get("<url>", (response) => {
    message.channel.sendMessage({
      content: "Downloaded file: ",
      attachments: [await uploader.upload(response, "file.filetype")]
    });
  });
});
```

Furthermore, it is possible to upload your content under different tags. The default tag is `attachments`. These tags are available:

- `attachments`
- `avatars`
- `backgrounds`
- `icons`
- `banners`
- `emojis`

All of these have different configurations and limits. See [this file](https://github.com/revoltchat/autumn/blob/d5218727e56e986a4092ee635b10c3fd7c71e373/Autumn.toml#L7C2-L7C2) for the exact specifications.
