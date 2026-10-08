// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic
 * @description Structured and deterministically sortable DEM compiler diagnostic.
 */

const NS = 'TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic';

/**
 * Structured compiler diagnostic.
 */
export default class Diagnostic {
    /** @type {string} */
    code;
    /** @type {TeqFw_Db_Object} */
    details;
    /** @type {string} */
    message;
    /** @type {string} */
    path;
    /** @type {'error'|'warning'} */
    severity;
    /** @type {TeqFw_Db_SourceArray} */
    sources;
    /** @type {TeqFw_Db_DiagnosticStage} */
    stage;

    /**
     * @param {object} deps
     * @param {string} deps.code
     * @param {TeqFw_Db_Object} deps.details
     * @param {string} deps.message
     * @param {string} deps.path
     * @param {TeqFw_Db_DiagnosticSeverity} deps.severity
     * @param {TeqFw_Db_SourceArray} deps.sources
     * @param {TeqFw_Db_DiagnosticStage} deps.stage
     */
    constructor({code, details, message, path, severity, sources, stage}) {
        this.code = code;
        this.details = details;
        this.message = message;
        this.path = path;
        this.severity = severity;
        this.sources = sources;
        this.stage = stage;
    }
}

/**
 * @memberOf TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic
 */
export class Factory {
    static namespace = NS;

    /**
     * Initialize the factory.
     */
    constructor() {
        /** @type {Record<string, number>} */
        const stageOrder = Object.freeze({
            parse: 0,
            decode: 1,
            composition: 2,
            logical: 3,
            graph: 4,
            dialect: 5,
            preflight: 6,
            plan: 7,
            query: 8,
        });

        /**
         * @param {any} value
         * @returns {any}
         */
        const copy = function (value) {
            if (Array.isArray(value)) return Object.freeze(value.map(copy));
            if (value && typeof value === 'object') {
                /** @type {TeqFw_Db_Object} */
                const res = {};
                for (const key of Object.keys(value).sort()) res[key] = copy(value[key]);
                return Object.freeze(res);
            }
            return value;
        };

        /**
         * @param {any} source
         * @returns {string}
         */
        const sourceKey = function (source) {
            return `${source?.fragmentId ?? ''}\u0000${source?.filename ?? ''}\u0000${source?.sourcePointer ?? ''}`;
        };

        /**
         * @param {object} deps
         * @param {string} deps.code
         * @param {TeqFw_Db_Object} [deps.details]
         * @param {string} deps.message
         * @param {string} [deps.path]
         * @param {TeqFw_Db_DiagnosticSeverity} [deps.severity]
         * @param {TeqFw_Db_SourceArray} [deps.sources]
         * @param {string} deps.stage
         * @returns {TeqFw_Db_Back_Dto_Dem_Compile_Diagnostic}
         */
        this.create = function ({code, details = {}, message, path = '', severity = 'error', sources = [], stage}) {
            if (typeof code !== 'string' || code.length === 0) throw new TypeError('Diagnostic code is required.');
            if (typeof message !== 'string' || message.length === 0) throw new TypeError('Diagnostic message is required.');
            if (!(stage in stageOrder)) throw new TypeError(`Unknown diagnostic stage '${stage}'.`);
            if (severity !== 'error' && severity !== 'warning') throw new TypeError(`Unknown diagnostic severity '${severity}'.`);
            const res = new Diagnostic({
                code, details: copy(details), message,
                path: typeof path === 'string' ? path : '', severity,
                sources: Object.freeze([...sources].sort((a, b) => sourceKey(a).localeCompare(sourceKey(b))).map(copy)),
                stage: /** @type {TeqFw_Db_DiagnosticStage} */ (stage),
            });
            return Object.freeze(res);
        };

        /**
         * @param {TeqFw_Db_DiagnosticArray} values
         * @returns {TeqFw_Db_DiagnosticArray}
         */
        this.sort = function (values) {
            const res = [...values];
            res.sort((a, b) => {
                const stage = (stageOrder[a.stage] ?? Number.MAX_SAFE_INTEGER)
                    - (stageOrder[b.stage] ?? Number.MAX_SAFE_INTEGER);
                if (stage !== 0) return stage;
                const path = String(a.path ?? '').localeCompare(String(b.path ?? ''));
                if (path !== 0) return path;
                const code = String(a.code ?? '').localeCompare(String(b.code ?? ''));
                if (code !== 0) return code;
                const left = (a.sources ?? []).map(sourceKey).join('\u0001');
                const right = (b.sources ?? []).map(sourceKey).join('\u0001');
                return left.localeCompare(right);
            });
            return Object.freeze(res);
        };
    }
}

Object.freeze(Diagnostic);
