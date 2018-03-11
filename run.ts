#!/usr/bin/env node

import {App} from "./src/app";


const app = App.run();
App.instance.importTD();

/**
 * Create HTTP server
 */
const port = process.env.PORT || 5000;
app.listen(port);

console.log('Server listening on port ' + port);

/**
 * Throw error on unhandled promise rejection
 */
process.on('unhandledRejection', error => {
    throw error;
});
