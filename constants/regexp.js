/* eslint-disable */

const ipAddressRegexp = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?){4}$/;
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// const emailAddressRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// const phoneNumberRegexp = /^\+[0-9]{12}$/;
// const USER_PASSWORD_REGEXP = /^(?=.*[0-9])(?=.*[!«#$%&'()*+,—./:;<=>?@[\\]^_`{|}~])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
// const ROUTE_PATH_REGEXP = /^[A-Za-z0-9\-\_\.\/\?\=\&\,]+$/;
// const TEMPLATE_VARIABLE_REGEXP = /\{{2}[a-z\_]+\}{2}/gm;

module.exports = {
    ipAddressRegexp,
    uuidV4Regex
    // phoneNumberRegexp,
    // emailAddressRegexp,
    // USER_PASSWORD_REGEXP,
    // ROUTE_PATH_REGEXP,
    // TEMPLATE_VARIABLE_REGEXP
};
