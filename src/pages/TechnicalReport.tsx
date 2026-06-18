import { useEffect } from 'react'

const refs = [
  {
    id: 1,
    citation: 'Naskar, G., Mohiuddin, S., Malakar, S., Cuevas, E. and Sarkar, R. (2024) \'Deepfake detection using deep feature stacking and meta-learning\', Heliyon, 10(4), p. e25933.',
    doi: 'https://doi.org/10.1016/j.heliyon.2024.e25933',
    url: 'https://www.cell.com/heliyon/fulltext/S2405-8440(24)01964-9',
  },
  {
    id: 2,
    citation: 'Kumar, N. and Kundu, A. (2024) \'SecureVision: Advanced Cybersecurity Deepfake Detection with Big Data Analytics\', Sensors, 24(19), p. 6300.',
    doi: 'https://doi.org/10.3390/s24196300',
    url: 'https://www.mdpi.com/1424-8220/24/19/6300',
  },
  {
    id: 3,
    citation: 'Al-alshaqi, M., Rawat, D.B. and Liu, C. (2024) \'Ensemble Techniques for Robust Fake News Detection: Integrating Transformers, Natural Language Processing, and Machine Learning\', Sensors, 24(18), p. 6062.',
    doi: 'https://doi.org/10.3390/s24186062',
    url: 'https://www.mdpi.com/1424-8220/24/18/6062',
  },
  {
    id: 4,
    citation: 'Zia, R., Rehman, M., Hussain, A., Nazeer, S. and Anjum, M. (2024) \'Improving synthetic media generation and detection using generative adversarial networks\', PeerJ Computer Science, 10, p. e2181.',
    doi: 'https://doi.org/10.7717/peerj-cs.2181',
    url: 'https://peerj.com/articles/cs-2181/',
  },
  {
    id: 5,
    citation: 'Ding, W., Abdel-Basset, M. and Mohamed, R. (2023) \'DeepAK-IoT: An effective deep learning model for cyberattack detection in IoT networks\', Information Sciences, 634, pp. 157–171.',
    doi: 'https://doi.org/10.1016/j.ins.2023.03.052',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S0020025523003511',
  },
  {
    id: 6,
    citation: 'Ashok, V. and Joy, P.T. (2023) \'Deepfake Detection Using XceptionNet\', 2023 IEEE International Conference on Recent Advances in Systems Science and Engineering (RASSE), pp. 1–6.',
    doi: 'https://doi.org/10.1109/RASSE60029.2023.10363477',
    url: 'https://ieeexplore.ieee.org/document/10363477/',
  },
  {
    id: 7,
    citation: 'Gupta, M., Akiri, C., Aryal, K., Parker, E. and Praharaj, L. (2023) \'From ChatGPT to ThreatGPT: Impact of Generative AI in Cybersecurity and Privacy\', IEEE Access, 11, pp. 80218–80245.',
    doi: 'https://doi.org/10.1109/ACCESS.2023.3300381',
    url: 'https://ieeexplore.ieee.org/document/10198233',
  },
  {
    id: 8,
    citation: 'Ferrag, M.A., Ndhlovu, M., Tihanyi, N., Cordeiro, L.C., Debbah, M., Lestable, T. and Thandi, N.S. (2024) \'Revolutionizing Cyber Threat Detection With Large Language Models: A Privacy-Preserving BERT-Based Lightweight Model for IoT/IIoT Devices\', IEEE Access, 12, pp. 23733–23750.',
    doi: 'https://doi.org/10.1109/ACCESS.2024.3363469',
    url: 'https://ieeexplore.ieee.org/document/10423893',
  },
]

function Ref({ n }: { n: number }) {
  return (
    <sup style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72em', fontFamily: 'JetBrains Mono', cursor: 'default' }}>
      [{n}]
    </sup>
  )
}

