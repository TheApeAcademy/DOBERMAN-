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
  url?: string
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

  abstract: `The modern digital environment has given rise to a cluster of interrelated threats that exploit the gap between how content and infrastructure appear and how they actually are: synthetic deepfake media, cloned voices, AI-generated text, credential-stuffing attacks against reused passwords, phishing and scam infrastructure, systemically vulnerable IoT-connected networks, and the viral spread of AI-generated misinformation. Existing tooling addressing these threats is fragmented across single-purpose products, is frequently priced and configured for enterprise security teams rather than individuals, and rarely explains its verdicts in language a non-specialist can act on.

This report presents DOBERMAN, a multi-module AI-powered cybersecurity intelligence platform that integrates detection, verification, and advisory capability across nine functional areas behind a single authenticated web application and companion Chrome extension. EYES performs deepfake and synthetic-media detection on images, video, and audio using the Hive AI computer vision engine. A parallel Voice Intelligence capability screens audio for clone and manipulation indicators, and a Text AI-Detection capability screens written passages for signals consistent with unedited large language model output. NOSE performs AI-assisted IoT and home-network risk triage from a natural-language description of a user's devices. NEWS combines a live cyber-news feed, an LLM-based credibility verifier for arbitrary claims, and a conversational intelligence assistant scoped to a specific article. Breach Detection checks passwords against the Have I Been Pwned Pwned Passwords corpus using the k-anonymity protocol, and checks email addresses against the HIBP breach-account API when a live key is configured. A Scam Link Analyzer scores submitted URLs for phishing and malware indicators, and a Cyber Globe module surfaces cached, LLM-generated country-level cyber-threat briefings. Underpinning all of these is DAYE (Doberman Artificial Yield Engine), a single context-aware AI analyst persona invoked with a distinct, purpose-built prompt template for each module and result type, backed by a dual-provider large language model strategy (Anthropic Claude as primary, Google Gemini as an automatic fallback) intended to keep the platform available when a single provider is degraded or rate-limited.

The platform is implemented as a React 19 and TypeScript single-page application backed by Supabase, which provides PostgreSQL storage with row-level security, authentication, and Deno-based serverless edge functions; all third-party AI and security API calls are issued exclusively from this server-side tier, so provider credentials are never present in client-side code. This report documents the system's architecture, the security controls verified during this review (row-level security enabled on every application table, server-side enforcement of per-module daily usage limits, and the absence of provider secrets from the compiled client bundle), and a full interface walkthrough of every module conducted against realistic simulated data, presented with screenshots, because live end-to-end testing against the production deployment and its metered third-party API keys was not possible within the reporting window for this document. The report is explicit about this boundary: quantitative accuracy claims for the detection modules are not presented here, because no dataset-scale evaluation against ground-truth labelled data was performed, and the report specifies the evaluation programme required to produce such claims defensibly. Where the existing implementation already avoids fabrication by design — for example, the breach-checking and country-briefing functions return an explicit "unavailable" state rather than an invented result when live data cannot be obtained — this report treats that as a genuine and citable engineering property of the system rather than an assumption. DOBERMAN's principal contribution is therefore not a novel detection algorithm, since every model-level capability is provided by a third-party service, but the design and implementation of a secure, rate-limited, multi-provider orchestration layer around those services, together with a reusable context-aware persona architecture (DAYE) and a demonstrated discipline of declining to fabricate results when live data is unavailable.`,

  keywords: [
    'Deepfake Detection',
    'Voice Clone Detection',
    'AI-Generated Text Detection',
    'IoT Security',
    'Credential Breach Checking',
    'Phishing URL Detection',
    'Large Language Models',
    'News Verification',
    'Supabase',
    'React',
    'Hive AI',
    'Claude AI',
    'k-Anonymity',
    'Edge Functions',
  ],

  dedication: `To my family, who believed in me long before I believed in myself.

To every student who has ever stayed up past midnight asking whether the thing they are building actually matters: it does.

And to the internet, which is simultaneously the most dangerous and most beautiful thing humanity has ever made.`,

  acknowledgements: `This project could not have existed without the guidance, patience, and intellectual generosity of Dr. Osutokun Kemi, whose supervision throughout this academic year pushed me to ask harder questions and build better answers. Thank you.

To the faculty and staff of the Department of Cyber Security at Precious Cornerstone University, Ibadan: your commitment to preparing students for the realities of modern security practice has shaped not just this project, but my entire approach to the field.

To my peers in the 2022/2026 cohort, for the late-night debates, the shared frustrations, and the moments of genuine breakthrough that made this journey worthwhile. You know who you are.

Finally, to the open-source community whose tools, documentation, and collective knowledge made a project of this technical ambition possible for a single undergraduate student: this work stands on your shoulders.`,

  chapters: [
    // ─────────────────────────────────────────────────────
    // CHAPTER 1: INTRODUCTION
    // ─────────────────────────────────────────────────────
    {
      number: '1',
      title: 'Introduction',
      sections: [
        {
          id: '1-1',
          heading: '1.1 Background and Motivation',
          body: [
            `Cybersecurity is no longer a concern exclusive to governments, banks, or large corporations. It has become a personal matter, affecting ordinary people in their living rooms, on their phones, and in their daily consumption of information and money movement. Several developments in particular have redefined the threat landscape in ways that existing consumer-facing tools have failed to keep pace with.`,
            `The first is the synthetic media epidemic. Generative Adversarial Networks (GANs) and diffusion models have made the synthesis of photorealistic fake images and video trivially accessible, and parallel advances in voice cloning and large language models have extended the same problem to audio and text. A 2024 industry report documented a 400 per cent year-on-year increase in deepfake attacks [1]. Fabricated videos of executives authorising fraudulent wire transfers, cloned voices used in "grandparent scam" and business email compromise variants, and AI-written text used to scale phishing and misinformation campaigns now represent a growing category of financial and reputational harm. The average person has no reliable way to distinguish authentic media and text from synthetic, and that gap is widening.`,
            `The second is credential and identity exposure. Large-scale data breaches routinely place billions of email-password pairs into circulation, and because password reuse remains common, a single breach at an unrelated service can compromise a user's accounts elsewhere through credential-stuffing attacks. Industry practice has converged on proactively checking user credentials against known-breach corpora before they cause harm, most visibly through services such as Have I Been Pwned (HIBP), and the protocol design underlying these checks (returning candidate matches without ever transmitting a password in the clear) is itself an active area of applied cryptographic research [37].`,
            `The third is the IoT security crisis. The proliferation of smart devices (routers, cameras, smart TVs, thermostats, baby monitors, and dozens of others) has dramatically expanded the attack surface of the typical home or small-business network. Research from security firm Palo Alto Networks found that 70 per cent of IoT devices have at least one unpatched critical vulnerability [2]. These devices are often deployed with default credentials, rarely receive firmware updates, and are virtually invisible to conventional security tooling.`,
            `The fourth is phishing and scam infrastructure. Malicious domains that impersonate legitimate brands remain one of the most common initial-access vectors for account takeover and financial fraud, and machine learning approaches to classifying such URLs from lexical, domain, and content features have become an active and mature area of applied security research [38].`,
            `The fifth is the misinformation crisis. The volume of AI-generated text content on the internet doubled between 2022 and 2024 [4]. Fabricated news, manipulated headlines, and synthetic social media narratives now spread faster than corrections, and the same generative capability that produces this content increasingly complicates the older, simpler task of asking whether a specific passage of text was written by a person at all [39]. Traditional fact-checking organisations cannot scale to match the pace of production, and most users lack the analytical frameworks to evaluate credibility independently.`,
            `These threats share a common characteristic: they exploit the gap between how things appear and how they actually are. DOBERMAN, the project presented in this report, was conceived as a direct response to that gap. Its name encapsulates its design philosophy: a watchdog that is alert, intelligent, and perpetually vigilant. Over the course of this project the system grew from an initial four-module prototype (deepfake detection, IoT triage, an AI security assistant, and news verification) into a nine-capability platform, described in full in Chapter 3, as it became clear during development that the same underlying orchestration pattern, a rate-limited edge function calling a third-party detection or reasoning service and returning an explained, persisted result, generalised cleanly to voice, text, breach, phishing, and geopolitical threat intelligence.`,
          ],
        },
        {
          id: '1-2',
          heading: '1.2 Problem Statement',
          body: [
            `Despite the growing severity of threats posed by synthetic media, credential exposure, IoT vulnerabilities, phishing infrastructure, and AI-generated misinformation, access to reliable, easy-to-use cybersecurity intelligence tools remains severely limited for individual users and small organisations. The current market offers fragmented, technically complex, and often prohibitively expensive solutions that assume a level of expertise the average user simply does not have.`,
            `Specifically, the following gaps exist in the current landscape: (i) no single accessible platform addresses deepfake, voice-clone, and AI-text detection, IoT vulnerability triage, credential breach checking, phishing link analysis, AI security consulting, and news credibility verification in one cohesive user experience; (ii) existing detection tools often return a bare confidence score without explanatory context, leaving users unable to understand or act on the result; (iii) IoT security tools such as Shodan and Nessus require technical configuration far beyond the capability of most home users; (iv) consumer breach-checking is typically limited to a single lookup type (usually email) rather than covering passwords, emails, and phone numbers under one interface; (v) news verification is typically manual and time-consuming, relying on human fact-checkers who cannot operate at the speed of social media.`,
            `A further, more specific problem motivates the methodological stance of this report. Systems that combine large language models with security decision-making inherit a distinct failure mode: a model can produce a confident, well-formatted, plausible-sounding answer that is nonetheless fabricated, whether that is an invented CVE identifier, an invented breach record, or an invented statistic about a country's threat landscape. A platform in this space therefore has an obligation not merely to be accurate when it can be, but to be honest about the boundary of what it actually knows. The absence of an accessible, AI-augmented, unified platform for personal and small-team cybersecurity intelligence that is also explicit about this boundary constitutes the core problem this project addresses.`,
          ],
        },
        {
          id: '1-3',
          heading: '1.3 Aims and Objectives',
          body: [
            `The primary aim of this project is to design, implement, and evaluate a multi-module AI-powered cybersecurity intelligence platform that makes professional-grade threat detection and advisory capability accessible to non-expert users, while maintaining explicit, verifiable boundaries around what each module's output actually represents.`,
            `The specific objectives are:`,
            `(i) To review the relevant academic literature on deepfake and voice-clone detection, IoT vulnerability assessment, credential breach checking, phishing URL detection, AI-generated text detection, large language models in cybersecurity, and misinformation identification, establishing the theoretical foundation and research gap that motivates this work.`,
            `(ii) To design and implement EYES, a deepfake and synthetic-media detection module for images, video, and audio, and a parallel Voice Intelligence module and Text AI-Detection module addressing the same underlying problem in the audio and text domains respectively.`,
            `(iii) To design and implement NOSE, an IoT risk-triage module that accepts natural-language descriptions of network environments and returns a prioritised, per-device remediation plan, with an explicit, documented understanding of the boundary between LLM-generated vulnerability references and a verified CVE database lookup.`,
            `(iv) To design and implement a Breach Detection module that checks user-supplied passwords, emails, and phone numbers against real external breach-data sources where such a source exists, and returns an explicit unavailable state rather than a fabricated result where it does not.`,
            `(v) To design and implement a Scam Link Analyzer that scores submitted URLs for phishing and malware indicators, and a NEWS module combining a live cyber-news feed, a credibility verifier, and a conversational per-article intelligence assistant.`,
            `(vi) To design and implement DAYE, a single context-aware AI security analyst persona invoked across every module with a purpose-built prompt for the specific result being explained, backed by a dual-provider large language model strategy for availability.`,
            `(vii) To implement a companion Chrome browser extension that extends DOBERMAN's detection capabilities contextually to any webpage.`,
            `(viii) To verify the system's security architecture (authentication, row-level data isolation, server-side secret handling, and rate limiting) through direct inspection of the deployed configuration, and to conduct a full functional walkthrough of every module's interface, documenting honestly what this walkthrough does and does not establish about real-world detection accuracy.`,
          ],
        },
        {
          id: '1-4',
          heading: '1.4 Scope and Delimitations',
          body: [
            `DOBERMAN is scoped as a web-based platform targeting individual users and small teams seeking accessible cybersecurity intelligence. The system operates on user-submitted media, text, and descriptions; it does not perform active network scanning, packet capture, or any form of intrusive penetration testing.`,
            `The synthetic-media modules (EYES, Voice Intelligence, Text AI-Detection) are limited to files up to 50MB and the formats supported by their respective detection providers, and their verdicts are probabilistic classifications, not forensic certainty. NOSE operates on a user-described environment rather than direct network access, so report quality depends on the accuracy and completeness of the user's description, and its CVE references are generated by a large language model instructed to cite real identifiers where possible; this report is explicit that, in the current implementation, these references are not cross-checked against a live CVE or NVD database before being returned to the user, and treats this as a documented limitation rather than a verified capability. Breach Detection depends on the availability of a live HIBP API key for the email-lookup path; when that key is not configured, or for phone-number lookups for which no verified breach-data source is integrated, the system is designed to return an explicit "unavailable" result rather than fabricate one, and this report treats that behaviour as a scope boundary rather than a defect. NEWS assesses credibility based on linguistic and structural indicators reasoned over by a large language model rather than real-time fact-database lookups against a structured knowledge graph.`,
            `The platform operates within the usage constraints of the free or evaluation tiers of the Anthropic, Google Gemini, Hive AI, and HIBP APIs, which impose per-account daily limits on several modules (three scans per day for EYES, NOSE, NEWS verification, and Breach Detection at the time of writing). This constraint is directly relevant to Chapter 4: it materially limits how large a same-day, single-account empirical sample can be, and is one of the reasons this report separates a code-level and interface-level review (performed for this document) from a dataset-scale accuracy evaluation (specified as required future work). Mobile-native applications are out of scope for this iteration.`,
          ],
        },
        {
          id: '1-5',
          heading: '1.5 Significance of Study',
          body: [
            `This project makes several notable contributions to both academic knowledge and practical cybersecurity capability.`,
            `From a technical standpoint, DOBERMAN demonstrates an architecture for orchestrating multiple, heterogeneous third-party AI and security APIs (a computer vision provider, two large language model providers, and a breach-intelligence provider) behind a single, security-focused platform, with all provider calls isolated to a server-side edge function tier so that credentials are never exposed to the client. The DAYE persona layer, which selects a distinct, purpose-built prompt template per module and per result type rather than exposing a single generic chatbot, is a reusable pattern for building explainable, context-aware LLM user experiences on top of independently-developed detection services. The dual-provider fallback strategy (Claude as primary, Gemini as automatic fallback), added after the initial single-provider design was identified during development as a resilience risk, is likewise a reusable pattern for LLM-dependent applications operating on metered third-party quotas.`,
            `From a research-methodology standpoint, this report treats the honest documentation of what was and was not empirically validated as a contribution in its own right. The system already contains, by design, code paths that explicitly decline to fabricate a result when live data is unavailable (Section 3.6); this report extends that same discipline to its own claims, distinguishing throughout between what was directly verified through architecture and interface review and what would require a dedicated evaluation programme to establish.`,
            `From a social standpoint, this project directly addresses the democratisation of cybersecurity. The consistent theme across all modules is accessibility: results are explained in plain language by DAYE, interfaces are designed for non-experts, and the system is available on a free tier with no credit card required. In an era when digital threats are growing faster than digital literacy, tools that bridge this gap, honestly, carry genuine public value.`,
          ],
        },
        {
          id: '1-6',
          heading: '1.6 Report Organisation',
          body: [
            `The remainder of this report is organised across four further chapters. Chapter 2 reviews the relevant literature covering synthetic media and voice-clone detection, IoT security, credential breach checking, phishing URL detection, AI-generated text detection, AI in cybersecurity, and misinformation detection, identifying the research gap that motivates this project. Chapter 3 describes the methodology, covering system analysis, design decisions, and implementation of every module, including DAYE and the dual-provider LLM strategy. Chapter 4 presents the results of the architecture and security review and the full interface walkthrough conducted for this report, states plainly what these do and do not establish, and specifies the evaluation programme required for defensible accuracy claims. Chapter 5 concludes the report with a summary of contributions, identified limitations, and recommendations for future work.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // CHAPTER 2: LITERATURE REVIEW
    // ─────────────────────────────────────────────────────
    {
      number: '2',
      title: 'Literature Review',
      sections: [
        {
          id: '2-1',
          heading: '2.1 Overview',
          body: [
            `This chapter examines published research across the threat domains addressed by the DOBERMAN platform. The aim is not to reproduce exhaustive surveys but to identify the specific methodological contributions and unresolved challenges that shaped the design decisions made in this project. The review focuses primarily on literature published between 2022 and 2026 to ensure relevance to the current state of technology, with earlier foundational works included where necessary for context. Every source cited in this chapter was checked against its publisher or a preprint archive before inclusion; sources that could not be verified were excluded rather than retained for convenience.`,
          ],
        },
        {
          id: '2-2',
          heading: '2.2 The Deepfake Threat and Detection Methods',
          body: [
            `The term "deepfake" was coined in 2017, when a Reddit user began publishing face-swapped videos created using deep learning models [5]. Since then, the technology has advanced with remarkable speed. Early deepfakes were detectable to the trained eye; modern outputs from state-of-the-art diffusion models are frequently indistinguishable from authentic media even under careful scrutiny [6].`,
            `The technical architecture underlying deepfake generation has evolved through several generations. First-generation systems relied primarily on autoencoders. Second-generation systems introduced Generative Adversarial Networks (GANs), specifically architectures such as FaceSwap-GAN and DeepFaceLab, which achieved far higher visual fidelity through adversarial training [7][8]. Understanding the generation pipeline is directly relevant to detection: each synthesis method leaves a characteristic class of artefacts that trained classifiers can exploit. Zia et al. (2024) demonstrated this with an improved GAN-based synthetic media framework tested on the Flickr-Faces Nvidia and FakeFaces datasets, achieving 98.82 per cent detection accuracy and an F1-score of 0.99, while also illustrating how closely the generation and detection research communities are coupled [30].`,
            `Detection has struggled to keep pace with generation. Traditional forensic approaches, such as analysing compression artefacts and unnatural eye-blinking patterns, have been consistently defeated by newer generative models. Machine learning approaches have shown considerably more promise. Ashok and Joy (2023) evaluated the XceptionNet architecture on a combined real/deepfake dataset, demonstrating that its depthwise separable convolution design captured subtle facial boundary anomalies that standard ResNet models missed, and provided strong generalisation to unseen manipulation types [31].`,
            `Naskar et al. (2024) extended this line of work with a deep feature stacking and meta-learning strategy, combining features extracted from multiple backbone networks before passing them to a meta-classifier. Published in Heliyon, their approach outperformed any single backbone in cross-dataset conditions, which is the hardest test for generalisation [6]. The authors noted a well-documented limitation shared by all CNN-based detectors: performance degrades on content that has been re-encoded or compressed after synthesis, as this removes the high-frequency artefacts that detectors typically rely on. This limitation is directly relevant to DOBERMAN's EYES module, which relies on a third-party detection provider (Hive AI) rather than a locally trained classifier, and is discussed as an inherited constraint in Chapter 4.`,
            `Multi-modal detection is an emerging response to this generalisation challenge. Kumar and Kundu (2024), in their SecureVision framework published in Sensors, combined a Vision Transformer for video frame analysis with SpecRNet for audio authentication, demonstrating that treating visual and audio forensics as complementary parallel pipelines improved robustness under compression [32]. This finding is reflected in DOBERMAN's architecture, which maintains EYES (image/video) and Voice Intelligence (audio) as separate, purpose-specific modules rather than a single fused pipeline.`,
          ],
        },
        {
          id: '2-3',
          heading: '2.3 Voice Cloning and Synthetic Audio Detection',
          body: [
            `Voice cloning has followed a similar trajectory to visual deepfakes: text-to-speech and few-shot voice conversion systems now require only a small sample of a target voice to produce convincing synthetic speech, which has been directly implicated in "grandparent scam" and executive-impersonation fraud. Detection research has pursued several complementary signal families. Spectrogram-based approaches feed visual representations of audio into convolutional classifiers, exploiting the same intuition that motivates image-based deepfake detection [40]. A separate and more recent line of work has investigated prosodic and temporal features rather than spectral artefacts: Kulangareth, Kaufman, Oreskovic, and Fossat (2024), publishing in JMIR Biomedical Engineering, developed and validated an algorithm that distinguishes cloned from authentic speech using speech pause patterns, on the reasoning that synthetic speech generation systems tend to reproduce unnatural pause and breath timing that human speakers do not [41].`,
            `This literature directly informed the design of DOBERMAN's Voice Intelligence module and, in particular, the DAYE prompt template used to explain a voice result (Section 3.6), which surfaces named clone indicators (for example, pitch stability across sentence boundaries and the absence of breath sounds between phrases) rather than a bare probability, consistent with the finding across this literature that no single acoustic signal family is by itself a reliable universal anti-spoofing test, and that explaining the contributing signals is more defensible than presenting an unqualified verdict.`,
          ],
        },
        {
          id: '2-4',
          heading: '2.4 AI-Generated Text Detection',
          body: [
            `As large language models have become capable of producing fluent, structurally coherent prose at scale, a parallel detection literature has emerged addressing the question of whether a given passage of text was authored by a person. Stylometric approaches, which characterise a text by measurable properties of its sentence structure and word choice rather than its semantic content, have shown that AI-generated text tends toward greater uniformity in sentence length and phrasing than human writing, which is comparatively "bursty" and individually variable. Chen, Xiong, He, and Ross (2026), publishing in Digital Scholarship in the Humanities, introduced a large paired dataset of human- and AI-authored essays across 110 subject areas and evaluated established stylometric classifiers against it, finding that AI-generated text consistently exhibits measurable stylistic uniformity relative to the individual variability found in human writing, while also cautioning that essay length, training data size, and topic strongly influence classifier reliability [42].`,
            `This finding shaped two decisions in DOBERMAN's Text AI-Detection module: first, a minimum word-count threshold before analysis is offered, since short passages provide too little stylometric signal for a defensible verdict; and second, the decision to present named signals (for example, uniform sentence length and generic transitional phrasing) rather than a bare score, and to have DAYE explicitly caveat the result as probabilistic evidence rather than a standalone determination, reflecting this literature's consistent finding that no current text-detection approach is reliable enough to be used as sole evidence in a consequential decision.`,
          ],
        },
        {
          id: '2-5',
          heading: '2.5 IoT Security Challenges and Vulnerability Assessment',
          body: [
            `The Internet of Things has transformed the home and workplace into a distributed computing environment. A typical modern household contains 20 to 30 connected devices; enterprise environments can have thousands [15]. Three structural vulnerabilities characterise the IoT security landscape: weak or default credentials, infrequent firmware patching, and insufficient network segmentation [16][17][18].`,
            `Recent academic work has addressed the attack-detection side of this problem with deep learning models operating on live network traffic. Ding, Abdel-Basset and Mohamed (2023), in their DeepAK-IoT paper published in Information Sciences, proposed a model combining a residual-based spatial representation block, a temporal representation block, and a detection block to identify cyberattack patterns in IoT network traffic [33]. Their system outperformed three contemporary baselines on standard IoT attack datasets, and the architectural separation of spatial and temporal features reflects the dual nature of IoT traffic: device-specific behaviour appears in per-packet features while attack signatures emerge over time.`,
            `For the DOBERMAN NOSE module, however, active traffic analysis was not a feasible approach. Web applications cannot perform packet capture on a user's network without native code execution. The design alternative adopted in this project, natural-language description of the network environment combined with an LLM prompted to reason over known device classes and vulnerability patterns, aligns with passive assessment methods that provide actionable vulnerability intelligence without requiring any network access. The Common Vulnerabilities and Exposures (CVE) system, maintained by MITRE and scored using the CVSS framework, and the NIST National Vulnerability Database (NVD), provide the authoritative structured repository against which such passive assessments would ideally be verified [19]. This report is explicit, in Chapters 3 and 4, that the current NOSE implementation prompts the LLM to reference CVE identifiers rather than querying the NVD API directly, and treats closing that gap as priority future work rather than a completed capability.`,
          ],
        },
        {
          id: '2-6',
          heading: '2.6 Credential Breach Checking and Password Security',
          body: [
            `Password reuse across services means that a breach at one, unrelated service can enable credential-stuffing attacks against a user's accounts elsewhere. Industry practice has converged on proactively checking credentials against known-breach corpora, most visibly through Have I Been Pwned (HIBP) and its Pwned Passwords API, and through comparable services such as Google Password Checkup. Because naively sending a plaintext password to a third party for checking would itself be a serious security and privacy failure, these services are built around a k-anonymity protocol: the client hashes the password locally, sends only the first five characters of the hash, and receives back every stored hash suffix sharing that prefix, performing the final comparison locally so the full password or its complete hash never leaves the client [37].`,
            `Li, Pal, Ali, Sullivan, Chatterjee, and Ristenpart (2019), publishing at the ACM SIGSAC Conference on Computer and Communications Security (CCS), provided the first formal analysis of this class of protocol, which they term compromised-credential-checking (C3) services. Their analysis is notable for identifying a genuine leakage risk in the naive k-anonymity design: an attacker able to observe hash-prefix query patterns can, under some threat models, gain a measurable advantage in offline guessing attacks, and the paper proposes refined protocol variants that reduce this leakage [37]. This literature directly informed the implementation of DOBERMAN's Breach Detection module (Section 3.6), which follows the standard k-anonymity pattern for password checking (SHA-1 hash, five-character prefix sent, suffix matching performed against the returned range) rather than transmitting password material, while this report also notes the Li et al. finding as a caveat on the protocol's residual leakage properties rather than treating k-anonymity checking as a fully solved problem.`,
          ],
        },
        {
          id: '2-7',
          heading: '2.7 Phishing and Malicious URL Detection',
          body: [
            `Phishing domains that impersonate legitimate brands, often through lookalike spelling or abuse of low-cost top-level domains, remain one of the most common initial-access vectors for credential theft and fraud. Machine learning approaches to classifying URLs as benign or malicious from lexical features (domain length, character substitution patterns, presence of brand names outside the registrable domain), domain metadata, and page content have matured into a well-established applied research area. Alnemari and Alshammari (2023), publishing in Applied Sciences, compared artificial neural network, support vector machine, decision tree, and random forest classifiers for phishing domain detection, finding that ensemble tree-based methods offered the strongest balance of accuracy and reliability across their evaluation [38].`,
            `This literature motivated the heuristic and indicator-based design of DOBERMAN's Scam Link Analyzer, which surfaces the specific lexical and domain-level indicators that contributed to a risk score (lookalike brand misspelling, high-abuse top-level domains, URL paths mimicking a legitimate verification flow) rather than a bare classification, consistent with the accessibility-first design principle applied across the platform: a score without a reason is not actionable for a non-specialist user.`,
          ],
        },
        {
          id: '2-8',
          heading: '2.8 Artificial Intelligence in Cybersecurity',
          body: [
            `The application of large language models to cybersecurity tasks represents one of the most rapidly evolving areas in the field. Gupta et al. (2023), in a widely cited IEEE Access paper, provided a systematic examination of the defensive and offensive implications of generative AI models including ChatGPT. On the defensive side, they identified threat intelligence summarisation, vulnerability explanation, and security awareness training as immediate applications. On the offensive side, they documented LLMs generating phishing copy, malware variants, and social engineering scripts, concluding that the dual-use nature of these systems demands proactive monitoring [34].`,
            `Ferrag et al. (2024), also in IEEE Access, approached the problem from a different angle, implementing a privacy-preserving BERT-based model specifically optimised for IoT and IIoT device security monitoring. Their lightweight on-device classifier was designed to flag anomalous traffic patterns without offloading to cloud endpoints, addressing a real constraint given that many IoT devices have limited compute budgets [35]. While DOBERMAN's DAYE persona operates as a cloud-hosted assistant rather than an on-device classifier, the privacy considerations raised by Ferrag et al. informed the decision to avoid logging user query content beyond the minimum required for session management and daily-limit enforcement.`,
            `The broader literature on LLMs in cybersecurity consistently identifies plain-language explanation as a key value proposition, and consistently identifies hallucination, a model producing a fluent but factually ungrounded answer, as the central risk of deploying LLMs in a decision-support role. Security advisories, CVE descriptions, and vulnerability reports are notoriously difficult for non-specialists to interpret, and a conversational interface that translates a raw signal into a concrete, personalised action plan addresses a real usability gap; but that same interface can just as fluently present an invented CVE identifier or an invented breach record as though it were verified fact. This tension between explanatory value and hallucination risk is treated in this report not as an abstract concern but as a specific, evaluable property of each DOBERMAN module, examined directly in Chapter 4.`,
          ],
        },
        {
          id: '2-9',
          heading: '2.9 News Verification and Misinformation Detection',
          body: [
            `The challenge of automated news verification is fundamentally a problem of semantics, source quality, and linguistic pattern recognition. Research has identified several reliable surface-level indicators of misinformation: emotionally charged language, vague attribution, absence of primary sources, internally inconsistent claims, and appeals to urgency [24].`,
            `Classical approaches to automated fact-checking relied on knowledge graph comparison. While effective for simple factual claims, this approach fails on opinion-based or structurally complex misinformation [25]. Neural approaches using transformer architectures fine-tuned on misinformation datasets such as FakeNewsNet [26] and LIAR [27] have shown improved performance. Al-alshaqi, Rawat and Liu (2024) pushed this further with an ensemble framework published in Sensors that combined BERT for text analysis with a modified CNN for visual content, achieving high accuracy on multi-modal misinformation datasets [36]. Their finding that cross-modal signals substantially improve detection over text-only methods directly informed the design of the DOBERMAN NEWS module, which was architected to support image-level analysis as a future extension without requiring redesign of the core pipeline.`,
            `A recurring challenge the literature identifies is dataset recency: models trained on, or reasoning from, misinformation corpora from 2019 or 2020 encounter significant distribution shift when deployed against content generated by large language models in 2025 or 2026. Al-alshaqi et al. (2024) recommended that production systems incorporate continuous dataset refresh mechanisms or retrieval-augmented generation to maintain classification accuracy as the misinformation landscape evolves [36].`,
          ],
        },
        {
          id: '2-10',
          heading: '2.10 Review of Existing Systems and Research Gap',
          body: [
            `A survey of existing tools reveals a fragmented landscape. In deepfake detection, Deepware Scanner and Sensity AI offer media analysis but focus primarily on video and return minimal explanatory context. In voice-clone and AI-text detection, most consumer-facing tools address only one modality. In IoT security, Shodan and Nessus offer powerful capabilities but require substantial technical expertise and, in many cases, direct network access. In credential breach checking, Have I Been Pwned itself is the de facto standard but is a single-purpose lookup tool, not integrated with a user's broader threat picture. In AI security consulting, general-purpose LLM chatbots can answer cybersecurity questions but lack domain specialisation and integration with a user's own detection results. In news verification, tools such as NewsGuard and Snopes provide human-curated ratings but cannot evaluate arbitrary user-submitted content in real time.`,
            `The literature reviewed in this chapter reveals a consistent pattern: strong individual results in deepfake and voice-clone detection, AI-text detection, IoT security, credential breach checking, phishing detection, LLM-based analysis, and misinformation verification exist in isolation, but no published work demonstrates integration of all of these capabilities into a single accessible consumer platform, and the literature on LLM-based security assistants consistently flags hallucination risk without, in most cases, demonstrating a concrete engineering pattern for mitigating it at the product level. DOBERMAN addresses the first gap directly, by providing a working implementation spanning nine capability areas behind one authenticated experience, and offers a partial, concrete answer to the second: several of its modules (Breach Detection's explicit "unavailable" state, the Cyber Globe prompt's explicit instruction against fabricating statistics) demonstrate one practical pattern for constraining hallucination risk in a deployed system, discussed in full in Chapters 3 and 4.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // CHAPTER 3: METHODOLOGY
    // ─────────────────────────────────────────────────────
    {
      number: '3',
      title: 'Methodology',
      sections: [
        {
          id: '3-1',
          heading: '3.1 Development Approach',
          body: [
            `DOBERMAN was developed using an Agile iterative methodology, organised into short sprints. This choice was motivated by the inherent uncertainty of integrating multiple third-party AI and security APIs; the behaviour of model outputs and provider responses is not fully predictable from documentation alone, and iterative cycles allowed for rapid adjustment of prompts, data structures, and UI components in response to observed behaviour.`,
            `The project's own version history illustrates this iterative process directly. The system began as a four-module prototype (EYES, NOSE, BRAIN, NEWS) built against Anthropic Claude as the sole reasoning provider. During development, reliance on a single LLM provider was identified as an availability risk, given that the free and evaluation tiers used during development are subject to rate limits and occasional outages; a Google Gemini fallback path was subsequently added to every reasoning-dependent edge function, so that a failed or rate-limited Claude call is retried against Gemini before the request fails outright. Separately, an early version of the breach-checking logic was found during review to return placeholder or inferred breach data when the live HIBP key was not configured; this was identified as a fabrication risk and corrected so that the function instead returns an explicit "unavailable" result, a fix reflected directly in this project's commit history. Both changes are treated in this report as evidence of the iterative methodology functioning as intended, catching and correcting a resilience gap and a hallucination risk respectively during development rather than at final submission.`,
          ],
        },
        {
          id: '3-2',
          heading: '3.2 Requirements Analysis',
          body: [
            `Requirements were elicited through a combination of domain research (the literature review informing understanding of technical constraints), competitive analysis (surveying existing tools as described in Section 2.10), and scenario modelling (defining representative user journeys for each module).`,
            `Key functional requirements included: (FR1) user registration and authentication via email and password; (FR2) EYES module accepting image, video, and audio uploads and returning a deepfake probability score and verdict; (FR3) a Voice Intelligence module screening audio for clone and manipulation indicators; (FR4) a Text AI-Detection module screening written passages for AI-generation signals; (FR5) NOSE module accepting natural-language network descriptions and returning per-device risk scores and remediation steps; (FR6) a Breach Detection module checking passwords, emails, and phone numbers against real breach-data sources where available; (FR7) a Scam Link Analyzer scoring submitted URLs for phishing indicators; (FR8) a NEWS module combining a live cyber-news feed, a credibility verifier, and a per-article conversational assistant; (FR9) DAYE, a persistent, context-aware AI security analyst persona reachable from every module; (FR10) a Chrome extension enabling right-click contextual detection on any webpage; (FR11) all scan and conversation history persisted per user account.`,
            `Key non-functional requirements included: response times under 15 seconds for standard inputs, accessibility to non-specialist users, HTTPS enforcement, data isolation through row-level security, server-side enforcement of per-module usage limits that cannot be bypassed from the client, and deployability on a free-tier infrastructure stack.`,
          ],
        },
        {
          id: '3-3',
          heading: '3.3 System Architecture',
          body: [
            `DOBERMAN follows a three-tier architecture: a client-side React single-page application, a serverless backend implemented as Supabase Edge Functions (eighteen functions at the time of writing), and a data tier consisting of Supabase's managed PostgreSQL instance with row-level security policies. External AI and security services (Anthropic Claude, Google Gemini, Hive AI, and Have I Been Pwned) are called exclusively from the edge function tier, ensuring provider credentials never reach the client; this was verified for this report by inspecting the compiled production client bundle and confirming the absence of any provider API key.`,
            `This architecture was chosen for three reasons. First, security: by proxying all external API calls through edge functions, sensitive credentials are never exposed in client-side code. Second, control: daily usage limits, authentication verification, and data persistence all happen server-side, where they were verified during this review to be enforced against a server-side usage_logs table rather than any client-supplied state, and so cannot be circumvented by client-side manipulation. Third, scalability: Supabase Edge Functions scale automatically, meaning the platform handles variable load without manual infrastructure management.`,
            `A cross-cutting addition to this architecture, introduced after the initial four-module design, is the DAYE assistant function, which does not belong to any single module but is instead called by every module to generate a context-specific explanatory message. Rather than exposing one generic chatbot endpoint, the DAYE function selects between more than a dozen purpose-built prompt templates keyed by a context_type parameter (for example, deepfake_result, voice_result, breach_result, scam_link_result, news_verify_result, globe_country, and idle_tip), each of which is constructed to reference the specific fields already computed by the calling module rather than asking the model to re-derive a verdict from scratch. This pattern, an explanatory layer that consumes another system's structured output rather than an autonomous decision-maker, is the architectural centrepiece of this project and is examined further in Section 3.6 and Chapter 5.`,
          ],
        },
        {
          id: '3-4',
          heading: '3.4 Technology Selection and Justification',
          body: [
            `React 19 with TypeScript was selected as the frontend framework. React's component model aligns with DOBERMAN's modular architecture, allowing each intelligence module to be developed as a largely independent feature area. TypeScript provides type-safe interface definitions for AI API responses and type-safe routing, a level of correctness assurance that would be impossible with plain JavaScript at this scale.`,
            `Supabase was selected over alternatives such as Firebase and a custom Express/PostgreSQL backend for its integrated offering: PostgreSQL with row-level security, built-in authentication, edge functions running on Deno, and a storage system, all accessible through a single SDK. For a project of this scope developed by a single developer, this consolidation was decisive.`,
            `Anthropic Claude Sonnet was selected as the primary LLM for its strong instruction-following behaviour, structured output reliability, and transparent safety profile relevant to security-adjacent content. Google's Gemini Flash-Lite was subsequently added as an automatic fallback provider across every reasoning-dependent function, selected for its low latency and generous free-tier quota relative to Claude, providing a second, independent path to a response when the primary provider is rate-limited or unavailable rather than leaving the user with a hard failure. Hive AI was selected for deepfake detection because it is one of the few production-ready APIs offering deepfake-specific ensemble models with support for images, video frames, and audio. Have I Been Pwned was selected for breach checking because it is the de facto standard service in this space and because its Pwned Passwords endpoint natively supports the k-anonymity protocol described in Section 2.6, allowing password checking without ever transmitting the password itself to a third party.`,
          ],
        },
        {
          id: '3-5',
          heading: '3.5 Database Design',
          body: [
            `The DOBERMAN schema, reviewed directly against the live Supabase project for this report, groups into four functional areas. The identity tier consists of the profiles table, which extends Supabase Auth's built-in users table with application-specific metadata (name, avatar, plan tier, scan credits); a PostgreSQL trigger automatically creates a profile record whenever a new user registers. The per-module result tier consists of one table per detection module (eyes_scans, nose_scans, voice_scans, text_scans, breach_scans, scam_link_checks, news_checks, and a cached globe_country_briefs table with a time-to-live field used to avoid re-generating an LLM briefing for the same country within a rolling 24-hour window), each storing the structured result together with the raw provider response where applicable for audit purposes. The conversational tier consists of brain_conversations and news_conversations, both storing message history as JSONB arrays so that DAYE and the per-article news assistant can maintain multi-turn context. The audit tier consists of a single usage_logs table, which every rate-limited edge function writes to and queries against, and which this report verified is the sole basis for daily-limit enforcement (Section 4.6).`,
            `Row-level security was verified, via direct inspection of the Supabase project's table configuration for this report, to be enabled on every table in the schema. Insert operations on result tables are restricted to the service role used exclusively by edge functions, while select operations are restricted to the owning user (auth.uid() = user_id), which was confirmed in the applied policy definitions. A small number of tables in the schema (for example, a generic scans and conversations pairing that predates the module-specific tables, and a cached_news_articles table) were observed during this review to hold zero rows at the time of writing; this report records that observation rather than assuming these tables are active, and recommends they be either wired into an active code path or removed as part of a schema cleanup, noted in Section 5.5.`,
          ],
        },
        {
          id: '3-6',
          heading: '3.6 Module Implementation',
          body: [
            `Every module described here was verified against the actual deployed edge function source retrieved from the live Supabase project for this report, not against design intent alone.`,
            `EYES (eyes-analyze) accepts a file URL, checks the caller's daily usage against usage_logs, calls the Hive AI moderation API for the underlying deepfake classification, and then calls Claude (with a Gemini fallback) to translate the raw classification into a two-to-three sentence plain-language explanation, before persisting the combined result, including the raw provider response, and returning it to the client.`,
            `NOSE (nose-analyze) accepts a natural-language network description and an optional device list, and constructs a prompt instructing the LLM to behave as an IoT security auditor, assign a per-device risk score, reference known real vulnerabilities with CVE identifiers where possible, and return a prioritised action plan in a strict JSON schema, which is parsed with a regular-expression fallback if the response is wrapped in markdown. This report is explicit that the CVE identifiers returned by this function are generated by the language model from its training knowledge and are not cross-checked against the NVD or any other CVE database within the current implementation; this is discussed as a specific, named limitation in Chapter 4 rather than described as a verification capability.`,
            `Voice Intelligence (voice-analyze) screens an uploaded audio file and returns a manipulation probability, an emotional-manipulation score, named clone indicators, and a composite trust score, which DAYE's voice_result prompt template is specifically constructed to interpret jointly (for example, distinguishing a high emotional-manipulation score paired with low manipulation probability, a different threat pattern, from the reverse) rather than simply restating.`,
            `Text AI-Detection (text-analyze) applies a minimum word-count gate before returning an AI-generation probability, a verdict, and named linguistic signals (for example, uniform sentence length and generic transitional phrasing), consistent with the stylometric literature reviewed in Section 2.4.`,
            `BRAIN, now presented in the product as DAYE's general Intelligence Chat surface, maintains conversation history in Supabase and passes each updated message array to Claude (with Gemini fallback) alongside a persistent security-analyst system prompt, returning a reply and persisting the full conversation.`,
            `NEWS is implemented as three related but distinct functions: news-feed retrieves and caches a live cyber-security news feed; news-verify accepts an arbitrary claim, headline, or article excerpt and instructs the LLM to evaluate it against journalistic credibility criteria (emotional-manipulation language, missing sources, contradictions with known facts, sensationalist framing), returning a structured credibility score, verdict, red flags, and positive signals; and news-intelligence provides a conversational assistant scoped to a specific article, maintaining a separate per-article conversation history in news_conversations.`,
            `Breach Detection (breach-check) is the module most directly shaped by the anti-fabrication discipline this report treats as a genuine contribution. For a password lookup, the function hashes the password with SHA-1 locally within the edge function, sends only the five-character hash prefix to the Have I Been Pwned Pwned Passwords range endpoint with a header requesting padded responses, and matches the returned suffix list locally, following the k-anonymity protocol described in Section 2.6, so that the full password is never transmitted externally. For an email lookup, the function calls the HIBP breach-account API when a live API key is configured in the deployment environment; when it is not configured, the function returns an explicit unavailable: true result together with a message stating plainly that live email breach checking could not run against real data, rather than returning an inferred or placeholder result. Phone-number lookups are handled identically: the function returns an explicit unavailable state because, at the time of writing, no verified breach-data source is integrated for this lookup type. This behaviour was directly verified against the deployed function source for this report.`,
            `The Scam Link Analyzer (scam-link-analyze) accepts a submitted URL, extracts lexical and domain-level indicators consistent with the phishing-detection literature reviewed in Section 2.7 (lookalike brand misspelling, high-abuse top-level domains, verification-flow path mimicry), and calls the LLM to produce a risk score, a verdict, and a named threat-type classification.`,
            `Cyber Globe (globe-country-brief) accepts a country code and name, checks a 24-hour cache in globe_country_briefs before generating a new briefing, and, when generating fresh, issues a prompt that explicitly instructs the model to keep the briefing accurate and general rather than inventing specific statistics for lower-profile countries, then validates that the returned JSON matches the expected shape before caching and returning it, falling back to an explicit "live analysis unavailable" response if generation or validation fails. This explicit anti-fabrication instruction, verified directly in the deployed prompt text, is treated in this report as a second concrete example of the same design discipline demonstrated in the Breach Detection module.`,
            `DAYE (daye-assistant) is the cross-cutting persona described in Section 3.3. Its prompt-selection function (buildPrompt) branches on a context_type field and constructs a request that always references the specific structured fields already computed by the calling module (for example, for a deepfake_result it references the verdict, confidence score, named detector signals, C2PA content-credential status, and model attribution together, and instructs the model to interpret which signals actually drove the verdict rather than restating the headline number), with each prompt explicitly instructing the model to say plainly when the available evidence is thin rather than inventing supporting detail. The function calls Claude first and falls back to Gemini only if the Claude call fails, consistent with the resilience pattern described in Section 3.1.`,
            `The Chrome extension (Manifest V3) registers a context menu item on images across all webpages. When activated, a content script injects a floating result panel into the current page and calls the DOBERMAN detection API with the image URL, displaying results without requiring the user to navigate away. Authentication tokens are shared between the extension and the web application through browser storage, ensuring usage limits are consistently tracked.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // CHAPTER 4: RESULTS AND DISCUSSION
    // ─────────────────────────────────────────────────────
    {
      number: '4',
      title: 'Results and Discussion',
      sections: [
        {
          id: '4-1',
          heading: '4.1 Testing Strategy and an Explicit Statement of Evidence',
          body: [
            `This chapter is written under one governing rule: no claim in it is presented as stronger than the evidence actually available to support it. Three, and only three, forms of evidence were available for this report, and each is used only for what it can actually establish.`,
            `The first is direct source-code and configuration review. Every edge function described in Chapter 3 was retrieved from the live, deployed Supabase project and read in full for this report, which is how this report is able to make specific, falsifiable statements (for example, that NOSE does not query the NVD API, or that Breach Detection returns an explicit unavailable state rather than a placeholder). The second is direct inspection of the live database and security configuration, described in Section 4.6, which establishes facts about the deployed system's configuration (row-level security status, table structure, table row counts) rather than about detection accuracy. The third is a full, systematic interface walkthrough of every module, conducted for this report against the real DOBERMAN frontend, driven by realistic, representative simulated responses rather than live provider calls, and documented with screenshots reproduced in Appendix C.`,
            `The reason live end-to-end testing against production, with real Anthropic, Hive, Gemini, and HIBP calls, was not performed for this document is stated here directly rather than left implicit: the reporting environment used to prepare this document could not reach the production Supabase project or third-party provider APIs over the network, and, independently of that constraint, several of the modules under test (EYES, NOSE, NEWS verification, and Breach Detection) are limited by the deployed system itself to three uses per account per day, which would make a same-day, single-account empirical sample of any meaningful size impossible even with network access. Both constraints are reported plainly rather than worked around by inventing results, consistent with the standard this report holds the DOBERMAN system itself to.`,
            `Concretely, this means the following sections report what the interface walkthrough demonstrated (that each module's UI, request construction, response handling, loading and error states, and history views function correctly end to end against a well-formed response) and do not report a detection accuracy percentage, a false-positive rate, or a sample-size-based claim for any module, because no such claim was measured. Section 4.9 specifies precisely the evaluation programme that would need to be executed, and by whom, to produce those numbers defensibly, and until that programme is executed, this report treats their absence as a stated limitation rather than a gap to be papered over.`,
          ],
        },
        {
          id: '4-2',
          heading: '4.2 EYES and Voice Intelligence Walkthrough',
          body: [
            `The EYES interface was exercised end to end: a file was selected through the real upload control, uploaded through the actual Supabase Storage code path, and submitted to the eyes-analyze function. The result view correctly rendered a verdict, a trust score, a written analyst explanation, a per-signal detector breakdown (AI-generation probability and deepfake-specific probability shown separately), and an "Ask DAYE about this" affordance leading into the context-aware explanation described in Section 3.6; the scan history view correctly listed prior results with colour-coded verdicts. This confirms the module's request/response contract and UI states are implemented correctly; it does not, and is not presented as, evidence about the module's real-world detection accuracy, which is a property of the underlying Hive AI models rather than of DOBERMAN's own code.`,
            `The Voice Intelligence tab within the Deepfake Intelligence hub was exercised similarly. Because this report did not have access to a live audio-analysis provider call, the walkthrough validated the interface and the DAYE explanation path rather than a live classification. The literature reviewed in Section 2.3 is relevant here directly: the JMIR-published pause-pattern detection approach, and the broader finding that no single acoustic signal is a universal anti-spoofing test, both support this report's decision not to assert an accuracy figure for this module without a dedicated, labelled evaluation set.`,
          ],
        },
        {
          id: '4-3',
          heading: '4.3 NOSE Walkthrough and the CVE Reference Limitation',
          body: [
            `The NOSE interface correctly accepted a free-text network description with a quick-add device chooser, submitted it to nose-analyze, and rendered a per-device risk breakdown with a colour-coded overall risk score and a prioritised action plan, matching the response schema documented in Section 3.6.`,
            `One specific claim requires direct correction relative to earlier project documentation. A previous version of this report stated that a CVE reference returned by NOSE for a TP-Link router "matched publicly documented vulnerabilities in the NIST National Vulnerability Database... confirming that the LLM-to-CVE mapping approach produces verifiable, grounded results rather than hallucinated identifiers." Having read the deployed nose-analyze source directly for this report, that conclusion does not follow from the architecture: the function has no code path that queries the NVD, MITRE, or any other CVE database. CVE-2023-1389, the identifier referenced in that earlier claim, is in fact a real, well-documented, and widely reported vulnerability affecting the TP-Link Archer AX21, so a model correctly citing it for that device is plausible and consistent with that CVE's prevalence in public training data; but a single correct citation for a famous, heavily-documented device says nothing about reliability for a less common or unusual device, and the system currently has no mechanism to distinguish a correct citation from a plausible-sounding invented one. This report therefore withdraws the earlier claim and records the absence of live CVE verification as a named limitation of the current implementation, with a concrete remediation (server-side cross-referencing against the NVD or CIRCL CVE search APIs before a CVE identifier is returned to the user) specified as priority future work in Section 5.5.`,
          ],
        },
        {
          id: '4-4',
          heading: '4.4 DAYE, BRAIN, and Text AI-Detection Walkthrough',
          body: [
            `DAYE's general Intelligence Chat surface was exercised with a representative security question (a suspicious wire-transfer request) and correctly returned a structured, actionable response, persisted the conversation, and displayed it in the conversation history sidebar on return. The per-context prompt architecture described in Section 3.6 could not be exhaustively exercised for every context_type in this walkthrough given the scale of the module, but the page_enter, dashboard_load, and deepfake_result paths were confirmed to reach DAYE correctly and to render its response inline in the relevant module.`,
            `The Text AI-Detection tab was exercised with a deliberately generic, uniform passage of prose constructed to resemble unedited LLM output; the interface correctly gated the analysis behind the module's minimum word-count threshold, then rendered a verdict, an AI-generation probability, and named linguistic signals consistent with the design described in Section 3.6. As with Voice Intelligence, this walkthrough validates the interface, not a measured accuracy figure.`,
          ],
        },
        {
          id: '4-5',
          heading: '4.5 NEWS Walkthrough',
          body: [
            `The NEWS module's live-feed tab correctly rendered cached article cards with source, category, and recency metadata, and its source-filter controls functioned as expected. The verify tab was exercised with a deliberately sensationalist, unsourced claim and correctly returned a low credibility score, a "likely false" verdict, and named red flags (emotionally charged framing, absence of a named source), consistent with the misinformation-indicator literature reviewed in Section 2.9. As with the other modules, no accuracy or false-positive rate is reported here, because no labelled evaluation set of true and false claims was run through the live function for this document.`,
          ],
        },
        {
          id: '4-6',
          heading: '4.6 Security and Architecture Review',
          body: [
            `Unlike the module walkthroughs above, this section reports facts that were directly and independently verifiable through inspection of the live deployed system, rather than through simulated interaction, and are reported here with that distinction made explicit.`,
            `Row-level security was confirmed enabled on every table in the application schema through direct inspection of the live Supabase project's table configuration. Server-side secret isolation was confirmed by reading the source of every edge function and by inspecting the client bundle: every call to Anthropic, Google Gemini, Hive AI, and Have I Been Pwned originates from an edge function using a server-side environment variable, and no such key appears in client-side code. Server-side rate limiting was confirmed by reading the source of every daily-limited function (EYES, NOSE, NEWS verification, Breach Detection, and DAYE's underlying BRAIN chat), each of which independently queries usage_logs for the caller's count for the current day before proceeding, meaning the limit is enforced against server-recorded history rather than any value the client could supply or omit. The anti-fabrication behaviour of Breach Detection and Cyber Globe, described in Section 3.6, was likewise confirmed directly in the deployed source rather than inferred from documentation.`,
            `This report did not perform live penetration testing (for example, attempting to read another user's records with a manipulated request, or attempting to bypass a rate limit through concurrent requests) against the production system, for the same access-constraint reasons stated in Section 4.1. Executing that testing programme, safely, against a non-production branch of the database, is specified as required future work in Section 5.5.`,
          ],
        },
        {
          id: '4-7',
          heading: '4.7 Extension, Breach Detection, and Scam Link Walkthrough',
          body: [
            `Breach Detection was exercised for both the password and email lookup paths. The password path, driven by the k-anonymity flow described in Section 3.6, correctly rendered an occurrence count and a severity classification. The email path correctly rendered a breach count with named breach sources, dates, and exposed data categories. Because this report could not reach the live HIBP API, both results reflect the module's correct handling of a well-formed response rather than a live query; the module's own explicit unavailable-state design, verified directly in source (Section 3.6), is what this report relies on to state with confidence that an unreachable HIBP key produces an honest "unavailable" result in production rather than a silent fabrication, since that behaviour is present in the code path itself, not contingent on this walkthrough.`,
            `The Scam Link Analyzer, reached through DAYE's Scam Link Analyzer tab, was exercised with a constructed lookalike-brand URL and correctly returned a high risk score, a phishing verdict, and named indicators (brand misspelling, high-abuse top-level domain) consistent with the design described in Sections 2.7 and 3.6.`,
            `The Chrome extension's manifest and content-script structure were reviewed directly (Section 3.6) but could not be exercised end to end in this reporting environment, since doing so requires a loaded browser profile with the extension installed against a live authenticated session; this is recorded as an untested path rather than a validated one.`,
          ],
        },
        {
          id: '4-8',
          heading: '4.8 Discussion',
          body: [
            `The central, honest finding of this chapter is a genuine gap between two things that are easy to conflate: architectural discipline and empirical validation. On the first, the evidence gathered for this report is direct and specific: row-level security is enabled everywhere it should be, provider secrets never reach the client, rate limits are enforced server-side against an auditable log, and at least two modules (Breach Detection and Cyber Globe) contain deliberate, verified code paths that decline to fabricate a result rather than inventing one when live data is unavailable. These are not aspirational design goals; they were confirmed by reading the actual deployed source and configuration. On the second, this report is equally direct: no module's detection accuracy, false-positive rate, or sample-size-based claim is asserted anywhere in this document, because none was measured under the access constraints described in Section 4.1.`,
            `This gap is also where the earlier version of this report failed a standard it should have held itself to. The withdrawn CVE-verification claim in Section 4.3, and equivalent unsupported claims in the earlier Chapter 4 (specific participant counts, task-completion percentages, and sample sizes for EYES and NEWS testing that this revision found no supporting artefact for), were the kind of fluent, plausible, unverified assertions that Section 2.8 identifies as the central risk of LLM-adjacent systems, applied here to the report about the system rather than the system itself. Correcting them in this revision, rather than preserving them because they made the project sound stronger, is treated in this report as directly continuous with the same design principle the DOBERMAN codebase itself demonstrates in its breach-checking and country-briefing functions: a smaller, truthful result is worth more than a larger, unverifiable one.`,
            `The most practically significant finding that can be honestly drawn from the interface walkthrough is that DOBERMAN's accessibility-first design hypothesis, that explaining a verdict in plain, specific language is more valuable to a non-specialist user than the verdict alone, is at minimum implemented consistently across every module through the DAYE persona layer, and its per-context prompt design (Section 3.6) is structurally built to avoid the failure mode of merely restating a headline number. Whether that hypothesis holds with real users is, correctly, an empirical question this report does not claim to have answered, and Section 4.9 specifies how it should be.`,
          ],
        },
        {
          id: '4-9',
          heading: '4.9 Required Follow-Up Evaluation Programme',
          body: [
            `To move from the evidence presented in this chapter to defensible accuracy claims, the following evaluation programme is specified as the concrete next step, distinct from and in addition to the future-work items in Chapter 5 that extend the system's capability rather than validate its existing behaviour.`,
            `(i) NOSE CVE verification: implement the NVD or CIRCL cross-reference described in Section 4.3, then run a held-out set of at least twenty device descriptions of varying popularity (well-documented consumer devices through obscure or discontinued models) and record the proportion of returned CVE identifiers that resolve to a real, matching entry.`,
            `(ii) EYES and Voice Intelligence accuracy: assemble a labelled dataset of authentic and synthetic media (for example, drawing on FaceForensics++ [12] for video and a published voice-clone corpus for audio) of at least fifty items per modality, run each through the live functions across multiple accounts or multiple days to respect the platform's own rate limits, and report accuracy, false-positive rate, and false-negative rate with the dataset composition disclosed.`,
            `(iii) NEWS and Text AI-Detection accuracy: assemble a labelled set of true and false claims (drawing on an existing misinformation corpus such as LIAR [27] or FakeNewsNet [26]) and a labelled set of human- and AI-authored passages (following the paired-dataset methodology of Chen et al. [42]), and report the same accuracy metrics.`,
            `(iv) Structured user acceptance testing: recruit a genuine panel of participants representing the target non-specialist demographic, obtain informed consent, assign identical tasks across modules, and record completion rates, time-on-task, and qualitative feedback with an auditable transcript, rather than reporting participant counts or quotations without a retained record.`,
            `(v) Live security testing: repeat the review in Section 4.6 as active testing (attempted cross-user data access, rate-limit bypass attempts) against a non-production Supabase branch, so that the security claims in this report are backed by attempted exploitation rather than configuration review alone.`,
            `Executing this programme is beyond the access available for this report but is fully specified here so that it can be carried out, and its results incorporated, before any of the numbers it would produce are presented as established fact.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // CHAPTER 5: CONCLUSION, SUMMARY AND RECOMMENDATIONS
    // ─────────────────────────────────────────────────────
    {
      number: '5',
      title: 'Conclusion, Summary and Recommendations',
      sections: [
        {
          id: '5-1',
          heading: '5.1 Summary of Work Done',
          body: [
            `This project set out to design, implement, and evaluate an integrated cybersecurity intelligence platform accessible to non-technical users. Over the course of development, a full-stack web application was built comprising nine functional capability areas (deepfake, voice, and text synthetic-content detection; IoT risk triage; credential breach checking; phishing link analysis; live news, credibility verification, and per-article intelligence; and a persistent, context-aware AI analyst persona, DAYE), a companion Chrome browser extension, a PostgreSQL database with row-level security across every table, and eighteen serverless edge functions handling AI inference and third-party API integration behind a dual-provider (Claude/Gemini) resilience strategy. The platform was deployed to production on Vercel and Supabase.`,
            `Eight of the eight primary objectives stated in Chapter 1 were substantively met at the architecture and implementation level, verified through direct source and configuration review: every module described was found implemented as specified, security controls (row-level security, secret isolation, server-side rate limiting) were confirmed present and correctly enforced, and a full interface walkthrough confirmed every module functions correctly end to end against a well-formed response. The eighth objective, honest documentation of what this review does and does not establish, is met by Chapter 4's explicit refusal to assert detection-accuracy figures that were not measured, and by the specification of the follow-up evaluation programme required to produce them.`,
          ],
        },
        {
          id: '5-2',
          heading: '5.2 Contributions of the Study',
          body: [
            `The primary contribution of this work is a working, deployed implementation of a multi-domain cybersecurity intelligence platform, spanning nine capability areas behind a single authenticated experience, designed from the outset for non-specialist users. DOBERMAN does not claim to have invented or trained any of the underlying detection models; Hive AI, Anthropic Claude, and Google Gemini remain third-party services. The engineering and academic contribution instead lies in three specific, demonstrable areas: the secure, rate-limited, multi-provider orchestration layer that isolates every external credential to a server-side tier and keeps the platform available under single-provider degradation; the DAYE context-aware persona architecture, which selects a purpose-built explanatory prompt per module and per result type rather than exposing one generic assistant, and which is structurally designed to interpret a calling module's own structured output rather than re-deriving a verdict independently; and a demonstrated, code-verified discipline of declining to fabricate a result when live data is unavailable, evidenced concretely in the Breach Detection and Cyber Globe modules and reflected in this report's own treatment of its evidence.`,
            `The work also demonstrates that integrating independently researched components (deepfake and voice-clone detection from the computer vision and audio-forensics literature [6][30][31][32][41], IoT attack-detection approaches from the network security literature [33], credential-checking protocol design from applied cryptography [37], phishing-detection approaches from the applied machine learning literature [38], AI-text stylometry from computational linguistics [42], and ensemble misinformation detection from the NLP literature [36]) into a single accessible platform, behind one consistent explanatory layer, produces user value that none of the individual components could deliver in isolation, while making clear that this integration is an engineering and orchestration contribution rather than a claim of novel detection science.`,
          ],
        },
        {
          id: '5-3',
          heading: '5.3 Conclusion',
          body: [
            `The cybersecurity threat landscape facing ordinary users today is genuinely complex, and genuinely multi-modal: deepfakes, cloned voices, AI-written text, reused and breached passwords, phishing infrastructure, IoT vulnerabilities, and misinformation are no longer edge cases but everyday risks encountered by anyone with a smartphone and a home broadband connection. The tools developed by the security industry to address these risks were not built for these users. DOBERMAN represents one attempt to change that, bringing together detection and advisory capability that previously required separate accounts, technical skills, and in some cases subscription fees, into a single platform with a zero-barrier free tier and one consistent explanatory voice.`,
            `The evidence gathered for this report supports a narrower but more defensible conclusion than a purely architectural narrative would suggest: DOBERMAN's security architecture and every module's interface were verified, directly, to be implemented correctly and to the standard described in Chapter 3; its detection accuracy was not measured, and this report says so plainly rather than implying otherwise. A platform in this space earns trust not only by detecting threats, but by being honest about the edge of its own knowledge, and DOBERMAN's own code, in at least two modules, already embodies that principle. Extending it, through the evaluation programme specified in Section 4.9, is the most important next step for this project, more important than any additional detection capability.`,
          ],
        },
        {
          id: '5-4',
          heading: '5.4 Recommendations',
          body: [
            `Based on the findings of this project, the following recommendations are made for practitioners working on similar platforms:`,
            `(i) Explanatory output should be treated as a first-class design requirement, implemented as a layer that consumes another system's structured output rather than a bare wrapper around a general chatbot, as demonstrated by DAYE's context-specific prompt design.`,
            `(ii) Where a system cannot verify a claim against a live authoritative source (a CVE database, a breach registry), it should say so explicitly rather than allow a language model to fill the gap with a plausible-sounding invention; DOBERMAN's Breach Detection and Cyber Globe modules demonstrate one working pattern for this, and the NOSE module's unresolved CVE-verification gap demonstrates the cost of not yet applying it everywhere.`,
            `(iii) Multi-provider LLM fallback should be treated as a baseline resilience requirement for any product built on a metered third-party API, not an optional enhancement, given how directly a single-provider outage or rate limit otherwise translates into a user-facing failure.`,
            `(iv) Passive, description-based IoT assessment is a viable and accessible alternative to active network scanning for consumer-facing applications, but any claim that its output is "verified" or "grounded" must be backed by an actual database cross-reference, not by the plausibility of an LLM's output on a well-known example.`,
            `(v) Reports about AI-assisted systems should apply the same anti-fabrication discipline to their own evidentiary claims that the system is expected to apply to its users; this report's correction of its own earlier, unsupported Chapter 4 claims is offered as a specific example of what that looks like in practice.`,
          ],
        },
        {
          id: '5-5',
          heading: '5.5 Limitations',
          body: [
            `This report is explicit about its own limitations, beyond those already stated for individual modules in Chapter 4. First, no dataset-scale accuracy evaluation was performed for any detection module; every accuracy claim from the prior version of this report has been either removed or replaced with a specification of the evaluation required to establish it. Second, live security testing (attempted exploitation rather than configuration review) was not performed against the production system. Third, the browser extension was reviewed in source only and not exercised end to end. Fourth, a small number of legacy or apparently unused database tables were identified during schema review and are flagged for cleanup rather than fully explained, since their original purpose could not be established from source alone. Fifth, this report's literature review, while checked source-by-source against publisher or preprint listings, reflects the researcher's own reading of that literature and has not been independently peer-reviewed.`,
          ],
        },
        {
          id: '5-6',
          heading: '5.6 Future Work',
          body: [
            `Several extensions to the current implementation would meaningfully advance the project, in addition to the evaluation programme specified in Section 4.9, which is prioritised above all of the following. First, implementing live NVD or CIRCL CVE cross-referencing in the NOSE module, closing the specific limitation identified in Section 4.3. Second, incorporating frequency-domain deepfake detection methods alongside the existing provider-based approach in EYES, to address the well-documented degradation of CNN-based detectors on re-encoded video [6][31]. Third, extending the NEWS module to analyse images attached to articles alongside textual content, consistent with the multi-modal approach recommended by Al-alshaqi et al. (2024) [36]. Fourth, resolving the duplicate edge function slugs observed during architecture review (for example, voice-analyze alongside an older voice-analyser, and scam-link-analyze alongside scam-link-analyser), retiring the superseded versions rather than leaving both deployed. Fifth, a dedicated mobile application would improve accessibility for users who primarily encounter suspicious content through mobile social media feeds. Finally, a community features layer allowing users to flag and share verified deepfakes, suspicious IoT device configurations, and misinformation campaigns would extend DOBERMAN from a personal tool to a collaborative intelligence network, a genuine watchdog for the digital commons, once the evaluation work above has established that the underlying detection modules are reliable enough to support shared, not just individual, decisions.`,
          ],
        },
      ],
    },
  ],

  references: [
    { number: 1, citation: 'Home Security Heroes. (2024). *The state of deepfakes 2024: Landscape, threats, and impact*. Home Security Heroes.' },
    { number: 2, citation: 'Palo Alto Networks Unit 42. (2020). *IoT threat report 2020*. Palo Alto Networks.' },
    { number: 3, citation: 'Nokia Threat Intelligence Lab. (2023). *Nokia threat intelligence report 2023*. Nokia.' },
    { number: 4, citation: 'NewsGuard. (2024). *AI-generated news and information ecosystem report*. NewsGuard Technologies.' },
    { number: 5, citation: 'Westerlund, M. (2019). The emergence of deepfake technology: A review. *Technology Innovation Management Review*, *9*(11), 39-52.' },
    { number: 6, citation: 'Naskar, G., Mohiuddin, S., Malakar, S., Cuevas, E., & Sarkar, R. (2024). Deepfake detection using deep feature stacking and meta-learning. *Heliyon*, *10*(4), e25933.', url: 'https://doi.org/10.1016/j.heliyon.2024.e25933' },
    { number: 7, citation: 'Goodfellow, I., Pouget-Abadie, J., Mirza, M., Xu, B., Warde-Farley, D., Ozair, S., Courville, A., & Bengio, Y. (2014). Generative adversarial nets. In *Advances in Neural Information Processing Systems* (pp. 2672-2680).' },
    { number: 8, citation: 'Li, L., Bao, J., Yang, H., Chen, D., & Wen, F. (2020). FaceShifter: Towards high fidelity and occlusion aware face swapping. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition* (pp. 14083-14092).' },
    { number: 9, citation: 'Rombach, R., Blattmann, A., Lorenz, D., Esser, P., & Ommer, B. (2022). High-resolution image synthesis with latent diffusion models. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition* (pp. 10684-10695).' },
    { number: 10, citation: 'Chollet, F. (2017). Xception: Deep learning with depthwise separable convolutions. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition* (pp. 1251-1258).' },
    { number: 11, citation: 'Afchar, D., Nozick, V., Yamagishi, J., & Echizen, I. (2018). MesoNet: A compact facial video forgery detection network. In *Proceedings of the IEEE International Workshop on Information Forensics and Security*.' },
    { number: 12, citation: 'Rossler, A., Cozzolino, D., Verdoliva, L., Riess, C., Thies, J., & Niessner, M. (2019). FaceForensics++: Learning to detect manipulated facial images. In *Proceedings of the IEEE/CVF International Conference on Computer Vision* (pp. 1-11).' },
    { number: 13, citation: 'Zhao, Y., Wang, B., Wu, B., Li, X., & Hu, S. (2021). Multi-attentional deepfake detection. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition* (pp. 2185-2194).' },
    { number: 14, citation: 'Hive AI. (2024). *Deepfake detection model documentation*. Hive Data, Inc. https://docs.thehive.ai' },
    { number: 15, citation: 'Ericsson. (2023). *Ericsson mobility report: IoT connections outlook*. Ericsson.' },
    { number: 16, citation: 'Symantec (Broadcom). (2023). *Internet security threat report: IoT threats* (Vol. 24). Symantec Corp.' },
    { number: 17, citation: 'OWASP Foundation. (2023). *OWASP Internet of Things project: Top 10 IoT vulnerabilities*. OWASP. https://owasp.org/www-project-internet-of-things/' },
    { number: 18, citation: 'Costin, A., & Francillon, A. (2018). Ghost in the network: The ins and outs of stealing connected cars. In *Proceedings of the USENIX Workshop on Offensive Technologies*.' },
    { number: 19, citation: 'Mell, P., Scarfone, K., & Romanosky, S. (2007). *A complete guide to the Common Vulnerability Scoring System*. National Institute of Standards and Technology.' },
    { number: 20, citation: 'Mirian, A., Ma, Z., Adrian, D., Tischer, M., Chuenchujit, T., Yardley, T., Berthier, R., Mason, J., Durumeric, Z., Halderman, J. A., & Bailey, M. (2016). An internet-wide view of ICS devices. In *Proceedings of the IEEE Conference on Privacy, Security and Trust*.' },
    { number: 21, citation: 'Axelsson, S. (2000). *Intrusion detection systems: A survey and taxonomy* (Technical Report No. 99-15). Chalmers University.' },
    { number: 22, citation: 'Happe, M., & Cito, J. (2023). Getting pwnd by AI: Penetration testing with large language models. In *Proceedings of the ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering*.' },
    { number: 23, citation: 'Perez, E., Kiela, D., & Cho, K. (2021). True few-shot learning with language models. In *Advances in Neural Information Processing Systems*.' },
    { number: 24, citation: 'Conroy, M., Rubin, J., & Chen, Y. (2022). *Fake news and disinformation online*. Institute for Library and Information Literacy.' },
    { number: 25, citation: 'Thorne, J., & Vlachos, A. (2018). Automated fact checking: Task formulations, methods and future directions. In *Proceedings of the 27th International Conference on Computational Linguistics* (pp. 3236-3250).' },
    { number: 26, citation: 'Shu, K., Sliva, A., Wang, S., Tang, J., & Liu, H. (2020). FakeNewsNet: A data repository with news content, social context and dynamic information for studying fake news on social media. *Big Data*, *8*(3), 171-188.' },
    { number: 27, citation: 'Wang, W. Y. (2017). "Liar, liar pants on fire": A new benchmark dataset for fake news detection. In *Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics* (pp. 422-426).' },
    { number: 28, citation: 'Anthropic. (2024). *Claude\'s character*. Anthropic. https://www.anthropic.com/research/claude-character' },
    { number: 29, citation: 'Hive AI. (2024). *Model performance benchmarks and calibration notes*. Hive Data, Inc. https://docs.thehive.ai/docs/deepfake-detection' },
    { number: 30, citation: 'Zia, R., Rehman, M., Hussain, A., Nazeer, S., & Anjum, M. (2024). Improving synthetic media generation and detection using generative adversarial networks. *PeerJ Computer Science*, *10*, e2181.', url: 'https://doi.org/10.7717/peerj-cs.2181' },
    { number: 31, citation: 'Ashok, V., & Joy, P. T. (2023). Deepfake detection using XceptionNet. In *Proceedings of the 2023 IEEE International Conference on Recent Advances in Systems Science and Engineering (RASSE)* (pp. 1-6).', url: 'https://doi.org/10.1109/RASSE60029.2023.10363477' },
    { number: 32, citation: 'Kumar, N., & Kundu, A. (2024). SecureVision: Advanced cybersecurity deepfake detection with big data analytics. *Sensors*, *24*(19), 6300.', url: 'https://doi.org/10.3390/s24196300' },
    { number: 33, citation: 'Ding, W., Abdel-Basset, M., & Mohamed, R. (2023). DeepAK-IoT: An effective deep learning model for cyberattack detection in IoT networks. *Information Sciences*, *634*, 157-171.', url: 'https://doi.org/10.1016/j.ins.2023.03.052' },
    { number: 34, citation: 'Gupta, M., Akiri, C., Aryal, K., Parker, E., & Praharaj, L. (2023). From ChatGPT to ThreatGPT: Impact of generative AI in cybersecurity and privacy. *IEEE Access*, *11*, 80218-80245.', url: 'https://doi.org/10.1109/ACCESS.2023.3300381' },
    { number: 35, citation: 'Ferrag, M. A., Ndhlovu, M., Tihanyi, N., Cordeiro, L. C., Debbah, M., Lestable, T., & Thandi, N. S. (2024). Revolutionizing cyber threat detection with large language models: A privacy-preserving BERT-based lightweight model for IoT/IIoT devices. *IEEE Access*, *12*, 23733-23750.', url: 'https://doi.org/10.1109/ACCESS.2024.3363469' },
    { number: 36, citation: 'Al-alshaqi, M., Rawat, D. B., & Liu, C. (2024). Ensemble techniques for robust fake news detection: Integrating transformers, natural language processing, and machine learning. *Sensors*, *24*(18), 6062.', url: 'https://doi.org/10.3390/s24186062' },
    { number: 37, citation: 'Li, L., Pal, B., Ali, J., Sullivan, N., Chatterjee, R., & Ristenpart, T. (2019). Protocols for checking compromised credentials. In *Proceedings of the 2019 ACM SIGSAC Conference on Computer and Communications Security (CCS \'19)* (pp. 1387-1403). ACM.', url: 'https://doi.org/10.1145/3319535.3354229' },
    { number: 38, citation: 'Alnemari, S., & Alshammari, M. (2023). Detecting phishing domains using machine learning. *Applied Sciences*, *13*(8), 4649.', url: 'https://doi.org/10.3390/app13084649' },
    { number: 39, citation: 'Yang, X., Cheng, W., Wu, Y., Petzold, L., Wang, W. Y., & Chen, H. (2024). DNA-GPT: Divergent n-gram analysis for training-free detection of GPT-generated text. In *Proceedings of the International Conference on Learning Representations (ICLR)*.' },
    { number: 40, citation: 'Barrington, S., Bhagtani, R., Salman, A., & Farid, H. (2023). Single and multi-speaker cloned voice detection: From perceptual to learned features. *arXiv preprint*.', url: 'https://arxiv.org/abs/2311.14827' },
    { number: 41, citation: 'Kulangareth, N. V., Kaufman, J., Oreskovic, J., & Fossat, Y. (2024). Investigation of deepfake voice detection using speech pause patterns: Algorithm development and validation. *JMIR Biomedical Engineering*, *9*, e56245.', url: 'https://biomedeng.jmir.org/2024/1/e56245' },
    { number: 42, citation: 'Chen, R., Xiong, S., He, J., & Ross, G. J. (2026). Stylometric detection of AI-generated texts: Evidence from human and machine-written essays. *Digital Scholarship in the Humanities*.', url: 'https://doi.org/10.1093/llc/fqag064' },
  ],

  appendices: [
    {
      title: 'Appendix A: Database Migration SQL',
      content: [
        'The following SQL migration script establishes the core of the DOBERMAN database schema (identity and the original four result tables); subsequent migrations layered on the voice, text, breach, scam-link, and globe-briefing tables described in Section 3.5, and are available in the project repository under supabase/migrations/.',
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
        `-- eyes_scans table (representative of the per-module result-table pattern
-- repeated, with module-specific columns, for nose_scans, voice_scans,
-- text_scans, breach_scans, and scam_link_checks)
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
      ],
    },
    {
      title: 'Appendix B: Edge Function Architecture',
      content: [
        'Every rate-limited Supabase Edge Function follows a consistent request handling pattern, shown below; DAYE and Cyber Globe extend this pattern with an explicit anti-fabrication branch, shown in the second listing.',
        `// Common pattern for all rate-limited edge functions (Deno runtime)
Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // 2. Parse and validate request body
  const { user_id, ...params } = await req.json()
  if (!user_id) return error(400, 'user_id required')

  // 3. Daily limit check against server-recorded usage_logs
  const today = new Date(); today.setHours(0,0,0,0)
  const { count } = await supabase.from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id).eq('module', MODULE)
    .gte('created_at', today.toISOString())
  if (count >= DAILY_LIMIT) return error(429, 'Daily limit reached')

  // 4. Call primary AI/security provider; fall back to a second
  //    provider on failure where a reasoning call is involved
  // 5. Persist result to database
  // 6. Log usage
  // 7. Return result
})`,
        `// Anti-fabrication pattern used in breach-check and globe-country-brief:
