// Central site content: navigation, footer, plans, and page definitions.
// Every claim here maps to a feature that exists in the product.

export const BRAND = "InsightPad";

export const PAY_LINKS = {
  professional: process.env.NEXT_PUBLIC_PAY_LINK_PROFESSIONAL || "https://selar.com/47plan?currency=USD",
  team: process.env.NEXT_PUBLIC_PAY_LINK_TEAM || "https://selar.com/57plan?currency=USD",
  enterprise: process.env.NEXT_PUBLIC_PAY_LINK_ENTERPRISE || "https://selar.com/97plan?currency=USD",
};

export type NavItem = { title: string; desc: string; href: string; icon: string };

export const platformProducts: NavItem[] = [
  { title: "Agentic notebooks", desc: "Deep-dive analysis with an agent that writes and runs the queries", href: "/product/notebooks", icon: "layers" },
  { title: "Conversational analytics", desc: "Ask in plain language and get a verified, charted answer", href: "/product/threads", icon: "chat" },
  { title: "Context Studio", desc: "Governed metrics, definitions and evals for every AI answer", href: "/product/context-studio", icon: "book" },
  { title: "Data apps", desc: "Publish live dashboards your teams can open by link", href: "/product/data-apps", icon: "app" },
];
export const platformCaps: NavItem[] = [
  { title: "Exploratory analysis", desc: "From first question to published app in one workspace", href: "/capability/exploratory-analysis", icon: "search" },
  { title: "Business intelligence", desc: "Governed self-serve for the entire organization", href: "/product/bi", icon: "grid" },
  { title: "Embedded analytics", desc: "Put live data apps in front of customers and partners", href: "/product/embedded-analytics", icon: "download" },
  { title: "Data connections", desc: "How data enters and stays protected", href: "/product/integrations", icon: "plug" },
];
export const solutionsNav: NavItem[] = [
  { title: "Data leaders", desc: "Clear the request queue and scale trusted answers", href: "/solutions/data-leaders", icon: "frame" },
  { title: "Product", desc: "Decide on shipped-feature impact with evidence", href: "/solutions/product-analytics", icon: "spark" },
  { title: "Marketing", desc: "Trace spend to pipeline and reallocate fast", href: "/solutions/marketing", icon: "burst" },
  { title: "Sales", desc: "Pipeline coverage and forecast you can defend", href: "/solutions/sales-analytics", icon: "fan" },
  { title: "Customer success", desc: "Find at-risk accounts before renewal", href: "/solutions/customer-success", icon: "globe" },
];
export const resourcesNav: NavItem[] = [
  { title: "Documentation", desc: "How each part of the platform works", href: "/docs", icon: "book" },
  { title: "Compare", desc: "InsightPad against dashboards and standalone notebooks", href: "/compare", icon: "grid" },
  { title: "Trust center", desc: "Security, privacy and data handling", href: "/trust", icon: "shield" },
  { title: "Switching to InsightPad", desc: "Pilot and migrate on your timeline", href: "/product/switching-to-insightpad", icon: "layers" },
];

export const footerCols: { title: string; links: [string, string][] }[] = [
  { title: "Product", links: [["Agentic notebooks", "/product/notebooks"], ["Conversational analytics", "/product/threads"], ["Context Studio", "/product/context-studio"], ["Data apps", "/product/data-apps"], ["Pricing", "/pricing"]] },
  { title: "Solutions", links: [["Data leaders", "/solutions/data-leaders"], ["Product", "/solutions/product-analytics"], ["Marketing", "/solutions/marketing"], ["Sales", "/solutions/sales-analytics"], ["Customer success", "/solutions/customer-success"]] },
  { title: "Company", links: [["About", "/about"], ["Enterprise", "/enterprise"], ["Trust center", "/trust"], ["Documentation", "/docs"], ["Compare", "/compare"]] },
  { title: "Legal", links: [["Privacy policy", "/legal/privacy"], ["Terms and conditions", "/legal/terms"]] },
];

