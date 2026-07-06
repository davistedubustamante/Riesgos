// Errores tipados para que el middleware los serialice de forma homogénea.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
