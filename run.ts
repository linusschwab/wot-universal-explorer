#!/usr/bin/env node

import {App} from "./src/app";


App.run();

/**
 * Throw error on unhandled promise rejection
 */
process.on('unhandledRejection', error => {
    throw error;
});
