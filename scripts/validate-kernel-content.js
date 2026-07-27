#!/usr/bin/env node
/**
 * CI helper — validate Restoration Kernel content pack.
 */
import { assertContentPackValid } from '../js/kernel/schema.js';

try {
    assertContentPackValid();
    console.info('PASS: kernel content pack valid');
    process.exit(0);
} catch (e) {
    console.error(String(e && e.message ? e.message : e));
    process.exit(1);
}
