import { createAction } from '@reduxjs/toolkit';

/** Wipes every slice back to its initial state ("Reset demo data"). */
export const resetApp = createAction('app/reset');
