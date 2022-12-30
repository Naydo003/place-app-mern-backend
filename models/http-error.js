class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Add a "message" property. super() directs to the base class ie Error constructor.
    this.code = errorCode; // Adds a "code" property
  }
}

module.exports = HttpError;