export const dataConnections: { title: string; blurb: string; items: string[] }[] = [
  { title: "CSV and TSV upload", blurb: "Upload exports from your CRM, billing system, ad platforms or warehouse. Columns and types are detected automatically and the original file is kept in private storage.", items: ["CSV", "TSV"] },
  { title: "Governed context", blurb: "Attach metric definitions, glossary terms and dataset notes. Endorsed definitions are applied to every AI request.", items: ["Metrics", "Glossary", "Dataset notes"] },
  { title: "Shareable data apps", blurb: "Publish an app and share a read-only link, or place that link in an iframe inside your own product.", items: ["Share link", "Iframe embed"] },
  { title: "Isolated by workspace", blurb: "Row Level Security in the database restricts every table, file and query to the members of your workspace.", items: ["Row Level Security", "Private buckets"] },
];

export type Plan = {
  id: "community" | "professional" | "team" | "enterprise";
  name: string;
  group: "INDIVIDUAL PLANS" | "TEAM PLANS";
  blurb: string;
  price: string;
  unit?: string;
  amount: number | null;
  cta: string;
  payLink?: string;
  lead?: string;
  features: string[];
  limits: { aiCredits: number; datasets: number; apps: number; rows: number };
};

export const plans: Plan[] = [
  {
    id: "community", name: "Community", group: "INDIVIDUAL PLANS",
    blurb: "For operators validating the platform on a first dataset.",
    price: "Free", amount: 0, cta: "Sign up",
    features: ["30 AI credits per month", "3 datasets, 2,000 rows each", "1 published data app", "Notebooks, Threads, Context Studio and Evals", "7-day notebook history"],
    limits: { aiCredits: 30, datasets: 3, apps: 1, rows: 2000 },
  },
  {
    id: "professional", name: "Professional", group: "INDIVIDUAL PLANS",
    blurb: "For analysts running recurring analysis on live business data.",
    price: "$47", unit: "per month", amount: 47, cta: "Sign up", payLink: PAY_LINKS.professional,
    lead: "Everything in Community, plus:",
    features: ["300 AI credits per month", "15 datasets, 10,000 rows each", "5 published data apps", "30-day notebook history"],
    limits: { aiCredits: 300, datasets: 15, apps: 5, rows: 10000 },
  },
  {
    id: "team", name: "Team", group: "TEAM PLANS",
    blurb: "For teams that run revenue, product and operations decisions on shared data.",
    price: "$57", unit: "per month", amount: 57, cta: "Sign up", payLink: PAY_LINKS.team,
    lead: "Everything in Professional, plus:",
    features: ["1,500 AI credits per month", "100 datasets, 25,000 rows each", "Unlimited published data apps", "Unlimited notebook history"],
    limits: { aiCredits: 1500, datasets: 100, apps: 9999, rows: 25000 },
  },
  {
    id: "enterprise", name: "Enterprise", group: "TEAM PLANS",
    blurb: "For organizations running analytics at scale across departments.",
    price: "$97", unit: "per month", amount: 97, cta: "Sign up", payLink: PAY_LINKS.enterprise,
    lead: "Everything in Team, plus:",
    features: ["6,000 AI credits per month", "1,000 datasets, 50,000 rows each", "Workspace usage reports", "Administrator-verified billing"],
    limits: { aiCredits: 6000, datasets: 1000, apps: 9999, rows: 50000 },
  },
];

export const compareRows: { section: string; rows: [string, string, string, string, string][] }[] = [
  { section: "Capacity", rows: [
    ["AI credits per month", "30", "300", "1,500", "6,000"],
    ["Datasets", "3", "15", "100", "1,000"],
    ["Rows per dataset", "2,000", "10,000", "25,000", "50,000"],
    ["Published data apps", "1", "5", "Unlimited", "Unlimited"],
  ]},
  { section: "Workspace", rows: [
    ["Agentic notebooks", "Yes", "Yes", "Yes", "Yes"],
    ["Conversational analytics", "Yes", "Yes", "Yes", "Yes"],
    ["Context Studio and Evals", "Yes", "Yes", "Yes", "Yes"],
    ["Notebook version history", "7 days", "30 days", "Unlimited", "Unlimited"],
  ]},
  { section: "Security and administration", rows: [
    ["Row Level Security", "Yes", "Yes", "Yes", "Yes"],
    ["Private file storage", "Yes", "Yes", "Yes", "Yes"],
    ["Usage tracking per action", "Yes", "Yes", "Yes", "Yes"],
    ["Administrator-verified billing", "Not applicable", "Yes", "Yes", "Yes"],
  ]},
];

