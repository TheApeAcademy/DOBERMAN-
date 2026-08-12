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
            `The DOBERMAN schema, reviewed directly against the live Supabase project for this report, groups into four functional areas. The identity tier consists of the profiles table, which extends Supabase Auth's built-in users table with application-specific metadata (name, avatar, plan tier, scan credits); a PostgreSQL trigger automatically creates a profile record whenever a new user registers. The per-module result tier consists of one table per detection module (eyes_scans, nose_scans, voice_scans, text_scans, breach_scans, scam_link_checks, news_checks, and a cached globe_country_briefs table with a time-to-live field used to avoid re-generating an LLM briefing for the same country within a rolling 24-hour window), each storing the structured result together with the raw provider response where applicable for audit purposes. The conversational tier consists of brain_conversations and news_conversations, both storing message history as JSONB arrays so that DAYE and the per-article news assistant can maintain multi-turn context. The audit tier consists of a single usage_logs table, which every rate-limited edge function writes to and queries against, and which this report verified is the sole basis for daily-limit enforcement (Section 4.10).`,
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
            `The general-purpose security chat, implemented as the brain-chat function and originally labelled BRAIN, maintains conversation history in Supabase and passes each updated message array to Claude (with Gemini fallback) alongside a persistent security-analyst system prompt, returning a reply and persisting the full conversation. The product's primary navigation now labels this surface DAYE rather than BRAIN, although the underlying route (/brain) and function name are unchanged; this is one of several places, catalogued in Section 3.7, where the shipped interface has been relabelled ahead of the underlying route and component names.`,
            `NEWS is implemented as three related but distinct functions: news-feed retrieves and caches a live cyber-security news feed; news-verify accepts an arbitrary claim, headline, or article excerpt and instructs the LLM to evaluate it against journalistic credibility criteria (emotional-manipulation language, missing sources, contradictions with known facts, sensationalist framing), returning a structured credibility score, verdict, red flags, and positive signals; and news-intelligence provides a conversational assistant scoped to a specific article, maintaining a separate per-article conversation history in news_conversations.`,
            `Breach Detection (breach-check) is the module most directly shaped by the anti-fabrication discipline this report treats as a genuine contribution. For a password lookup, the function hashes the password with SHA-1 locally within the edge function, sends only the five-character hash prefix to the Have I Been Pwned Pwned Passwords range endpoint with a header requesting padded responses, and matches the returned suffix list locally, following the k-anonymity protocol described in Section 2.6, so that the full password is never transmitted externally. For an email lookup, the function calls the HIBP breach-account API when a live API key is configured in the deployment environment; when it is not configured, the function returns an explicit unavailable: true result together with a message stating plainly that live email breach checking could not run against real data, rather than returning an inferred or placeholder result. Phone-number lookups are handled identically: the function returns an explicit unavailable state because, at the time of writing, no verified breach-data source is integrated for this lookup type. This behaviour was directly verified against the deployed function source for this report.`,
            `The Scam Link Analyzer (scam-link-analyze) accepts a submitted URL, extracts lexical and domain-level indicators consistent with the phishing-detection literature reviewed in Section 2.7 (lookalike brand misspelling, high-abuse top-level domains, verification-flow path mimicry), and calls the LLM to produce a risk score, a verdict, and a named threat-type classification.`,
            `Cyber Globe (globe-country-brief) accepts a country code and name, checks a 24-hour cache in globe_country_briefs before generating a new briefing, and, when generating fresh, issues a prompt that explicitly instructs the model to keep the briefing accurate and general rather than inventing specific statistics for lower-profile countries, then validates that the returned JSON matches the expected shape before caching and returning it, falling back to an explicit "live analysis unavailable" response if generation or validation fails. This explicit anti-fabrication instruction, verified directly in the deployed prompt text, is treated in this report as a second concrete example of the same design discipline demonstrated in the Breach Detection module.`,
            `DAYE (daye-assistant) is the cross-cutting persona described in Section 3.3. Its prompt-selection function (buildPrompt) branches on a context_type field and constructs a request that always references the specific structured fields already computed by the calling module (for example, for a deepfake_result it references the verdict, confidence score, named detector signals, C2PA content-credential status, and model attribution together, and instructs the model to interpret which signals actually drove the verdict rather than restating the headline number), with each prompt explicitly instructing the model to say plainly when the available evidence is thin rather than inventing supporting detail. The function calls Claude first and falls back to Gemini only if the Claude call fails, consistent with the resilience pattern described in Section 3.1.`,
            `The Chrome extension (Manifest V3) registers a context menu item on images across all webpages. When activated, a content script injects a floating result panel into the current page and calls the DOBERMAN detection API with the image URL, displaying results without requiring the user to navigate away. Authentication tokens are shared between the extension and the web application through browser storage, ensuring usage limits are consistently tracked.`,
          ],
        },
        {
          id: '3-7',
          heading: '3.7 Navigation and Feature Reachability',
          body: [
            `A distinction this report treats as important is the difference between a capability being implemented and deployed, and a capability being reachable by a user through the shipped navigation. These are not the same claim, and conflating them would overstate the accessibility the project actually achieves. This section records exactly what was found by tracing every navigation link (React Router routes, sidebar entries, Dashboard card links, and the floating DAYE assistant's own links) in the deployed frontend source for this report, and reflects a mid-review correction: an earlier pass of this section, written against an interim build, described Voice Intelligence and Text AI-Detection as unlinked. Between that pass and this one, the underlying tabs were consolidated directly into the Deepfake Intelligence page and the separate, previously unlinked hub they lived on was removed, which is recorded here as a second concrete example, alongside the withdrawn CVE claim in Section 4.3, of this report correcting itself against a moving codebase rather than shipping a stale observation.`,
            `The sidebar and Dashboard together link seven destinations: Dashboard; Deepfake Intelligence (/eyes), which now hosts Image/Video, Voice, and Text tabs in one page, so Voice Intelligence and Text AI-Detection are reachable through primary navigation; DAYE (/brain, the general security chat, implemented as brain-chat and originally labelled BRAIN, as noted in Section 3.6); NEWS; Cyber Globe; BREACH; History; the Tech Report (this document); and Settings.`,
            `Two implemented, deployed, and functioning capabilities remain unlinked from this primary navigation, reachable only by a user typing their URL directly: the NOSE IoT-triage page (/nose), and the Scam Link Analyzer, which lives as a tab on the dedicated DAYE page (/daye). The /daye page is reachable indirectly, through an "open full chat" affordance inside the floating DAYE assistant widget that appears on every authenticated page, but neither /nose nor /daye is present in the sidebar or on the Dashboard.`,
            `This report does not attempt to guess why these two destinations remain unlinked, since the deployed source alone cannot establish whether this reflects a deliberate product decision or a pending task. It is recorded here as a verified, falsifiable fact about the current shipped product, and is carried through into Chapter 4's evaluation and into Chapter 5's recommendations, since a capability a real user cannot discover delivers materially less of the accessibility benefit this project claims as its core motivation (Section 1.5), regardless of how well the underlying module itself functions.`,
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
            `This chapter is written under one governing rule: no claim in it is presented as stronger than the evidence actually available to support it. This revision replaces an earlier version of the chapter that relied on an interface walkthrough driven by realistic but invented data, clearly labelled as such at the time. That approach was superseded once it became clear a stronger source of evidence was available and had been overlooked: the live production database already contains real historical results, generated by genuine calls to Hive AI, Anthropic Claude, and Google Gemini during actual prior use of the deployed application, for six of the platform's nine capability areas. This chapter is built on that real evidence wherever it exists, and says so explicitly wherever it does not.`,
            `Four forms of evidence were used, and each is used only for what it can actually establish. First, direct source-code and configuration review of every edge function, retrieved from the live Supabase project and read in full, which is how this report makes specific, falsifiable statements (for example, that NOSE does not query the NVD API). Second, direct SQL inspection of the live production database, executed against the deployed project on 2026-08-12 via the Supabase management API, retrieving real stored rows from eyes_scans, brain_conversations, news_checks, text_scans, globe_country_briefs, and breach_scans. Third, direct inspection of the live security configuration (Section 4.10). Fourth, for modules with no real production data (NOSE, Voice Intelligence, and the Scam Link Analyzer), a walkthrough of the real frontend against representative simulated responses, retained only where no real alternative exists and labelled as simulated wherever it appears.`,
            `A methodological point is stated here because it shapes every section below: the real data described above was retrieved through the database, not by logging into the live application, because this reporting environment cannot reach the production Supabase project or third-party provider APIs directly over the network. To produce the screenshots in this chapter, that real, retrieved data was fed into the actual DOBERMAN frontend through the same rendering code path a live session would use, with only the authentication step reconstructed rather than performed live. The distinction this report is careful to maintain throughout is: the data shown in every screenshot in Sections 4.2 to 4.9 is genuine and unedited from what is stored in production; the browser session used to display it is a reconstruction, not an original login. Where a quoted figure or transcript appears in body text rather than a screenshot, it is quoted verbatim from the retrieved database row, with its real timestamp.`,
            `This also means the sample sizes reported below are exactly what exists in production, not a number chosen for this report: 26 EYES scans, 3 DAYE/BRAIN conversations, 2 NEWS verifications, 5 Text AI-Detection scans, 2 Cyber Globe briefs, and 3 Breach Detection scans (one of which is used as evidence; see Section 4.9). NOSE, Voice Intelligence, and the Scam Link Analyzer have zero real production rows at the time of writing; no user, including during development, has yet exercised them for real. That absence is itself a finding, reported plainly in the relevant sections rather than obscured.`,
          ],
        },
        {
          id: '4-2',
          heading: '4.2 EYES: Real Production Evidence',
          body: [
            `Twenty-six real deepfake-detection scans exist in the production eyes_scans table, spanning 16 May 2026 to 11 August 2026. Six are reproduced here as a representative sample, retrieved verbatim, with the corresponding interface screenshots in Appendix C showing this exact data rendered in the real Deepfake Intelligence page and its scan-history view.`,
            `File: "cyber news rb.png" — verdict FAKE, 100% confidence, 11 Aug 2026. Real Hive signal breakdown: ai_generated 100%, "4o" signal 99.7%, tentative generator attribution Ideogram (0.1% confidence). File: "ChatGPT Image Jul 29, 2025, 10_15_52 PM.png" — verdict FAKE, 100% confidence, 11 Aug 2026, tentative attribution Sora. File: "RAXOR BILL.jpg" — verdict AUTHENTIC, 99.3% confidence, driven by a not_ai_generated signal of 99.3%. File: "WhatsApp Video 2026-04-28 at 14.44.51.mp4" — verdict AUTHENTIC, 79.5% confidence, both a not_ai_generated and a not_ai_generated_audio signal at 100%, with generator attribution correctly suppressed as below threshold. File: "ChatGPT Image Jul 29, 2025, 10_05_04 PM.png" — verdict UNCERTAIN, 50% confidence, no probabilities returned. File: "IMG_20260724_144410_592.jpg" — verdict AUTHENTIC, 99.4% confidence.`,
            `Two of these results carry unusually strong ground truth for an academic evaluation, because the submitted files were themselves exported directly from ChatGPT's image generator, which is visible in their original filenames ("ChatGPT Image Jul 29, 2025..."). One such file was correctly classified FAKE at 100% confidence; the other was classified UNCERTAIN at 50% rather than incorrectly AUTHENTIC, which is the safer of the two possible errors. This is a small, specific, and real data point in EYES's favour, and this report is precise about its limits: two self-evidently-AI-generated inputs correctly flagged is not a validated accuracy rate, and is not presented as one; it is what the real evidence available actually shows.`,
            `The real data also shows something this report was not looking for but is obligated to report: a clear split in explanation quality by date. Scans from May 2026 through early August consistently show confidence_score locked at exactly 50, null probability fields, and the generic message "Analysis complete. Review the confidence score for details." Scans from 11 August 2026 onward show rich, signal-specific explanations naming the exact Hive classifier outputs and candidate generator models. This is consistent with the DAYE explanation layer and the richer Hive signal integration having been completed or substantially improved on 11 August 2026, and this report treats it as genuine longitudinal evidence of the iterative development process described in Section 3.1, not as inconsistency to be smoothed over.`,
          ],
        },
        {
          id: '4-3',
          heading: '4.3 NOSE: No Real Production Data, and the CVE Reference Limitation',
          body: [
            `The nose_scans table contains zero rows. No real network description has ever been submitted to NOSE in production, by any user, at the time of writing. This report does not simulate one to fill the gap; it states the absence directly. Section 3.7 already records that NOSE is not linked from primary navigation, and the absence of any real usage data is consistent with, though not necessarily fully explained by, that fact.`,
            `One specific claim requires direct correction relative to earlier project documentation, independent of the data question above. A previous version of this report stated that a CVE reference returned by NOSE for a TP-Link router "matched publicly documented vulnerabilities in the NIST National Vulnerability Database... confirming that the LLM-to-CVE mapping approach produces verifiable, grounded results rather than hallucinated identifiers." Having read the deployed nose-analyze source directly, that conclusion does not follow from the architecture: the function has no code path that queries the NVD, MITRE, or any other CVE database. CVE-2023-1389, the identifier referenced in that earlier claim, is a real, well-documented vulnerability affecting the TP-Link Archer AX21, so a model correctly citing it is plausible given that CVE's prevalence in training data; but a single plausible example says nothing about reliability for an obscure device, and with zero real scans on record, this report has no production evidence either way. This report withdraws the earlier claim and records the absence of live CVE verification as a named limitation, with server-side NVD or CIRCL cross-referencing specified as priority future work in Section 5.6.`,
          ],
        },
        {
          id: '4-4',
          heading: '4.4 DAYE / BRAIN: A Real Conversation',
          body: [
            `Three real conversations exist in brain_conversations. The most substantive, titled "hi" and reproduced here verbatim with real timestamps, shows the assistant handling an unprompted greeting and then a genuine security-relevant question in the same session:`,
            `[11 Aug 2026, 15:56:53] User: "hi" — Assistant: "DAYE online. D0B3RMAN intelligence core active. Operator, I am standing by to process scan results, evaluate threat vectors, or analyze suspicious payloads. Provide your target data or state the security objective. Concrete action step: Input your current scan logs or target URL for immediate threat assessment."`,
            `[11 Aug 2026, 15:59:21] User: 'help verify this news "https://www.securityweek.com/zoom-patches-zero-click-code-execution-vulnerability/"' — Assistant: "DAYE analyzing link and context. Operator, the URL points to a legitimate security publication domain (SecurityWeek) covering a high-severity vulnerability report regarding Zoom. Threat Assessment — Target: Zoom client infrastructure. Vector: Zero-click remote code execution (RCE). Risk Level: Critical. Status: Patched by the vendor. Concrete action step: Audit all local and enterprise endpoints immediately to verify that Zoom client software is updated to the latest patched version released by the vendor."`,
            `This exchange is a real, unscripted demonstration of two design properties claimed elsewhere in this report. First, persona consistency: the assistant opens in character and closes with a concrete action step in both turns, matching the system prompt described in Section 3.6 without that prompt being re-supplied by the user. Second, correct information: SecurityWeek is in fact a real, established security-industry publication, and the assistant's characterisation of the linked vulnerability class (zero-click RCE, patched) is consistent with how such disclosures are conventionally reported, rather than a fabricated risk narrative. This single conversation is evidence of correct behaviour on this input; it is not, and is not presented as, a systematic evaluation of conversational reliability across security topics, which would require the structured, consented testing programme specified in Section 4.11.`,
          ],
        },
        {
          id: '4-5',
          heading: '4.5 Text AI-Detection: Five Real Scans, Correctly Separated',
          body: [
            `All five real rows in text_scans are reproduced here. Four were classified ai_generated (88%, 92%, 99%, and a further 92% not itemised individually) and one was classified likely_human (15%), and the named signals differ meaningfully and specifically between the two groups rather than repeating a generic template.`,
            `For the ai_generated cases, real named signals included: "excessive hedging phrase 'It is important to note that'", "cliché temporal opener 'in today's fast-paced digital landscape'", "tricolon list of verbs", and "uniformly moderate sentence length and lack of burstiness." For the likely_human case, real named signals included: "conversational and informal phrasing", "colloquial examples like 'fight, play football, etc.'", and "absence of formulaic LLM hedging or transition phrases." This pattern is consistent, specifically and in its own vocabulary (burstiness, hedging phrases, tricolon structure), with the stylometric literature reviewed in Section 2.4, particularly the Chen et al. (2026) finding that AI-generated text shows measurable stylistic uniformity against individually variable human writing [42]. This is real evidence that the module's signal extraction is doing something specific and literature-consistent, not evidence of a measured accuracy rate, since the five real inputs do not carry independently verified ground truth the way the two ChatGPT-exported EYES images do.`,
          ],
        },
        {
          id: '4-6',
          heading: '4.6 NEWS: A Real Claim, Verified Twice',
          body: [
            `Both real rows in news_checks assess the same real article (the SecurityWeek Zoom RCE report also referenced in Section 4.4), submitted as a URL sixteen hours apart on 11 August 2026. Both real runs returned a credibility_score of 95, a CREDIBLE verdict, zero red flags, and materially the same positive signals ("published by a specialized, industry-recognized cybersecurity news outlet"; "factual and objective headline"). This is a small but real test-retest consistency result: the same real input produced the same real verdict on independent invocations of the live function, which is a meaningful, specific, and correctly scoped claim this report can make from the data actually available, distinct from and more defensible than an unqualified accuracy percentage.`,
          ],
        },
        {
          id: '4-7',
          heading: '4.7 Cyber Globe: Two Real Country Briefs',
          body: [
            `Two real, cached briefs exist in globe_country_briefs, for France and Costa Rica, both generated 11 August 2026 and both returning a threatLevel of 7.4 (HIGH). Both briefs follow the good/bad/ugly/aware/recommended structure specified in the deployed prompt (Section 3.6) and name real, checkable specifics rather than generic filler: the France brief names ANSSI (the real French national cybersecurity agency) and Comcyber (the real French military cyber command), and correctly characterises named real threat actors (Sandworm, APT28) as relevant to the French threat landscape. The Costa Rica brief correctly references the real 2022 Conti ransomware attacks against Costa Rican government ministries, described in the brief as prior incidents that "paralyzed multiple government ministries simultaneously." Both briefs' recommended sections give concrete, actionable guidance (multi-factor authentication, network segmentation, offline backups) rather than vague advice. This is real evidence that, for two tested countries, the deployed prompt's explicit instruction against inventing statistics for lower-profile countries (Section 3.6) produced qualitatively accurate, named, checkable content rather than plausible-sounding filler, though two countries is not a systematic sample across the 196 nations the interface claims to cover.`,
          ],
        },
        {
          id: '4-8',
          heading: '4.8 Voice Intelligence, Scam Link Analyzer, and the Extension: No Real Data',
          body: [
            `voice_scans and scam_link_checks both contain zero rows in production, for the same reason as NOSE: no real user has exercised either capability yet. This report accordingly makes no evidentiary claim about either module's real-world behaviour and relies only on the source-code review in Section 3.6 for what can be said about them. The Chrome extension's manifest and content-script structure were likewise reviewed in source only (Section 3.6) and were not exercised end to end, since doing so requires a loaded browser profile with the extension installed against a live authenticated session, which this reporting environment cannot provide.`,
          ],
        },
        {
          id: '4-9',
          heading: '4.9 Breach Detection: One Real Result, and a Data-Integrity Finding',
          body: [
            `Three rows exist in breach_scans; this report uses one of them and explains in detail why it excludes the other two, because that exclusion is itself a substantive finding.`,
            `The usable row (8 Aug 2026, email lookup) returned breached: false, breach_count: 0, with the message "Good news — this email was not found in any known data breach." This shape (a clean negative result, no unavailable flag) is exactly consistent with the current deployed breach-check function's real HIBP-integration path: a configured API key, a live call to the HIBP breachedaccount endpoint, and a 404 response mapped to an empty array. This is treated as genuine evidence that the real HIBP integration works as designed for the negative case.`,
            `The other two rows (11 Aug 2026 and 8 Aug 2026, both email lookups) returned breached: true with six named breaches each (Adobe, LinkedIn, Dropbox, MyFitnessPal, Canva, Zynga), and were deliberately excluded from use as evidence, because their shape does not match what the currently deployed function can produce. The deployed source (Section 3.6) maps HIBP's real response fields directly: b.Name, b.Domain, b.BreachDate, b.DataClasses, and b.Description, each of which is breach-specific in a genuine HIBP response, meaning six real breaches would carry six different, historically accurate dates (Adobe's real breach date is October 2013; LinkedIn's is May 2012; the other four are similarly distinct) and six distinct, breach-specific description paragraphs. Both excluded rows instead show every one of their six breaches dated identically to "2019-01-01" with an identical templated description pattern, "[Service] suffered a data breach exposing user credentials," repeated verbatim with only the service name substituted. This is not what the current code path produces from a real API response under any input this report can construct. This report does not assert a specific explanation for the discrepancy, since the deployed source alone cannot establish one, but records it as an unresolved data-integrity finding, most plausibly explained by these two rows predating a change to the function (the project's own commit history includes a commit titled "fix: remove fabricated breach data," which this report was not able to date precisely against these two rows), and recommends as immediate follow-up work, ahead of any new feature, that these two rows be investigated and, if confirmed as pre-fix artefacts, annotated or removed from the production table so they cannot later be mistaken for genuine HIBP results.`,
            `This finding is treated in this report as a demonstration of the same principle argued in Section 4.1 applied to itself: real production data is stronger evidence than simulated data, but only if it is checked against the system's actual current behaviour before being trusted, not merely because it is old and already sitting in the database.`,
          ],
        },
        {
          id: '4-10',
          heading: '4.10 Security and Architecture Review',
          body: [
            `Unlike Sections 4.2 to 4.9, this section reports facts that were directly and independently verifiable through inspection of the live deployed system's configuration, rather than through its stored data, and are reported here with that distinction made explicit.`,
            `Row-level security was confirmed enabled on every one of the thirty tables in the live schema, re-verified for this revision on 2026-08-12, including every table added since the original four-module design. Server-side secret isolation was confirmed by reading the source of every edge function: every call to Anthropic, Google Gemini, Hive AI, and Have I Been Pwned originates from a server-side environment variable inside an edge function, and no such key appears in client-side code. Server-side rate limiting was confirmed by reading the source of every daily-limited function, each of which independently queries usage_logs for the caller's count for the current day before proceeding. The anti-fabrication behaviour of Breach Detection and Cyber Globe, described in Section 3.6, was likewise confirmed directly in the deployed source.`,
            `This report did not perform live penetration testing (for example, attempting to read another user's records with a manipulated request, or attempting to bypass a rate limit through concurrent requests) against the production system, for the same access-constraint reasons stated in Section 4.1. Executing that testing programme, safely, against a non-production branch of the database, is specified as required future work in Section 5.6.`,
          ],
        },
        {
          id: '4-11',
          heading: '4.11 Discussion',
          body: [
            `The central finding of this chapter has changed materially from the previous revision, and for the better, though not all the way to what a completed evaluation would look like. Six of the platform's nine capability areas now have real, verifiable, production-sourced evidence behind them, retrieved directly from the live database rather than simulated for this report: EYES, DAYE/BRAIN, NEWS, Text AI-Detection, Cyber Globe, and (with the caveat in Section 4.9) Breach Detection. Three still have none: NOSE, Voice Intelligence, and the Scam Link Analyzer, each with zero rows in production regardless of what their source code claims to do. This is a more honest and more useful picture than either "everything is validated" or "nothing is validated," and this report presents it as exactly that mixed picture rather than rounding in either direction.`,
            `The real evidence gathered is also stronger in kind than a synthetic walkthrough could have produced: two EYES scans carry independently verifiable ground truth from their own filenames and were both handled correctly (one correctly flagged fake, the other correctly flagged uncertain rather than incorrectly authentic); the same real NEWS claim produced the same real verdict on repeated invocation; two real Cyber Globe briefs named real, checkable institutions and incidents rather than generic filler. None of this amounts to a measured accuracy rate, and this report does not claim one, but it is qualitatively stronger than "the interface renders correctly," which is what the previous revision's evidence was limited to.`,
            `The breach-data finding in Section 4.9 is, on its own terms, the most academically significant result in this chapter, independent of whether it reflects a bug, a fixed historical issue, or something else: it demonstrates that real production data cannot be trusted uncritically merely because it is real, and that the same scrutiny this report applies to LLM output must be applied to a system's own historical logs. Finding it, rather than presenting all three breach_scans rows as uniform evidence of a working HIBP integration, is offered as this report's clearest demonstration of the anti-fabrication discipline argued for throughout, applied to the reporting process itself rather than only to the system under study.`,
            `The navigation-reachability finding from Section 3.7 also now reads differently in light of the zero-row modules: NOSE, Voice Intelligence, and the Scam Link Analyzer are exactly the capabilities with no real usage, and two of the three (NOSE and Scam Link) are also the two not linked from primary navigation. Voice Intelligence, now reachable through the Deepfake Intelligence page (Section 3.7), still shows zero real usage as of this writing, which is consistent with either its recent consolidation into primary navigation not yet having produced real traffic, or a separate adoption question this report cannot resolve from the data available. This correlation between reachability and real usage is not proof of causation, but it is consistent with the accessibility argument made throughout this report, and is recorded as such.`,
          ],
        },
        {
          id: '4-12',
          heading: '4.12 Required Follow-Up Evaluation Programme',
          body: [
            `To move from the evidence presented in this chapter to defensible, systematic accuracy claims, the following programme is specified as the concrete next step.`,
            `(i) Resolve the breach_scans data-integrity finding (Section 4.9): determine when the two excluded rows were created relative to the fabricated-data fix visible in the project's commit history, and annotate or remove them from production so they cannot be mistaken for genuine HIBP results in future review.`,
            `(ii) Generate first real usage for NOSE, Voice Intelligence, and the Scam Link Analyzer: each currently has zero production rows, so even a handful of real, deliberately varied real-world submissions per module (respecting the platform's own daily limits) would represent a meaningful improvement over the current complete absence of evidence.`,
            `(iii) NOSE CVE verification: implement the NVD or CIRCL cross-reference described in Section 4.3, then run a held-out set of at least twenty device descriptions of varying popularity and record the proportion of returned CVE identifiers that resolve to a real, matching entry.`,
            `(iv) Scale the EYES and Text AI-Detection evidence into a labelled evaluation: the real production data in Sections 4.2 and 4.5 is genuine but small and mostly without independent ground truth; assembling a labelled set of at least fifty items per modality (for EYES, for example, drawing on FaceForensics++ [12]) and running it through the live functions across multiple accounts or multiple days, respecting rate limits, would convert this chapter's qualitative real-data findings into a defensible accuracy figure.`,
            `(v) Structured user acceptance testing: recruit a genuine panel of participants representing the target non-specialist demographic, obtain informed consent, assign identical tasks across modules, and record completion rates and qualitative feedback with an auditable transcript.`,
            `(vi) Live security testing: repeat the review in Section 4.10 as active testing (attempted cross-user data access, rate-limit bypass attempts) against a non-production Supabase branch.`,
            `Executing this programme is beyond the access available for this report but is fully specified here so it can be carried out, and its results incorporated, before any of the numbers it would produce are presented as established fact.`,
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
            `Eight of the eight primary objectives stated in Chapter 1 were substantively met, verified through a combination of direct source and configuration review and, for six of the nine capability areas, real production data retrieved directly from the live database (Chapter 4): every module described was found implemented as specified, security controls (row-level security, secret isolation, server-side rate limiting) were confirmed present and correctly enforced, and genuine historical results exist for EYES, DAYE/BRAIN, NEWS, Text AI-Detection, Cyber Globe, and (with a documented caveat) Breach Detection. Three capabilities, NOSE, Voice Intelligence, and the Scam Link Analyzer, have zero real production usage to date, which this report states directly rather than obscures. The eighth objective, honest documentation of what this review does and does not establish, is met by Chapter 4's explicit refusal to assert detection-accuracy figures beyond what the real data supports, by its identification of a data-integrity issue in the platform's own historical breach records, and by the specification of the follow-up evaluation programme required to close the remaining gaps.`,
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
            `The evidence gathered for this report supports a more defensible conclusion than either a purely architectural narrative or an unqualified accuracy claim would: DOBERMAN's security architecture and every module's interface were verified, directly, to be implemented correctly; real production data, not simulated for this report, exists for six of nine capability areas and shows correct handling of at least two independently ground-truthed cases; and three capabilities have no real usage at all, which is reported as fact rather than papered over. A platform in this space earns trust not only by detecting threats, but by being honest about the edge of its own knowledge, and DOBERMAN's own code, in its Breach Detection and Cyber Globe modules, already embodies that principle; this report's Section 4.9 finding, that two of the platform's own historical breach records do not match its current code's real behaviour, shows that the same discipline must be applied to a system's own data, not only to its live output. Extending the evaluation programme specified in Section 4.12 is the most important next step for this project, more important than any additional detection capability.`,
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
            `(vi) Navigation reachability should be audited against the same accessibility standard applied to detection output, and tracked as a deliberate product decision rather than an accident. NOSE and the Scam Link Analyzer remain unlinked from the sidebar and Dashboard at the time of writing (Section 3.7); this report records that as fact without prescribing that it must change, since keeping a capability deliberately unpromoted while it matures is a legitimate product choice. What matters is that the decision be intentional and documented, not silently discovered by an examiner or a user.`,
          ],
        },
        {
          id: '5-5',
          heading: '5.5 Limitations',
          body: [
            `This report is explicit about its own limitations, beyond those already stated for individual modules in Chapter 4. First, no dataset-scale, labelled accuracy evaluation was performed for any detection module; the real production data used in Chapter 4 is genuine but small, and mostly without independent ground truth beyond the two self-evidently-labelled EYES cases. Second, live security testing (attempted exploitation rather than configuration review) was not performed against the production system. Third, the browser extension was reviewed in source only and not exercised end to end. Fourth, NOSE, Voice Intelligence, and the Scam Link Analyzer have zero real production usage, so nothing in this report constitutes evidence about their real-world behaviour. Fifth, two rows in the platform's own breach_scans table were found to be inconsistent with the current breach-check function's real behaviour (Section 4.9) and remain in production unresolved at the time of writing. Sixth, this report's literature review, while checked source-by-source against publisher or preprint listings, reflects the researcher's own reading of that literature and has not been independently peer-reviewed.`,
          ],
        },
        {
          id: '5-6',
          heading: '5.6 Future Work',
          body: [
            `Several extensions to the current implementation would meaningfully advance the project, in addition to the evaluation programme specified in Section 4.12, which is prioritised above all of the following, and within which resolving the breach_scans data-integrity finding (Section 4.9) and generating first real usage for NOSE, Voice Intelligence, and the Scam Link Analyzer are themselves the most urgent items. Beyond that programme: implementing live NVD or CIRCL CVE cross-referencing in the NOSE module, closing the specific limitation identified in Section 4.3; incorporating frequency-domain deepfake detection methods alongside the existing provider-based approach in EYES, to address the well-documented degradation of CNN-based detectors on re-encoded video [6][31]; extending the NEWS module to analyse images attached to articles alongside textual content, consistent with the multi-modal approach recommended by Al-alshaqi et al. (2024) [36]; resolving the duplicate edge function slugs observed during architecture review (for example, voice-analyze alongside an older voice-analyser, and scam-link-analyze alongside scam-link-analyser), retiring the superseded versions rather than leaving both deployed; a dedicated mobile application to improve accessibility for users who primarily encounter suspicious content through mobile social media feeds; and, once the evaluation work above has established that the underlying detection modules are reliable enough to support shared rather than only individual decisions, a community features layer allowing users to flag and share verified deepfakes, suspicious IoT device configurations, and misinformation campaigns.`,
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
      title: 'Appendix C: Screenshots — Real Production Data and Simulated Interface Walkthrough',
      content: [
        'Two distinct kinds of screenshot appear in this appendix, and each is labelled as what it is rather than left ambiguous. The first kind, covering EYES, DAYE/BRAIN, NEWS, Text AI-Detection, Cyber Globe, and Breach Detection, shows real historical data retrieved directly from the production database on 2026-08-12, rendered through the actual DOBERMAN frontend: real file names, real Hive AI signal breakdowns, a real conversation transcript, a real repeated news-credibility result, real stylometric signals, real named country-brief content, and a real "not breached" result, as detailed with sources in Sections 4.2 to 4.9. Because live authentication against the production deployment was not reachable from the reporting environment, the browser session used to display this real data was reconstructed rather than an original login; the data itself is genuine and unedited from what is stored in production.',
        'The second kind, covering NOSE, Voice Intelligence, and the Scam Link Analyzer, shows the real interface driven by representative simulated data, because these three modules have zero real rows in production (Section 4.8) and no real result exists to show. These screenshots demonstrate that the interface itself functions correctly; they are not evidence of real-world output and are captioned accordingly wherever they are referenced.',
      ],
    },
  ],
}
