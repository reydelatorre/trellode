#!/usr/bin/env node

import { dispatch } from './lib/cli';
import { fatal } from './lib/output';

dispatch(process.argv).catch((err: unknown) => {
    fatal(err instanceof Error ? err.message : String(err));
});
