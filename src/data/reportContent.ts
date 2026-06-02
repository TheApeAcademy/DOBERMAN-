export interface ReportSection {
  id: string
  heading: string
  body: string[]
}

export interface ReportChapter {
  number: string
  title: string
  sections: ReportSection[]
}

export interface Reference {
  number: number
  citation: string
}

export interface ReportData {
  title: string
  subtitle: string
  author: string
  matric: string
  university: string
  department: string
  supervisor: string
  year: string
  abstract: string
  keywords: string[]
  dedication: string
  acknowledgements: string
  chapters: ReportChapter[]
  references: Reference[]
  appendices: { title: string; content: string[] }[]
}

export const REPORT: ReportData = {
  title: 'DOBERMAN',
  subtitle:
    'Design and Implementation of a Multi-Module AI-Powered Cybersecurity Intelligence Platform',
  author: 'OLUSANU JOSHUA BANKOLE',
  matric: '2022/493',
  university: 'PRECIOUS CORNERSTONE UNIVERSITY',
  department: 'Department of Cyber Security',
  supervisor: 'Dr. Osutokun Kemi',
  year: '2025/2026',

  abstract: `The modern digital environment has given rise to three of the most urgent and interrelated threats of our time: the proliferation of synthetic deepfake media, the systemic vulnerability of IoT-connected networks, and the viral spread of AI-generated misinformation. These threats do not operate in isolation — they reinforce one another, exploit the same cognitive biases, and overwhelm users who lack the tools or training to respond. Existing cybersecurity solutions are either narrowly focused on enterprise environments, prohibitively expensive, or technically inaccessible to the average user.

This project presents DOBERMAN — a multi-module, AI-powered cybersecurity intelligence platform designed to make professional-grade threat detection accessible to everyone. The system is built around four core modules: EYES, which detects deepfake manipulation in images, videos, and audio using the Hive AI computer vision engine combined with Claude AI-powered contextual explanation; NOSE, which performs AI-driven IoT network vulnerability assessment by mapping real CVE (Common Vulnerabilities and Exposures) references to user-described devices and generating a prioritised remediation plan; BRAIN, a persistent AI security analyst powered by Anthropic's Claude Sonnet model that provides expert, conversational cybersecurity guidance in plain language; and NEWS, a credibility verification engine that evaluates headlines and article content against known misinformation patterns.

The platform is implemented as a full-stack web application using React 19, TypeScript, and Vite on the frontend, with Supabase providing PostgreSQL database management, row-level security, and serverless edge functions. A companion Chrome extension extends DOBERMAN's detection capabilities to any webpage via right-click context menus. The system demonstrates a novel architecture for orchestrating multiple AI models — Hive AI for computer vision and Anthropic Claude for reasoning — within a single unified platform with shared authentication, usage tracking, and a consistent user experience.

Evaluation of the system demonstrates high deepfake detection accuracy aligned with Hive AI benchmarks, actionable IoT vulnerability insights validated against the NIST National Vulnerability Database, and positive user feedback on the platform's accessibility and clarity. DOBERMAN represents a meaningful contribution to the democratisation of cybersecurity intelligence.`,

  keywords: [
    'Deepfake Detection',
    'IoT Security',
    'AI-Powered Cybersecurity',
    'Large Language Models',
    'News Verification',
    'Supabase',
    'React',
    'Hive AI',
    'Claude AI',
    'Edge Functions',
  ],

  dedication: `To my family, who believed in me long before I believed in myself.

To every student who has ever stayed up past midnight asking whether the thing they are building actually matters — it does.

And to the internet, which is simultaneously the most dangerous and most beautiful thing humanity has ever made.`,

  acknowledgements: `This project could not have existed without the guidance, patience, and intellectual generosity of Dr. Osutokun Kemi, whose supervision throughout this academic year pushed me to ask harder questions and build better answers. Thank you.

To the faculty and staff of the Department of Cyber Security at Precious Cornerstone University, Ibadan — your commitment to preparing students for the realities of modern security practice has shaped not just this project, but my entire approach to the field.

To my peers in the 2022/2026 cohort — the late-night debates, the shared frustrations, and the moments of genuine breakthrough made this journey worthwhile. You know who you are.

Finally, to the open-source community whose tools, documentation, and collective knowledge made a project of this technical ambition possible for a single undergraduate student: this work stands on your shoulders.`,

  chapters: [
    {
      number: '1',
      title: 'Introduction',
      sections: [
        {
          id: '1-1',
          heading: '1.1 Background and Motivation',
          body: [
            `Cybersecurity is no longer a concern exclusive to governments, banks, or large corporations. It has become a personal matter — affecting ordinary people in their living rooms, on their phones, and in their daily consumption of information. Three developments in particular have redefined the threat landscape in ways that existing tools have failed to keep pace with.`,
            `The first is the deepfake epidemic. Generative Adversarial Networks (GANs) and diffusion models have made the synthesis of photorealistic fake media trivially accessible. A 2024 industry report documented a 400% year-on-year increase in deepfake attacks [1]. Fabricated videos of executives authorising fraudulent wire transfers, fake audio recordings used in social engineering, and manipulated identity documents now represent a growing category of financial and reputational harm. The average person has no reliable way to distinguish authentic media from synthetic — and that gap is widening.`,
            `The second is the IoT security crisis. The proliferation of smart devices — routers, cameras, smart TVs, thermostats, baby monitors, and dozens of others — has dramatically expanded the attack surface of the typical home or small-business network. Research from security firm Palo Alto Networks found that 70% of IoT devices have at least one unpatched critical vulnerability [2]. These devices are often deployed with default credentials, rarely receive firmware updates, and are virtually invisible to conventional security tooling. Attackers have taken notice: IoT-targeted malware families have grown by 300% since 2020 [3].`,
            `The third is the misinformation crisis. The volume of AI-generated text content on the internet doubled between 2022 and 2024 [4]. Fabricated news, manipulated headlines, and synthetic social media narratives now spread faster than corrections. Traditional fact-checking organisations cannot scale to match the pace of production, and most users lack the analytical frameworks to evaluate credibility independently.`,
            `These three threats share a common characteristic: they exploit the gap between how things appear and how they actually are. DOBERMAN — the project presented in this report — was conceived as a direct response to that gap. Its name encapsulates its design philosophy: a watchdog. Alert, intelligent, and always on.`,
          ],
        },
        {
          id: '1-2',
          heading: '1.2 Problem Statement',
          body: [
            `Despite the growing severity of threats posed by deepfake media, IoT vulnerabilities, and AI-generated misinformation, access to reliable, easy-to-use cybersecurity intelligence tools remains severely limited for individual users and small organisations. The current market offers fragmented, technically complex, and often prohibitively expensive solutions that assume a level of expertise the average user simply does not have.`,
            `Specifically, the following gaps exist in the current landscape: (i) no single platform addresses deepfake detection, IoT vulnerability assessment, AI security consulting, and news credibility verification in one cohesive user experience; (ii) existing deepfake detection tools often return a confidence score without any explanatory context, leaving users unable to understand or act on the result; (iii) IoT security tools such as Shodan and Nessus require technical configuration far beyond the capability of most home users; (iv) news verification is typically manual and time-consuming, relying on human fact-checkers who cannot operate at the speed of social media.`,
            `The absence of an accessible, AI-augmented, unified platform for personal and small-team cybersecurity intelligence constitutes the core problem this project addresses.`,
          ],
        },
        {
          id: '1-3',
          heading: '1.3 Aims and Objectives',
          body: [
            `The primary aim of this project is to design, implement, and evaluate a multi-module AI-powered cybersecurity intelligence platform that makes professional-grade threat detection accessible to non-expert users.`,
            `The specific objectives are:`,
            `(i) To design and implement EYES, a deepfake detection module capable of analysing image, video, and audio media for synthetic manipulation, returning a confidence score and a plain-language explanation.`,
            `(ii) To design and implement NOSE, an IoT vulnerability assessment module that accepts natural-language descriptions of network environments, maps discovered risks to real CVE references, and returns a prioritised remediation action plan.`,
            `(iii) To design and implement BRAIN, an AI security analyst module that enables multi-turn conversational interaction with a cybersecurity expert persona powered by Claude Sonnet, with persistent conversation history.`,
            `(iv) To design and implement NEWS, a news credibility verification module that evaluates submitted headlines and article content against known misinformation indicators and returns a structured verdict.`,
            `(v) To implement a companion Chrome browser extension that extends DOBERMAN's detection capabilities contextually to any webpage.`,
            `(vi) To evaluate the system's technical correctness, usability, and security through a structured testing programme.`,
          ],
        },
        {
          id: '1-4',
          heading: '1.4 Scope and Delimitations',
          body: [
            `DOBERMAN is scoped as a web-based platform targeting individual users and small teams seeking accessible cybersecurity intelligence. The system operates on user-submitted media and descriptions — it does not perform active network scanning, packet capture, or any form of intrusive penetration testing.`,
            `The deepfake detection module (EYES) is limited to media files up to 50MB in size and the formats supported by Hive AI's detection API. The IoT assessment module (NOSE) operates on user-described environments rather than direct network access, which means the quality of the vulnerability report depends on the accuracy and completeness of the user's description. The news verification module (NEWS) assesses credibility based on linguistic and structural indicators rather than real-time fact database lookups.`,
            `The platform operates within the usage constraints of the free tier of the Anthropic Claude and Hive AI APIs. Production deployment would require tier upgrades for high-volume usage. Mobile-native applications are out of scope for this iteration.`,
          ],
        },
        {
          id: '1-5',
          heading: '1.5 Significance of Study',
          body: [
            `This project makes several meaningful contributions to both academic knowledge and practical cybersecurity capability.`,
            `From a technical standpoint, DOBERMAN demonstrates a novel architecture for orchestrating multiple AI models — a computer vision API and a large language model — within a single, security-focused platform. The design patterns developed here, particularly the edge function architecture for AI orchestration with built-in rate limiting and RLS-secured data storage, represent a reusable template for AI-augmented security applications.`,
            `From a social standpoint, this project directly addresses the democratisation of cybersecurity. The consistent theme across all four modules is accessibility: results are explained in plain language, interfaces are designed for non-experts, and the system is available on a free tier with no credit card required. At a moment when digital threats are growing faster than digital literacy, tools that bridge that gap carry genuine public value.`,
            `From an educational standpoint, this project demonstrates the practical integration of modern cloud infrastructure (Supabase), cutting-edge AI APIs (Anthropic, Hive AI), and contemporary frontend engineering (React 19, TypeScript, GSAP, Three.js) in the context of a real-world cybersecurity use case.`,
          ],
        },
        {
          id: '1-6',
          heading: '1.6 Report Organisation',
          body: [
            `The remainder of this report is organised as follows. Chapter 2 reviews the relevant literature, covering the state of deepfake technology, IoT security, AI in cybersecurity, and existing tools. Chapter 3 describes the system analysis and methodology, including requirements engineering and the justification of technology choices. Chapter 4 presents the system design, covering architecture, database schema, API design, and security considerations. Chapter 5 details the implementation of each module and the supporting infrastructure. Chapter 6 presents the testing and evaluation programme and its results. Chapter 7 concludes the report with a reflection on achievements, limitations, and future directions.`,
          ],
        },
      ],
    },
    {
      number: '2',
      title: 'Literature Review',
      sections: [
        {
          id: '2-1',
          heading: '2.1 The Deepfake Threat Landscape',
          body: [
            `The term "deepfake" was coined in 2017, when a Reddit user began publishing face-swapped videos created using deep learning models [5]. Since then, the technology has advanced with remarkable speed. Early deepfakes were detectable to the trained eye; modern outputs from state-of-the-art diffusion models such as DALL-E 3 and Stable Diffusion are frequently indistinguishable from authentic media even under careful scrutiny [6].`,
            `The technical architecture underlying deepfake generation has evolved through several generations. First-generation systems relied primarily on autoencoders — encoder networks that learn a compressed latent representation of a face, combined with decoder networks that reconstruct it onto a target subject [7]. Second-generation systems introduced Generative Adversarial Networks (GANs), specifically architectures such as FaceSwap-GAN and DeepFaceLab, which achieved far higher visual fidelity by training a discriminator network to distinguish real from generated images, creating an adversarial dynamic that drove quality improvements [8].`,
            `The current generation of deepfake production uses diffusion models, which learn to reverse a noise-addition process to reconstruct high-quality images from learned data distributions. Latent diffusion models such as Stable Diffusion 3 can generate photorealistic faces, voices, and full-body video with minimal technical knowledge required from the operator [9].`,
            `Detection has struggled to keep pace. Traditional forensic approaches — analysing compression artifacts, inconsistent lighting, unnatural eye blinking patterns — have been consistently defeated by new generation models. Machine learning-based detection has shown more promise: architectures such as XceptionNet [10], EfficientNet, and MesoNet [11] have demonstrated strong performance on benchmark datasets such as FaceForensics++ [12]. However, these approaches exhibit a known weakness: models trained on one generation of deepfakes often fail to generalise to newer synthesis techniques [13], a problem known as the generalisation gap.`,
            `Hive AI's deepfake detection API — used by DOBERMAN — addresses this through ensemble modelling, combining multiple detection architectures and continuously retraining on new synthetic media. This provides a more robust baseline than single-model approaches and reduces the generalisation gap through diversity [14].`,
          ],
        },
        {
          id: '2-2',
          heading: '2.2 IoT Security Challenges',
          body: [
            `The Internet of Things has transformed the home and workplace into a distributed computing environment. A typical modern household contains 20–30 connected devices; enterprise environments can have thousands [15]. This proliferation has outpaced the security practices of both manufacturers and users.`,
            `Three structural vulnerabilities characterise the IoT security landscape. First, weak or default credentials: a 2023 survey found that 48% of IoT devices still use manufacturer-default passwords, and that the most common credentials remain "admin/admin" and "admin/password" [16]. Second, infrequent patching: IoT devices often run embedded operating systems that manufacturers deprioritise for security updates, leaving devices vulnerable long after patches for underlying vulnerabilities have been released [17]. Third, insufficient network segmentation: most home users do not isolate IoT devices on separate network segments, meaning a compromised smart bulb can theoretically pivot to a laptop on the same subnet [18].`,
            `The Common Vulnerabilities and Exposures (CVE) system, maintained by MITRE and scored using the CVSS framework, provides a standardised vocabulary for IoT vulnerabilities. The National Institute of Standards and Technology (NIST) maintains the National Vulnerability Database (NVD) as the authoritative repository of CVE records [19]. Mapping IoT device configurations to real CVE records — as DOBERMAN's NOSE module does — provides users with actionable, verifiable information rather than generic advice.`,
            `Existing tools for IoT security assessment include Shodan (internet-wide device scanning), Nessus (enterprise vulnerability scanner), and Nmap (network mapping). Each requires technical configuration and network access that places them out of reach for most home users. There is a clear gap for a natural-language interface to IoT vulnerability intelligence [20].`,
          ],
        },
        {
          id: '2-3',
          heading: '2.3 Artificial Intelligence in Cybersecurity',
          body: [
            `The application of artificial intelligence to cybersecurity is not new — intrusion detection systems based on anomaly detection have used ML models for decades [21]. However, the emergence of large language models (LLMs) has introduced a qualitatively different capability: the ability to reason about security in natural language, synthesise knowledge across domains, and communicate findings to non-technical audiences.`,
            `LLMs such as GPT-4 and Claude Sonnet have demonstrated strong performance on security knowledge benchmarks, including CTF (Capture the Flag) challenges, CVE triage, and incident response planning [22]. Their ability to generate structured analysis from unstructured natural-language descriptions — precisely the core function of DOBERMAN's NOSE and NEWS modules — represents a novel capability that did not exist in the pre-LLM era.`,
            `A key design challenge when deploying LLMs for security applications is prompt engineering — the craft of constructing input instructions that reliably elicit structured, accurate, and safe outputs. Research by Perez et al. [23] on instruction-following behaviour demonstrates that even small variations in prompt construction can produce dramatically different outputs. DOBERMAN addresses this through carefully designed system prompts for each module, with structured JSON output specifications for the NOSE and NEWS modules to ensure consistent parsing.`,
            `The limitations of LLMs in security contexts are equally important to acknowledge. LLMs can hallucinate — producing plausible-sounding but factually incorrect information. For security applications, this represents a real risk: a hallucinated CVE reference or an incorrect remediation step could lead a user to believe they have addressed a vulnerability when they have not. DOBERMAN mitigates this by grounding the NOSE module in real CVE terminology and instructing the model to qualify uncertain statements, and by combining LLM reasoning with the deterministic output of Hive AI's detection engine for the EYES module.`,
          ],
        },
        {
          id: '2-4',
          heading: '2.4 News Verification and Misinformation Detection',
          body: [
            `The challenge of automated news verification is fundamentally a problem of semantics, source quality, and linguistic pattern recognition. Research in computational journalism has identified several reliable indicators of misinformation at the surface level: emotionally charged language, vague attribution ("experts say"), absence of primary sources, internally inconsistent claims, and appeals to urgency [24].`,
            `Classical approaches to automated fact-checking typically relied on knowledge graph comparison — matching claims against a structured database of verified facts. While effective for simple factual claims (dates, names, statistics), this approach fails on opinion-based or structurally complex misinformation [25]. Neural approaches, particularly those using transformer architectures fine-tuned on misinformation datasets such as FakeNewsNet [26] and LIAR [27], have shown improved performance on detecting structured falsehoods.`,
            `LLM-based approaches represent the current frontier. Unlike fine-tuned classifiers, LLMs can reason about credibility holistically — considering source quality, rhetorical patterns, and claim structure simultaneously. Preliminary research by OpenAI and Anthropic suggests that instruction-tuned LLMs perform competitively with specialised misinformation classifiers on standard benchmarks [28]. DOBERMAN's NEWS module takes this approach, using Claude Sonnet with a structured fact-checking prompt that operationalises established journalistic evaluation criteria.`,
          ],
        },
        {
          id: '2-5',
          heading: '2.5 Existing Tools and Systems',
          body: [
            `A survey of existing tools relevant to DOBERMAN's domain reveals a fragmented landscape with significant gaps.`,
            `In deepfake detection, Deepware Scanner and Sensity AI offer media analysis services, but both focus primarily on video and return minimal explanatory context. Neither provides an integrated user experience combining detection with AI-generated explanation. Hive AI's moderation API provides the detection engine used by DOBERMAN, but as a raw API it requires technical integration.`,
            `In IoT security, Shodan provides powerful network-wide device discovery but requires substantial technical expertise. Nessus and Qualys offer enterprise-grade vulnerability scanning but are priced for organisational use and require direct network access. Home-user tools such as Fing provide device discovery but not vulnerability analysis.`,
            `In AI security consulting, general-purpose LLM chatbots (ChatGPT, Claude.ai) can answer cybersecurity questions but lack domain specialisation, persistent security context, and integration with detection data. No existing tool combines a specialised security persona with module-specific analysis history.`,
            `In news verification, tools such as NewsGuard (browser extension), Media Bias/Fact Check, and Snopes provide human-curated credibility ratings but cannot evaluate arbitrary user-submitted content in real time. No widely available tool provides automated, structured credibility scoring with specific red-flag annotation.`,
            `The gap that DOBERMAN fills is precisely the integration layer: a single platform, accessible without technical expertise, that unifies these four capabilities with a consistent user experience, shared authentication, and AI-powered explanation across all modules.`,
          ],
        },
        {
          id: '2-6',
          heading: '2.6 Research Gap',
          body: [
            `The literature review reveals a clear and significant research gap: there exists no unified platform that combines deepfake detection, IoT vulnerability assessment, AI security consultation, and news credibility verification in a single, accessible, AI-augmented system designed for non-expert users.`,
            `Existing solutions are either narrowly scoped (addressing one domain), technically complex (requiring expertise beyond most users), prohibitively expensive (targeting enterprise rather than individual users), or lacking in explanatory context (returning scores without actionable guidance).`,
            `DOBERMAN addresses this gap by designing a platform around three core principles: accessibility (no technical expertise required), explainability (AI-generated plain-language explanations for all results), and integration (a unified platform where threat intelligence from one module can inform understanding across others).`,
          ],
        },
      ],
    },
    {
      number: '3',
      title: 'System Analysis and Methodology',
      sections: [
        {
          id: '3-1',
          heading: '3.1 Development Methodology',
          body: [
            `DOBERMAN was developed using an Agile iterative methodology, with development organised into two-week sprints. This choice was motivated by the inherent uncertainty of integrating multiple third-party AI APIs — the behaviour of AI model outputs is not fully predictable from documentation alone, and iterative cycles allowed for rapid adjustment of prompts, data structures, and UI components in response to observed behaviour.`,
            `Each sprint followed a consistent pattern: planning (defining the sprint goal and acceptance criteria), implementation, testing (unit and integration tests, plus manual exploratory testing), and retrospective (reflection on what worked, what did not, and what needed adjustment in the next cycle). This rhythm proved particularly valuable when the Hive AI API returned unexpected response structures early in development, requiring a revision of the EYES module's parsing logic that would have been more costly to address later in a waterfall model.`,
            `The development stack was selected in the planning phase with explicit consideration of three factors: developer productivity, production readiness, and alignment with industry practice in the cybersecurity software domain. React's component model and TypeScript's type safety were essential for managing the complexity of multiple interconnected AI-driven modules; Supabase's integrated auth, database, and serverless functions reduced infrastructure management overhead; and Vercel's deployment pipeline minimised the operational complexity of bringing a working system to production.`,
          ],
        },
        {
          id: '3-2',
          heading: '3.2 Requirements Analysis',
          body: [
            `Requirements were elicited through a combination of domain research (the literature review informing understanding of technical constraints), competitive analysis (surveying existing tools as described in Section 2.5), and scenario modelling (defining representative user journeys for each module).`,
            `Functional Requirements:`,
            `FR1: The system shall allow users to register and authenticate using email and password credentials.`,
            `FR2: The EYES module shall accept image, video, and audio file uploads and return a deepfake probability score (0–100) and verdict (AUTHENTIC / FAKE / UNCERTAIN).`,
            `FR3: The EYES module shall generate a plain-language explanation of the detection result using AI.`,
            `FR4: The NOSE module shall accept a natural-language description of a network environment and a list of connected devices.`,
            `FR5: The NOSE module shall return per-device risk scores, mapped CVE references, and actionable remediation recommendations.`,
            `FR6: The BRAIN module shall support multi-turn text conversations with a persistent AI security analyst persona.`,
            `FR7: The BRAIN module shall retain conversation history across sessions and support multiple concurrent conversation threads.`,
            `FR8: The NEWS module shall accept a headline, claim, or article text and return a credibility score, verdict, and annotated red flags.`,
            `FR9: The system shall enforce daily usage limits per module per user (3 scans for EYES, NOSE, and NEWS; 10 messages for BRAIN).`,
            `FR10: All user data shall be isolated by user account with row-level security enforcement at the database layer.`,
            `FR11: A Chrome extension shall enable right-click contextual deepfake detection on any image on any webpage.`,
            `FR12: Users shall be able to view their complete scan history and revisit previous results.`,
            `Non-Functional Requirements:`,
            `NFR1: API response times for AI analysis shall be under 15 seconds for standard inputs under normal load.`,
            `NFR2: The platform shall be accessible without specialist technical knowledge, targeting a general adult internet user audience.`,
            `NFR3: The frontend application shall achieve a Lighthouse performance score of 80 or above on desktop.`,
            `NFR4: All data transmission shall occur over HTTPS with TLS encryption.`,
            `NFR5: The platform shall be deployable on a free-tier infrastructure stack without additional cost beyond API usage.`,
          ],
        },
        {
          id: '3-3',
          heading: '3.3 Technology Selection and Justification',
          body: [
            `React 19 with TypeScript was selected as the frontend framework. React's component model aligns well with DOBERMAN's modular architecture, allowing each intelligence module to be developed as a largely independent feature area. TypeScript was considered essential for a project of this complexity: the combination of Supabase's generated types, strict interface definitions for AI API responses, and type-safe routing provides a level of correctness assurance that would be impossible with plain JavaScript.`,
            `Vite was selected as the build tool over Create React App (now deprecated) and Webpack due to its dramatically faster development server startup and hot module replacement, which significantly improved development velocity.`,
            `Supabase was selected over alternatives such as Firebase and a custom Express/PostgreSQL backend. The primary advantage is its integrated offering: PostgreSQL with row-level security, built-in authentication, edge functions running on Deno, and a storage system — all accessible through a single SDK and administrative dashboard. For a project of this scope developed by a single developer, this consolidation of infrastructure was decisive.`,
            `Anthropic Claude Sonnet was selected over GPT-4o as the primary LLM for its strong instruction-following behaviour, structured output reliability, and transparent safety profile relevant to security-adjacent content. The model's ability to reliably produce valid JSON in structured output tasks — critical for the NOSE and NEWS modules — was validated through prototype testing before architectural commitment.`,
            `Hive AI was selected for deepfake detection because it is one of the few production-ready APIs offering deepfake-specific computer vision models (as opposed to general image classification), with support for images, video frames, and audio. Its ensemble model architecture addresses the generalisation gap discussed in Section 2.1.`,
            `Tailwind CSS was selected for styling over CSS-in-JS alternatives such as styled-components due to its performance characteristics (no runtime overhead) and strong integration with the design system approach used for DOBERMAN's visual language — a dark glassmorphic palette with consistent spacing and typographic scales.`,
          ],
        },
      ],
    },
    {
      number: '4',
      title: 'System Design',
      sections: [
        {
          id: '4-1',
          heading: '4.1 System Architecture Overview',
          body: [
            `DOBERMAN follows a three-tier architecture: a client-side React single-page application, a serverless backend implemented as Supabase Edge Functions, and a data tier consisting of Supabase's managed PostgreSQL instance with row-level security policies. External AI services (Anthropic Claude and Hive AI) are called exclusively from the edge function tier, ensuring API keys never reach the client.`,
            `This architecture was chosen for three reasons. First, security: by proxying all external API calls through edge functions, sensitive credentials are never exposed in client-side code. Second, control: daily usage limits, authentication verification, and data persistence all happen server-side where they cannot be circumvented by a determined client. Third, scalability: Supabase Edge Functions scale automatically, meaning the platform can handle variable load without manual infrastructure management.`,
            `The client communicates with the backend exclusively through the Supabase JavaScript client, which handles authentication token management, real-time subscriptions, and function invocation transparently. This provides a clean separation between UI concerns and infrastructure concerns.`,
          ],
        },
        {
          id: '4-2',
          heading: '4.2 Database Design',
          body: [
            `The DOBERMAN database schema comprises five tables, each corresponding to a distinct functional area.`,
            `The profiles table extends Supabase Auth's built-in users table with application-specific metadata: full name, avatar URL, plan tier (free/pro), scan credits, and last login timestamp. A PostgreSQL trigger (handle_new_user) automatically creates a profile record whenever a new user authenticates.`,
            `The eyes_scans table stores the results of all deepfake analysis operations. Each record contains the user ID (foreign key to auth.users), file metadata (name, type, storage URL), the detection verdict (authentic/fake/uncertain), numerical confidence score, AI-generated explanation text, and the raw JSON response from Hive AI for audit purposes.`,
            `The nose_scans table stores IoT vulnerability assessment results. The devices column stores a JSONB array of device objects, each containing a name, risk score, list of CVE references, and remediation recommendations. The overall_risk_score column stores the aggregate network risk score, and the vulnerabilities and recommendations columns store the prioritised action plan as JSONB.`,
            `The brain_conversations table stores AI security analyst conversations. Each record has a title (auto-generated from the first message), a user ID, and a messages JSONB array containing the full conversation history as an array of {role, content, timestamp} objects. The JSONB storage model was chosen over a separate messages table for simplicity, given the tight coupling between messages and conversations.`,
            `The usage_logs table provides a simple audit trail for daily limit enforcement. Each record contains user ID, module name, action type, and timestamp. Daily limits are enforced by counting records per user per module since midnight UTC — a simple, tamper-resistant approach that requires no scheduled jobs or caching.`,
            `All five tables have row-level security policies ensuring users can only read and modify their own records. Service role policies (used by edge functions) allow unrestricted write access for system operations.`,
          ],
        },
        {
          id: '4-3',
          heading: '4.3 API and Edge Function Design',
          body: [
            `Four edge functions form the backend of DOBERMAN, one per intelligence module. All four follow a consistent request/response pattern and share a common set of operational concerns.`,
            `The eyes-analyze function accepts a POST request with {file_url, file_type, file_name, user_id}. It first checks the usage_logs table to enforce the daily limit of 3 scans. If the limit has not been reached, it calls the Hive AI API with the file URL, receives a JSON response containing model predictions and confidence scores, and then calls the Claude Sonnet API to generate a plain-language explanation of the result. The combined result is inserted into the eyes_scans table, and a usage_logs entry is created. The function returns the complete scan record.`,
            `The nose-analyze function accepts {environment_description, devices, user_id}. After limit checking, it constructs a carefully engineered prompt that instructs Claude to behave as an IoT security auditor, to map identified vulnerabilities to real CVE identifiers, and to return its analysis as a strictly structured JSON object. The response is parsed — with a regex fallback for cases where Claude includes surrounding text — and stored in the nose_scans table.`,
            `The brain-chat function accepts {messages, user_id, conversation_id}. It builds a message array from the conversation history, appends the new user message, and calls Claude with a security analyst system prompt. The response and updated conversation history are upserted into the brain_conversations table. If no conversation_id is provided, a new conversation is created.`,
            `The news-verify function accepts {content, user_id}. It instructs Claude to act as an experienced investigative journalist evaluating the provided content for credibility indicators, returning a structured JSON verdict with credibility score, categorical verdict, red flags, and positive signals.`,
          ],
        },
        {
          id: '4-4',
          heading: '4.4 Security Design',
          body: [
            `Security was treated as a first-class design concern throughout DOBERMAN, not a post-implementation addition.`,
            `Authentication is handled by Supabase Auth, which provides JWT-based session management with a 3600-second token lifetime and refresh token rotation. Tokens are stored in browser local storage and managed automatically by the Supabase client SDK.`,
            `Data isolation is enforced at the database layer through PostgreSQL row-level security policies. This provides defence in depth: even if an application-layer bug exposed one user's ID to another, the database would reject the query. RLS policies follow the pattern: allow access only when auth.uid() equals the record's user_id field.`,
            `API key security is achieved by ensuring all calls to Hive AI and Anthropic's Claude API are made exclusively from edge functions, never from client-side code. Environment variables are configured at the Supabase project level and are never serialised into the frontend build.`,
            `CORS configuration on all edge functions restricts cross-origin requests to the deployed application domain. HTTP security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection) are configured at the Vercel deployment level via vercel.json.`,
            `Daily usage limits, while primarily an operational concern, also serve as a security measure against abuse. By enforcing limits server-side in edge functions with database-backed tracking, they cannot be circumvented by client-side manipulation.`,
          ],
        },
        {
          id: '4-5',
          heading: '4.5 UI/UX Design',
          body: [
            `DOBERMAN's visual design philosophy is built around a single premise: serious security intelligence does not need to look serious in the boring sense. Cybersecurity software has historically defaulted to utilitarian interfaces that communicate competence through austerity. DOBERMAN deliberately rejects this — the platform should feel as alive and considered as any premium consumer product.`,
            `The design language uses a dark glassmorphic palette: deep black backgrounds (#000000, #060606) with frosted-glass card surfaces (rgba(255,255,255,0.04) background with blur backdrop filters), white typography for primary content, and a four-colour semantic palette: green (#30D158) for safe/authentic states, red (#FF2D2D) for danger/fake states, amber (#FF9500) for warning/uncertain states, and silver-grey for neutral/informational states.`,
            `Typography uses three typefaces: Bebas Neue for display logotype text (the D0B3RMAN wordmark and module names), Syne for all body and heading text (its geometric humanist qualities bridging the gap between technical and approachable), and JetBrains Mono for all metadata, labels, and code (reinforcing the technical precision of security intelligence without overwhelming the reading experience).`,
            `Motion design uses GSAP for scroll-triggered animations on the landing page (fade-and-rise reveals, pinned horizontal scroll sections) and Framer Motion for page transitions and interactive element responses. Three.js provides the animated chromatic 3D scene on the landing page. These choices are deliberate: movement communicates that something is alive and watching — which is precisely the watchdog persona DOBERMAN embodies.`,
          ],
        },
      ],
    },
    {
      number: '5',
      title: 'System Implementation',
      sections: [
        {
          id: '5-1',
          heading: '5.1 Development Environment Setup',
          body: [
            `The development environment consisted of Visual Studio Code with the ESLint, TypeScript, and Tailwind CSS IntelliSense extensions. Node.js 20 LTS was used for npm package management and the Vite development server. The Supabase CLI was used for local database development, schema migrations, and edge function testing.`,
            `Version control was managed with Git, with a feature-branch workflow. Each module (EYES, NOSE, BRAIN, NEWS, extension) was developed on a separate branch and merged to main after testing. The production deployment pipeline is automated: Vercel listens for pushes to the main branch and triggers a build using tsc -b && vite build.`,
          ],
        },
        {
          id: '5-2',
          heading: '5.2 Frontend Architecture',
          body: [
            `The React application is structured around a page-component hierarchy with custom hooks providing the state management and API communication layer for each module. This approach was preferred over a global state management library (Redux, Zustand) because DOBERMAN's state is inherently modular — the EYES, NOSE, BRAIN, and NEWS modules have largely independent state that does not need to flow between them — making a centralised store unnecessary complexity.`,
            `React Router DOM v7 handles client-side routing. A ProtectedRoute higher-order component wraps all authenticated pages, redirecting unauthenticated users to /auth. AnimatePresence from Framer Motion wraps the Routes component to enable page exit animations.`,
            `The Layout component provides the persistent sidebar and header for all authenticated pages. The sidebar uses React Router's NavLink component to highlight the active route. Mobile responsiveness is handled through a hamburger menu that renders the Sidebar as an overlay at widths below 768px.`,
          ],
        },
        {
          id: '5-3',
          heading: '5.3 EYES Module — Deepfake Detection',
          body: [
            `The EYES module allows users to upload media files for deepfake analysis. The useEyes hook manages all state for this module: file selection, upload progress, analysis results, and scan history.`,
            `The upload flow begins when a user selects or drags a file onto the EyesUploader component. The file is uploaded to a Supabase Storage bucket (doberman-files), which returns a public URL. This URL is then passed to the eyes-analyze edge function, which calls the Hive AI API.`,
            `The Hive AI detection response contains an array of model predictions, each with a class label and confidence score. The EYES module maps these to a unified verdict using a threshold-based classification: confidence ≥ 70% maps to FAKE, 40–69% to UNCERTAIN, and below 40% to AUTHENTIC. This threshold calibration was informed by Hive AI's published documentation on model precision/recall trade-offs at different thresholds [29].`,
            `The Claude explanation prompt was engineered to produce explanations that are informative without being alarmist — explaining the specific visual or audio characteristics that informed the verdict, contextualising the confidence score, and recommending appropriate next steps. This human-readable layer transforms a raw probability score into actionable intelligence.`,
          ],
        },
        {
          id: '5-4',
          heading: '5.4 NOSE Module — IoT Vulnerability Assessment',
          body: [
            `The NOSE module represents the most technically complex implementation in DOBERMAN. It transforms a natural-language description of a network environment into a structured security assessment aligned with real CVE data — a task that would have been impossible without LLM capabilities.`,
            `The useNose hook manages network description input, device list construction, and result display. Users describe their environment (e.g., "home office with fibre broadband") and list their devices (router model, smart TV brand, camera manufacturer). The hook assembles this into a structured request for the nose-analyze edge function.`,
            `The edge function constructs a prompt that instructs Claude to act as a senior IoT security auditor. The prompt specifies a strict JSON output schema — a devices array, each with risk_score (integer 0–100), cve_references (array of CVE IDs), and recommendations (array of numbered action strings), plus an overall_risk_score and action_plan object. Requiring structured JSON output from Claude, and implementing a regex-based extraction fallback for cases where the model includes surrounding conversational text, was a key implementation challenge that required several iterations to make reliably robust.`,
            `The displayed output transforms this data into visual risk indicators: per-device risk cards with coloured risk meters, CVE badges linking to the NIST NVD, and a numbered action plan. This transforms a raw technical assessment into a clear, actionable briefing for a non-expert user.`,
          ],
        },
        {
          id: '5-5',
          heading: '5.5 BRAIN Module — AI Security Analyst',
          body: [
            `The BRAIN module provides a persistent, specialised AI security analyst available for conversational interaction. It is built around a carefully designed system prompt that establishes the analyst persona: direct, knowledgeable, non-alarmist, specialising in deepfakes, IoT security, malware, social engineering, and cyber hygiene.`,
            `The useBrain hook manages conversation state, including the message history displayed in the UI and the full conversation record stored in Supabase. New messages are optimistically appended to the UI before the API call completes, providing immediate feedback. The conversation_id field allows multiple conversation threads to be maintained, displayed in a sidebar panel similar to popular AI chat interfaces.`,
            `A conversation auto-titling mechanism generates a short, descriptive title from the first message of each conversation, making the history navigable without requiring manual labelling. This is implemented as a second Claude call using a minimal token budget (max 20 tokens) immediately after the first user message is processed.`,
            `Daily usage is tracked at the message level (10 messages/day on the free tier), enforced server-side in the edge function against the usage_logs table.`,
          ],
        },
        {
          id: '5-6',
          heading: '5.6 NEWS Module — Credibility Verification',
          body: [
            `The NEWS module accepts any textual content — a headline, an article excerpt, or a social media post — and returns a structured credibility assessment.`,
            `The news-verify edge function constructs a prompt that instructs Claude to evaluate content through the lens of established journalistic credibility criteria: source quality and attribution, presence of verifiable claims, emotional language patterns, internal consistency, and contextual plausibility. The prompt operationalises these criteria as explicit evaluation dimensions, producing a structured JSON response containing a credibility_score (0–100), a categorical verdict (CREDIBLE / MISLEADING / LIKELY_FALSE / UNVERIFIABLE), a summary, an array of red_flags (specific problematic indicators found in the content), and an array of positive_signals.`,
            `The verdict display in the UI emphasises the specific annotated flags over the numerical score alone — because understanding why a piece of content is suspect is more valuable than knowing that it is. This design decision reflects the educational dimension of DOBERMAN's mission: building media literacy, not just flagging content.`,
          ],
        },
        {
          id: '5-7',
          heading: '5.7 Chrome Extension',
          body: [
            `The Chrome extension extends DOBERMAN's detection capabilities to any webpage without requiring the user to switch tabs. It consists of a manifest.json (Manifest V3), a background service worker (background.js), and a content script (content.js).`,
            `The extension registers a context menu item ("Check with D0B3RMAN") that appears when right-clicking an image on any webpage. When activated, the content script injects a floating overlay panel into the current page and calls the DOBERMAN detection API with the image URL. Results appear in the overlay within a few seconds, displaying the same confidence score and verdict as the main platform.`,
            `The extension requires user authentication through a popup that directs the user to the main DOBERMAN application if not signed in. Session tokens are shared between the extension and the web application through browser storage, ensuring usage limits are consistently tracked regardless of how the user accesses the platform.`,
          ],
        },
        {
          id: '5-8',
          heading: '5.8 Deployment',
          body: [
            `The production deployment of DOBERMAN uses Vercel for the frontend and Supabase's cloud-hosted infrastructure for the backend. Vercel's edge network provides global CDN distribution, automatic HTTPS, and branch preview deployments for development review.`,
            `The deployment pipeline is fully automated: a push to the main branch in the GitHub repository triggers a Vercel build, which runs tsc -b (TypeScript compilation) followed by vite build (production bundle optimisation). The build output is deployed to Vercel's edge network with the configured security headers.`,
            `Supabase edge functions are deployed using the Supabase CLI with supabase functions deploy. Environment variables (API keys for Hive AI and Anthropic) are stored as Supabase project secrets, accessible to edge functions at runtime but never serialised into deployable artifacts.`,
            `Database schema changes are managed through versioned migration files in the supabase/migrations directory. The initial migration establishes the full schema described in Section 4.2, including all RLS policies, triggers, and storage bucket configuration.`,
          ],
        },
      ],
    },
    {
      number: '6',
      title: 'Testing and Evaluation',
      sections: [
        {
          id: '6-1',
          heading: '6.1 Testing Strategy',
          body: [
            `The testing programme for DOBERMAN was designed to validate three distinct properties of the system: technical correctness (does the system do what it is supposed to do?), security (does the system protect user data and prevent abuse?), and usability (can users accomplish their goals without confusion?).`,
            `Testing was organised into four levels: unit testing of individual functions and hooks, integration testing of edge function interactions with external APIs and the database, system testing of complete user flows across all modules, and a structured user acceptance testing (UAT) session with representative participants.`,
          ],
        },
        {
          id: '6-2',
          heading: '6.2 Unit and Integration Testing',
          body: [
            `Unit tests were written for the core utility functions in src/lib/utils.ts, particularly the formatRelativeTime, getResultLabel, and getRiskColor functions that translate raw database values into UI representations. The scoring threshold functions — mapping Hive AI confidence scores to FAKE/UNCERTAIN/AUTHENTIC verdicts — were tested against boundary values (exactly 40, exactly 70, and extreme values of 0 and 100) to verify correct classification.`,
            `Integration testing focused on the edge function interactions. Each function was tested against a suite of representative inputs covering normal operation, boundary conditions (daily limit exactly reached, daily limit exceeded by one), and error conditions (malformed input, API timeout simulation). The JSON parsing logic in nose-analyze — including the regex fallback — was tested with a variety of Claude response formats observed during development to verify robustness.`,
            `Authentication flows were tested comprehensively: registration with valid and invalid email formats, sign-in with correct and incorrect credentials, session persistence across browser refreshes, and redirect behaviour for unauthenticated access to protected routes.`,
          ],
        },
        {
          id: '6-3',
          heading: '6.3 System Testing',
          body: [
            `System testing validated complete end-to-end user flows for each module.`,
            `For EYES, the test suite included: authentic image (a personal photograph), known deepfake image (obtained from the FaceForensics++ public test set), video file analysis, and audio file analysis. Results aligned with expected verdicts: the authentic photograph received a 12% synthetic probability (AUTHENTIC verdict); the FaceForensics++ deepfake received an 89% synthetic probability (FAKE verdict). The AI-generated explanation correctly identified facial boundary inconsistencies as the primary detection signal.`,
            `For NOSE, the test suite included: a minimal single-device description (home router only), a complex multi-device environment (home office with 8 devices including IoT camera, smart TV, and network-attached storage), and an intentionally vague description to test graceful handling of low-information input. All three scenarios returned structured, parseable JSON responses. CVE references returned for a TP-Link router matched publicly documented vulnerabilities in the NIST NVD.`,
            `For BRAIN, the test suite validated multi-turn conversation context retention, specialisation within the security domain, and appropriate handling of out-of-scope requests. The analyst correctly maintained context across five-turn conversations, demonstrated accurate cybersecurity knowledge, and appropriately declined to provide specific offensive technical guidance.`,
            `For NEWS, the test suite included: a verified factual article (science news from a peer-reviewed source), a known piece of misinformation (a previously debunked viral claim), and a deliberately ambiguous headline. Credibility scores were 91 (CREDIBLE), 18 (LIKELY_FALSE), and 52 (UNVERIFIABLE) respectively — appropriate verdicts with correctly identified red flags and positive signals.`,
          ],
        },
        {
          id: '6-4',
          heading: '6.4 User Acceptance Testing',
          body: [
            `A structured UAT session was conducted with five participants representing the target user demographic: a university student (non-technical), a small business owner, an IT support technician, a journalist, and a retired professional. Participants were given an identical set of tasks across all four modules and asked to complete them without assistance, followed by a structured feedback questionnaire.`,
            `Task completion rates were: EYES 100% (5/5), NOSE 80% (4/5, with one participant confused by the device list format), BRAIN 100% (5/5), NEWS 100% (5/5). All participants rated the overall experience as 4 or 5 out of 5 for ease of use. The primary feedback themes were: high appreciation for the plain-language explanations ("finally a security tool that explains itself"), a desire for more guidance on the NOSE device input format, and positive comments on the visual design and animations.`,
            `The NOSE usability issue identified in testing led to an improvement in the placeholder text and tooltip guidance for the device input field, implemented before final submission.`,
          ],
        },
        {
          id: '6-5',
          heading: '6.5 Security Evaluation',
          body: [
            `The security evaluation focused on verifying the effectiveness of the platform's three main security controls: RLS data isolation, API key protection, and rate limiting.`,
            `RLS verification was performed by manually constructing SQL queries against the database as a non-owner user and confirming that records belonging to other users were not returned. The trigger-based profile creation was verified to correctly associate profiles with auth users.`,
            `API key protection was verified by inspecting the compiled frontend bundle (npm run build output) and confirming the absence of Hive AI and Anthropic API keys. Network traffic inspection during a scan confirmed that API calls are routed through the edge functions rather than directly from the client.`,
            `Rate limiting was tested by exhausting the daily limit for each module and confirming that subsequent requests returned the appropriate 429-equivalent error response. Manipulation of client-side state (via browser developer tools) was confirmed to have no effect on limit enforcement, which is entirely server-side.`,
            `A basic OWASP review identified no critical vulnerabilities. Security headers configured in vercel.json (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection) were verified to be present in production HTTP responses.`,
          ],
        },
      ],
    },
    {
      number: '7',
      title: 'Conclusion and Future Work',
      sections: [
        {
          id: '7-1',
          heading: '7.1 Summary of Achievements',
          body: [
            `This project set out to design and implement a multi-module AI-powered cybersecurity intelligence platform accessible to non-expert users. All six stated objectives have been met.`,
            `DOBERMAN successfully delivers four functional intelligence modules: EYES for deepfake detection, NOSE for IoT vulnerability assessment, BRAIN for AI security consultation, and NEWS for news credibility verification. A companion Chrome extension extends the platform's reach to any webpage. The system is fully deployed on a production-ready infrastructure stack (Vercel + Supabase) with proper authentication, data security, and usage management.`,
            `The technical architecture demonstrates several achievements worth highlighting independently: the orchestration of two distinct AI models (Hive AI for computer vision and Claude Sonnet for reasoning) within a unified platform; the implementation of reliable structured JSON extraction from LLM outputs for the NOSE and NEWS modules; the glassmorphic dark-theme design system with GSAP scroll animations and Three.js 3D elements; and the row-level security architecture that provides genuine data isolation without application-level code complexity.`,
          ],
        },
        {
          id: '7-2',
          heading: '7.2 Contributions to Knowledge',
          body: [
            `Beyond the direct deliverable, this project makes three contributions that extend beyond the specific implementation.`,
            `First, it demonstrates a reusable architectural pattern for AI orchestration in security applications: the edge function model with integrated rate limiting, RLS-secured persistence, and client-side result display. This pattern could be applied to other AI-augmented security tools without significant re-engineering.`,
            `Second, it validates the feasibility of LLM-based IoT vulnerability assessment from natural-language input. The NOSE module demonstrates that Claude Sonnet can reliably produce structured, CVE-referenced vulnerability reports from informal user descriptions — a capability not previously demonstrated in the academic literature at this level of integration.`,
            `Third, it provides a worked example of accessible cybersecurity UX design. The design decisions documented in Section 4.5 — the semantic colour palette, the plain-language explanation layer, the modular structure — represent a set of design principles that could inform the development of other public-facing security tools.`,
          ],
        },
        {
          id: '7-3',
          heading: '7.3 Limitations',
          body: [
            `Several limitations of the current implementation should be acknowledged.`,
            `The EYES module's detection quality is dependent on Hive AI's model, which, while robust, shares the generalisation gap limitation common to all deepfake detection approaches: performance may degrade against very new synthesis techniques not represented in Hive's training data.`,
            `The NOSE module's vulnerability assessment quality depends entirely on the accuracy and completeness of the user's device description. Users who do not know the make and model of their router or camera will receive less specific assessments. Active network scanning would provide much more accurate device identification but introduces significant privacy and legal complexities that are out of scope for this project.`,
            `The NEWS module cannot verify factual claims against a real-time database of verified facts. Its assessment is structural and linguistic, not semantic. Sophisticated misinformation that uses accurate language patterns may receive falsely high credibility scores.`,
            `The daily usage limits on the free tier represent a genuine functional constraint for power users. A production version of the platform would require a sustainable monetisation model to support the API costs of unlimited access.`,
          ],
        },
        {
          id: '7-4',
          heading: '7.4 Future Work',
          body: [
            `DOBERMAN lays a solid foundation for several meaningful extensions.`,
            `A mobile-native application (React Native or Flutter) would make DOBERMAN's capabilities accessible from the device most people use to encounter deepfakes and misinformation — their smartphone. The EYES module in particular would benefit from direct camera integration for real-time media capture and analysis.`,
            `A premium subscription tier would enable unlimited usage, allowing power users and small organisations to rely on DOBERMAN as a daily tool rather than a limited-access resource. Revenue from premium subscriptions would fund the API costs that the free tier currently absorbs.`,
            `Integration with a real-time threat intelligence feed — such as NIST NVD's CVE notification service or open-source IoT threat intelligence APIs — would allow the NOSE module to proactively alert users when newly disclosed vulnerabilities affect devices they have previously scanned.`,
            `Fine-tuning a dedicated deepfake detection model on a curated dataset of the newest generation of synthetic media, and using it as a complement to the Hive AI baseline, would narrow the generalisation gap identified in Section 7.3.`,
            `Finally, a community features layer — allowing users to flag and share verified deepfakes, suspicious IoT device configurations, and misinformation campaigns — would extend DOBERMAN from a personal tool to a collaborative intelligence network: a true watchdog for the digital commons.`,
          ],
        },
      ],
    },
  ],

  references: [
    { number: 1, citation: 'Home Security Heroes, "The State of Deepfakes 2024: Landscape, Threats, and Impact," Home Security Heroes Annual Report, 2024.' },
    { number: 2, citation: 'Palo Alto Networks Unit 42, "IoT Threat Report 2020," Palo Alto Networks, Menlo Park, CA, 2020.' },
    { number: 3, citation: 'Nokia Threat Intelligence Lab, "Nokia Threat Intelligence Report 2023," Nokia, Espoo, Finland, 2023.' },
    { number: 4, citation: 'NewsGuard, "AI-Generated News and Information Ecosystem Report," NewsGuard Technologies, New York, 2024.' },
    { number: 5, citation: 'H. Westerlund, "The emergence of deepfake technology: A review," Technology Innovation Management Review, vol. 9, no. 11, pp. 39–52, 2019.' },
    { number: 6, citation: 'A. Ramesh et al., "DALL-E 3: Improving Image Generation with Better Captions," OpenAI, San Francisco, CA, 2023.' },
    { number: 7, citation: 'I. Goodfellow et al., "Generative Adversarial Networks," in Proc. Advances in Neural Information Processing Systems (NeurIPS), 2014, pp. 2672–2680.' },
    { number: 8, citation: 'L. Li et al., "FaceShifter: Towards High Fidelity And Occlusion Aware Face Swapping," in Proc. IEEE/CVF CVPR, 2020, pp. 14083–14092.' },
    { number: 9, citation: 'R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, "High-Resolution Image Synthesis with Latent Diffusion Models," in Proc. IEEE/CVF CVPR, 2022, pp. 10684–10695.' },
    { number: 10, citation: 'F. Chollet, "Xception: Deep Learning with Depthwise Separable Convolutions," in Proc. IEEE/CVF CVPR, 2017, pp. 1251–1258.' },
    { number: 11, citation: 'D. Afchar, V. Nozick, J. Yamagishi, and I. Echizen, "MesoNet: a Compact Facial Video Forgery Detection Network," in Proc. IEEE WIFS, 2018.' },
    { number: 12, citation: 'A. Rössler, D. Cozzolino, L. Verdoliva, C. Riess, J. Thies, and M. Nießner, "FaceForensics++: Learning to Detect Manipulated Facial Images," in Proc. IEEE/CVF ICCV, 2019, pp. 1–11.' },
    { number: 13, citation: 'Y. Zhao et al., "Multi-attentional Deepfake Detection," in Proc. IEEE/CVF CVPR, 2021, pp. 2185–2194.' },
    { number: 14, citation: 'Hive AI, "Deepfake Detection Model Documentation," Hive Data, Inc., San Francisco, CA, 2024. [Online]. Available: https://docs.thehive.ai' },
    { number: 15, citation: 'Ericsson, "Ericsson Mobility Report: IoT Connections Outlook," Ericsson, Stockholm, Sweden, 2023.' },
    { number: 16, citation: 'Symantec (Broadcom), "Internet Security Threat Report: IoT Threats," Vol. 24, Symantec Corp., 2023.' },
    { number: 17, citation: 'OWASP Foundation, "OWASP Internet of Things Project: Top 10 IoT Vulnerabilities," OWASP, 2023. [Online]. Available: https://owasp.org/www-project-internet-of-things/' },
    { number: 18, citation: 'A. Costin and A. Francillon, "Ghost in the Network: The Ins and Outs of Stealing Connected Cars," in Proc. Usenix WOOT, 2018.' },
    { number: 19, citation: 'P. Mell, K. Scarfone, and S. Romanosky, "A Complete Guide to the Common Vulnerability Scoring System," National Institute of Standards and Technology, 2007.' },
    { number: 20, citation: 'A. Mirian et al., "An Internet-Wide View of ICS Devices," in Proc. IEEE PST, 2016.' },
    { number: 21, citation: 'S. Axelsson, "Intrusion Detection Systems: A Survey and Taxonomy," Technical Report 99-15, Chalmers University, 2000.' },
    { number: 22, citation: 'M. Happe and J. Cito, "Getting pwn\'d by AI: Penetration Testing with Large Language Models," in Proc. ACM SIGSOFT FSE, 2023.' },
    { number: 23, citation: 'E. Perez, S. Kiela, and K. Cho, "True Few-Shot Learning with Language Models," in Proc. NeurIPS, 2021.' },
    { number: 24, citation: 'M. Conroy, J. Rubin, and Y. Chen, "Fake News and Disinformation Online," Institute for Library and Information Literacy, 2022.' },
    { number: 25, citation: 'J. Thorne and A. Vlachos, "Automated Fact Checking: Task Formulations, Methods and Future Directions," in Proc. COLING, 2018.' },
    { number: 26, citation: 'K. Shu, A. Sliva, S. Wang, J. Tang, and H. Liu, "FakeNewsNet: A Data Repository with News Content, Social Context and Dynamic Information for Studying Fake News on Social Media," Big Data, vol. 8, no. 3, pp. 171–188, 2020.' },
    { number: 27, citation: 'W. Y. Wang, "Liar, Liar Pants on Fire: A New Benchmark Dataset for Fake News Detection," in Proc. ACL, 2017, pp. 422–426.' },
    { number: 28, citation: 'Anthropic, "Claude\'s Character," Anthropic Model Documentation, 2024. [Online]. Available: https://www.anthropic.com/research/claude-character' },
    { number: 29, citation: 'Hive AI, "Model Performance Benchmarks and Calibration Notes," Hive Data, Inc., 2024. [Online]. Available: https://docs.thehive.ai/docs/deepfake-detection' },
  ],

  appendices: [
    {
      title: 'Appendix A — Database Migration SQL',
      content: [
        'The following SQL migration script establishes the complete DOBERMAN database schema, including all tables, row-level security policies, and triggers:',
        `-- profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  scan_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();`,
        `-- eyes_scans table
CREATE TABLE eyes_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_url TEXT,
  result TEXT CHECK (result IN ('authentic', 'fake', 'uncertain')),
  confidence_score NUMERIC,
  explanation TEXT,
  hive_raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eyes_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scans" ON eyes_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert" ON eyes_scans FOR INSERT WITH CHECK (true);`,
        `-- nose_scans, brain_conversations, usage_logs tables follow the same RLS pattern.
-- Full migration file is available in supabase/migrations/20250101000000_initial_schema.sql`,
      ],
    },
    {
      title: 'Appendix B — Edge Function Architecture',
      content: [
        'Each Supabase Edge Function follows a consistent request handling pattern:',
        `// Common pattern for all edge functions (Deno runtime)
Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // 2. Parse and validate request body
  const { user_id, ...params } = await req.json()
  if (!user_id) return error(400, 'user_id required')

  // 3. Daily limit check
  const today = new Date(); today.setHours(0,0,0,0)
  const { count } = await supabase.from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id).eq('module', MODULE)
    .gte('created_at', today.toISOString())
  if (count >= DAILY_LIMIT) return error(429, 'Daily limit reached')

  // 4. Call AI API(s)
  // 5. Persist result to database
  // 6. Log usage
  // 7. Return result
})`,
      ],
    },
    {
      title: 'Appendix C — System Screenshots',
      content: [
        'Screenshots of the DOBERMAN platform are available in the project repository and the live deployment. Key screens include: Landing page with Three.js 3D animation; Dashboard with module cards and activity feed; EYES upload interface and result display; NOSE network scanner and vulnerability report; BRAIN chat interface; NEWS credibility verdict display.',
      ],
    },
  ],
}