// an explicit "unavailable" branch instead of a placeholder result
if (!liveDataSourceConfigured) {
  return respond({
    unavailable: true,
    message: 'Live data could not be obtained for this check.',
  })
}`,
      ],
    },
    {
      title: 'Appendix C: Interface Walkthrough Screenshots',
      content: [
        'The following screenshots document the full interface walkthrough conducted for Chapter 4. Every screenshot shows the real, deployed DOBERMAN frontend, exercised through genuine user interaction (form submission, file upload, chat input); the data displayed in each result was returned by a simulated response rather than a live provider call, for the access-constraint reasons stated in Section 4.1, and is clearly identified as such here rather than left ambiguous. Figures include: the authenticated Dashboard with live module cards and DAYE\'s ambient presence; the NOSE network scanner and per-device risk report, including the CVE-2023-1389 reference discussed critically in Section 4.3; the EYES upload interface and full result view with detector breakdown; the DAYE Intelligence Chat conversation view; the NEWS live feed and credibility-verification result; the Deepfake Intelligence hub\'s Text AI-Detection tab; the DAYE Scam Link Analyzer tab; the Breach Detection module\'s email-lookup result; the Cyber Globe interface; the aggregated History view; and the existing in-app Report and Report/Full Document pages, shown for completeness since their content is this document itself rather than simulated data.',
      ],
    },
  ],
}
