// path: src/utils/parseXml.js
const xml2js = require('xml2js');

/**
 * Parse XML response from Namecheap API and throw on any reported errors.
 * Returns the ApiResponse object on success.
 */
async function parseXml(xml) {
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false, mergeAttrs: true });
  const result = await parser.parseStringPromise(xml);

  const response = result.ApiResponse;
  const errors = response?.Errors?.Error;
  if (errors) {
    // Error can be single object or array
    const err = Array.isArray(errors) ? errors[0] : errors;
    const message = err.Message || err._ || JSON.stringify(err);
    const code = err.Number || err.Code;
    throw new Error(message + (code ? ` (Code: ${code})` : ''));
  }

  return response;
}

module.exports = parseXml;