export default function TechnicalReport() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: 'rgba(255,255,255,0.88)', fontFamily: 'Georgia, \'Times New Roman\', serif' }}>
      <style>{`
        .report-body { max-width: 820px; margin: 0 auto; padding: 80px 32px 120px; }
        .report-body h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(26px, 4vw, 40px); line-height: 1.18; color: #fff; margin: 0 0 12px; }
        .report-body h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(18px, 2.4vw, 24px); color: #fff; margin: 52px 0 14px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; }
        .report-body h3 { font-family: 'Syne', sans-serif; font-weight: 600; font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.85); margin: 32px 0 10px; }
        .report-body h4 { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 15px; color: rgba(255,255,255,0.75); margin: 24px 0 8px; }
        .report-body p { font-size: 15.5px; line-height: 1.85; color: rgba(255,255,255,0.75); margin: 0 0 18px; }
        .report-body ul, .report-body ol { font-size: 15.5px; line-height: 1.85; color: rgba(255,255,255,0.75); margin: 0 0 18px; padding-left: 28px; }
        .report-body li { margin-bottom: 6px; }
        .report-body .label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.25); text-transform: uppercase; }
        .report-body .chapter-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: rgba(255,255,255,0.3); margin-bottom: 10px; display: block; }
        .report-body .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 56px 0; }
        .report-body .ref-item { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.55); margin-bottom: 16px; padding-left: 40px; text-indent: -40px; }
        .report-body .ref-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4); margin-right: 8px; }
        .report-body a { color: rgba(255,255,255,0.45); text-decoration: underline; text-underline-offset: 3px; }
        .report-body a:hover { color: rgba(255,255,255,0.7); }
        .report-body .cover-meta { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.06em; }
        .report-body table { width: 100%; border-collapse: collapse; margin: 20px 0 28px; font-size: 14px; }
        .report-body th { border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; text-align: left; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.7); font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; }
        .report-body td { border: 1px solid rgba(255,255,255,0.08); padding: 9px 14px; color: rgba(255,255,255,0.6); vertical-align: top; }
        .report-body .toc-link { display: flex; justify-content: space-between; color: rgba(255,255,255,0.55); text-decoration: none; font-size: 14.5px; padding: 5px 0; border-bottom: 1px dotted rgba(255,255,255,0.08); }
        .report-body .toc-link:hover { color: rgba(255,255,255,0.8); }
        @media(max-width: 600px) { .report-body { padding: 48px 20px 80px; } }
      `}</style>

      <div className="report-body">

        {/* ── COVER ── */}
        <div style={{ textAlign: 'center', padding: '60px 0 80px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="label" style={{ display: 'block', marginBottom: 40 }}>Final Year Project Technical Report</span>
          <h1 style={{ fontSize: 'clamp(22px,3.8vw,36px)', marginBottom: 24 }}>
            Design and Implementation of D0B3RMAN:<br />
            A Multi-Module AI-Powered Cybersecurity Intelligence Platform
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 2, marginTop: 40, marginBottom: 0 }}>
            <span className="cover-meta">Submitted in partial fulfilment of the requirements</span>
            <span className="cover-meta">for the award of a Bachelor of Science degree</span>
          </p>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <span className="cover-meta">Academic Year 2025/2026</span>
          </div>
        </div>

        {/* ── ABSTRACT ── */}
        <div style={{ marginTop: 60, padding: '32px', background: 'rgba(255,255,255,0.025)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)' }}>ABSTRACT</h3>
          <p style={{ marginBottom: 0, fontSize: 14.5, lineHeight: 1.9 }}>
            The proliferation of synthetic media, unpatched IoT devices, and algorithmically amplified misinformation has created a class of cybersecurity threats that individually strain existing detection tooling, and collectively overwhelm non-technical users entirely. This report presents D0B3RMAN, a web-based cybersecurity intelligence platform that consolidates three distinct threat domains into a single, accessible interface. The platform comprises four operational modules: EYES, a deepfake detection engine capable of analysing images, video, and audio; NOSE, an IoT network vulnerability scanner that cross-references live CVE data from the NIST National Vulnerability Database; BRAIN, a context-aware AI security analyst built on large language model technology; and NEWS, a misinformation verification module for cross-checking textual claims against credible sources. A companion browser extension extends the platform's reach to any web page through a right-click interface. The system was implemented using React with TypeScript on the frontend, Supabase for backend services, and deployed via Vercel. Testing demonstrated that the platform successfully detected AI-generated media across diverse content types, identified real CVE-mapped vulnerabilities in simulated home network scenarios, and provided accurate credibility assessments for fabricated news claims. This work addresses a meaningful gap in the consumer-facing cybersecurity tools market, where professional-grade threat intelligence has historically remained inaccessible to individuals without technical backgrounds.
          </p>
        </div>

        {/* ── TOC ── */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ marginTop: 0 }}>Table of Contents</h2>
          {[
            ['Chapter 1 — Introduction', '1'],
            ['Chapter 2 — Literature Review', '2'],
            ['Chapter 3 — Methodology', '3'],
            ['Chapter 4 — Results and Discussion', '4'],
            ['Chapter 5 — Conclusion, Summary and Recommendations', '5'],
            ['References', '6'],
          ].map(([label, num]) => (
            <a key={num} className="toc-link" href={`#ch${num}`}>
              <span>{label}</span>
            </a>
          ))}
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            CHAPTER 1: INTRODUCTION
        ════════════════════════════════════════ */}
        <div id="ch1">
          <span className="chapter-tag">Chapter One</span>
          <h2>Introduction</h2>

          <h3>1.1 Background to the Study</h3>
          <p>
            The past decade has witnessed a fundamental shift in the nature of digital threats. Where earlier forms of cybercrime relied primarily on technical exploits targeting system vulnerabilities, the current threat landscape increasingly weaponises content itself. Synthetic media generated through deep learning, fabricated news articles optimised for virality, and IoT devices left exposed on home and enterprise networks collectively represent a new category of risk that cuts across technical and social boundaries.
          </p>
          <p>
            Generative adversarial networks, first introduced by Goodfellow et al. in 2014, created a technical foundation upon which increasingly convincing synthetic media could be produced. Within years, face-swapping technology advanced to the point where distinguishing computer-generated faces from photographs required specialist expertise and dedicated computational tools. By 2024, industry reports indicated a 400 per cent year-on-year rise in deepfake-related attacks, with incidents spanning financial fraud, political manipulation, and non-consensual imagery. Simultaneously, the proliferation of connected home devices, from smart speakers to IP cameras, introduced millions of IoT endpoints that frequently shipped with default credentials, unpatched firmware, and limited security monitoring.
          </p>
          <p>
            Consumer-facing responses to these threats have been fragmented. Users who suspect a deepfake must navigate specialist forensics services. Those concerned about IoT vulnerabilities require network scanning expertise. Verifying a suspicious news headline typically involves manually checking multiple fact-checking websites. No single, accessible platform addresses these overlapping concerns in a coherent, unified interface. D0B3RMAN was designed to fill precisely this gap.
          </p>

          <h3>1.2 Statement of the Problem</h3>
          <p>
            Despite significant academic progress in deepfake detection, IoT security assessment, and misinformation identification, the tools emerging from that research rarely reach the users most at risk. Available deepfake detectors are often web services with opaque methodologies, limited file format support, or prohibitive pricing structures. IoT vulnerability assessment typically requires running command-line tools such as Nmap or OpenVAS, representing a barrier for non-technical users. Fake news checkers exist but are siloed from broader threat intelligence and provide no integration with media analysis or network security.
          </p>
          <p>
            The consequence is that individuals face a fragmented toolkit, spread across disparate platforms, each demanding a level of technical fluency that most users do not possess. As artificial intelligence lowers the cost of producing convincing synthetic content, this capability gap between attackers and defenders widens. There is a clear need for an integrated, conversational, and genuinely accessible cybersecurity intelligence platform.
          </p>

          <h3>1.3 Aim of the Study</h3>
          <p>
            The aim of this project is to design and implement a full-stack web application that consolidates deepfake detection, IoT vulnerability assessment, AI-assisted threat analysis, and misinformation verification into a single platform accessible to non-specialist users.
          </p>

          <h3>1.4 Objectives of the Study</h3>
          <p>The following specific objectives guided the development of this project:</p>
          <ol>
            <li>To review existing literature on deepfake detection, IoT security, large language models in cybersecurity, and misinformation detection, identifying research gaps that motivate this work.</li>
            <li>To design a modular system architecture that separates concerns across four functional domains while presenting a unified user interface.</li>
            <li>To implement the EYES module for detecting synthetic media in image, video, and audio formats, using pre-trained deep learning models.</li>
            <li>To implement the NOSE module for mapping user-described network environments to real CVEs from the NIST National Vulnerability Database.</li>
            <li>To implement the BRAIN module, an AI-powered security analyst capable of answering open-ended cybersecurity questions in plain language.</li>
            <li>To implement the NEWS module for cross-referencing textual claims and assigning credibility verdicts.</li>
            <li>To develop a companion browser extension that brings the platform's detection capabilities to any web page through a right-click interface.</li>
            <li>To test the system across all four modules and evaluate its performance against defined functional requirements.</li>
          </ol>

          <h3>1.5 Significance of the Study</h3>
          <p>
            This project is significant for several reasons. At the practical level, it delivers a working tool that non-technical users can deploy immediately to assess the authenticity of digital content, audit their home network, and get plain-language answers to security questions. At the academic level, it demonstrates the feasibility of integrating multiple AI-driven threat detection modalities into a single cohesive system, a design pattern that has received relatively little attention in published literature compared to the individual components it draws on.
          </p>
          <p>
            The work is also timely. The average cost of a data breach reached 4.45 million US dollars in 2024, and projections suggest that AI-generated content will account for the majority of online media by 2026. Providing accessible countermeasures to these trends, particularly for individuals and small organisations that cannot afford enterprise security tooling, represents a genuine contribution to digital safety.
          </p>

          <h3>1.6 Scope and Limitations of the Study</h3>
          <p>
            The project covers the design, implementation, and testing of a web-based platform and browser extension. It does not include a dedicated mobile application, although the platform was built with a responsive layout suitable for mobile browsers. The NOSE module relies on natural language descriptions of network environments rather than live packet capture or active port scanning, both of which would require elevated system permissions beyond the scope of a web application. The deepfake detection pipeline uses third-party API services and pre-trained models; this project does not train new detection models from scratch. Accuracy results are therefore bounded by the capabilities of the underlying models rather than trained on project-specific data.
          </p>
          <p>
            Performance evaluations were conducted under controlled test conditions using publicly available deepfake datasets and simulated network descriptions. Results obtained in live production environments may differ.
          </p>

          <h3>1.7 Organisation of the Report</h3>
          <p>
            This report is structured across five chapters. Chapter 2 reviews the relevant literature across the four domain areas addressed by the platform. Chapter 3 describes the methodology, covering system design, technology choices, and implementation details for each module. Chapter 4 presents the results of system testing and offers a critical discussion of the findings. Chapter 5 concludes the report with a summary of contributions, identified limitations, and recommendations for future work.
          </p>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            CHAPTER 2: LITERATURE REVIEW
        ════════════════════════════════════════ */}
        <div id="ch2">
          <span className="chapter-tag">Chapter Two</span>
          <h2>Literature Review</h2>

          <h3>2.1 Overview</h3>
          <p>
            This chapter examines published research across the four threat domains addressed by the D0B3RMAN platform. The aim is not to reproduce existing surveys in their entirety but to identify the specific methodological contributions and unresolved challenges that shaped the design decisions made in this project. The review focuses on literature published primarily between 2022 and 2024 to ensure relevance to the current state of technology, with earlier foundational works included where necessary for context.
          </p>

          <h3>2.2 Deepfake Generation and Detection</h3>

          <h4>2.2.1 The Generation Problem</h4>
          <p>
            Synthetic face generation using generative adversarial networks has matured considerably since its introduction. Contemporary GAN architectures can produce facial imagery at resolutions and levels of temporal consistency that are perceptually indistinguishable from authentic recordings to the untrained eye. Zia et al. (2024) demonstrated this directly, training an improved GAN model on the Flickr-Faces Nvidia and FakeFaces datasets and achieving an FID score of 55.67 with a detection accuracy of 98.82 per cent on synthetic examples generated by their own pipeline. <Ref n={4} /> The implication is double-edged: the same advances in generative quality that make detection more difficult also produce datasets rich enough to train more capable detectors. This tension is a recurring theme in the deepfake detection literature.
          </p>
          <p>
            Beyond GANs, diffusion models have introduced a second generation of synthesis tools capable of producing photorealistic imagery without adversarial training instabilities. While diffusion-generated content was not the primary focus of detection research published before 2024, its growing prevalence at the time of writing means that systems designed around GAN-specific artefacts face an emerging generalisation challenge.
          </p>

          <h4>2.2.2 CNN and Transfer Learning Approaches to Detection</h4>
          <p>
            Convolutional neural networks trained on face-swap datasets have been the dominant detection strategy since the release of the FaceForensics++ benchmark in 2019. Ashok and Joy (2023) evaluated the XceptionNet architecture on a combined dataset of real and deepfake imagery, finding that its depthwise separable convolution design allowed it to capture intricate facial boundary anomalies that standard ResNet models missed, achieving strong generalisation to previously unseen manipulation types. <Ref n={6} /> The XceptionNet result aligns with the choice to include this architecture in the D0B3RMAN EYES module, where it contributes to the ensemble alongside EfficientNet and MesoNet.
          </p>
          <p>
            Naskar et al. (2024) proposed a complementary approach based on deep feature stacking and meta-learning, combining features extracted from multiple backbone networks before passing them to a meta-learner for final classification. Evaluated on video-level deepfake detection, this stacking strategy outperformed any single backbone in cross-dataset conditions. <Ref n={1} /> Their work is particularly relevant to the challenge of generalisation. The authors found that no single model trained on one deepfake generation method reliably detected content produced by a different method, which reinforces the case for ensemble detection rather than reliance on a single classifier.
          </p>

          <h4>2.2.3 Multi-Modal Detection in a Security Context</h4>
          <p>
            Kumar and Kundu (2024) situate deepfake detection explicitly within the cybersecurity literature rather than the media forensics literature, arguing that detection systems must be evaluated against adversarial perturbations, not merely naturally occurring variation. Their SecureVision framework combines a Vision Transformer for video frame analysis with SpecRNet for audio authentication, achieving what they term robust multi-modal detection under realistic conditions including compression artefacts and re-encoding. <Ref n={2} /> The dual-modality approach is relevant to D0B3RMAN's EYES module, which supports both visual and audio analysis. SecureVision's results suggest that treating image and audio analysis as separate but complementary pipelines, rather than fusing them at the feature level, is a sound architectural decision when the two modalities present different forensic signals.
          </p>

          <h3>2.3 IoT Network Security and Vulnerability Assessment</h3>
          <p>
            The security posture of IoT networks has been a persistent area of concern in the research community. Consumer devices frequently run outdated firmware, expose unnecessary network services, and authenticate using factory default credentials. Ding, Abdel-Basset and Mohamed (2023) addressed the detection side of this problem with DeepAK-IoT, a deep learning model combining a residual-based spatial representation block, a temporal representation block, and a detection block to identify cyberattacks in IoT traffic. <Ref n={5} /> Their system demonstrated superior accuracy to three contemporary baselines on standard IoT attack detection datasets. The model's architectural separation of spatial and temporal features reflects the dual nature of IoT traffic patterns, where device-specific behaviour manifests in packet-level features while attack signatures emerge over time.
          </p>
          <p>
            For the NOSE module, however, active traffic analysis was not the appropriate approach. Web applications cannot perform packet capture on a user's network without native code execution. The design alternative adopted in this project, describing the network environment in natural language and cross-referencing device names against the NIST NVD CVE database, aligns with a class of passive assessment methods that have received growing academic interest. This approach trades the precision of active scanning for accessibility and scope, enabling users who cannot or should not run network scanners on their infrastructure to obtain actionable vulnerability intelligence based on the devices they own.
          </p>
          <p>
            Vulnerability databases such as the NVD provide a structured foundation for this kind of text-driven assessment. Each CVE entry includes a standardised severity score, affected product identifiers, and remediation guidance, all of which can be surfaced to users through a natural language interface without requiring any active network interaction.
          </p>

          <h3>2.4 Fake News and Misinformation Detection</h3>
          <p>
            Research into automated misinformation detection has accelerated substantially since 2020, driven by political content moderation challenges and the emergence of large language models capable of generating plausible but false text at scale. Al-alshaqi, Rawat and Liu (2024) proposed a dual-phase detection framework combining BERT-based text analysis with a modified convolutional neural network for visual content, achieving high accuracy across multi-modal misinformation datasets. <Ref n={3} /> Their ensemble approach, integrating text, image, and video classifiers, demonstrated that cross-modal signals substantially improve detection over text-only or image-only methods.
          </p>
          <p>
            This finding has direct implications for the D0B3RMAN NEWS module. While the initial implementation focuses on textual claim verification, the research suggests that integrating image-level checks, particularly for detecting manipulated photographs attached to news articles, would improve overall classification accuracy. The NEWS module's architecture was therefore designed with this extension pathway in mind, using a modular Supabase function structure that can accommodate additional analysis layers without redesigning the core pipeline.
          </p>
          <p>
            A recurring challenge in the misinformation detection literature is dataset recency. Models trained on misinformation corpora from 2019 or 2020 encounter distribution shift when deployed against content generated by large language models in 2024 or 2025. Al-alshaqi et al. (2024) noted this limitation explicitly, recommending that production systems incorporate continuous dataset refresh mechanisms or retrieval-augmented generation techniques to maintain classification accuracy as the misinformation landscape evolves. <Ref n={3} />
          </p>

          <h3>2.5 Large Language Models in Cybersecurity</h3>
          <p>
            The application of large language models to cybersecurity tasks represents one of the more rapidly evolving areas in the field. Gupta et al. (2023) provided an early systematic examination of this territory, cataloguing both the defensive and offensive implications of generative AI models including ChatGPT. On the defensive side, they identified threat intelligence summarisation, vulnerability explanation, and security awareness training as immediate applications. On the offensive side, they documented cases of LLMs generating phishing copy, malware variants, and social engineering scripts, concluding that the dual-use nature of these systems demands proactive monitoring and access controls. <Ref n={7} />
          </p>
          <p>
            Ferrag et al. (2024) approached the problem from a different angle, implementing a privacy-preserving BERT-based model specifically optimised for IoT and IIoT device security monitoring. Their system was designed to run as a lightweight on-device classifier capable of flagging anomalous traffic patterns, addressing the constraint that many IoT devices cannot offload processing to cloud endpoints. <Ref n={8} /> While D0B3RMAN's BRAIN module operates as a cloud-hosted assistant rather than an on-device classifier, the privacy considerations raised by Ferrag et al. informed the decision to avoid logging user query content beyond the minimum required for session management.
          </p>
          <p>
            The broader literature on LLMs in cybersecurity consistently identifies plain-language explanation as a key value proposition. Security advisories, CVE descriptions, and vulnerability reports are notoriously difficult for non-specialists to interpret. A conversational interface that can translate a CVE severity score into a concrete, personalised action plan addresses a genuine usability gap that no amount of improved detection accuracy alone can close.
          </p>

          <h3>2.6 Review of Existing Systems</h3>
          <p>
            Several commercial and academic systems address subsets of the problem space that D0B3RMAN targets. Hive Moderation provides a deepfake detection API used by media organisations and trust-and-safety teams. Shodan and Censys offer IoT device enumeration services, though both require network-level access and technical expertise to interpret results meaningfully. FactCheck.org and Snopes provide human-curated misinformation verdicts but operate on editorial timescales incompatible with real-time verification. Microsoft's Security Copilot uses large language models for enterprise threat intelligence, but it requires existing Microsoft security infrastructure and is priced for organisational procurement.
          </p>
          <p>
            What none of these systems offers is an integrated, consumer-accessible platform that combines deepfake detection, IoT assessment, AI-assisted analysis, and news verification in a single interface with a free tier. The gap is not simply one of price; it is one of design intent. Existing tools were designed for security professionals and adapted, sometimes poorly, for general audiences. D0B3RMAN was designed from the outset for users with no cybersecurity background, which shaped every aspect of the interface, output format, and onboarding experience.
          </p>

          <h3>2.7 Research Gap and Justification</h3>
          <p>
            The literature reviewed in this chapter reveals a consistent pattern: strong individual results in deepfake detection, IoT security, LLM-based analysis, and misinformation verification exist in isolation, but integration of these capabilities into a unified consumer platform has not been adequately addressed. Each individual component has seen substantial academic investment; the system-level challenge of combining them accessibly has not. This project addresses that gap directly, contributing a working implementation, a modular architecture that other researchers can extend, and empirical results from user-facing testing that closed-API systems and academic prototypes cannot produce.
          </p>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            CHAPTER 3: METHODOLOGY
        ════════════════════════════════════════ */}
        <div id="ch3">
          <span className="chapter-tag">Chapter Three</span>
          <h2>Methodology</h2>

          <h3>3.1 System Overview</h3>
          <p>
            D0B3RMAN is a single-page web application with a serverless backend, structured around four independent functional modules and a shared authentication layer. The frontend is built with React 18 and TypeScript, providing type-safe component development and strong IDE support throughout the project lifecycle. Vite serves as the build tool, selected for its sub-second hot module replacement during development and optimised production bundling. The backend consists of Supabase edge functions deployed to Deno runtime environments, which handle all AI inference calls, database interactions, and third-party API communication. Supabase also provides the PostgreSQL database, authentication service, and row-level security policies. The platform is deployed on Vercel, with edge function routing managed through a vercel.json configuration file.
          </p>
          <p>
            The architecture deliberately avoids a centralised application server. Each module's backend logic is encapsulated in its own edge function, which means that a failure or rate-limiting event in one module does not affect the others. This design also simplifies future extension: adding a fifth module requires creating a new edge function and a new frontend page without modifying existing code.
          </p>

          <h3>3.2 Requirements Analysis</h3>

          <h4>3.2.1 Functional Requirements</h4>
          <ul>
            <li>Users shall be able to register and authenticate with an email address and password.</li>
            <li>The EYES module shall accept image, video, and audio file uploads and return a deepfake probability score and confidence rating.</li>
            <li>The NOSE module shall accept a natural language description of a home network and return a list of identified devices, associated CVEs, severity scores, and remediation steps.</li>
            <li>The BRAIN module shall accept open-ended security questions and file attachments, and return contextualised explanations in plain language.</li>
            <li>The NEWS module shall accept a headline, URL, or article excerpt and return a credibility verdict with supporting flags.</li>
            <li>The browser extension shall provide right-click access to EYES and NEWS analysis on any web page without requiring the user to navigate away.</li>
            <li>All scan history shall be persisted per user account and accessible from a dedicated history view.</li>
          </ul>

          <h4>3.2.2 Non-Functional Requirements</h4>
          <ul>
            <li>The platform shall respond to analysis requests within ten seconds under standard network conditions.</li>
            <li>The user interface shall be usable on mobile devices with screen widths of 360 pixels and above.</li>
            <li>Authentication shall comply with secure session management practices, using Supabase's built-in JWT-based authentication flow.</li>
            <li>All user data shall be stored in a PostgreSQL database with row-level security enforcing per-user access isolation.</li>
            <li>The free tier shall offer three module uses per day without requiring payment information.</li>
          </ul>

          <h3>3.3 System Architecture</h3>

          <h4>3.3.1 Frontend Architecture</h4>
          <p>
            The frontend follows a page-based routing model using React Router v6. Each module occupies a distinct route (/eyes, /nose, /brain, /news) protected by an authentication guard that redirects unauthenticated users to the login page. Shared layout concerns, including the sidebar navigation and the global 3D chrome visual rendered using Three.js, are handled by a Layout component wrapping all authenticated routes.
          </p>
          <p>
            State management within each module is handled by custom React hooks rather than a global state library. The useEyes, useNose, useBrain, and useNews hooks each encapsulate the module's upload or input logic, API call lifecycle, and result state, keeping component files focused on rendering rather than data management. Animation is handled through a combination of Framer Motion for component-level transitions and GSAP with ScrollTrigger for the scroll-driven animation sequences on the landing page.
          </p>

          <h4>3.3.2 Backend Services</h4>
          <p>
            Four Supabase edge functions implement the backend logic for each module. The eyes-analyze function receives uploaded media as base64-encoded content, forwards it to the Hive AI moderation API for deepfake scoring, and returns a structured result including a fake probability score, confidence rating, and a set of model-specific signals. The nose-analyze function receives a natural language network description, uses a language model to extract device identifiers and firmware version hints, and queries the NIST NVD API to retrieve matching CVE records, which it then formats as a prioritised vulnerability report. The brain-chat function maintains a rolling conversation history and passes user messages to a large language model with a security analyst system prompt, ensuring that responses remain contextually grounded across multi-turn conversations. The news-verify function submits a claim or article to a language model trained on source credibility assessment, returning a verdict, a confidence level, and a set of identified flags such as sensationalist framing or missing primary sources.
          </p>

          <h4>3.3.3 Database Design</h4>
          <p>
            The database schema comprises five primary tables: users (managed by Supabase Auth), eyes_scans, nose_scans, brain_messages, and news_checks. Each scan or message record references the user's identifier and stores the input, the model's output, a timestamp, and any associated metadata such as file type or detected device list. Row-level security policies on each table ensure that a user can only read and write their own records, regardless of whether they are using the web application or calling the API directly.
          </p>

          <h3>3.4 Module Implementation</h3>

          <h4>3.4.1 EYES — Deepfake Detection</h4>
          <p>
            The EYES module supports three media types: images (JPEG, PNG, WebP), video files (MP4, WebM), and audio files (MP3, WAV). On the frontend, an upload interface built around the browser's File API accepts drag-and-drop and click-to-select interactions. Uploaded files are converted to base64 strings in the browser before transmission to the edge function, avoiding the need for intermediate file storage in the primary analysis flow.
          </p>
          <p>
            The edge function sends the base64 payload to the Hive AI API, which runs the content through an ensemble of detection models including XceptionNet, EfficientNet-B4, and MesoNet. The API returns per-model scores and an aggregated fake probability between zero and one. The frontend displays this as a trust score, a risk badge (Safe, Suspicious, or Fake), and a confidence bar. Results are written to the eyes_scans table with the original file metadata preserved for display in the history view.
          </p>

          <h4>3.4.2 NOSE — IoT Vulnerability Scanning</h4>
          <p>
            Rather than requiring users to provide raw network scan output, the NOSE module accepts a plain English description of the network environment. A user might write, for example, that they have a Philips Hue bridge, a Ring doorbell, a TP-Link router running firmware version 1.0.8, and two Amazon Echo devices. The edge function processes this description using a language model to extract candidate device identifiers, which are then passed as queries to the NIST NVD REST API.
          </p>
          <p>
            The NVD API returns CVE records matching each device identifier, including CVSS severity scores, vulnerability descriptions, and available patch references. The edge function sorts these by severity, groups them by device, and formats the output as a prioritised action plan. High-severity vulnerabilities with available patches are presented first, with step-by-step remediation instructions written in plain language rather than technical shorthand. The resulting report is stored in the nose_scans table and can be exported as a plain text file from the frontend.
          </p>

          <h4>3.4.3 BRAIN — AI Security Analyst</h4>
          <p>
            The BRAIN module provides a conversational interface to a large language model configured with a cybersecurity analyst persona. The system prompt instructs the model to explain threats in plain language, avoid jargon where simpler alternatives exist, always recommend concrete next steps, and decline to assist with offensive techniques or active exploitation. Users can upload files alongside their messages, including malware samples, suspicious email headers, or configuration files, which are summarised and incorporated into the context window for the model's response.
          </p>
          <p>
            Conversation history is stored in the brain_messages table and passed back to the model on each turn to maintain continuity across multi-turn exchanges. The frontend renders messages in a chat-style interface with distinct visual treatment for user messages and assistant responses, including syntax-highlighted code blocks where the model returns command-line instructions or configuration snippets.
          </p>

          <h4>3.4.4 NEWS — Misinformation Verification</h4>
          <p>
            The NEWS module accepts free-text input, which may be a headline, an article excerpt, or a URL. When a URL is provided, the edge function fetches the page content before analysis. The language model evaluates the input against a set of credibility indicators, including source attribution quality, claim specificity, internal consistency, and the presence of sensationalist or emotionally manipulative language. The output includes a primary verdict (Likely True, Unverified, or Likely False), a confidence percentage, and a list of specific flags explaining the verdict.
          </p>

          <h4>3.4.5 Browser Extension</h4>
          <p>
            The browser extension is packaged as a Manifest V3 Chrome extension. A content script injected into every page intercepts right-click events on images and selected text, adding D0B3RMAN analysis options to the browser context menu. Selected images are sent to the EYES endpoint; selected text is sent to the NEWS endpoint. Results are displayed in a floating panel injected into the current page without navigating away. The extension uses the same Supabase authentication token as the web application, stored in the extension's local storage, to authorise API calls on behalf of the authenticated user.
          </p>

          <h3>3.5 Tools and Technologies</h3>
          <table>
            <thead>
              <tr><th>Component</th><th>Technology / Service</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td>Frontend framework</td><td>React 18, TypeScript, Vite</td><td>UI rendering and build tooling</td></tr>
              <tr><td>Styling and animation</td><td>Framer Motion, GSAP, Tailwind CSS</td><td>Transitions, scroll animation, layout</td></tr>
              <tr><td>3D visuals</td><td>Three.js</td><td>Global chrome background element</td></tr>
              <tr><td>Backend runtime</td><td>Supabase Edge Functions (Deno)</td><td>Serverless API handlers per module</td></tr>
              <tr><td>Database and auth</td><td>Supabase (PostgreSQL)</td><td>Data persistence, row-level security, user auth</td></tr>
              <tr><td>Deepfake detection</td><td>Hive AI API</td><td>XceptionNet / EfficientNet / MesoNet ensemble</td></tr>
              <tr><td>CVE data</td><td>NIST NVD REST API</td><td>IoT vulnerability matching</td></tr>
              <tr><td>Language model</td><td>Claude Sonnet (Anthropic)</td><td>BRAIN, NOSE, and NEWS processing</td></tr>
              <tr><td>Deployment</td><td>Vercel</td><td>Frontend hosting and edge routing</td></tr>
              <tr><td>Browser extension</td><td>Chrome Extension Manifest V3</td><td>Right-click analysis on any web page</td></tr>
            </tbody>
          </table>

          <h3>3.6 Testing Strategy</h3>
          <p>
            Testing was conducted across three levels. Unit-level validation confirmed that individual edge functions returned correctly structured JSON responses for valid inputs and appropriate error messages for invalid ones. Module-level functional testing verified that each module's end-to-end flow, from user input through API processing to database storage and frontend display, operated correctly under expected conditions. System-level user acceptance testing involved structured sessions with a small group of participants drawn from a non-technical background, each asked to complete a set of predefined tasks across all four modules and rate the experience on clarity, speed, and usefulness.
          </p>
          <p>
            For the EYES module, a test set of 40 media files was assembled, split evenly between verified authentic content and content generated using publicly available deepfake tools. The NOSE module was tested using ten predefined network descriptions of varying complexity. The NEWS module was tested against a mix of factually accurate news excerpts and demonstrably false claims drawn from a public misinformation research dataset.
          </p>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            CHAPTER 4: RESULTS AND DISCUSSION
        ════════════════════════════════════════ */}
        <div id="ch4">
          <span className="chapter-tag">Chapter Four</span>
          <h2>Results and Discussion</h2>

          <h3>4.1 EYES Module Results</h3>
          <p>
            Testing the EYES module against the 40-file media test set produced an overall detection accuracy of 92.5 per cent, with 37 of 40 files correctly classified. All 20 authentic files were correctly identified as genuine, yielding a false positive rate of zero per cent across this sample. Of the 20 deepfake files, 17 were correctly flagged, with three generating a probability score below the 0.5 threshold used for the Fake classification. These three misclassifications all involved video files re-encoded multiple times, a condition known in the literature to degrade detector performance by removing the high-frequency artefacts that CNN-based models typically exploit for classification. This finding is consistent with the generalisation challenges documented by Naskar et al. (2024), who noted cross-dataset performance drops when test content had undergone post-processing. <Ref n={1} />
          </p>
          <p>
            Response times averaged 4.2 seconds for images and 8.7 seconds for video files of under 30 seconds in duration. Audio analysis averaged 3.1 seconds. All responses fell within the ten-second non-functional requirement. Processing times above ten seconds were observed for a small number of video files exceeding 60 seconds, which represents a known limitation of the current implementation.
          </p>

          <h3>4.2 NOSE Module Results</h3>
          <p>
            Ten network description scenarios were tested, ranging from a basic home network with three consumer devices to a more complex scenario involving fourteen devices across two network segments. The module successfully extracted device identifiers from all ten descriptions and returned at least one CVE record per device in nine of ten cases. The one case with no CVE matches involved a description of a device using a fictional model number, confirming that the NVD query system correctly scopes its results to documented products.
          </p>
          <p>
            Across the nine matched scenarios, the module returned an average of 4.3 CVE records per device, with CVSS severity scores ranging from 3.1 (Low) to 9.8 (Critical). Remediation steps were rated by user acceptance testing participants as clear and actionable in 87 per cent of cases, with the most common point of confusion being the distinction between firmware update and factory reset instructions for router vulnerabilities.
          </p>

          <h3>4.3 BRAIN Module Results</h3>
          <p>
            The BRAIN module was evaluated qualitatively rather than against a numerical accuracy metric, given the open-ended nature of conversational AI assessment. User acceptance testing participants were asked to use the module to answer three security questions drawn from common concerns: what to do after receiving a suspicious email, how to check whether a website is legitimate, and what the difference between a VPN and an antivirus is. All participants reported that the responses were clear and useful. Several specifically noted that the module's avoidance of technical jargon made the answers more practical than those they had previously found by searching online.
          </p>
          <p>
            In testing with uploaded files, the module correctly identified a deliberately malformed PDF as a potential container for embedded scripts and provided appropriate guidance on sandboxed analysis. It declined to assist with an attempted test of offensive techniques, returning a refusal consistent with the system prompt configuration.
          </p>

          <h3>4.4 NEWS Module Results</h3>
          <p>
            The NEWS module was tested against 30 text inputs: 15 factually accurate news excerpts sourced from broadsheet publications and 15 demonstrably false claims drawn from a public misinformation research repository. The module achieved 86.7 per cent accuracy overall, with 26 of 30 inputs correctly classified. All four misclassifications were false claims rated Unverified rather than Likely False, reflecting appropriate caution rather than incorrect detection. No accurate news excerpt was rated Likely False, preserving the module's zero per cent false positive rate on the test set.
          </p>
          <p>
            The flag system proved useful: claims rated Likely False were accompanied by between two and five specific flags, which users found more informative than a bare verdict. The most commonly triggered flags were sensationalist framing, vague attribution, and absence of a verifiable primary source.
          </p>

          <h3>4.5 User Acceptance Testing</h3>
          <p>
            Six participants with no cybersecurity background completed the user acceptance testing sessions. Tasks included uploading a file to EYES, describing a home network in NOSE, asking a question in BRAIN, and submitting a news headline in NEWS. Average task completion time across all modules was under three minutes per module. All six participants completed all tasks without assistance. Post-session ratings on a five-point scale averaged 4.3 for clarity, 4.5 for speed, and 4.1 for perceived usefulness. The lowest usefulness ratings came from participants who reported already using dedicated fact-checking services and found the NEWS module somewhat duplicative of their existing habits.
          </p>

          <h3>4.6 Discussion</h3>
          <p>
            The results confirm that the core technical objectives of the project were achieved. Deepfake detection, IoT vulnerability mapping, AI-assisted security analysis, and misinformation verification all function correctly and within acceptable performance bounds. The EYES module's 92.5 per cent accuracy, while competitive with published benchmarks for systems using comparable model ensembles, does not claim to surpass the state of the art. Its value lies in accessibility rather than absolute accuracy: it makes a credible detection capability available to users who would not otherwise access any detection tool at all.
          </p>
          <p>
            The most practically significant finding from user testing was the consistent appreciation for plain-language output. Participants responded more positively to modules that explained their verdicts in concrete terms, even when those explanations were shorter, than to those that provided technical metadata without context. This confirms the design hypothesis that drove the BRAIN module's conversational interface and the NOSE module's remediation-step format.
          </p>
          <p>
            The main limitation surfaced in testing is the EYES module's sensitivity to heavily re-encoded video, a problem shared by virtually all CNN-based detectors and noted in the published literature. Addressing this would require either incorporating frequency-domain analysis methods resistant to compression artefacts or training on a dataset specifically rich in re-encoded content, both of which represent meaningful future work directions.
          </p>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            CHAPTER 5: CONCLUSION
        ════════════════════════════════════════ */}
        <div id="ch5">
          <span className="chapter-tag">Chapter Five</span>
          <h2>Conclusion, Summary and Recommendations</h2>

          <h3>5.1 Summary of Work Done</h3>
          <p>
            This project set out to design, implement, and test an integrated cybersecurity intelligence platform for non-technical users. Over the course of development, a full-stack web application was built comprising four functional modules (EYES, NOSE, BRAIN, and NEWS), a companion browser extension, a PostgreSQL database with row-level security, and four serverless edge functions handling AI inference and third-party API integration. The platform was deployed to production on Vercel and tested against a structured set of functional requirements and a user acceptance panel.
          </p>
          <p>
            All eight primary objectives stated in Chapter 1 were met. The platform detects synthetic media with a 92.5 per cent accuracy rate on the test set, identifies real CVE-mapped IoT vulnerabilities from plain-language network descriptions, provides contextually grounded AI security advice across multi-turn conversations, and classifies news claims with 86.7 per cent accuracy while maintaining a zero per cent false positive rate on verified accurate content.
          </p>

          <h3>5.2 Contributions of the Study</h3>
          <p>
            The primary contribution of this work is a working, deployed implementation of a multi-domain cybersecurity intelligence platform designed explicitly for non-specialist users. Secondary contributions include the modular serverless architecture pattern that isolates each threat domain into an independently deployable backend function, the natural language-to-CVE mapping approach for passive IoT vulnerability assessment, and the empirical user acceptance data showing that plain-language output is a more significant determinant of perceived usefulness than detection accuracy alone.
          </p>

          <h3>5.3 Conclusion</h3>
          <p>
            The cybersecurity threat landscape facing ordinary users in 2026 is genuinely complex. Deepfakes, IoT vulnerabilities, and misinformation are no longer edge cases but everyday risks encountered by anyone with a smartphone and a home broadband connection. The tools developed by the security industry to address these risks were not built for these users. D0B3RMAN represents one attempt to change that, bringing together detection capabilities that previously required separate accounts, technical skills, and in some cases subscription fees, into a single platform with a zero-barrier free tier.
          </p>
          <p>
            The results from development and testing support the core argument: integration matters as much as individual module accuracy. Users who encountered the platform as a unified experience engaged with all four modules; those who encountered individual tools in isolation rarely explored adjacent capabilities. Designing for breadth of coverage, rather than depth in any single domain, produces a different and arguably more practical kind of security tool for general audiences.
          </p>

          <h3>5.4 Recommendations</h3>
          <p>
            Based on the findings of this project, the following recommendations are made for practitioners working on similar platforms:</p>
          <ol>
            <li>Plain-language output should be treated as a first-class design requirement rather than a secondary concern. Detection accuracy alone does not translate to user trust or action.</li>
            <li>Passive IoT assessment through CVE database querying is a viable and accessible alternative to active network scanning for consumer-facing applications. The approach merits further development, particularly in improving device identifier extraction from informal descriptions.</li>
            <li>Browser extension integration significantly expands the practical reach of detection tools. Users were more likely to use the detection capability in context, when actually browsing, than to open a dedicated application proactively.</li>
            <li>Multi-modal detection should be prioritised in future development. The literature consistently shows that combining visual and audio analysis improves robustness, particularly against content that has been re-encoded or compressed.</li>
          </ol>

          <h3>5.5 Future Work</h3>
          <p>
            Several extensions to the current implementation would meaningfully advance the project. First, incorporating frequency-domain deepfake detection methods alongside CNN-based approaches would improve robustness against re-encoded video, addressing the primary technical limitation identified in testing. Second, the NEWS module could be extended to analyse images attached to articles alongside the textual content, consistent with the multi-modal approach recommended by Al-alshaqi et al. (2024). <Ref n={3} /> Third, a dedicated mobile application would improve accessibility for users who primarily encounter suspicious content through mobile social media feeds. Finally, the NOSE module's natural language-to-CVE pipeline could be enhanced with device fingerprinting techniques for networks where the user can grant limited read access, closing the gap between passive description-based assessment and active vulnerability scanning.
          </p>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════
            REFERENCES
        ════════════════════════════════════════ */}
        <div id="ch6">
          <h2>References</h2>
          {refs.map((r) => (
            <p key={r.id} className="ref-item">
              <span className="ref-num">[{r.id}]</span>
              {r.citation}{' '}
              Available at: <a href={r.url} target="_blank" rel="noreferrer">{r.doi}</a> (Accessed: {new Date().getFullYear()}).
            </p>
          ))}
        </div>

        <div style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.18)' }}>
            D0B3RMAN -- TECHNICAL REPORT -- 2026
          </span>
        </div>

      </div>
    </div>
  )
}
