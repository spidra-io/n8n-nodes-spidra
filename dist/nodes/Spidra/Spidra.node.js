"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spidra = void 0;
const n8n_workflow_1 = require("n8n-workflow");
// ─── Proxy country list ───────────────────────────────────────────────────────
const PROXY_COUNTRY_OPTIONS = [
    { name: 'United States', value: 'us' },
    { name: 'United Kingdom', value: 'gb' },
    { name: 'Germany', value: 'de' },
    { name: 'France', value: 'fr' },
    { name: 'Japan', value: 'jp' },
    { name: 'Australia', value: 'au' },
    { name: 'Canada', value: 'ca' },
    { name: 'Brazil', value: 'br' },
    { name: 'India', value: 'in' },
    { name: 'Netherlands', value: 'nl' },
    { name: 'Singapore', value: 'sg' },
    { name: 'Spain', value: 'es' },
    { name: 'Italy', value: 'it' },
    { name: 'Mexico', value: 'mx' },
    { name: 'South Africa', value: 'za' },
    { name: 'Nigeria', value: 'ng' },
    { name: 'Argentina', value: 'ar' },
    { name: 'Belgium', value: 'be' },
    { name: 'Switzerland', value: 'ch' },
    { name: 'Chile', value: 'cl' },
    { name: 'China', value: 'cn' },
    { name: 'Colombia', value: 'co' },
    { name: 'Czech Republic', value: 'cz' },
    { name: 'Denmark', value: 'dk' },
    { name: 'Egypt', value: 'eg' },
    { name: 'Finland', value: 'fi' },
    { name: 'Greece', value: 'gr' },
    { name: 'Hong Kong', value: 'hk' },
    { name: 'Hungary', value: 'hu' },
    { name: 'Indonesia', value: 'id' },
    { name: 'Ireland', value: 'ie' },
    { name: 'Israel', value: 'il' },
    { name: 'South Korea', value: 'kr' },
    { name: 'Malaysia', value: 'my' },
    { name: 'Norway', value: 'no' },
    { name: 'New Zealand', value: 'nz' },
    { name: 'Peru', value: 'pe' },
    { name: 'Philippines', value: 'ph' },
    { name: 'Poland', value: 'pl' },
    { name: 'Portugal', value: 'pt' },
    { name: 'Romania', value: 'ro' },
    { name: 'Saudi Arabia', value: 'sa' },
    { name: 'Sweden', value: 'se' },
    { name: 'Thailand', value: 'th' },
    { name: 'Turkey', value: 'tr' },
    { name: 'Taiwan', value: 'tw' },
    { name: 'Ukraine', value: 'ua' },
    { name: 'Vietnam', value: 'vn' },
    { name: 'European Union', value: 'eu' },
    { name: 'Global (random)', value: 'global' },
];
// ─── Shared scrape/batch options ──────────────────────────────────────────────
// These fields appear in the Options collection for Scrape and Batch Scrape.
// Crawl has its own separate options (it doesn't support screenshot/schema/prompt).
const SCRAPE_OPTIONS_FIELDS = [
    {
        displayName: 'Extraction Prompt',
        name: 'prompt',
        type: 'string',
        default: '',
        placeholder: 'e.g. Extract the product name, price, and availability',
        description: 'Plain English description of the data you want extracted from the page. Only applies when Output Format is JSON. For structured output, use Extraction Schema instead.',
    },
    {
        displayName: 'Extraction Schema',
        name: 'schema',
        type: 'json',
        default: '{}',
        placeholder: '{\n  "type": "object",\n  "properties": {\n    "title": { "type": "string" },\n    "price": { "type": "number" }\n  }\n}',
        description: 'JSON Schema for structured AI extraction. Only applies when Output Format is JSON. Takes precedence over Extraction Prompt.',
    },
    {
        displayName: 'Main Content Only',
        name: 'extractContentOnly',
        type: 'boolean',
        default: false,
        description: 'Whether to strip navigation menus, ads, cookie banners, and other boilerplate — leaving only the main page content',
    },
    {
        displayName: 'Capture Screenshot',
        name: 'screenshot',
        type: 'boolean',
        default: false,
        description: 'Whether to capture a screenshot of the page after it finishes loading',
    },
    {
        displayName: 'Full Page Screenshot',
        name: 'fullPageScreenshot',
        type: 'boolean',
        default: false,
        displayOptions: { show: { screenshot: [true] } },
        description: 'Whether to scroll and stitch the entire page height into one image instead of just the visible viewport',
    },
    {
        displayName: 'Use Proxy',
        name: 'useProxy',
        type: 'boolean',
        default: false,
        description: 'Whether to route the request through a residential proxy. Helps bypass bot detection on protected sites.',
    },
    {
        displayName: 'Proxy Country',
        name: 'proxyCountry',
        type: 'options',
        options: PROXY_COUNTRY_OPTIONS,
        default: 'us',
        displayOptions: { show: { useProxy: [true] } },
        description: 'Exit country for the proxy. The target site will see traffic from this country.',
    },
    {
        displayName: 'Cookies',
        name: 'cookies',
        type: 'string',
        default: '',
        placeholder: 'session=abc123; auth_token=xyz',
        description: 'Cookie header string to send with the request. Use this to scrape pages that require you to be logged in.',
    },
];
// ─── Node ─────────────────────────────────────────────────────────────────────
class Spidra {
    constructor() {
        this.description = {
            displayName: 'Spidra',
            name: 'spidra',
            icon: 'file:spidra.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
            description: 'Scrape pages, run batch jobs, and crawl entire websites with Spidra AI',
            defaults: { name: 'Spidra' },
            // @ts-ignore — usableAsTool supported in n8n ≥ 1.23
            usableAsTool: true,
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    displayName: 'Spidra API',
                    name: 'spidraApi',
                    required: true,
                },
            ],
            properties: [
                // ── Resource ────────────────────────────────────────────────────────────
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        { name: 'Scrape', value: 'scrape', description: 'Scrape up to 3 URLs in a single request' },
                        { name: 'Batch Scrape', value: 'batchScrape', description: 'Scrape a large list of URLs in one job' },
                        { name: 'Crawl', value: 'crawl', description: 'Crawl an entire website starting from a root URL' },
                        { name: 'Logs', value: 'logs', description: 'Browse your past scrape logs' },
                        { name: 'Usage', value: 'usage', description: 'Check your API credit usage' },
                    ],
                    default: 'scrape',
                },
                // ── Operations: Scrape ─────────────────────────────────────────────────
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['scrape'] } },
                    options: [
                        {
                            name: 'Run',
                            value: 'run',
                            description: 'Submit a scrape job and wait here until results are ready',
                            action: 'Run a scrape job',
                        },
                        {
                            name: 'Submit',
                            value: 'submit',
                            description: 'Submit a scrape job and immediately get back a Job ID — chain a "Get Status" node to fetch results later',
                            action: 'Submit a scrape job',
                        },
                        {
                            name: 'Get Status',
                            value: 'getStatus',
                            description: 'Check the status and retrieve the results of a previously submitted scrape job',
                            action: 'Get scrape job status',
                        },
                    ],
                    default: 'run',
                },
                // ── Operations: Batch Scrape ───────────────────────────────────────────
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['batchScrape'] } },
                    options: [
                        {
                            name: 'Run',
                            value: 'run',
                            description: 'Submit a batch scrape job and wait here until all URLs are done',
                            action: 'Run a batch scrape',
                        },
                        {
                            name: 'Submit',
                            value: 'submit',
                            description: 'Submit a batch scrape and immediately get back a Batch ID — chain a "Get Status" node to fetch results later',
                            action: 'Submit a batch scrape',
                        },
                        {
                            name: 'Get Status',
                            value: 'getStatus',
                            description: 'Check the status and results of a previously submitted batch scrape',
                            action: 'Get batch scrape status',
                        },
                        {
                            name: 'List',
                            value: 'list',
                            description: 'Get a list of all batch scrape jobs for your account',
                            action: 'List batch scrape jobs',
                        },
                        {
                            name: 'Cancel',
                            value: 'cancel',
                            description: 'Cancel a batch scrape that is still running. Credits for unprocessed URLs will be refunded.',
                            action: 'Cancel batch scrape',
                        },
                        {
                            name: 'Retry Failed',
                            value: 'retryFailed',
                            description: 'Re-queue all URLs that failed in a previous batch scrape',
                            action: 'Retry failed batch scrape URLs',
                        },
                    ],
                    default: 'run',
                },
                // ── Operations: Crawl ──────────────────────────────────────────────────
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['crawl'] } },
                    options: [
                        {
                            name: 'Run',
                            value: 'run',
                            description: 'Submit a crawl job and wait here until the crawl finishes',
                            action: 'Run a crawl job',
                        },
                        {
                            name: 'Submit',
                            value: 'submit',
                            description: 'Submit a crawl job and immediately get back a Job ID — chain a "Get Status" node to fetch results later',
                            action: 'Submit a crawl job',
                        },
                        {
                            name: 'Get Status',
                            value: 'getStatus',
                            description: 'Check the current status and progress of a crawl job',
                            action: 'Get crawl job status',
                        },
                        {
                            name: 'Get Pages',
                            value: 'getPages',
                            description: 'Retrieve the individual pages collected by a completed crawl',
                            action: 'Get crawl pages',
                        },
                        {
                            name: 'Extract',
                            value: 'extract',
                            description: 'Re-run AI extraction on a completed crawl using a new extraction instruction',
                            action: 'Extract from crawl',
                        },
                        {
                            name: 'History',
                            value: 'history',
                            description: 'Get a list of all past crawl jobs for your account',
                            action: 'Get crawl history',
                        },
                    ],
                    default: 'run',
                },
                // ── Operations: Logs ───────────────────────────────────────────────────
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['logs'] } },
                    options: [
                        {
                            name: 'List',
                            value: 'list',
                            description: 'Get a paginated list of scrape log entries for your account',
                            action: 'List logs',
                        },
                        {
                            name: 'Get',
                            value: 'get',
                            description: 'Get the full details of a single scrape log entry',
                            action: 'Get log',
                        },
                    ],
                    default: 'list',
                },
                // ── Operations: Usage ──────────────────────────────────────────────────
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['usage'] } },
                    options: [
                        {
                            name: 'Get Stats',
                            value: 'getStats',
                            description: 'Get credit usage, bandwidth, and request counts for your account',
                            action: 'Get usage stats',
                        },
                    ],
                    default: 'getStats',
                },
                // ── Scrape: URL list (up to 3) ─────────────────────────────────────────
                {
                    displayName: 'URLs',
                    name: 'urls',
                    type: 'fixedCollection',
                    typeOptions: { multipleValues: true, maxValues: 3 },
                    displayOptions: {
                        show: { resource: ['scrape'], operation: ['run', 'submit'] },
                    },
                    placeholder: 'Add URL',
                    default: {},
                    description: 'The pages to scrape. Add up to 3 URLs. For larger lists use Batch Scrape.',
                    options: [
                        {
                            displayName: 'URL',
                            name: 'urlEntry',
                            values: [
                                {
                                    displayName: 'URL',
                                    name: 'url',
                                    type: 'string',
                                    default: '',
                                    required: true,
                                    placeholder: 'https://example.com/page',
                                    description: 'Full URL of the page to scrape (must start with http:// or https://)',
                                },
                                {
                                    displayName: 'Browser Actions',
                                    name: 'actions',
                                    type: 'json',
                                    default: '[]',
                                    placeholder: '[{ "type": "click", "value": "Load more results" }, { "type": "wait", "duration": 2000 }]',
                                    description: 'Optional. Step-by-step browser interactions to perform before scraping (e.g. click a button, fill a form, scroll). Each action needs a "type" (click, type, scroll, wait, check, uncheck, forEach) and a target — use "selector" for a CSS selector or "value" for a plain-English description the AI will locate.',
                                },
                            ],
                        },
                    ],
                },
                // ── Batch Scrape: URL list ─────────────────────────────────────────────
                {
                    displayName: 'URLs',
                    name: 'batchUrls',
                    type: 'string',
                    typeOptions: { multipleValues: true },
                    displayOptions: {
                        show: { resource: ['batchScrape'], operation: ['run', 'submit'] },
                    },
                    default: [],
                    placeholder: 'https://example.com/page',
                    description: 'List of URLs to scrape. Add as many as you need (up to 50 per batch).',
                },
                // ── Scrape Output Format (top-level — used often enough to not be buried in Options) ──
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    displayOptions: {
                        show: { resource: ['scrape', 'batchScrape'], operation: ['run', 'submit'] },
                    },
                    options: [
                        { name: 'JSON', value: 'json', description: 'Structured JSON — best when using an Extraction Schema or Prompt' },
                        { name: 'Markdown', value: 'markdown', description: 'Clean Markdown text of the page content' },
                    ],
                    default: 'json',
                    description: 'Format of the returned page content',
                },
                // ── Scrape Options ─────────────────────────────────────────────────────
                {
                    displayName: 'Options',
                    name: 'scrapeOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    displayOptions: {
                        show: { resource: ['scrape'], operation: ['run', 'submit'] },
                    },
                    default: {},
                    options: SCRAPE_OPTIONS_FIELDS,
                },
                // ── Batch Scrape Options ───────────────────────────────────────────────
                {
                    displayName: 'Options',
                    name: 'batchScrapeOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    displayOptions: {
                        show: { resource: ['batchScrape'], operation: ['run', 'submit'] },
                    },
                    default: {},
                    options: SCRAPE_OPTIONS_FIELDS,
                },
                // ── Crawl required fields ──────────────────────────────────────────────
                {
                    displayName: 'Start URL',
                    name: 'crawlBaseUrl',
                    type: 'string',
                    displayOptions: {
                        show: { resource: ['crawl'], operation: ['run', 'submit'] },
                    },
                    default: '',
                    required: true,
                    placeholder: 'https://example.com',
                    description: 'The root URL the crawler starts from. Links discovered here will be followed.',
                },
                {
                    displayName: 'Navigation Instruction',
                    name: 'crawlInstruction',
                    type: 'string',
                    typeOptions: { rows: 3 },
                    displayOptions: {
                        show: { resource: ['crawl'], operation: ['run', 'submit'] },
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. Follow all product links. Ignore blog posts, social media links, and external sites.',
                    description: 'Tell the AI which pages to visit and which links to follow or skip during the crawl',
                },
                {
                    displayName: 'Extraction Instruction',
                    name: 'transformInstruction',
                    type: 'string',
                    typeOptions: { rows: 3 },
                    displayOptions: {
                        show: { resource: ['crawl'], operation: ['run', 'submit', 'extract'] },
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. Extract the product name, price, currency, and stock status from each page.',
                    description: 'Describe what data the AI should pull from each crawled page (e.g. "Extract the product name, price, and stock status"). When using the Extract operation on an existing crawl, this replaces the previous instruction and re-processes all collected pages.',
                },
                // ── Crawl Options ──────────────────────────────────────────────────────
                {
                    displayName: 'Options',
                    name: 'crawlOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    displayOptions: {
                        show: { resource: ['crawl'], operation: ['run', 'submit'] },
                    },
                    default: {},
                    options: [
                        {
                            displayName: 'Max Pages',
                            name: 'maxPages',
                            type: 'number',
                            typeOptions: { minValue: 1 },
                            default: 5,
                            description: 'Maximum number of pages the crawler will visit before stopping',
                        },
                        {
                            displayName: 'Use Proxy',
                            name: 'useProxy',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to route crawl requests through a residential proxy',
                        },
                        {
                            displayName: 'Proxy Country',
                            name: 'proxyCountry',
                            type: 'options',
                            options: PROXY_COUNTRY_OPTIONS,
                            default: 'us',
                            displayOptions: { show: { useProxy: [true] } },
                            description: 'Exit country for the proxy',
                        },
                        {
                            displayName: 'Cookies',
                            name: 'cookies',
                            type: 'string',
                            default: '',
                            placeholder: 'session=abc123; auth_token=xyz',
                            description: 'Cookie header string for crawling pages that require authentication',
                        },
                    ],
                },
                // ── Scrape / Crawl: Job ID ─────────────────────────────────────────────
                {
                    displayName: 'Job ID',
                    name: 'jobId',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['scrape', 'crawl'],
                            operation: ['getStatus', 'getPages', 'extract'],
                        },
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    description: 'The Job ID from a previous "Submit" or "Run" (on timeout) operation. Found in the output of those nodes as "jobId".',
                },
                // ── Batch Scrape: Batch ID ─────────────────────────────────────────────
                {
                    displayName: 'Batch ID',
                    name: 'batchId',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['batchScrape'],
                            operation: ['getStatus', 'cancel', 'retryFailed'],
                        },
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    description: 'The Batch ID from a previous "Submit" or "Run" (on timeout) operation. Found in the output of those nodes as "batchId".',
                },
                // ── Logs: Log ID ───────────────────────────────────────────────────────
                {
                    displayName: 'Log ID',
                    name: 'logId',
                    type: 'string',
                    displayOptions: {
                        show: { resource: ['logs'], operation: ['get'] },
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    description: 'UUID of the scrape log entry to retrieve. Find it in the output of a Logs → List call.',
                },
                // ── Logs: list options ─────────────────────────────────────────────────
                {
                    displayName: 'Limit',
                    name: 'limit',
                    type: 'number',
                    typeOptions: { minValue: 1 },
                    displayOptions: { show: { resource: ['logs'], operation: ['list'] } },
                    default: 10,
                    description: 'Maximum number of log entries to return',
                },
                {
                    displayName: 'Page',
                    name: 'page',
                    type: 'number',
                    typeOptions: { minValue: 1 },
                    displayOptions: { show: { resource: ['logs'], operation: ['list'] } },
                    default: 1,
                    description: 'Page number for paginated results',
                },
                {
                    displayName: 'Filters',
                    name: 'logFilters',
                    type: 'collection',
                    placeholder: 'Add Filter',
                    displayOptions: { show: { resource: ['logs'], operation: ['list'] } },
                    default: {},
                    options: [
                        {
                            displayName: 'Search',
                            name: 'searchTerm',
                            type: 'string',
                            default: '',
                            placeholder: 'https://example.com',
                            description: 'Filter logs by URL or preset name',
                        },
                        {
                            displayName: 'Status',
                            name: 'status',
                            type: 'options',
                            options: [
                                { name: 'Success', value: 'success' },
                                { name: 'Error', value: 'error' },
                                { name: 'In Progress', value: 'in_progress' },
                            ],
                            default: 'success',
                            description: 'Filter by scrape result status',
                        },
                    ],
                },
                // ── Usage: time range ──────────────────────────────────────────────────
                {
                    displayName: 'Time Range',
                    name: 'range',
                    type: 'options',
                    displayOptions: { show: { resource: ['usage'], operation: ['getStats'] } },
                    options: [
                        { name: 'Last 7 Days', value: '7d' },
                        { name: 'Last 30 Days', value: '30d' },
                        { name: 'This Week', value: 'weekly' },
                    ],
                    default: '7d',
                    description: 'Time window for the usage statistics',
                },
                // ── Max Wait Time ──────────────────────────────────────────────────────
                {
                    displayName: 'Max Wait Time (Seconds)',
                    name: 'maxWaitTime',
                    type: 'number',
                    typeOptions: { minValue: 10 },
                    displayOptions: {
                        show: { operation: ['run'] },
                    },
                    default: 120,
                    description: 'How many seconds to wait for the job to complete. If the job is still running when this limit is reached, the node returns a timeout response with the Job ID so you can chain a "Get Status" node to check progress later.',
                },
            ],
        };
    }
    // ─── execute ──────────────────────────────────────────────────────────────
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('spidraApi');
        const baseUrl = credentials.baseUrl.replace(/\/$/, '');
        const apiKey = credentials.apiKey;
        // ── Helpers ──────────────────────────────────────────────────────────────
        const apiRequest = async (method, path, body, qs) => {
            try {
                return (await this.helpers.httpRequest({
                    method,
                    url: `${baseUrl}${path}`,
                    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
                    body,
                    qs,
                    json: true,
                }));
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
        };
        const pollUntilDone = async (getStatusFn, maxWaitSeconds, idField, idValue) => {
            var _a;
            const terminal = ['completed', 'failed', 'cancelled'];
            const intervalMs = 3000;
            const maxAttempts = Math.ceil((maxWaitSeconds * 1000) / intervalMs);
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                let result;
                for (let retry = 0; retry < 3; retry++) {
                    try {
                        result = await getStatusFn();
                        break;
                    }
                    catch (err) {
                        if (retry === 2)
                            throw err;
                        await (0, n8n_workflow_1.sleep)(3000);
                    }
                }
                const status = (_a = result.status) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (status && terminal.includes(status))
                    return result;
                if (attempt < maxAttempts - 1)
                    await (0, n8n_workflow_1.sleep)(intervalMs);
            }
            return {
                success: false,
                status: 'timeout',
                [idField]: idValue,
                message: `Job did not complete within ${maxWaitSeconds}s. Use "Get Status" with the ${idField} to check progress.`,
            };
        };
        const parseSchema = (raw) => {
            if (!raw || raw === '{}')
                return undefined;
            try {
                return typeof raw === 'string' ? JSON.parse(raw) : raw;
            }
            catch {
                return undefined;
            }
        };
        // ── Item loop ─────────────────────────────────────────────────────────────
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                let responseData = {};
                // ── SCRAPE ───────────────────────────────────────────────────────────
                if (resource === 'scrape') {
                    if (operation === 'run' || operation === 'submit') {
                        const urlsCollection = this.getNodeParameter('urls', i);
                        const entries = (_a = urlsCollection.urlEntry) !== null && _a !== void 0 ? _a : [];
                        if (entries.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Add at least one URL before running.', { itemIndex: i });
                        }
                        const outputFormat = this.getNodeParameter('outputFormat', i, 'json');
                        const options = this.getNodeParameter('scrapeOptions', i, {});
                        const parsedSchema = parseSchema(options.schema);
                        const urlsPayload = entries.map((e) => ({
                            url: e.url,
                            actions: (() => {
                                var _a;
                                try {
                                    return typeof e.actions === 'string' ? JSON.parse(e.actions) : ((_a = e.actions) !== null && _a !== void 0 ? _a : []);
                                }
                                catch {
                                    return [];
                                }
                            })(),
                        }));
                        const body = {
                            urls: urlsPayload,
                            output: outputFormat,
                            ...(options.prompt ? { prompt: options.prompt } : {}),
                            ...(parsedSchema ? { schema: parsedSchema } : {}),
                            ...(options.extractContentOnly ? { extractContentOnly: true } : {}),
                            ...(options.screenshot ? { screenshot: true } : {}),
                            ...(options.fullPageScreenshot ? { fullPageScreenshot: true } : {}),
                            ...(options.useProxy ? { useProxy: true, proxyCountry: (_b = options.proxyCountry) !== null && _b !== void 0 ? _b : 'us' } : {}),
                            ...(options.cookies ? { cookies: options.cookies } : {}),
                        };
                        const submitted = await apiRequest('POST', '/scrape', body);
                        if (operation === 'submit') {
                            responseData = submitted;
                        }
                        else {
                            const maxWait = this.getNodeParameter('maxWaitTime', i, 120);
                            const jobId = ((_d = (_c = submitted.jobId) !== null && _c !== void 0 ? _c : submitted.id) !== null && _d !== void 0 ? _d : '');
                            responseData = await pollUntilDone(() => apiRequest('GET', `/scrape/${jobId}`), maxWait, 'jobId', jobId);
                        }
                    }
                    else if (operation === 'getStatus') {
                        const jobId = this.getNodeParameter('jobId', i);
                        responseData = await apiRequest('GET', `/scrape/${jobId}`);
                    }
                }
                // ── BATCH SCRAPE ─────────────────────────────────────────────────────
                else if (resource === 'batchScrape') {
                    if (operation === 'run' || operation === 'submit') {
                        const batchUrls = this.getNodeParameter('batchUrls', i, []);
                        if (batchUrls.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Add at least one URL before running.', { itemIndex: i });
                        }
                        const outputFormat = this.getNodeParameter('outputFormat', i, 'json');
                        const options = this.getNodeParameter('batchScrapeOptions', i, {});
                        const parsedSchema = parseSchema(options.schema);
                        const body = {
                            urls: batchUrls,
                            output: outputFormat,
                            ...(options.prompt ? { prompt: options.prompt } : {}),
                            ...(parsedSchema ? { schema: parsedSchema } : {}),
                            ...(options.extractContentOnly ? { extractContentOnly: true } : {}),
                            ...(options.screenshot ? { screenshot: true } : {}),
                            ...(options.fullPageScreenshot ? { fullPageScreenshot: true } : {}),
                            ...(options.useProxy ? { useProxy: true, proxyCountry: (_e = options.proxyCountry) !== null && _e !== void 0 ? _e : 'us' } : {}),
                            ...(options.cookies ? { cookies: options.cookies } : {}),
                        };
                        const submitted = await apiRequest('POST', '/batch/scrape', body);
                        if (operation === 'submit') {
                            responseData = submitted;
                        }
                        else {
                            const maxWait = this.getNodeParameter('maxWaitTime', i, 120);
                            const batchId = ((_g = (_f = submitted.batchId) !== null && _f !== void 0 ? _f : submitted.id) !== null && _g !== void 0 ? _g : '');
                            responseData = await pollUntilDone(() => apiRequest('GET', `/batch/scrape/${batchId}`), maxWait, 'batchId', batchId);
                        }
                    }
                    else if (operation === 'getStatus') {
                        const batchId = this.getNodeParameter('batchId', i);
                        responseData = await apiRequest('GET', `/batch/scrape/${batchId}`);
                    }
                    else if (operation === 'list') {
                        responseData = await apiRequest('GET', '/batch/scrape');
                    }
                    else if (operation === 'cancel') {
                        const batchId = this.getNodeParameter('batchId', i);
                        responseData = await apiRequest('DELETE', `/batch/scrape/${batchId}`);
                    }
                    else if (operation === 'retryFailed') {
                        const batchId = this.getNodeParameter('batchId', i);
                        responseData = await apiRequest('POST', `/batch/scrape/${batchId}/retry`);
                    }
                }
                // ── CRAWL ────────────────────────────────────────────────────────────
                else if (resource === 'crawl') {
                    if (operation === 'run' || operation === 'submit') {
                        const crawlBaseUrl = this.getNodeParameter('crawlBaseUrl', i);
                        const crawlInstruction = this.getNodeParameter('crawlInstruction', i);
                        const transformInstruction = this.getNodeParameter('transformInstruction', i);
                        const options = this.getNodeParameter('crawlOptions', i, {});
                        const body = {
                            baseUrl: crawlBaseUrl,
                            crawlInstruction,
                            transformInstruction,
                            ...(options.maxPages ? { maxPages: options.maxPages } : {}),
                            ...(options.useProxy ? { useProxy: true, proxyCountry: (_h = options.proxyCountry) !== null && _h !== void 0 ? _h : 'us' } : {}),
                            ...(options.cookies ? { cookies: options.cookies } : {}),
                        };
                        const submitted = await apiRequest('POST', '/crawl', body);
                        if (operation === 'submit') {
                            responseData = submitted;
                        }
                        else {
                            const maxWait = this.getNodeParameter('maxWaitTime', i, 120);
                            const jobId = ((_k = (_j = submitted.jobId) !== null && _j !== void 0 ? _j : submitted.id) !== null && _k !== void 0 ? _k : '');
                            responseData = await pollUntilDone(() => apiRequest('GET', `/crawl/${jobId}`), maxWait, 'jobId', jobId);
                        }
                    }
                    else if (operation === 'getStatus') {
                        const jobId = this.getNodeParameter('jobId', i);
                        responseData = await apiRequest('GET', `/crawl/${jobId}`);
                    }
                    else if (operation === 'getPages') {
                        const jobId = this.getNodeParameter('jobId', i);
                        responseData = await apiRequest('GET', `/crawl/${jobId}/pages`);
                    }
                    else if (operation === 'extract') {
                        const jobId = this.getNodeParameter('jobId', i);
                        const transformInstruction = this.getNodeParameter('transformInstruction', i);
                        responseData = await apiRequest('POST', `/crawl/${jobId}/extract`, { transformInstruction });
                    }
                    else if (operation === 'history') {
                        responseData = await apiRequest('GET', '/crawl/history');
                    }
                }
                // ── LOGS ─────────────────────────────────────────────────────────────
                else if (resource === 'logs') {
                    if (operation === 'list') {
                        const limit = this.getNodeParameter('limit', i, 10);
                        const page = this.getNodeParameter('page', i, 1);
                        const filters = this.getNodeParameter('logFilters', i, {});
                        responseData = await apiRequest('GET', '/scrape-logs', undefined, {
                            limit,
                            page,
                            ...(filters.searchTerm ? { searchTerm: filters.searchTerm } : {}),
                            ...(filters.status ? { status: filters.status } : {}),
                        });
                    }
                    else if (operation === 'get') {
                        const logId = this.getNodeParameter('logId', i);
                        responseData = await apiRequest('GET', `/scrape-logs/${logId}`);
                    }
                }
                // ── USAGE ─────────────────────────────────────────────────────────────
                else if (resource === 'usage') {
                    if (operation === 'getStats') {
                        const range = this.getNodeParameter('range', i, '7d');
                        responseData = await apiRequest('GET', '/usage-stats', undefined, { range });
                    }
                }
                returnData.push(...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } }));
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push(...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } }));
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Spidra = Spidra;
