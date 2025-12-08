/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as financialSummary from "../financialSummary.js";
import type * as fixedExpenses from "../fixedExpenses.js";
import type * as goals from "../goals.js";
import type * as incomeSettings from "../incomeSettings.js";
import type * as incomes from "../incomes.js";
import type * as lib_auth from "../lib/auth.js";
import type * as variableExpenses from "../variableExpenses.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  financialSummary: typeof financialSummary;
  fixedExpenses: typeof fixedExpenses;
  goals: typeof goals;
  incomeSettings: typeof incomeSettings;
  incomes: typeof incomes;
  "lib/auth": typeof lib_auth;
  variableExpenses: typeof variableExpenses;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
