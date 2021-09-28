export default {
  // If you are running against a local API on Sails, this is probably the root:
  apiRoot: 'http://localhost:1337',
  // The online staging API:
  // apiRoot: 'https://api-staging.yogo.dk',
  // Where to get images. Should be matching the API that are used.
  imageServerImgix: 'yogo-test.imgix.net',
  // Callback URL, primarily used for local testing
  externalCallbackUrl: 'https://yogo-api-dev.ngrok.io',
  // The clientId is needed for local development, where we don't have a custom domain.
  // In production and staging, client is determined by the caller domain.
  clientId: 1,
  googleWebFontsApiKey: 'AIzaSyAJhI0KONbefxUhDd3U6EZTZTmYqzKcyZc',
};