export const pricingFaq: [string, string][] = [
  ["How do I upgrade?", "Sign up, open Billing, and pay for your plan through the checkout link. Enter the order reference from your receipt and an administrator verifies the payment before your limits change. A redirect alone never upgrades a workspace."],
  ["How do I change or cancel my plan?", "Choose a different plan on the Billing page and complete checkout. Your current allowance stays active until the end of the period you paid for."],
  ["How do credits work?", "Each AI action consumes credits: one for a question, two for an agent cell, one per eval case. Your balance and every deduction are visible on the Usage page."],
  ["How is my data protected?", "Every table is protected with Row Level Security, files live in private storage, and AI keys never reach the browser. The model sees column names, types and a small sample, never full tables."],
  ["What happens when I run out of credits?", "AI actions pause until you upgrade. Your datasets, notebooks and published apps remain available."],
];

export type Block = {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  visual?: string;
};
export type PageDef = {
  slug: string;
  title: string;
  kicker?: string;
  h1: string;
  lead: string;
  visual: string;
  theme?: "light" | "night";
  blocks: Block[];
  steps?: { title: string; body: string }[];
  stepsTitle?: string;
  faq?: [string, string][];
  ctaTitle: string;
  ctaBody: string;
};

export const pages: Record<string, PageDef> = {
  "product/notebooks": {
    slug: "product/notebooks", title: "Agentic notebooks", kicker: "Platform / Notebooks",
    h1: "The notebook where an AI agent does the analysis",
    lead: "Describe the question. The agent plans the query, runs it against your data and returns a chart you can audit. Analysts review instead of rebuild.",
    visual: "notebook",
    blocks: [
      { title: "An agent that plans, runs and explains", body: "The agent reads your schema and your governed definitions, proposes up to three query plans for a task, executes them deterministically and summarizes what it found.", bullets: ["Plans are validated against your real columns", "Numbers are computed by code, not guessed by a model", "Every result exposes its query plan"], visual: "agent" },
      { title: "Question cells for repeatable answers", body: "Pin a plain-language question inside a document. Re-run it as the data changes and the answer, chart and plan update together.", visual: "nocode" },
      { title: "Markdown for the decision narrative", body: "Write the conclusion next to the evidence. Readers see the logic and the numbers in a single document.", visual: "chart" },
      { title: "Version history that protects the work", body: "Each save is versioned. Restore an earlier state in one step, with retention that scales with your plan.", visual: "graph" },
    ],
    ctaTitle: "Put an analyst agent on your data", ctaBody: "Create a workspace, upload a CSV and run your first agent cell in minutes.",
  },
  "product/threads": {
    slug: "product/threads", title: "Conversational analytics", kicker: "Platform / Threads",
    h1: "Ask a business question. Get a verified answer.",
    lead: "Threads turns plain-language questions into validated query plans, computes the result from your rows and shows the logic behind every figure.",
    visual: "chat",
    blocks: [
      { title: "Questions become structured plans", body: "The model translates intent into a typed plan: aggregate, column, grouping, filters. Anything that does not match your schema is rejected and retried.", bullets: ["Follow-up questions keep context", "Charts are chosen automatically", "Every answer links to its plan"], visual: "chat" },
      { title: "Numbers you can defend in a board meeting", body: "Arithmetic runs in deterministic code against your stored rows. The model never produces a figure, so the same question always returns the same number.", visual: "trust" },
      { title: "Flag a wrong answer and fix the cause", body: "Flagged answers surface in Context Studio so the missing definition gets written once and applied everywhere.", visual: "improve" },
      { title: "From answer to asset", body: "Move a result into a notebook for depth or add it to a data app for the whole team.", visual: "promote" },
    ],
    faq: [["What data can Threads query?", "Any dataset in your workspace. Upload CSV or TSV files and ask immediately."], ["Can I see how an answer was calculated?", "Yes. Each response includes the structured query plan that was executed on your data."], ["Does the model see my full data?", "No. The model receives column names, types and a few sample values to plan the query. The aggregation runs on the server."]],
    ctaTitle: "Replace the reporting queue", ctaBody: "Upload a dataset and put your first question to it.",
  },
  "product/context-studio": {
    slug: "product/context-studio", title: "Context Studio", kicker: "Platform / Context",
    h1: "Make every AI answer match your definitions",
    lead: "Define metrics once. Context Studio injects them into every thread, notebook and app, then proves accuracy with evals that check answers against known values.",
    visual: "context",
    blocks: [
      { title: "One definition per metric", body: "Capture metrics, glossary terms and dataset notes. Only endorsed items reach the model, so “active customer” means the same thing in every answer.", visual: "unified" },
      { title: "Evals with expected values", body: "Write prompts with the number you expect and a tolerance. Run the suite after each context change and see pass and fail per case, with credit cost.", visual: "evals" },
      { title: "Visibility into every question", body: "See how many questions your workspace asks, which answers were flagged, and where definitions are missing.", visual: "observe" },
    ],
    ctaTitle: "Govern AI answers at the source", ctaBody: "Create your first metric definition and run an eval against it.",
  },
  "product/data-apps": {
    slug: "product/data-apps", title: "Data apps", kicker: "Platform / Apps",
    h1: "Turn answers into live apps your teams act on",
    lead: "Ask for a chart, add it to an app, and publish a read-only link. Widgets recompute from the data each time the app loads.",
    visual: "app",
    blocks: [
      { title: "Build by asking", body: "Each widget is a question. The agent validates the plan, computes the result and pins it to your app.", visual: "app" },
      { title: "Always current", body: "Widgets store the query plan, not a screenshot. Replace the dataset contents and the app reflects the change.", visual: "loop" },
      { title: "Publish with one switch", body: "Share an unguessable link with partners and executives. Unpublish at any time to revoke access.", visual: "canvas" },
    ],
    ctaTitle: "Retire the weekly status deck", ctaBody: "Publish your first live data app today.",
  },
  "capability/exploratory-analysis": {
    slug: "capability/exploratory-analysis", title: "Exploratory analysis", kicker: "Capability",
    h1: "Go from a hypothesis to a defensible answer in one session",
    lead: "Query, segment, chart and document in a single workspace. The agent handles the mechanics so you spend the time on the decision.",
    visual: "notebook",
    blocks: [
      { title: "One workspace instead of five tools", body: "Upload, question, chart, narrate and publish without exporting between a spreadsheet, a SQL editor and a slide deck.", visual: "graph" },
      { title: "Start with language, finish with evidence", body: "Open with a plain-language question, then inspect the plan and refine filters until the answer holds.", visual: "nocode" },
      { title: "Agent assistance on demand", body: "Delegate a multi-step task such as comparing trends across regions and review the plans it produces.", visual: "agent" },
      { title: "Publish what you find", body: "Pin the winning charts to a data app and share the result.", visual: "app" },
    ],
    ctaTitle: "Find the driver behind the number", ctaBody: "Upload a dataset and start with your hardest question.",
  },
  "product/bi": {
    slug: "product/bi", title: "Business intelligence", kicker: "Platform / BI",
    h1: "Business intelligence that answers instead of reports",
    lead: "Replace static dashboards with governed, AI-driven self-serve. Every team asks its own questions while one set of definitions keeps the answers consistent.",
    visual: "dashboard",
    blocks: [
      { title: "Cut the report backlog", body: "Route the repetitive questions to Threads and keep analysts on the problems that need judgment.", visual: "chat" },
      { title: "Consistency by construction", body: "Endorsed metrics apply to every answer, notebook and app, which removes the argument over whose number is right.", visual: "unified" },
      { title: "Dashboards from real questions", body: "Pin the answers people keep asking for. The dashboard grows from demand rather than guesswork.", visual: "dashboard" },
    ],
    faq: [["Does InsightPad replace my BI tool?", "Many teams pilot alongside the existing tool, compare answers, then retire dashboards nobody opens."], ["How is governance handled?", "Endorsed metrics, workspace roles and Row Level Security apply to every thread, notebook and app."]],
    ctaTitle: "Move from reporting to answering", ctaBody: "Start a workspace and pilot one team this week.",
  },
  "product/embedded-analytics": {
    slug: "product/embedded-analytics", title: "Embedded analytics", kicker: "Platform / Embedded",
    h1: "Put live analytics in front of customers and partners",
    lead: "Publish a data app and embed its read-only link in your product or portal. Recipients see current numbers without an account.",
    visual: "embed",
    blocks: [
      { title: "From analysis to customer-facing view", body: "Build the view once with questions your team already trusts, then share the link or place it in an iframe.", visual: "dashboard" },
      { title: "Access you control", body: "Links are unguessable and read-only. Unpublish to revoke access immediately.", visual: "shield" },
      { title: "Always the latest data", body: "Widgets recompute from the dataset on every load.", visual: "loop" },
    ],
    ctaTitle: "Turn your data into a product surface", ctaBody: "Publish a data app and share the link.",
  },
  "capability/ai": {
    slug: "capability/ai", title: "AI engine", kicker: "Capability / AI",
    h1: "An AI engine that analyzes, explains and automates",
    lead: "AI is the core of InsightPad, not a feature on top. It plans queries, builds charts, writes the narrative and automates analyst work, while code guarantees the numbers.",
    visual: "agent",
    blocks: [
      { title: "Analyzes", body: "Translates a business question into a validated query plan over your schema and your governed definitions.", visual: "agent" },
      { title: "Explains", body: "Writes a short narrative from the computed result, restricted to the figures the engine produced.", visual: "chat" },
      { title: "Automates", body: "Agent cells carry out multi-step analysis tasks and return plans, charts and a summary for review.", visual: "notebook" },
      { title: "Stays accurate", body: "A strict separation between planning and arithmetic keeps figures reproducible. Evals measure accuracy against known values.", visual: "trust" },
    ],
    faq: [["Which model powers the engine?", "InsightPad calls Google Gemini from the server. The key is never exposed to the browser."], ["Is my data used for training?", "We send only the minimum needed to plan a query, which is column names, types and a few sample values."]],
    ctaTitle: "Run your analytics on an AI engine", ctaBody: "Upload a dataset and watch the engine work.",
  },
  "product/switching-to-insightpad": {
    slug: "product/switching-to-insightpad", title: "Switching to InsightPad", kicker: "Platform / Switching",
    h1: "Pilot in a week. Migrate on your terms.",
    lead: "Prove accuracy on your own questions first, then move reports across one team at a time.",
    visual: "switch",
    blocks: [
      { title: "Why teams switch", body: "Fewer tools, shared definitions and answers that arrive in minutes. Backlogs shrink and unused dashboards get retired.", bullets: ["One workspace for exploration, questions and apps", "Governed metrics reused everywhere", "Visible logic behind every figure"], visual: "unified" },
    ],
    stepsTitle: "Run a proof of concept",
    steps: [{ title: "Pick one team and ten questions", body: "Choose the questions that team asks every month." }, { title: "Upload the datasets", body: "Start with CSV exports from your current systems." }, { title: "Define the metrics", body: "Capture definitions in Context Studio." }, { title: "Compare with evals", body: "Check answers against the values you already trust." }],
    ctaTitle: "Start the pilot", ctaBody: "Create a workspace and upload the first dataset.",
  },
  "enterprise": {
    slug: "enterprise", title: "Enterprise", kicker: "ENTERPRISE", theme: "night",
    h1: "Built for scale, security, and control",
    lead: "Isolate every workspace, govern every definition and see every credit your teams spend.",
    visual: "enterprise",
    blocks: [
      { title: "Isolation enforced in the database", body: "Row Level Security on every table, private storage buckets and server-only AI keys.", bullets: ["Row Level Security everywhere", "Private storage buckets", "Server-side secrets only"], visual: "shield" },
      { title: "Governance you can audit", body: "Workspace roles, endorsed definitions and an eval history show how answers are produced and how accurate they are.", bullets: ["Owner, admin, editor and viewer roles", "Endorsed metrics and glossary", "Eval run history"], visual: "toggles" },
      { title: "Cost visibility", body: "Every AI action is logged with its credit cost, so you know what each workflow consumes.", visual: "observe" },
    ],
    faq: [["Where is data stored?", "In your workspace's database region with private buckets and Row Level Security."], ["How does billing work?", "Pay through checkout, submit the order reference, and an administrator verifies the payment before limits change."]],
    ctaTitle: "Bring governed AI analytics to your organization", ctaBody: "Sign up and invite your first team.",
  },
};

export const solutionPages: Record<string, PageDef> = {
  "solutions/data-leaders": {
    slug: "solutions/data-leaders", title: "Data leaders", kicker: "Solutions / Data leaders",
    h1: "Clear the request queue without losing control",
    lead: "Give every team trusted answers on demand. Keep the definitions, track the usage and redirect analyst time to higher-value work.",
    visual: "chat",
    blocks: [
      { title: "Cut ticket volume", body: "Threads absorb the repeat questions so analysts work on problems that need judgment.", visual: "everyone" },
      { title: "Convert one-off analyses into durable apps", body: "Pin recurring answers to live data apps that stay current.", visual: "app" },
      { title: "Own the definitions", body: "Context Studio lets you endorse the metrics every answer must use.", visual: "context" },
      { title: "See what AI tells your stakeholders", body: "Review volume, flagged answers and credit spend across the workspace.", visual: "observe" },
    ],
    stepsTitle: "Where to start",
    steps: [{ title: "Upload a core dataset", body: "Choose the table people ask about most." }, { title: "Define three metrics", body: "Revenue, active customers, churn." }, { title: "Invite a pilot team", body: "Review the first week of questions." }],
    faq: [["How do I keep control as usage grows?", "Endorsed metrics, workspace roles and eval suites keep answers consistent."], ["Can I see who spends credits?", "Usage is recorded for every AI action in the workspace."]],
    ctaTitle: "Scale answers, keep trust", ctaBody: "Start with one dataset and one pilot team.",
  },
  "solutions/product-analytics": {
    slug: "solutions/product-analytics", title: "Product", kicker: "Solutions / Product",
    h1: "Decide on feature impact with evidence",
    lead: "Measure adoption, retention and conversion from your event exports, and settle roadmap debates with numbers.",
    visual: "chart",
    blocks: [
      { title: "Quantify adoption", body: "Ask for active users by plan, feature or cohort and get a chart with the plan behind it.", visual: "chart" },
      { title: "Compare before and after", body: "Filter by date to isolate the effect of a release and see the difference directly.", visual: "drill" },
      { title: "Share the result", body: "Pin the charts to a data app for product, engineering and leadership.", visual: "app" },
    ],
    stepsTitle: "Where to start",
    steps: [{ title: "Upload an events export", body: "One row per event is enough." }, { title: "Ask about adoption", body: "Weekly active users by plan." }, { title: "Publish the answer", body: "Share a live app with the team." }],
    ctaTitle: "Put numbers behind every product bet", ctaBody: "Upload your event data and ask the first question.",
  },
  "solutions/marketing": {
    slug: "solutions/marketing", title: "Marketing", kicker: "Solutions / Marketing",
    h1: "Trace every dollar of spend to pipeline",
    lead: "Combine campaign, spend and pipeline exports and let AI surface which channels earn their budget.",
    visual: "dashboard",
    blocks: [
      { title: "One definition of a qualified lead", body: "Endorse the definition once. Every answer and app uses it.", visual: "unified" },
      { title: "Answer pipeline questions in the meeting", body: "Ask in plain language and show the chart before the next slide.", visual: "chat" },
      { title: "Reallocate with confidence", body: "Compare cost per opportunity across channels and campaigns.", visual: "chart" },
    ],
    stepsTitle: "Where to start",
    steps: [{ title: "Upload campaign performance", body: "Spend, clicks, leads, opportunities." }, { title: "Ask for cost per opportunity", body: "Grouped by channel." }, { title: "Publish a live app", body: "Replace the weekly slide." }],
    ctaTitle: "Fund the channels that convert", ctaBody: "Upload campaign data and see the ranking.",
  },
  "solutions/sales-analytics": {
    slug: "solutions/sales-analytics", title: "Sales", kicker: "Solutions / Sales",
    h1: "A forecast you can defend line by line",
    lead: "Break pipeline down by stage, owner and region, and trace every total back to the rows that produced it.",
    visual: "chart",
    blocks: [
      { title: "Coverage by stage and quarter", body: "Sum pipeline by any dimension with definitions finance agrees on.", visual: "chart" },
      { title: "Find the driver of a variance", body: "Segment any total by region, owner or product to see where it moved.", visual: "drill" },
      { title: "Keep the number current", body: "Replace the export and every pinned widget updates.", visual: "loop" },
    ],
    stepsTitle: "Where to start",
    steps: [{ title: "Upload opportunities", body: "Amount, stage, owner, close date." }, { title: "Ask for coverage by quarter", body: "Compare against target." }, { title: "Publish a pipeline app", body: "Share it with leadership." }],
    ctaTitle: "Forecast with evidence", ctaBody: "Upload a pipeline export and ask your first question.",
  },
  "solutions/customer-success": {
    slug: "solutions/customer-success", title: "Customer success", kicker: "Solutions / Customer success",
    h1: "Find at-risk accounts before renewal",
    lead: "Bring usage, revenue and ownership into one view and rank the accounts that need attention.",
    visual: "accounts",
    blocks: [
      { title: "One account view", body: "Combine ARR, usage and renewal date into a single dataset and query it in plain language.", visual: "app" },
      { title: "Ask about any segment", body: "Find accounts whose usage dropped, grouped by owner or tier.", visual: "chat" },
      { title: "Share health with the team", body: "Publish a live app so every account owner sees the same picture.", visual: "dashboard" },
    ],
    stepsTitle: "Where to start",
    steps: [{ title: "Upload your accounts export", body: "ARR, usage, owner, renewal date." }, { title: "Ask for accounts at risk", body: "Usage down more than 15 percent." }, { title: "Publish a health app", body: "Share it with the whole team." }],
    ctaTitle: "Protect recurring revenue", ctaBody: "Upload account data and surface the risks.",
  },
};

export const allDefs: Record<string, PageDef> = { ...pages, ...solutionPages };

export const homeFaq: [string, string][] = [
  ["What is InsightPad?", "InsightPad is an AI-native analytics platform. An AI engine plans queries, builds charts and automates analyst work on your data, while deterministic code computes every figure."],
  ["Who is it for?", "Revenue, product, marketing, customer success and data teams at businesses that need faster, defensible decisions."],
  ["How does InsightPad keep AI answers accurate?", "The model produces a structured query plan that is validated against your schema. Code computes the result from your rows, and every answer shows its plan. Evals check accuracy against known values."],
  ["Do business users need SQL or Python?", "No. Business users ask questions in plain language and open published data apps."],
  ["What data can I use?", "Upload CSV or TSV files. Files are stored privately and isolated to your workspace."],
  ["How is InsightPad different from a general AI assistant?", "A general assistant does not know your definitions or run governed queries. InsightPad grounds each answer in your datasets and context, then records usage and quality."],
];

export const docsEntries: [string, string][] = [
  ["Quickstart", "Create an account, upload a CSV and ask your first question."],
  ["Datasets", "Upload CSV or TSV files up to your plan's row limit. Column types are detected automatically."],
  ["Threads", "Ask in plain language. The model plans a structured query and the server computes the result."],
  ["Notebooks", "Combine markdown, question cells and agent cells in one versioned document."],
  ["Data apps", "Pin questions as widgets, publish, and share a read-only link."],
  ["Context Studio", "Define metrics and glossary terms that are applied to every AI request."],
  ["Evals", "Write prompts with expected values and run them against your context."],
  ["Billing and credits", "Credits are deducted per AI action. Upgrade from the Billing page."],
];
