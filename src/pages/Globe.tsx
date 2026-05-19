import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { Search, X, Shield, Newspaper, Brain, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'

// ─── Country Data ────────────────────────────────────────────────────────────

interface Headline {
  title: string
  date: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface Country {
  code: string
  name: string
  lat: number
  lon: number
  threatLevel: number
  threatLabel: string
  color: string
  situation: {
    overview: string
    good: string
    bad: string
    ugly: string
    aware: string
    recommended: string
  }
  stats: {
    breaches: number
    malwareRate: number
    avgBreach: string
    criticalVulns: number
  }
  headlines: Headline[]
  dayeIntelligence: string
}

const COUNTRIES: Country[] = [
  {
    code: 'US', name: 'United States', lat: 38.9, lon: -77.0,
    threatLevel: 7.2, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "The United States is simultaneously the world's most targeted nation and its most sophisticated cyber defender. Government agencies, critical infrastructure, and Fortune 500 companies face daily attacks from nation-state actors, organized crime, and hacktivists.",
      good: "CISA, NSA, and FBI maintain world-class threat intelligence. The U.S. Cyber Command actively conducts defensive and offensive operations. Strong public-private partnerships share real-time threat data.",
      bad: "Legacy infrastructure vulnerabilities in power grids, water systems, and healthcare. High-value target status means constant advanced persistent threats (APTs). Political division slows legislative cybersecurity reform.",
      ugly: "Critical infrastructure breaches in 2023-2024 exposed nuclear facility data. Volt Typhoon (Chinese APT) maintained undetected access to U.S. infrastructure for years.",
      aware: "Enable MFA on all accounts. Assume breach posture for enterprise environments. Monitor for supply chain attacks.",
      recommended: "Zero Trust Architecture adoption, NIST Cybersecurity Framework compliance, regular penetration testing.",
    },
    stats: { breaches: 4521, malwareRate: 74, avgBreach: '$9.44M', criticalVulns: 234 },
    headlines: [
      { title: 'Volt Typhoon remains embedded in U.S. critical infrastructure networks', date: '2026-05-12', severity: 'critical' },
      { title: 'CISA issues emergency directive on federal zero-day vulnerabilities', date: '2026-05-08', severity: 'high' },
      { title: 'New ransomware strain targets U.S. hospital networks coast-to-coast', date: '2026-05-01', severity: 'high' },
    ],
    dayeIntelligence: "The U.S. threat landscape in 2026 is defined by nation-state persistence and AI-augmented attacks. DAYE assesses HIGH risk from Chinese APTs targeting semiconductors, Russian ransomware groups targeting healthcare, and Iranian hacktivists targeting financial sector. Immediate priority: audit third-party vendors and implement continuous monitoring.",
  },
  {
    code: 'RU', name: 'Russia', lat: 55.75, lon: 37.62,
    threatLevel: 9.5, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "Russia operates the world's most sophisticated state-sponsored cyber warfare apparatus. Groups like Fancy Bear (APT28), Cozy Bear (APT29), and Sandworm operate under FSB, GRU, and SVR direction.",
      good: "Russia's domestic cybersecurity infrastructure is heavily fortified. The RuNet (national internet segment) provides isolation capability.",
      bad: "Russian citizens face some of the world's most aggressive domestic surveillance. Independent cybersecurity firms face government pressure.",
      ugly: "Sandworm's attacks on Ukrainian power grids caused actual civilian blackouts. NotPetya malware caused $10B in global damage.",
      aware: "All Russian-origin traffic should be treated as potentially adversarial. Spear phishing from Russian APTs mimics legitimate government communications.",
      recommended: "Block Russian IP ranges in sensitive environments. Apply all patches within 24h. Disable legacy protocols (SMBv1, Telnet).",
    },
    stats: { breaches: 892, malwareRate: 88, avgBreach: '$2.1M', criticalVulns: 445 },
    headlines: [
      { title: 'APT28 launches new campaign against NATO member ministries', date: '2026-05-14', severity: 'critical' },
      { title: 'Sandworm deploys upgraded industrial malware targeting European energy', date: '2026-05-06', severity: 'critical' },
      { title: 'Russian hacktivists claim breach of UK government contractor', date: '2026-04-28', severity: 'high' },
    ],
    dayeIntelligence: "Russia remains the most active state cyber aggressor in 2026. DAYE assesses CRITICAL threat level with ongoing operations against NATO infrastructure, election systems in 14 countries, and financial SWIFT networks. The integration of AI into Sandworm's toolkit has made attribution increasingly difficult.",
  },
  {
    code: 'CN', name: 'China', lat: 39.9, lon: 116.4,
    threatLevel: 9.2, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "China's cyber operations are strategic, patient, and focused on long-term intelligence gathering. APT groups (APT10, APT41, Volt Typhoon) target intellectual property, military secrets, and critical infrastructure across dozens of countries.",
      good: "China has dramatically improved domestic cybersecurity. The Cybersecurity Law requires data localization and security reviews.",
      bad: "All Chinese companies are legally required to cooperate with state intelligence demands — making Chinese hardware/software inherently suspect.",
      ugly: "Operation Cloud Hopper (APT10) compromised MSPs serving 12 countries, stealing data from aerospace, pharma, and defense sectors over 5 years undetected.",
      aware: "Chinese-made networking equipment, cameras, and IoT devices may contain backdoors. Avoid WeChat and TikTok on enterprise devices.",
      recommended: "Ban Huawei/ZTE equipment in sensitive environments. Audit supply chains for Chinese component dependencies. Monitor for low-and-slow data exfiltration.",
    },
    stats: { breaches: 2341, malwareRate: 82, avgBreach: '$4.2M', criticalVulns: 567 },
    headlines: [
      { title: 'Volt Typhoon expands pre-positioning in Pacific telecommunications', date: '2026-05-15', severity: 'critical' },
      { title: 'APT41 targets semiconductor firms in Taiwan, South Korea, and U.S.', date: '2026-05-10', severity: 'critical' },
      { title: 'Chinese AI-powered phishing campaigns defeat traditional email filters', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "China's 2026 cyber posture reflects Five-Year Plan priorities: semiconductors, quantum computing, and AI. DAYE identifies systematic targeting of these sectors. Volt Typhoon's infrastructure pre-positioning suggests preparation for conflict scenarios. Organizations in tech, defense, and critical infrastructure should treat Chinese-origin APTs as a constant presence.",
  },
  {
    code: 'GB', name: 'United Kingdom', lat: 51.5, lon: -0.12,
    threatLevel: 6.8, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "The UK faces a complex threat landscape as a major NATO ally, financial center, and intelligence hub. GCHQ's NCSC is among Europe's most capable cyber defense agencies.",
      good: "NCSC provides world-class threat intelligence and incident response. Cyber Essentials certification scheme drives baseline security across SMEs.",
      bad: "NHS (National Health Service) breaches expose patient data regularly. Legacy government IT systems are increasingly vulnerable.",
      ugly: "The MOD breach exposed personal data of 200,000+ armed forces personnel. Russian interference in Brexit referendum remains officially confirmed.",
      aware: "UK financial institutions are prime targets for SWIFT-related fraud. Government contractors face sophisticated spear-phishing.",
      recommended: "Implement Cyber Essentials Plus. Ensure NHS-connected systems are air-gapped from internet. Regular supply chain audits for defense contractors.",
    },
    stats: { breaches: 1243, malwareRate: 67, avgBreach: '$4.56M', criticalVulns: 178 },
    headlines: [
      { title: 'NCSC warns of sustained Russian targeting of UK energy infrastructure', date: '2026-05-11', severity: 'high' },
      { title: 'NHS trust hit by ransomware; 300,000 patient records encrypted', date: '2026-05-07', severity: 'high' },
      { title: 'UK Electoral Commission confirms voter data breach larger than reported', date: '2026-05-03', severity: 'critical' },
    ],
    dayeIntelligence: "The UK's threat environment in 2026 is characterized by Russian retaliation for Ukraine support, Chinese economic espionage, and opportunistic criminal ransomware. DAYE assesses HIGH risk particularly for public sector and healthcare. Key priority: modernize NHS digital infrastructure.",
  },
  {
    code: 'DE', name: 'Germany', lat: 52.52, lon: 13.4,
    threatLevel: 6.5, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Germany, as Europe's largest economy and a NATO cornerstone, faces persistent cyber threats from Russia and China. BSI leads national cyber defense. Industrial espionage targeting Mittelstand manufacturing is a chronic problem.",
      good: "BSI provides excellent guidance and incident response. Germany's GDPR implementation is among EU's strictest, driving privacy-by-design.",
      bad: "Government networks use outdated infrastructure. Bundeswehr IT modernization chronically delayed.",
      ugly: "Bundestag hack (2015) by APT28 stole terabytes of parliamentary data including Chancellor Merkel's communications.",
      aware: "German manufacturing SMEs are goldmines for IP theft. AutoCAD files and industrial control system access are prime targets.",
      recommended: "OT/IT network segmentation for all manufacturing. BSI Grundschutz compliance. Regular red-team exercises for critical infrastructure.",
    },
    stats: { breaches: 876, malwareRate: 58, avgBreach: '$4.67M', criticalVulns: 134 },
    headlines: [
      { title: 'APT28 targets German Bundestag ahead of federal elections', date: '2026-05-13', severity: 'critical' },
      { title: 'BSI reports 40% increase in ransomware attacks on German municipalities', date: '2026-05-09', severity: 'high' },
      { title: 'Chinese espionage targets German hydrogen technology firms', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "Germany's 2026 cyber threat profile is dominated by Russian election interference attempts and Chinese industrial espionage. DAYE assesses ELEVATED risk, particularly for defense contractors, automotive sector, and chemical industry.",
  },
  {
    code: 'KP', name: 'North Korea', lat: 39.0, lon: 125.75,
    threatLevel: 9.8, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "North Korea's Lazarus Group is unique: a state-sponsored actor primarily motivated by financial theft to circumvent sanctions. They have stolen over $3 billion in cryptocurrency since 2017.",
      good: "North Korea's domestic internet is almost entirely isolated, making it effectively immune to many attack vectors.",
      bad: "No international cybersecurity cooperation. North Korean operatives use freelancing platforms to infiltrate tech companies globally.",
      ugly: "Lazarus Group's Ronin Network hack stole $620M in cryptocurrency in a single operation. They fund WMD programs with stolen digital assets.",
      aware: "North Korean IT workers infiltrate companies using fake identities. Cryptocurrency platforms face persistent attacks.",
      recommended: "Verify all remote developer identities rigorously. Cryptocurrency platforms need transaction monitoring. Never allow code from unknown sources in production.",
    },
    stats: { breaches: 234, malwareRate: 95, avgBreach: '$7.8M', criticalVulns: 0 },
    headlines: [
      { title: 'Lazarus Group deploys new macOS malware targeting DeFi developers', date: '2026-05-14', severity: 'critical' },
      { title: 'UN report: North Korea stole $1.7B in crypto in Q1 2026 alone', date: '2026-05-08', severity: 'critical' },
      { title: 'FBI warns tech companies of North Korean IT worker infiltration', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "North Korea's cyber program in 2026 has evolved into a sophisticated financial weapon. DAYE assesses CRITICAL threat level for cryptocurrency, DeFi, and financial services globally. Key concern: stolen funds directly finance nuclear and missile programs.",
  },
  {
    code: 'IR', name: 'Iran', lat: 35.7, lon: 51.4,
    threatLevel: 8.5, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "Iran's cyber capabilities have grown dramatically since the Stuxnet revelation. IRGC-linked groups (Charming Kitten/APT35) conduct both espionage and destructive attacks.",
      good: "Iran has built significant domestic cyber defense capability and conducts frequent exercises.",
      bad: "Iranian threat actors regularly target journalists, dissidents, and human rights organizations with sophisticated spyware.",
      ugly: "Shamoon malware attacks on Saudi Aramco destroyed 30,000+ computers. Iran's targeting of Israeli infrastructure has caused real-world disruptions.",
      aware: "Iranian APTs extensively use social engineering via fake academic/conference invitations.",
      recommended: "Enhanced email authentication (DMARC, DKIM, SPF) for all organizations. Physical security awareness for personnel in or near Iran.",
    },
    stats: { breaches: 567, malwareRate: 79, avgBreach: '$3.2M', criticalVulns: 89 },
    headlines: [
      { title: 'Charming Kitten targets nuclear negotiators with new spyware variant', date: '2026-05-12', severity: 'critical' },
      { title: 'Iranian APT compromises water treatment systems in four U.S. cities', date: '2026-05-06', severity: 'critical' },
      { title: 'Israel-Iran cyber conflict intensifies with reciprocal infrastructure attacks', date: '2026-05-01', severity: 'critical' },
    ],
    dayeIntelligence: "Iran's 2026 cyber operations reflect escalated regional tensions. DAYE assesses CRITICAL threat for Israeli interests, energy infrastructure in the Gulf, and U.S. government-affiliated organizations. The convergence of Iranian and Russian tactical approaches suggests possible coordination.",
  },
  {
    code: 'UA', name: 'Ukraine', lat: 50.45, lon: 30.52,
    threatLevel: 8.0, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "Ukraine has become the world's most intense active cyber conflict zone. Russian APTs conduct daily attacks on government, military, and civilian infrastructure.",
      good: "Ukraine's CERT-UA is now among the world's most experienced incident response teams. International support has dramatically improved defensive capabilities.",
      bad: "Constant Russian attacks overwhelm response capacity. Civilian infrastructure including hospitals, water, and power are regularly targeted.",
      ugly: "Sandworm's attacks on Ukrainian power grids left millions without electricity during winter months. AcidRain malware wiped satellite modems affecting civilian communications.",
      aware: "Ukraine is a proving ground for new Russian cyber weapons that later get deployed globally.",
      recommended: "Study Ukrainian defensive strategies as a model for critical infrastructure protection. Participate in international threat sharing with Ukraine-focused orgs.",
    },
    stats: { breaches: 1892, malwareRate: 91, avgBreach: '$1.4M', criticalVulns: 312 },
    headlines: [
      { title: 'Russian Sandworm deploys new wiper malware targeting Kyiv infrastructure', date: '2026-05-15', severity: 'critical' },
      { title: 'CERT-UA neutralizes coordinated attack on national railway systems', date: '2026-05-11', severity: 'high' },
      { title: 'Ukraine cyber forces claim access to Russian military logistics network', date: '2026-05-07', severity: 'high' },
    ],
    dayeIntelligence: "Ukraine in 2026 represents the cutting edge of active cyber warfare. DAYE assesses the conflict as a live laboratory for techniques that will propagate globally. Ukrainian resilience provides crucial lessons for all nations' defensive planning.",
  },
  {
    code: 'IL', name: 'Israel', lat: 31.78, lon: 35.22,
    threatLevel: 7.8, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Israel has one of the world's most advanced cyber ecosystems, with Unit 8200 alumni founding dozens of leading cybersecurity companies. The country faces constant attacks from Iran, Hamas-affiliated groups, and Hezbollah.",
      good: "World-leading offensive and defensive cyber capabilities. Unit 8200 produces exceptional talent. Israeli cybersecurity exports exceeded $11B in 2025.",
      bad: "High-profile civilians and government officials face constant surveillance attempts. NSO Group's Pegasus spyware has caused significant controversy.",
      ugly: "Persistent Iranian attacks on Israeli water systems, hospitals, and financial infrastructure.",
      aware: "Any Israeli-developed software should be evaluated for government access backdoors. Israeli firms face sophisticated supply chain attacks.",
      recommended: "Adopt Israeli-style continuous monitoring (assume breach always). Zero Trust implementation as national standard.",
    },
    stats: { breaches: 445, malwareRate: 62, avgBreach: '$6.2M', criticalVulns: 67 },
    headlines: [
      { title: 'Iranian APT deploys new destructive malware against Israeli healthcare', date: '2026-05-13', severity: 'critical' },
      { title: "Israel's cyber exporters under scrutiny for dual-use technology sales", date: '2026-05-09', severity: 'medium' },
      { title: 'IDF Cyber Division claims major disruption of Hamas command infrastructure', date: '2026-05-05', severity: 'high' },
    ],
    dayeIntelligence: "Israel's 2026 cyber posture reflects active multi-front engagement. DAYE assesses ongoing CRITICAL threat from Iranian APTs and Hamas-affiliated groups. Key concern: the weaponization of AI surveillance tools developed by Israeli firms is being adopted by authoritarian regimes globally.",
  },
  {
    code: 'IN', name: 'India', lat: 28.6, lon: 77.2,
    threatLevel: 7.0, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "India's rapid digital transformation (1.4B people, UPI payments, Aadhaar) has created massive attack surface. Chinese APTs exploit border tensions while Pakistani groups conduct targeted attacks.",
      good: "India's CERT-In is improving rapidly. Digital India initiative includes cybersecurity investments. Growing domestic cybersecurity industry.",
      bad: "Massive data exposure from government databases. Healthcare sector severely under-protected. Enormous unpatched mobile device ecosystem.",
      ugly: "2023 AIIMS ransomware attack disrupted India's premier hospital for weeks. UIDAI (Aadhaar) database breaches exposed biometric data of millions.",
      aware: "UPI and digital payment fraud is epidemic. Social engineering via WhatsApp is the primary attack vector for most Indian users.",
      recommended: "Mandatory encryption for all government databases. Basic cyber hygiene campaigns for 500M+ internet users.",
    },
    stats: { breaches: 2103, malwareRate: 76, avgBreach: '$2.2M', criticalVulns: 456 },
    headlines: [
      { title: 'Chinese APT targets Indian defense contractors amid border tensions', date: '2026-05-14', severity: 'critical' },
      { title: 'CERT-In reports 300% increase in mobile banking fraud in Q1 2026', date: '2026-05-08', severity: 'high' },
      { title: 'Indian government database breach exposes 500M voter records', date: '2026-05-03', severity: 'critical' },
    ],
    dayeIntelligence: "India's digital transformation in 2026 outpaces its security maturity. DAYE assesses HIGH risk particularly for financial services, healthcare, and government databases. Chinese APTs increasingly exploit geopolitical tensions for cyber espionage targeting defense and space programs.",
  },
  {
    code: 'AU', name: 'Australia', lat: -35.28, lon: 149.13,
    threatLevel: 6.5, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Australia faces significant state-sponsored threats, primarily from China. Major healthcare, telecom, and government breaches in 2022-2024 exposed serious vulnerabilities.",
      good: "ASD (Australian Signals Directorate) provides strong national coordination. The Essential Eight framework is globally respected.",
      bad: "Medibank and Optus breaches demonstrated systemic vulnerabilities in major corporations.",
      ugly: "Medibank breach (2022) exposed mental health records of 9.7M Australians and led to targeted extortion of vulnerable individuals.",
      aware: "Australian critical minerals and defense technology are prime Chinese intelligence targets.",
      recommended: "Essential Eight compliance as minimum standard. Enhanced protection for critical minerals companies.",
    },
    stats: { breaches: 567, malwareRate: 59, avgBreach: '$3.35M', criticalVulns: 112 },
    headlines: [
      { title: 'ASD warns of sustained Chinese targeting of Australian critical minerals sector', date: '2026-05-12', severity: 'critical' },
      { title: 'Australian Electoral Commission confirms minor breach ahead of elections', date: '2026-05-08', severity: 'high' },
      { title: 'New cyber crime reporting scheme reveals 65% of breaches unreported', date: '2026-05-04', severity: 'medium' },
    ],
    dayeIntelligence: "Australia's 2026 cyber risk profile reflects its strategic position as a Five Eyes member near the South China Sea. DAYE assesses HIGH risk from Chinese state actors targeting defense supply chains and critical minerals. The Essential Eight framework is a genuine strength but implementation remains incomplete.",
  },
  {
    code: 'JP', name: 'Japan', lat: 35.68, lon: 139.69,
    threatLevel: 6.3, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Japan's cybersecurity capabilities have lagged its technological sophistication. A culture of minimal disclosure has been changing since major government breaches in 2022-2023.",
      good: "NISC has been significantly strengthened. Japan is increasing defense cyber investment dramatically.",
      bad: "Japan's security culture traditionally emphasizes physical security over digital. Many organizations use outdated software.",
      ugly: "Japan's Defense Ministry networks were hacked by China in 2023, with damage described by U.S. officials as 'catastrophic.'",
      aware: "Japanese precision manufacturing IP is among the world's most valuable. Chinese APTs persistently target automotive, robotics, and semiconductor sectors.",
      recommended: "Mandatory security updates for critical infrastructure. Enhanced protection of defense contractor networks.",
    },
    stats: { breaches: 445, malwareRate: 54, avgBreach: '$4.18M', criticalVulns: 98 },
    headlines: [
      { title: 'Japan Space Agency JAXA suffers breach in series of government attacks', date: '2026-05-11', severity: 'critical' },
      { title: 'North Korean Lazarus targets Japanese crypto exchanges with new vector', date: '2026-05-07', severity: 'high' },
      { title: 'Japan activates new Cyber Defense Command as threat environment escalates', date: '2026-05-03', severity: 'medium' },
    ],
    dayeIntelligence: "Japan's 2026 cyber posture reflects rapid change from defensive inadequacy to serious investment. DAYE assesses ELEVATED risk particularly from Chinese APTs targeting defense and space programs. Japan's alliance with the U.S. makes it a target for pre-positioning operations.",
  },
  {
    code: 'NL', name: 'Netherlands', lat: 52.37, lon: 4.89,
    threatLevel: 5.8, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "The Netherlands hosts major internet exchange points (AMS-IX) and punches above its weight in cybersecurity. Dutch intelligence (AIVD) has demonstrated sophisticated offensive capabilities.",
      good: "NCSC-NL is among Europe's best. Strong academic cybersecurity research. Netherlands coordinates much of European cyber defense.",
      bad: "As home to major internet infrastructure, a successful attack could have outsized global impact.",
      ugly: "AMS-IX processes ~10Tbps of global traffic — a failure or compromise would disrupt internet across Europe.",
      aware: "Dutch port (Rotterdam) and logistics infrastructure increasingly targeted for supply chain disruption.",
      recommended: "AMS-IX hardening is a global priority. Dutch financial sector requires enhanced monitoring.",
    },
    stats: { breaches: 234, malwareRate: 44, avgBreach: '$3.87M', criticalVulns: 56 },
    headlines: [
      { title: 'AIVD disrupts Russian infrastructure targeting operation in Netherlands', date: '2026-05-10', severity: 'high' },
      { title: 'AMS-IX reports attempted DDoS attack attributed to state actor', date: '2026-05-06', severity: 'critical' },
      { title: 'Dutch government mandates NIS2 compliance for all critical sectors', date: '2026-05-02', severity: 'low' },
    ],
    dayeIntelligence: "The Netherlands' 2026 cyber posture is strong relative to peer nations. DAYE assesses MODERATE risk, with key concerns around critical internet infrastructure and port logistics. The AIVD's demonstrated offensive capabilities create strategic deterrence.",
  },
  {
    code: 'BR', name: 'Brazil', lat: -15.78, lon: -47.93,
    threatLevel: 6.8, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Brazil is the most attacked nation in Latin America, facing sophisticated local and international threat actors. A vibrant criminal underground produces Brazil-specific malware (banking trojans like Grandoreiro) that has gone global.",
      good: "LGPD drives data privacy awareness. Brazilian cybersecurity companies are increasingly sophisticated.",
      bad: "Massive wealth inequality drives cybercrime growth. Government systems chronically underfunded.",
      ugly: "Superior Electoral Court hack during 2022 elections. Brazilian banking trojans affected 60+ countries globally.",
      aware: "Pix fraud is endemic. QR code poisoning is the fastest-growing attack vector.",
      recommended: "Pix transaction monitoring and anomaly detection. Enhanced LGPD enforcement.",
    },
    stats: { breaches: 1567, malwareRate: 71, avgBreach: '$1.8M', criticalVulns: 289 },
    headlines: [
      { title: 'Grandoreiro banking trojan returns with AI-enhanced capabilities', date: '2026-05-11', severity: 'high' },
      { title: 'Brazilian government databases exposed in massive data leak', date: '2026-05-07', severity: 'critical' },
      { title: 'Pix fraud losses reach R$2B in 2026 Q1, up 180% year-over-year', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "Brazil's 2026 threat landscape is dominated by sophisticated domestic cybercrime with international reach. DAYE assesses HIGH risk for financial sector. Brazilian banking malware developers represent world-class criminal capability.",
  },

  // ─── Africa ───────────────────────────────────────────────────────────────
  {
    code: 'ZA', name: 'South Africa', lat: -25.75, lon: 28.19,
    threatLevel: 7.5, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "South Africa is Africa's most digitized economy and its most targeted nation in cyberspace. The financial services sector, government entities, and critical infrastructure face persistent attacks from both domestic and international threat actors.",
      good: "CSIRT-SA coordinates national incident response. Strong financial sector cybersecurity frameworks. Growing private sector expertise.",
      bad: "Load-shedding forces reliance on vulnerable backup systems. High unemployment drives cybercrime recruitment.",
      ugly: "Transnet ransomware attack (2021) paralyzed port operations, costing hundreds of millions. Department of Justice breach exposed court records of millions.",
      aware: "RICA SIM-swap fraud is endemic. Online banking fraud via social engineering is the primary attack vector for consumers.",
      recommended: "Enhanced monitoring for industrial control systems. National cybersecurity skills development programs.",
    },
    stats: { breaches: 1876, malwareRate: 69, avgBreach: '$2.98M', criticalVulns: 213 },
    headlines: [
      { title: 'South African banks report coordinated ATM jackpotting campaign', date: '2026-05-13', severity: 'high' },
      { title: 'CSIRT-SA warns of ransomware surge targeting municipal governments', date: '2026-05-09', severity: 'high' },
      { title: 'Chinese APT group targeting South African critical minerals sector', date: '2026-05-04', severity: 'critical' },
    ],
    dayeIntelligence: "South Africa's 2026 cyber threat profile reflects its status as Africa's economic gateway. DAYE assesses HIGH risk for financial services and critical infrastructure. Chinese state actors are increasingly targeting platinum and rare-earth mining operations.",
  },
  {
    code: 'NG', name: 'Nigeria', lat: 9.07, lon: 7.4,
    threatLevel: 7.8, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Nigeria is simultaneously Africa's largest economy and a major origin point for global cybercrime. Business Email Compromise (BEC) and advance-fee fraud originating from Nigeria cost global businesses billions annually. The government is actively working to counter this reputation.",
      good: "NITDA and the Nigeria Cybercrime Advisory Council are increasingly active. Growing fintech ecosystem is driving security investment.",
      bad: "Weak law enforcement follow-through on cybercrime cases. High youth unemployment fuels criminal recruitment into cyber fraud networks.",
      ugly: "BEC groups like SilverTerrier (operating from Nigeria) have defrauded thousands of companies globally. Nigeria is one of the top five BEC source nations.",
      aware: "Any unsolicited financial opportunity emails from Nigerian domains should be treated as high-risk. BEC attacks increasingly use deepfake audio.",
      recommended: "Mandatory BEC training for finance staff. Multi-person authorization for all wire transfers. DMARC enforcement for all corporate domains.",
    },
    stats: { breaches: 1243, malwareRate: 73, avgBreach: '$1.6M', criticalVulns: 187 },
    headlines: [
      { title: 'EFCC arrests 40 suspected BEC operators in Lagos coordinated raid', date: '2026-05-14', severity: 'high' },
      { title: 'Nigerian fintech sector hit by wave of API exploitation attacks', date: '2026-05-09', severity: 'high' },
      { title: 'BEC losses to Nigerian-origin groups exceed $2.5B globally in Q1 2026', date: '2026-05-03', severity: 'critical' },
    ],
    dayeIntelligence: "Nigeria's 2026 cyber threat profile is dominated by organized financial fraud with global reach. DAYE assesses HIGH risk for any organization receiving financial communications from West Africa. State-sponsored activity is emerging in addition to criminal operations.",
  },
  {
    code: 'EG', name: 'Egypt', lat: 30.06, lon: 31.25,
    threatLevel: 7.2, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Egypt occupies a strategic position as Africa's second-largest economy and a key internet transit hub. Cyberattacks against government infrastructure, financial institutions, and critical systems from both regional rivals and hacktivists are frequent.",
      good: "EG-CERT has significantly improved national incident response. Suez Canal infrastructure benefits from multilayer security.",
      bad: "Political tensions drive hacktivism and state-level cyber operations against critics.",
      ugly: "Iranian-linked hackers attempted to compromise Suez Canal control systems in 2024 — a breach could have had catastrophic global trade implications.",
      aware: "Egyptian government websites are frequent targets of regional hacktivists. Phishing campaigns impersonating Egyptian banks are widespread.",
      recommended: "Protect Suez Canal infrastructure with air-gapped industrial networks. Implement strict access controls for critical national infrastructure.",
    },
    stats: { breaches: 987, malwareRate: 65, avgBreach: '$1.9M', criticalVulns: 156 },
    headlines: [
      { title: "Iranian APT attempts infiltration of Egypt's maritime systems", date: '2026-05-11', severity: 'critical' },
      { title: 'Egyptian Central Bank issues alert on mobile banking fraud surge', date: '2026-05-07', severity: 'high' },
      { title: 'State-linked hackers target Egyptian opposition media outlets', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "Egypt's 2026 threat posture reflects regional geopolitical tensions. DAYE assesses HIGH risk especially for Suez Canal infrastructure and government systems. Iranian and Israeli state actors periodically target Egyptian critical infrastructure as geopolitical leverage.",
  },
  {
    code: 'KE', name: 'Kenya', lat: -1.28, lon: 36.82,
    threatLevel: 7.0, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Kenya is Africa's Silicon Savannah — home to the largest tech ecosystem on the continent. M-Pesa's dominance in mobile money makes Kenya a prime target for financial cybercrime. The government has significant digital ambitions but faces growing threats.",
      good: "Nairobi's thriving tech startup ecosystem is creating domestic cybersecurity capacity. CERT-KE is actively engaged.",
      bad: "M-Pesa fraud is epidemic. SIM-swap attacks targeting mobile money accounts cost Kenyans billions of shillings annually.",
      ugly: "eCitizen portal breach (2023) disrupted government services for weeks. Chinese APTs targeted Kenya's Standard Gauge Railway control systems.",
      aware: "M-Pesa SIM-swap fraud is the most prevalent attack. Social engineering via WhatsApp is primary vector for most Kenyan internet users.",
      recommended: "Mandatory M-Pesa security education. Stronger telecom SIM-swap controls. Government portal penetration testing.",
    },
    stats: { breaches: 678, malwareRate: 61, avgBreach: '$0.9M', criticalVulns: 134 },
    headlines: [
      { title: 'M-Pesa fraud networks bust: KSh 2B recovered in 3-country operation', date: '2026-05-12', severity: 'high' },
      { title: 'Chinese APT targets Kenyan railway and port infrastructure', date: '2026-05-08', severity: 'critical' },
      { title: "Safaricom reports 300% surge in SIM-swap fraud attempts in Q1 2026", date: '2026-05-03', severity: 'high' },
    ],
    dayeIntelligence: "Kenya's 2026 cyber risk is shaped by its position as Africa's digital hub. DAYE assesses HIGH risk for mobile financial services and Chinese-built infrastructure. The Belt and Road-linked railway and port systems present significant espionage vectors.",
  },
  {
    code: 'MA', name: 'Morocco', lat: 34.02, lon: -6.84,
    threatLevel: 6.8, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Morocco is North Africa's most digitally advanced nation and a critical data hub connecting Europe and Africa. The kingdom faces sophisticated APT campaigns from Algerian state actors and Iranian proxies, alongside hacktivism linked to Western Sahara disputes.",
      good: "DGSSI (Moroccan cybersecurity agency) is among Africa's most professional. Growing cybersecurity talent pool from technical universities.",
      bad: "Persistent low-level cyberwar with Algeria affects government infrastructure. Espionage targeting phosphate industry (critical global resource).",
      ugly: "Pegasus spyware was used by Moroccan authorities to surveil journalists, human rights workers, and foreign heads of state.",
      aware: "Any communications involving Western Sahara politics may trigger surveillance. Phosphate sector supply chains are espionage targets.",
      recommended: "Government officials should use hardened devices. Phosphate OCP Group systems require enhanced monitoring.",
    },
    stats: { breaches: 567, malwareRate: 59, avgBreach: '$2.1M', criticalVulns: 98 },
    headlines: [
      { title: 'Algerian-linked hacktivists deface 200+ Moroccan government sites', date: '2026-05-13', severity: 'high' },
      { title: "Morocco's phosphate giant OCP reports industrial espionage attempt", date: '2026-05-08', severity: 'high' },
      { title: 'DGSSI warns of Iranian phishing targeting Moroccan financial institutions', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "Morocco's 2026 threat landscape is shaped by regional rivalries and its strategic position. DAYE assesses HIGH risk from Algerian state actors and Iranian-aligned groups. Phosphate sector is a critical espionage target given global food security dependence.",
  },
  {
    code: 'ET', name: 'Ethiopia', lat: 9.03, lon: 38.74,
    threatLevel: 6.7, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Ethiopia, Africa's second most populous nation, is undergoing rapid digital transformation amid significant political instability. The Tigray conflict created a cyber dimension with both domestic and foreign threat actors exploiting the crisis.",
      good: "EthioTelecom modernization is expanding connectivity. Government investment in digital infrastructure.",
      bad: "Internet shutdowns used as political tools. Tigray conflict generated significant cyber espionage activity. Weak institutional cybersecurity capacity.",
      ugly: "Spyware tools including FinFisher were used to surveil Ethiopian political dissidents globally. State actor attacks on Tigray communications infrastructure documented.",
      aware: "Any communications involving Ethiopian political opposition faces surveillance risk. Telecom infrastructure is geopolitically vulnerable.",
      recommended: "Use encrypted communications for sensitive matters. Ethiopian businesses should implement robust email security.",
    },
    stats: { breaches: 445, malwareRate: 67, avgBreach: '$0.7M', criticalVulns: 112 },
    headlines: [
      { title: 'Ethiopian government deploys spyware against diaspora journalists', date: '2026-05-11', severity: 'high' },
      { title: 'EthioTelecom hit by DDoS attacks during Amhara region unrest', date: '2026-05-07', severity: 'high' },
      { title: 'Chinese infrastructure contractor systems breached in Addis Ababa', date: '2026-05-03', severity: 'high' },
    ],
    dayeIntelligence: "Ethiopia's 2026 cyber risk reflects political instability and rapid digitization without adequate security maturity. DAYE assesses HIGH risk, particularly for communications infrastructure and any organizations connected to political conflict zones.",
  },
  {
    code: 'SO', name: 'Somalia', lat: 2.05, lon: 45.34,
    threatLevel: 9.2, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "Somalia's failed state status has made it a safe harbor for cybercriminal networks operating with near-total impunity. The country's territory is used to route cyberattacks, launder funds, and harbor operators who evade international law enforcement.",
      good: "Al-Shabaab's limited technical sophistication constrains the most dangerous threat actors. Mobile money (EVC Plus, Hormuud) is creating some financial infrastructure.",
      bad: "No functional national CERT. No enforceable cybercrime laws. Safe harbor for international criminal networks.",
      ugly: "Somali-based criminal networks handle financial fraud proceeds for international groups. Piracy networks have expanded into digital extortion.",
      aware: "Somali IP space is frequently used to obfuscate attacks originating elsewhere. Mobile money systems lack regulatory oversight.",
      recommended: "Block all unverified Somali IP ranges in enterprise environments. Flag any financial transactions involving Somali mobile money platforms.",
    },
    stats: { breaches: 89, malwareRate: 91, avgBreach: '$0.4M', criticalVulns: 12 },
    headlines: [
      { title: 'Al-Shabaab deploys encrypted comms platform to evade surveillance', date: '2026-05-10', severity: 'critical' },
      { title: 'Mogadishu financial networks exploited for international money laundering', date: '2026-05-06', severity: 'critical' },
      { title: 'UN report: Somali territory hosting servers for international ransomware groups', date: '2026-05-02', severity: 'critical' },
    ],
    dayeIntelligence: "Somalia represents a CRITICAL ungoverned cyber space in 2026. DAYE assesses extreme risk as a safe harbor for criminal infrastructure. Al-Shabaab's growing interest in cyber operations as a fundraising mechanism poses a new regional threat vector.",
  },
  {
    code: 'LY', name: 'Libya', lat: 32.9, lon: 13.18,
    threatLevel: 8.8, threatLabel: 'CRITICAL',
    color: '#FF2D2D',
    situation: {
      overview: "Libya's continued fragmentation between competing governments and militia factions has created a cybercrime safe haven. Wagner Group (now Africa Corps) presence has introduced sophisticated Russian cyber capabilities into an already unstable environment.",
      good: "Libyan oil infrastructure has some international-standard protection due to foreign energy company involvement.",
      bad: "Multiple competing authorities with no unified cybersecurity framework. Russian mercenary presence introduces sophisticated threat actors.",
      ugly: "Russian Africa Corps (formerly Wagner) uses Libyan infrastructure to route cyber operations against European targets. Oil field control systems have been targeted by multiple factions.",
      aware: "Any Libyan IP ranges may route Russian-origin attacks. Energy sector personnel operating in Libya face sophisticated surveillance.",
      recommended: "Energy sector companies operating in Libya should implement crisis-level security protocols. Assume all communications are monitored.",
    },
    stats: { breaches: 178, malwareRate: 84, avgBreach: '$1.2M', criticalVulns: 67 },
    headlines: [
      { title: 'Russian Africa Corps deploys cyber units from Libyan bases targeting EU', date: '2026-05-14', severity: 'critical' },
      { title: 'Libyan oil terminal control systems breached in faction conflict', date: '2026-05-09', severity: 'critical' },
      { title: 'Multiple Libyan banks paralyzed by competing faction cyber operations', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "Libya in 2026 represents a CRITICAL threat node where Russian, Turkish, and regional state actors operate freely. DAYE assesses CRITICAL risk for any European or energy sector organizations with Libyan exposure. Russian use of Libyan infrastructure for EU-targeted operations is a confirmed and escalating pattern.",
  },
  {
    code: 'DZ', name: 'Algeria', lat: 36.74, lon: 3.06,
    threatLevel: 6.2, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Algeria, Africa's largest country by area, maintains a sophisticated state security apparatus that extends into cyberspace. The government conducts surveillance of dissidents and opposition figures while facing external threats from Moroccan-linked and jihadist groups.",
      good: "ANSI (national cybersecurity agency) has strong government backing. Strategic oil/gas infrastructure receives enhanced protection.",
      bad: "Authoritarian surveillance infrastructure is turned against civil society. Limited transparency about breaches affecting citizens.",
      ugly: "State surveillance tools used against journalists and Hirak protest movement. Algerian-linked hacktivists conduct regular campaigns against Morocco.",
      aware: "Political communications involving Algeria carry significant surveillance risk. Energy sector contractors face sophisticated espionage.",
      recommended: "Use end-to-end encryption for all sensitive communications. Energy sector OT/IT segregation is critical.",
    },
    stats: { breaches: 387, malwareRate: 56, avgBreach: '$1.7M', criticalVulns: 89 },
    headlines: [
      { title: 'Algerian state hackers target Moroccan military communications', date: '2026-05-12', severity: 'high' },
      { title: 'Sonatrach gas infrastructure targeted in sophisticated intrusion attempt', date: '2026-05-08', severity: 'critical' },
      { title: 'ANSI issues alert on foreign intelligence targeting Algerian defense industry', date: '2026-05-03', severity: 'high' },
    ],
    dayeIntelligence: "Algeria's 2026 cyber posture reflects its position as a regional power with authoritarian security tendencies. DAYE assesses HIGH risk particularly for energy infrastructure and politically exposed persons. Algeria-Morocco cyber tensions show no sign of de-escalation.",
  },
  {
    code: 'TN', name: 'Tunisia', lat: 36.81, lon: 10.18,
    threatLevel: 6.5, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Tunisia's democratic transition stalled under President Saied's power consolidation, creating increased state surveillance alongside genuine external cyber threats. The country's digitally sophisticated population and growing tech sector create both opportunities and vulnerabilities.",
      good: "Relatively high digital literacy. Growing cybersecurity startup ecosystem. CERT-TCC provides reasonable national coordination.",
      bad: "Political crackdown has weaponized cyber surveillance against critics. Economic crisis forces talented cybersecurity professionals to emigrate.",
      ugly: "Opposition figures and journalists face persistent state-sponsored surveillance. Cybercrime groups exploit political chaos.",
      aware: "Tunisian political activists and diaspora face surveillance from state actors. Financial sector facing increasing fraud.",
      recommended: "Civil society organizations should adopt secure communication tools. Financial institutions need enhanced fraud monitoring.",
    },
    stats: { breaches: 298, malwareRate: 58, avgBreach: '$1.4M', criticalVulns: 76 },
    headlines: [
      { title: 'Tunisian authorities deploy commercial spyware against political opposition', date: '2026-05-11', severity: 'high' },
      { title: 'CERT-TCC warns of phishing campaign targeting Tunisian civil servants', date: '2026-05-07', severity: 'high' },
      { title: "Ransomware attack disrupts Tunisia's national health information system", date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "Tunisia's 2026 cyber threat reflects political regression combined with genuine external threats. DAYE assesses HIGH risk for civil society organizations and government systems. Regional spillover from Libyan instability creates additional threat vectors.",
  },
  {
    code: 'GH', name: 'Ghana', lat: 5.56, lon: -0.2,
    threatLevel: 5.8, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Ghana is West Africa's most stable democracy and a growing tech hub. Accra's emerging startup ecosystem has earned it the nickname 'Silicon Valley of West Africa.' However, rapid digitization has outpaced security investment.",
      good: "Political stability creates better security governance than regional peers. Ghana's Cybersecurity Authority is developing national capacity.",
      bad: "Sakawa (a local term for internet fraud combining cybercrime with occultism) remains a significant cultural problem. Limited cybersecurity talent pool.",
      ugly: "Ghana-based fraud networks have defrauded victims in Europe and North America of hundreds of millions over the past decade.",
      aware: "Romance scams and investment fraud originating from Ghana are widespread. Government procurement fraud via BEC is a significant risk.",
      recommended: "Enhanced due diligence on all financial transactions with West African counterparts. Staff awareness training on romance and investment scams.",
    },
    stats: { breaches: 234, malwareRate: 62, avgBreach: '$0.8M', criticalVulns: 67 },
    headlines: [
      { title: 'Ghana Cybersecurity Authority dismantles major fraud network in Kumasi', date: '2026-05-10', severity: 'high' },
      { title: 'Mobile money fraud losses reach GHS 800M in 2026 first quarter', date: '2026-05-06', severity: 'high' },
      { title: 'Accra tech startup ecosystem targeted in IP theft campaign', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Ghana's 2026 cyber profile reflects its dual role as a regional tech leader and persistent source of financial fraud. DAYE assesses ELEVATED risk, with key concerns around fraud networks and inadequate controls on the growing fintech sector.",
  },
  {
    code: 'SD', name: 'Sudan', lat: 15.55, lon: 32.53,
    threatLevel: 6.3, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Sudan's catastrophic civil war between the SAF and RSF has devastated digital infrastructure. Telecommunications have been weaponized, with both sides conducting influence operations and targeting each other's command systems. The humanitarian crisis creates a permissive environment for cybercrime.",
      good: "Limited digital dependence somewhat reduces the attack surface for critical infrastructure.",
      bad: "Active civil war has destroyed much of Sudan's cybersecurity capacity. Both warring factions use cyber tools against civilians.",
      ugly: "RSF-linked actors deliberately targeted Sudanese internet infrastructure to prevent documentation of human rights abuses. Displacement of 8M people has created massive digital identity fraud.",
      aware: "Any humanitarian or business operations in Sudan face active interception. Both warring factions conduct surveillance on communications.",
      recommended: "Humanitarian organizations operating in Sudan should use highest-level secure communications. Satellite communications preferred over terrestrial networks.",
    },
    stats: { breaches: 167, malwareRate: 78, avgBreach: '$0.5M', criticalVulns: 45 },
    headlines: [
      { title: 'RSF deploys cyber units to disrupt SAF logistics and communications', date: '2026-05-13', severity: 'critical' },
      { title: 'Sudan internet infrastructure collapses in Khartoum fighting', date: '2026-05-09', severity: 'critical' },
      { title: 'UN agencies report cyber-enabled identity fraud targeting Sudanese refugees', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "Sudan in 2026 represents an active conflict zone where cyber operations are embedded in conventional warfare. DAYE assesses HIGH risk for all organizations operating in or adjacent to Sudan. Foreign state actors (UAE, Russia, Iran) are providing cyber capabilities to warring factions.",
  },
  {
    code: 'AO', name: 'Angola', lat: -8.84, lon: 13.23,
    threatLevel: 5.4, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Angola's oil wealth makes it a target for both financial cybercrime and state-sponsored espionage. Chinese infrastructure investment has introduced Huawei network equipment throughout the country, raising surveillance concerns.",
      good: "Oil sector receives significant cybersecurity investment from international energy companies.",
      bad: "Pervasive corruption weakens institutional cybersecurity governance. Chinese network equipment creates surveillance risk.",
      ugly: "Angola's banking sector has been repeatedly exploited for international money laundering. State surveillance of opposition figures is documented.",
      aware: "Telecommunications infrastructure built on Chinese equipment may be subject to PRC access. Oil sector data is a prime espionage target.",
      recommended: "Audit all network equipment for Chinese-manufactured components in sensitive environments. Oil sector should implement strict OT/IT segregation.",
    },
    stats: { breaches: 198, malwareRate: 59, avgBreach: '$1.1M', criticalVulns: 56 },
    headlines: [
      { title: 'Angolan state oil company Sonangol targeted in espionage campaign', date: '2026-05-09', severity: 'high' },
      { title: 'ANAC warns of financial fraud surge targeting Angolan banking sector', date: '2026-05-05', severity: 'high' },
      { title: 'Huawei network audit reveals undocumented access points in Angola telecom', date: '2026-05-01', severity: 'critical' },
    ],
    dayeIntelligence: "Angola's 2026 cyber risk profile is dominated by oil sector espionage and Chinese infrastructure surveillance concerns. DAYE assesses ELEVATED risk particularly for energy sector operations and political communications.",
  },
  {
    code: 'MZ', name: 'Mozambique', lat: -25.97, lon: 32.57,
    threatLevel: 5.2, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Mozambique's natural gas boom in Cabo Delgado has made it a target for sophisticated espionage. The jihadist insurgency has a cyber dimension, and Chinese and Western energy companies compete for intelligence on the critical LNG reserves.",
      good: "LNG project security (Total, ENI) benefits from international standards.",
      bad: "Government cybersecurity capacity is minimal. Insurgency has disrupted infrastructure.",
      ugly: "Insurgent groups have targeted communications infrastructure. LNG project data has been targeted by multiple foreign intelligence services.",
      aware: "Cabo Delgado gas field data is a high-value target for multiple state actors. Government communications are minimally secured.",
      recommended: "LNG operators should apply maximum-security protocols to operational data. Government communications encryption is urgently needed.",
    },
    stats: { breaches: 134, malwareRate: 63, avgBreach: '$0.6M', criticalVulns: 34 },
    headlines: [
      { title: 'LNG project data targeted in sophisticated espionage campaign', date: '2026-05-08', severity: 'high' },
      { title: 'Insurgent groups disrupt mobile networks in northern Mozambique', date: '2026-05-04', severity: 'high' },
      { title: 'Mozambique banking system targeted in regional fraud campaign', date: '2026-04-29', severity: 'medium' },
    ],
    dayeIntelligence: "Mozambique's 2026 threat landscape is dominated by energy sector espionage and conflict-zone cyber risks. DAYE assesses ELEVATED risk particularly for LNG infrastructure and any operations in Cabo Delgado.",
  },
  {
    code: 'MG', name: 'Madagascar', lat: -18.91, lon: 47.54,
    threatLevel: 4.1, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Madagascar's political instability and growing vanilla and mining sectors have attracted cybercriminals. Limited digital infrastructure means cyber threats are primarily financial fraud and mobile money exploitation.",
      good: "Limited digital footprint reduces attack surface for most threats.",
      bad: "Minimal institutional cybersecurity capacity. Vanilla and rare mineral export transactions are fraud targets.",
      ugly: "Vanilla industry payment fraud has cost exporters millions. Mobile money platform vulnerabilities are widely exploited.",
      aware: "Agricultural commodity export transactions are frequent fraud targets. Mobile money security is inadequate.",
      recommended: "Agricultural exporters need enhanced payment verification processes. Mobile money providers need fraud detection systems.",
    },
    stats: { breaches: 67, malwareRate: 58, avgBreach: '$0.3M', criticalVulns: 19 },
    headlines: [
      { title: 'Madagascar vanilla export payment fraud scheme busted', date: '2026-05-07', severity: 'medium' },
      { title: 'Mobile money fraud surge hits Malagasy consumers ahead of elections', date: '2026-05-03', severity: 'medium' },
      { title: 'Mining company systems breached in Antananarivo data theft', date: '2026-04-28', severity: 'high' },
    ],
    dayeIntelligence: "Madagascar presents ELEVATED risk primarily around commodity export fraud and mobile financial crime. DAYE notes growing Chinese interest in the island's rare earth resources creating a new espionage vector.",
  },
  {
    code: 'CM', name: 'Cameroon', lat: 3.87, lon: 11.52,
    threatLevel: 5.5, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Cameroon's anglophone crisis has a significant cyber dimension, with both government and separatist groups using digital tools for propaganda and surveillance. The country bridges Central and West Africa as a regional internet hub.",
      good: "Regional internet exchange point status creates some infrastructure investment.",
      bad: "Government internet shutdowns in anglophone regions have lasted for years. Separatist cyber operations are growing in sophistication.",
      ugly: "Sustained internet shutdowns in Anglophone Cameroon represent one of the world's longest internet blockades. Government surveillance of activists is systematic.",
      aware: "Communications involving the anglophone conflict face near-certain surveillance. NGOs operating in crisis zones face sophisticated targeting.",
      recommended: "Organizations operating in Cameroon should use end-to-end encrypted communications. Minimize digital footprint in conflict-affected regions.",
    },
    stats: { breaches: 156, malwareRate: 64, avgBreach: '$0.6M', criticalVulns: 41 },
    headlines: [
      { title: 'Anglophone separatists claim breach of Cameroonian security services database', date: '2026-05-11', severity: 'high' },
      { title: 'Cameroon extends internet shutdown in conflict zones amid fighting', date: '2026-05-07', severity: 'high' },
      { title: 'Regional cyber fraud network operating from Douala disrupted', date: '2026-05-02', severity: 'medium' },
    ],
    dayeIntelligence: "Cameroon's 2026 threat profile reflects ongoing internal conflict and authoritarian digital control. DAYE assesses ELEVATED risk particularly for civil society and organizations operating near the anglophone conflict.",
  },
  {
    code: 'CI', name: "Côte d'Ivoire", lat: 6.82, lon: -5.27,
    threatLevel: 5.4, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Ivory Coast is West Africa's second-largest economy and home to a growing tech scene in Abidjan. However, cybercrime — particularly financial fraud ('brouteurs') — is deeply embedded in parts of society, exporting fraud globally.",
      good: "Abidjan's tech ecosystem is creating legitimate cybersecurity capacity. CERT-CI provides national coordination.",
      bad: "Brouteurs (a local term for online scammers) operate extensive fraud networks with near-impunity in some areas.",
      ugly: "Côte d'Ivoire-based fraud networks have defrauded European and North American victims of hundreds of millions. The fraud is sometimes linked to ritual practices.",
      aware: "Investment and romance fraud originating from Ivory Coast is widespread. Mobile money platforms are both tools for fraud and targets.",
      recommended: "Financial institutions should flag transactions patterns consistent with West African fraud networks. Staff training on advance-fee variants is essential.",
    },
    stats: { breaches: 189, malwareRate: 67, avgBreach: '$0.7M', criticalVulns: 48 },
    headlines: [
      { title: "Côte d'Ivoire cracks down on brouteur networks in Abidjan sweep", date: '2026-05-10', severity: 'high' },
      { title: 'Mobile money fraud epidemic spreads beyond West Africa via migrant networks', date: '2026-05-06', severity: 'high' },
      { title: 'CERT-CI reports significant increase in attacks on Abidjan financial sector', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Ivory Coast's 2026 cyber risk is characterized by persistent financial fraud operations with global reach and growing attacks on the financial sector. DAYE assesses ELEVATED risk, particularly for European organizations frequently targeted by Ivorian fraud networks.",
  },
  {
    code: 'TZ', name: 'Tanzania', lat: -6.17, lon: 35.74,
    threatLevel: 4.9, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Tanzania's growing economy and Chinese infrastructure investment create a mixed cyber risk landscape. Dar es Salaam's status as a regional port hub makes it a target for both criminal and state espionage.",
      good: "Relatively stable political environment reduces hacktivism. TCRA (Tanzania Communications Regulatory Authority) is active.",
      bad: "Chinese-built port infrastructure raises surveillance concerns. Limited institutional cybersecurity capacity.",
      ugly: "Chinese surveillance infrastructure at Dar es Salaam port has raised Western intelligence concerns about cargo intelligence gathering.",
      aware: "Port logistics data is a target for multiple intelligence services. Mobile financial fraud is growing rapidly.",
      recommended: "Port operators should audit Chinese-installed systems for undocumented access. Mobile money providers need enhanced fraud controls.",
    },
    stats: { breaches: 145, malwareRate: 57, avgBreach: '$0.5M', criticalVulns: 38 },
    headlines: [
      { title: 'Dar es Salaam port systems flagged in Chinese surveillance audit', date: '2026-05-09', severity: 'high' },
      { title: 'Tanzania mobile money fraud rises 200% driven by SIM-swap attacks', date: '2026-05-05', severity: 'high' },
      { title: 'Tanzanian government rejects CERT partnership citing sovereignty concerns', date: '2026-04-30', severity: 'medium' },
    ],
    dayeIntelligence: "Tanzania's ELEVATED risk profile is shaped by Chinese infrastructure concerns and rapid mobile financial fraud growth. DAYE notes the strategic importance of Dar es Salaam port as an intelligence gathering target for multiple state actors.",
  },
  {
    code: 'UG', name: 'Uganda', lat: 0.32, lon: 32.58,
    threatLevel: 5.3, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Uganda under President Museveni has developed significant surveillance capabilities used against political opposition. The Pegasus spyware revelations included Ugandan targets. Mobile money is the dominant financial system, creating fraud risks.",
      good: "Growing tech ecosystem in Kampala with active security community.",
      bad: "State surveillance apparatus extensively deployed against civil society and opposition. Weak rule of law enables cybercrime.",
      ugly: "Opposition politician Bobi Wine's phone was confirmed Pegasus-infected. Uganda deployed advanced surveillance before the 2021 elections.",
      aware: "Political communications in Uganda carry high surveillance risk. Mobile money fraud targeting Ugandans and regional victims is widespread.",
      recommended: "Civil society organizations should use hardened communications. Mobile financial providers need stronger fraud controls.",
    },
    stats: { breaches: 134, malwareRate: 64, avgBreach: '$0.4M', criticalVulns: 43 },
    headlines: [
      { title: 'Ugandan opposition figures report new round of device infections', date: '2026-05-12', severity: 'high' },
      { title: 'MTN Uganda reports major spike in SIM-swap fraud cases', date: '2026-05-08', severity: 'high' },
      { title: 'Kampala tech hub targeted in intellectual property theft campaign', date: '2026-05-03', severity: 'medium' },
    ],
    dayeIntelligence: "Uganda's 2026 cyber threat combines state-directed political surveillance with growing financial cybercrime. DAYE assesses ELEVATED risk particularly for civil society, political organizations, and mobile financial services.",
  },
  {
    code: 'ZW', name: 'Zimbabwe', lat: -17.83, lon: 31.05,
    threatLevel: 6.2, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "Zimbabwe's economic crisis has created both desperate cybercriminals and a government that uses digital tools to suppress dissent. Chinese surveillance technology underpins domestic political control while the collapsing economy drives cybercrime.",
      good: "Some institutional cybersecurity capacity inherited from pre-crisis era.",
      bad: "Economic collapse drives talented tech professionals toward cybercrime. State surveillance of opposition is pervasive.",
      ugly: "ZANU-PF government deploys Chinese-sourced surveillance tech against Zimbabwean citizens. Mobile money RTGS fraud is epidemic.",
      aware: "Zimbabwean digital communications carry significant state surveillance risk. Mobile money platforms are primary fraud targets.",
      recommended: "Zimbabwe-linked transactions require enhanced due diligence. Opposition and civil society need secure communication tools.",
    },
    stats: { breaches: 189, malwareRate: 72, avgBreach: '$0.5M', criticalVulns: 56 },
    headlines: [
      { title: 'Zimbabwe deploys Chinese AI surveillance ahead of 2026 elections', date: '2026-05-13', severity: 'high' },
      { title: 'Econet mobile money fraud surge costs Zimbabwean users US$45M', date: '2026-05-09', severity: 'high' },
      { title: 'CIO targets opposition MDC with sophisticated cyber operations', date: '2026-05-04', severity: 'critical' },
    ],
    dayeIntelligence: "Zimbabwe's 2026 cyber threat profile reflects authoritarian control combined with criminal opportunism driven by economic desperation. DAYE assesses HIGH risk for political organizations and mobile financial services.",
  },
  {
    code: 'ZM', name: 'Zambia', lat: -15.42, lon: 28.28,
    threatLevel: 5.1, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Zambia's copper-dependent economy and Chinese infrastructure investment create targeted espionage risks. The country's growing fintech sector has attracted financial cybercrime, while government systems remain inadequately protected.",
      good: "Democratic governance improvements under HH Hichilema's government. Growing focus on institutional cybersecurity.",
      bad: "Copper mining sector data is a significant espionage target. Limited cybersecurity talent pool.",
      ugly: "Chinese-built government IT systems have been flagged for potential surveillance backdoors by multiple Western intelligence partners.",
      aware: "Mining sector data is a high-value espionage target. Government IT systems may contain undocumented Chinese access capabilities.",
      recommended: "Audit all Chinese-sourced government IT systems. Copper sector companies need enhanced data protection protocols.",
    },
    stats: { breaches: 112, malwareRate: 58, avgBreach: '$0.5M', criticalVulns: 32 },
    headlines: [
      { title: 'Zambia audits Chinese government IT systems for surveillance capabilities', date: '2026-05-10', severity: 'high' },
      { title: 'Copperbelt mining companies targeted in coordinated espionage campaign', date: '2026-05-06', severity: 'high' },
      { title: 'Lusaka fintech companies report surge in API attacks', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Zambia's ELEVATED risk reflects Chinese infrastructure concerns and resource sector espionage. DAYE notes Zambia's proactive stance on auditing Chinese systems as a positive signal, but the audit itself may trigger retaliatory cyber activity.",
  },
  {
    code: 'SN', name: 'Senegal', lat: 14.72, lon: -17.47,
    threatLevel: 5.5, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Senegal is one of West Africa's most stable democracies and a growing tech hub. Dakar hosts several major fiber optic cable landing stations, making it critical West African internet infrastructure. The 2024 political crisis introduced a cyber dimension to political instability.",
      good: "Stable governance and growing tech sector. ADIE manages government IT with reasonable competence.",
      bad: "Political crisis of 2024 created state-sponsored surveillance concerns. Internet cable landing stations are high-value targets.",
      ugly: "Government use of phone hacking tools against opposition documented during Sonko crisis. Critical internet infrastructure concentration in Dakar creates chokepoint risk.",
      aware: "Senegal's undersea cable landing stations are high-value targets for any actor wanting to disrupt West African internet.",
      recommended: "Protect undersea cable facilities with enhanced physical and cyber security. Political organizations need secure communications.",
    },
    stats: { breaches: 123, malwareRate: 56, avgBreach: '$0.6M', criticalVulns: 36 },
    headlines: [
      { title: 'Dakar cable landing station reports unusual scanning activity', date: '2026-05-11', severity: 'high' },
      { title: 'Senegalese opposition claims government cyberattacks on party communications', date: '2026-05-07', severity: 'high' },
      { title: 'ADIE reports sharp increase in attacks on government digital services', date: '2026-05-02', severity: 'medium' },
    ],
    dayeIntelligence: "Senegal's ELEVATED risk reflects its strategic position as West Africa's internet hub. DAYE identifies undersea cable infrastructure as a critical vulnerability. Political tensions create additional cyber risk from both state and non-state actors.",
  },
  {
    code: 'RW', name: 'Rwanda', lat: -1.95, lon: 30.06,
    threatLevel: 5.0, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Rwanda punches well above its weight in cybersecurity, with Africa's first national cybersecurity framework and one of the continent's most developed institutional responses. However, the government's use of Pegasus spyware against dissidents globally has tarnished its reputation.",
      good: "NCSA (National Cyber Security Authority) is one of Africa's most professional. Kigali is a growing tech hub. Strong government digital services.",
      bad: "Pegasus spyware revelations showed Rwanda conducting sophisticated surveillance on dissidents in multiple countries.",
      ugly: "Paul Rusesabagina's phone and those of multiple diaspora dissidents were confirmed compromised with Pegasus spyware operated by Rwandan authorities.",
      aware: "Any individual perceived as opposing the Rwandan government faces sophisticated surveillance regardless of location.",
      recommended: "Organizations linked to Rwandan political opposition should use maximum-security communications. Despite strong institutional capacity, trust in government digital services should be calibrated.",
    },
    stats: { breaches: 89, malwareRate: 48, avgBreach: '$0.5M', criticalVulns: 28 },
    headlines: [
      { title: 'New Pegasus infections confirmed on Rwandan diaspora devices in France', date: '2026-05-12', severity: 'critical' },
      { title: "Rwanda's NCSA ranked top 5 in Africa's cybersecurity maturity index", date: '2026-05-08', severity: 'low' },
      { title: 'Kigali Innovation City reports growth despite regional cyber tensions', date: '2026-05-03', severity: 'low' },
    ],
    dayeIntelligence: "Rwanda presents a paradox: excellent institutional cybersecurity combined with documented offensive surveillance against dissidents globally. DAYE assesses ELEVATED risk specifically for individuals perceived as opponents of the Kagame government, who face sophisticated targeting regardless of location.",
  },
  {
    code: 'CD', name: 'DR Congo', lat: -4.33, lon: 15.32,
    threatLevel: 6.5, threatLabel: 'HIGH',
    color: '#FF9500',
    situation: {
      overview: "The Democratic Republic of Congo's coltan and cobalt resources — critical for global electronics and EV batteries — make it a high-value espionage target for multiple state actors. Active conflict zones, weak governance, and M23/Rwanda tensions create a dangerous cyber environment.",
      good: "Mining multinationals operating in DRC maintain international-standard security for their operations.",
      bad: "Catastrophic governance failures mean no effective national cybersecurity. Active conflict creates surveillance free-for-all.",
      ugly: "Multiple Chinese, American, and regional intelligence services conduct continuous espionage on DRC mining data. M23 conflict has a significant cyber component with Rwanda allegedly providing cyber support.",
      aware: "Mineral sector data is among the world's most contested intelligence targets. Humanitarian workers face surveillance from multiple parties.",
      recommended: "Mining companies should treat all DRC communications as compromised. Humanitarian organizations need secure protocols for conflict zone operations.",
    },
    stats: { breaches: 234, malwareRate: 75, avgBreach: '$0.8M', criticalVulns: 67 },
    headlines: [
      { title: 'Multiple intelligence services target DRC cobalt mining data simultaneously', date: '2026-05-14', severity: 'critical' },
      { title: 'M23 conflict drives surge in communications interception in eastern DRC', date: '2026-05-10', severity: 'critical' },
      { title: 'Kinshasa government systems breached in suspected state espionage', date: '2026-05-05', severity: 'high' },
    ],
    dayeIntelligence: "DRC in 2026 is a cyberspace battleground where multiple great powers compete for mineral intelligence. DAYE assesses HIGH risk for all organizations operating in DRC. Chinese, American, and regional state actors conduct persistent operations against mineral sector targets.",
  },
  {
    code: 'ML', name: 'Mali', lat: 12.65, lon: -8.0,
    threatLevel: 5.2, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Mali's expulsion of French forces and alignment with Russia's Africa Corps has introduced sophisticated Russian cyber capabilities into the Sahel's most unstable country. Jihadist groups operate with increasing cyber sophistication.",
      good: "Very limited digital infrastructure reduces attack surface for most threats.",
      bad: "Russia's Africa Corps presence introduces sophisticated threat actors. Jihadist groups use encrypted communications effectively.",
      ugly: "Russian Wagner/Africa Corps forces provide signals intelligence against French and Western forces using Mali as a base. This represents direct Russian military cyber activity in the Sahel.",
      aware: "Any operations involving the Malian state should be treated as potentially exposed to Russian intelligence. Jihadist groups target NGO communications.",
      recommended: "Organizations operating in Mali should treat all digital communications as compromised. Humanitarian workers need satellite communications isolated from local networks.",
    },
    stats: { breaches: 78, malwareRate: 69, avgBreach: '$0.3M', criticalVulns: 23 },
    headlines: [
      { title: 'Russian Africa Corps deploys cyber units against French interests in Bamako', date: '2026-05-13', severity: 'critical' },
      { title: 'JNIM jihadist group exploits Malian telecom vulnerabilities for coordination', date: '2026-05-09', severity: 'high' },
      { title: 'Mali government cuts remaining Western cybersecurity partnerships', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "Mali in 2026 is a critical nexus point for Russian cyber operations in the Sahel. DAYE assesses ELEVATED risk for all Western-affiliated organizations. Russian intelligence access via Africa Corps presents a CRITICAL threat to any French, EU, or NATO interests operating in or near Mali.",
  },
  {
    code: 'BF', name: 'Burkina Faso', lat: 12.37, lon: -1.53,
    threatLevel: 4.8, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Like its Sahel neighbors, Burkina Faso's military junta has expelled French forces and welcomed Russian presence. Jihadist insurgency dominates security concerns, with a growing cyber dimension to the conflict.",
      good: "Limited digital infrastructure constrains sophisticated cyber attacks.",
      bad: "Military junta with Russian alignment creates adversarial environment for Western organizations.",
      ugly: "Systematic attacks on humanitarian worker communications by jihadist groups. Russian intelligence gathering through Africa Corps advisory mission.",
      aware: "Any Western-affiliated operations in Burkina Faso face both jihadist and Russian intelligence threats.",
      recommended: "Minimize digital footprint in Burkina Faso. Essential communications should use satellite systems independent of local infrastructure.",
    },
    stats: { breaches: 56, malwareRate: 66, avgBreach: '$0.2M', criticalVulns: 16 },
    headlines: [
      { title: 'Burkina Faso junta expels last French cyber cooperation team', date: '2026-05-12', severity: 'high' },
      { title: 'JNIM disrupts mobile networks in Sahel campaign to isolate communities', date: '2026-05-08', severity: 'high' },
      { title: 'Russian signals intelligence unit confirmed operating near Ouagadougou', date: '2026-05-03', severity: 'critical' },
    ],
    dayeIntelligence: "Burkina Faso presents ELEVATED cyber risk due to Russian presence and jihadist operations. DAYE notes the Sahel's transformation into a Russian intelligence platform targeting Western interests throughout the region.",
  },
  {
    code: 'NE', name: 'Niger', lat: 13.51, lon: 2.12,
    threatLevel: 4.5, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Niger's 2023 coup expelled French forces and U.S. drone operations, fundamentally reshaping the Sahel security architecture. Russian and Iranian influence is growing in a country that hosts critical uranium mines supplying European nuclear power.",
      good: "Limited digital infrastructure constrains the most sophisticated attacks.",
      bad: "Uranium mining infrastructure now under reduced Western oversight. Russian and Iranian intelligence gathering growing.",
      ugly: "French and U.S. intelligence assets dismantled after coup. Russian advisors now have access to uranium facility data previously protected by Western security partnerships.",
      aware: "Niger's uranium mines are critical to European energy security and therefore high-value intelligence targets for multiple state actors.",
      recommended: "European nuclear energy companies need enhanced monitoring of Niger supply chain security. Uranium sector data should be treated as actively targeted.",
    },
    stats: { breaches: 45, malwareRate: 62, avgBreach: '$0.2M', criticalVulns: 14 },
    headlines: [
      { title: 'Russian advisors gain access to Niger uranium facility systems', date: '2026-05-11', severity: 'critical' },
      { title: 'U.S. intelligence: Niger now primary Russian signals intelligence hub in Sahel', date: '2026-05-07', severity: 'critical' },
      { title: 'AIEA raises concerns over uranium facility security in post-coup Niger', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "Niger's 2026 cyber risk is dominated by its transformation from Western security partner to Russian-aligned state with access to European-critical uranium. DAYE assesses ELEVATED overall risk with CRITICAL subcategory risk for uranium supply chain and European nuclear energy sector.",
  },
  {
    code: 'TD', name: 'Chad', lat: 12.11, lon: 15.04,
    threatLevel: 4.7, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Chad is one of the Sahel's few remaining pro-Western states, hosting French and U.S. military assets. This makes it a target for Russian and Chinese intelligence operations. Oil wealth and political succession disputes create additional cyber dimensions.",
      good: "Maintained Western security partnerships provide some cyber defense support.",
      bad: "Political instability following Idriss Déby's death created uncertainty. Oil sector is target for multiple state actors.",
      ugly: "Chadian oil infrastructure and government communications are targeted by both regional rivals and great powers seeking to influence post-Déby political transition.",
      aware: "As a Western military host nation, Chad faces Russian and Chinese intelligence operations targeting military logistics data.",
      recommended: "Military-adjacent organizations should assume surveillance. Oil sector data requires enhanced protection.",
    },
    stats: { breaches: 56, malwareRate: 63, avgBreach: '$0.3M', criticalVulns: 18 },
    headlines: [
      { title: 'N\'Djamena military installations targeted in suspected Russian cyber operation', date: '2026-05-10', severity: 'high' },
      { title: 'Chadian oil sector faces coordinated data theft campaign', date: '2026-05-06', severity: 'high' },
      { title: 'Political succession crisis drives surge in government comms monitoring', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Chad's ELEVATED risk reflects its strategic position as a Western military partner surrounded by Russian-aligned states. DAYE assesses targeted Russian and Chinese operations against Chadian military and oil sector infrastructure.",
  },
  {
    code: 'SS', name: 'South Sudan', lat: 4.85, lon: 31.6,
    threatLevel: 4.8, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "South Sudan's chronic civil conflict and extreme underdevelopment mean cybersecurity is not a governance priority. Limited digital infrastructure coexists with oil wealth that attracts foreign espionage. UN and humanitarian mission communications are frequent targets.",
      good: "Very limited digital exposure reduces the attack surface for most threats.",
      bad: "Active conflict creates surveillance free-for-all. Oil sector data is targeted by multiple regional actors.",
      ugly: "Warring factions and foreign intelligence services target UN and NGO communications. Oil revenue control is a key objective of cyber-enabled espionage.",
      aware: "Any communications involving oil revenue management or political succession in South Sudan are high-value targets.",
      recommended: "Humanitarian and UN mission communications should use satellite-based encrypted systems. Oil sector data requires maximum protection.",
    },
    stats: { breaches: 34, malwareRate: 71, avgBreach: '$0.3M', criticalVulns: 12 },
    headlines: [
      { title: 'South Sudan oil revenue management systems targeted in espionage', date: '2026-05-09', severity: 'high' },
      { title: 'UN UNMISS mission reports systematic targeting of staff communications', date: '2026-05-05', severity: 'high' },
      { title: 'Warring factions use commercial spyware against each other in Juba', date: '2026-04-30', severity: 'high' },
    ],
    dayeIntelligence: "South Sudan represents an active conflict zone with minimal cybersecurity governance. DAYE assesses ELEVATED risk for humanitarian workers and oil sector operations. Multiple foreign intelligence services maintain active operations around oil infrastructure.",
  },
  {
    code: 'MW', name: 'Malawi', lat: -13.97, lon: 33.79,
    threatLevel: 3.9, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Malawi, one of Africa's poorest nations, has limited digital infrastructure but faces growing mobile money fraud and targeted attacks on its tobacco export sector. Relatively stable democracy provides better governance than many regional peers.",
      good: "Democratic governance provides relatively transparent cybersecurity environment. MACRA provides basic regulatory oversight.",
      bad: "Extremely limited cybersecurity capacity. Tobacco sector payment systems are fraud targets.",
      ugly: "MACRA data breach in 2022 exposed personal data of millions of Malawians. Electoral commission has been hacked during recent elections.",
      aware: "Tobacco export payment fraud is growing. Mobile money platforms lack adequate fraud controls.",
      recommended: "Agricultural export payment verification processes need strengthening. Government database security requires urgent investment.",
    },
    stats: { breaches: 67, malwareRate: 55, avgBreach: '$0.2M', criticalVulns: 19 },
    headlines: [
      { title: 'Malawi Electoral Commission reports breach during voter registration', date: '2026-05-08', severity: 'high' },
      { title: 'Tobacco export companies targeted in payment diversion scam', date: '2026-05-04', severity: 'medium' },
      { title: 'MACRA launches first national cybersecurity awareness campaign', date: '2026-04-29', severity: 'low' },
    ],
    dayeIntelligence: "Malawi's MODERATE risk profile reflects limited digital exposure combined with governance challenges. DAYE identifies electoral infrastructure and tobacco export payments as primary risk areas requiring targeted attention.",
  },
  {
    code: 'GN', name: 'Guinea', lat: 9.54, lon: -13.68,
    threatLevel: 4.7, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Guinea's bauxite wealth — it holds the world's largest reserves — makes it a target for Chinese and Western espionage. The military junta has created political instability with a cyber dimension, and Russian influence is growing.",
      good: "Limited digital infrastructure reduces broad cyber attack surface.",
      bad: "Military junta creates hostile environment for civil society. Bauxite sector data is a high-value espionage target.",
      ugly: "Chinese mining companies operating in Guinea maintain direct communication lines to Beijing potentially bypassing local sovereignty. Russian influence operations are targeting Guinean media.",
      aware: "Bauxite mining data is among the most valuable commodity intelligence targets globally. Political opposition faces surveillance.",
      recommended: "Mining companies should isolate operational data from Chinese-partnered systems. Secure communications essential for civil society.",
    },
    stats: { breaches: 56, malwareRate: 62, avgBreach: '$0.3M', criticalVulns: 17 },
    headlines: [
      { title: 'Chinese mining firms accused of extracting Guinea bauxite data covertly', date: '2026-05-11', severity: 'high' },
      { title: 'Guinea junta deploys Russian-supplied surveillance tools against opposition', date: '2026-05-07', severity: 'high' },
      { title: 'Conakry internet infrastructure disrupted by political protests', date: '2026-05-02', severity: 'medium' },
    ],
    dayeIntelligence: "Guinea's ELEVATED risk is dominated by bauxite sector espionage and authoritarian surveillance. DAYE notes Chinese and Russian competition for influence in Guinea creates a complex multi-actor cyber threat environment.",
  },
  {
    code: 'BJ', name: 'Benin', lat: 6.37, lon: 2.42,
    threatLevel: 3.8, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Benin is a relatively stable democracy and growing digital economy in West Africa. Its position between Nigeria and Togo makes it a transit point for both legitimate trade and cybercriminal operations.",
      good: "Democratic governance and growing institutional capacity. Cotonou's port creates some international standards pressure.",
      bad: "Nigerian cybercrime operations increasingly use Benin as an overflow location. Limited institutional cybersecurity capacity.",
      ugly: "Fraud networks using Benin as a base to evade Nigerian enforcement are growing. Electoral systems have been targeted during contested elections.",
      aware: "Nigerian-origin cybercrime increasingly uses Beninese digital infrastructure to route attacks.",
      recommended: "Strengthen regional cybercrime cooperation with Nigeria. Electoral infrastructure requires enhanced protection.",
    },
    stats: { breaches: 67, malwareRate: 59, avgBreach: '$0.3M', criticalVulns: 18 },
    headlines: [
      { title: 'Benin serves as hub for regional fraud operations targeting Europe', date: '2026-05-10', severity: 'medium' },
      { title: 'Beninese banks targeted in cross-border fraud coordinated from Lagos', date: '2026-05-06', severity: 'high' },
      { title: 'CRIET disrupts cybercrime ring operating across Benin-Nigeria border', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Benin presents MODERATE risk with growing concern about being used as a proxy location for Nigerian cybercrime operations. DAYE recommends monitoring cross-border financial transaction patterns.",
  },
  {
    code: 'BI', name: 'Burundi', lat: -3.43, lon: 29.93,
    threatLevel: 4.8, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Burundi's authoritarian government under President Ndayishimiye uses digital tools to suppress dissent in one of Africa's poorest nations. Post-genocide political tensions and DRC border conflicts create a volatile cyber environment.",
      good: "Very limited digital infrastructure reduces sophisticated attack exposure.",
      bad: "State surveillance of opposition and civil society is pervasive. No meaningful cybersecurity governance.",
      ugly: "Burundian intelligence services conduct surveillance of diaspora opposition in Uganda, Rwanda, and Europe using basic but effective tools.",
      aware: "Burundian diaspora opposition faces surveillance from state intelligence services. NGO communications in Burundi are monitored.",
      recommended: "Organizations working on human rights in Burundi need maximum-security communications. Avoid Burundian digital platforms.",
    },
    stats: { breaches: 34, malwareRate: 67, avgBreach: '$0.1M', criticalVulns: 11 },
    headlines: [
      { title: 'Burundian diaspora activists report surveillance by state-linked hackers', date: '2026-05-09', severity: 'high' },
      { title: 'Mobile network disruptions coincide with political demonstrations', date: '2026-05-05', severity: 'medium' },
      { title: "Burundi blocks opposition media outlets' websites ahead of local elections", date: '2026-04-30', severity: 'high' },
    ],
    dayeIntelligence: "Burundi's ELEVATED risk is primarily political — state use of digital tools for repression rather than sophisticated external attacks. DAYE notes the cross-border surveillance of diaspora opposition as an international concern.",
  },
  {
    code: 'TG', name: 'Togo', lat: 6.14, lon: 1.22,
    threatLevel: 3.9, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Togo is a small but strategically located country in West Africa with a growing digital economy. The Lomé port is a key regional hub. Political opposition faces surveillance, but overall cyber risk is moderate.",
      good: "Relatively stable and small digital footprint. ANSSI-Togo provides basic cyber coordination.",
      bad: "Surveillance of political opposition documented. Lomé port systems are potential targets.",
      ugly: "Government surveillance of opposition using Israeli NSO Group tools confirmed in Citizen Lab research.",
      aware: "Political opposition in Togo faces targeted surveillance. Lomé port trade data may be espionage target.",
      recommended: "Opposition figures need secure communications. Port operators should review network security.",
    },
    stats: { breaches: 45, malwareRate: 54, avgBreach: '$0.2M', criticalVulns: 13 },
    headlines: [
      { title: 'Togo political opposition confirms devices compromised by spyware', date: '2026-05-08', severity: 'high' },
      { title: 'Lomé port systems targeted in cargo intelligence gathering operation', date: '2026-05-04', severity: 'medium' },
      { title: 'ANSSI-Togo launches first national cybersecurity framework', date: '2026-04-29', severity: 'low' },
    ],
    dayeIntelligence: "Togo presents MODERATE risk with a specific political surveillance concern. DAYE notes the confirmation of spyware against opposition figures as indicative of state-directed operations against critics.",
  },
  {
    code: 'SL', name: 'Sierra Leone', lat: 8.49, lon: -13.23,
    threatLevel: 3.6, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Sierra Leone's post-Ebola digital leap has created growing but vulnerable internet infrastructure. The country's diamond and rutile mining sector is a target for commodity price intelligence gathering.",
      good: "Relatively young democratic culture post-conflict. Growing mobile money adoption.",
      bad: "Very limited cybersecurity capacity. Mining sector data inadequately protected.",
      ugly: "Sierra Leone's attempt to use blockchain for elections in 2018 created security questions that remain unresolved. Mining sector data breaches have not been publicly acknowledged.",
      aware: "Diamond and rutile export data is a target for commodity intelligence gathering. Mobile money fraud is growing.",
      recommended: "Mining sector should implement international-standard data protection. Electoral systems need security review.",
    },
    stats: { breaches: 45, malwareRate: 58, avgBreach: '$0.2M', criticalVulns: 12 },
    headlines: [
      { title: 'Sierra Leone electoral commission reports security concerns over voter data', date: '2026-05-07', severity: 'medium' },
      { title: 'Diamond sector payment systems targeted in fraud campaign', date: '2026-05-03', severity: 'medium' },
      { title: 'Mobile money fraud rises sharply in Freetown as adoption grows', date: '2026-04-28', severity: 'medium' },
    ],
    dayeIntelligence: "Sierra Leone presents MODERATE risk with specific concerns around mining sector data and electoral integrity. DAYE recommends targeted security improvements for these critical areas.",
  },
  {
    code: 'LR', name: 'Liberia', lat: 6.3, lon: -10.8,
    threatLevel: 3.5, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Liberia's post-civil war recovery includes growing digital infrastructure, but cybersecurity capacity remains minimal. The country's flag of convenience ship registry creates a specific financial fraud vector.",
      good: "Stable democracy post-conflict. U.S. historical ties provide some security cooperation.",
      bad: "Extremely limited cybersecurity capacity. Ship registry is a fraud vector.",
      ugly: "Liberian ship registry is exploited by fraudsters to register shell company vessels for financial crime. Iron ore sector payment fraud is documented.",
      aware: "Liberian-flagged vessel transactions carry elevated fraud risk due to lax registry oversight.",
      recommended: "Reform ship registry verification processes. Iron ore sector payment verification needs strengthening.",
    },
    stats: { breaches: 34, malwareRate: 56, avgBreach: '$0.2M', criticalVulns: 10 },
    headlines: [
      { title: 'Liberian ship registry exploited in international financial fraud scheme', date: '2026-05-06', severity: 'medium' },
      { title: 'ArcelorMittal Liberia reports attempted intrusion on mining systems', date: '2026-05-02', severity: 'medium' },
      { title: 'Monrovia mobile money fraud surge prompts CBL investigation', date: '2026-04-27', severity: 'medium' },
    ],
    dayeIntelligence: "Liberia presents MODERATE overall risk but a specific ELEVATED risk around ship registry fraud exploitation. DAYE recommends targeted enforcement against shell company vessel registrations.",
  },
  {
    code: 'MR', name: 'Mauritania', lat: 18.08, lon: -15.98,
    threatLevel: 4.2, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Mauritania's strategic position bridging the Maghreb and Sahel, combined with significant iron ore and fishing resources, creates targeted espionage risks. Jihadist groups in the region use Mauritanian territory as a transit zone.",
      good: "Mauritania has successfully avoided major jihadist attacks through intelligence cooperation with France and U.S.",
      bad: "Limited cybersecurity capacity. Iron ore sector data is a target for commodity intelligence.",
      ugly: "Jihadist groups use encrypted communication tools developed with Iranian technical assistance, active in Mauritanian territory.",
      aware: "Iron ore and fishing sector data are espionage targets. Communications near Sahel border areas carry interception risk.",
      recommended: "Iron ore sector needs data protection standards. Border area communications should use encrypted channels.",
    },
    stats: { breaches: 45, malwareRate: 61, avgBreach: '$0.2M', criticalVulns: 14 },
    headlines: [
      { title: "AQIM-affiliated group's encrypted communications intercepted near Mauritania border", date: '2026-05-09', severity: 'high' },
      { title: 'Iron ore sector data breach attributed to industrial espionage', date: '2026-05-05', severity: 'medium' },
      { title: 'Mauritanian ANSSI establishes first national cybersecurity emergency unit', date: '2026-04-30', severity: 'low' },
    ],
    dayeIntelligence: "Mauritania presents ELEVATED risk from jihadist network exploitation and resource sector espionage. DAYE notes the country's strategic importance as a Sahel buffer state makes it increasingly targeted by multiple actors.",
  },
  {
    code: 'ER', name: 'Eritrea', lat: 15.33, lon: 38.93,
    threatLevel: 4.6, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Eritrea, one of the world's most isolated states, has minimal digital infrastructure. However, its conflict with Ethiopia and relationship with Russia and China creates external intelligence targeting of the country's mining interests.",
      good: "Extreme digital isolation limits most cyber threats.",
      bad: "Total state control of communications with no civil liberties. Diaspora faces intensive surveillance.",
      ugly: "Eritrean state uses diaspora networks as enforcement mechanism, with evidence of cyber-enabled surveillance to enforce the 2% diaspora tax and identify dissidents.",
      aware: "Eritrean diaspora faces surveillance by state intelligence. Mining sector data (gold, potash) is a foreign intelligence target.",
      recommended: "Eritrean diaspora communities should use encrypted communications. Mining sector operators need enhanced data protection.",
    },
    stats: { breaches: 23, malwareRate: 64, avgBreach: '$0.2M', criticalVulns: 8 },
    headlines: [
      { title: 'Eritrean diaspora groups report targeting by state surveillance tools', date: '2026-05-08', severity: 'high' },
      { title: 'Bisha gold mine systems targeted in state espionage campaign', date: '2026-05-04', severity: 'medium' },
      { title: 'Human Rights Watch: Eritrea expanding cyber surveillance of diaspora', date: '2026-04-29', severity: 'high' },
    ],
    dayeIntelligence: "Eritrea presents ELEVATED risk primarily through diaspora surveillance and mining sector espionage. DAYE notes the Eritrean state's use of international networks to enforce political control as a unique transnational threat.",
  },
  {
    code: 'NA', name: 'Namibia', lat: -22.56, lon: 17.08,
    threatLevel: 3.7, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Namibia is one of Africa's most stable countries with a relatively well-functioning government. Its diamond, uranium, and rare earth resources create targeted espionage risks despite low overall cyber threat levels.",
      good: "Strong rule of law and democratic governance. NAMPOL cyber unit is growing in capability.",
      bad: "Limited cybersecurity capacity relative to the value of resources being targeted.",
      ugly: "Diamond and uranium sector data is targeted by Chinese and Russian intelligence services. Namibia's recent Chinese deep-water port project raises surveillance concerns.",
      aware: "Resource sector data is disproportionately targeted relative to the country's overall cyber risk profile.",
      recommended: "Enhanced protection for diamond and uranium sector data. Review Chinese-built port infrastructure for surveillance capabilities.",
    },
    stats: { breaches: 56, malwareRate: 47, avgBreach: '$0.5M', criticalVulns: 16 },
    headlines: [
      { title: 'Namibian uranium producer Rossing targeted in industrial espionage attempt', date: '2026-05-07', severity: 'high' },
      { title: 'Chinese-built Walvis Bay port extension flagged in intelligence review', date: '2026-05-03', severity: 'high' },
      { title: 'Namibia Diamonds NamDeb reports suspicious network activity', date: '2026-04-28', severity: 'medium' },
    ],
    dayeIntelligence: "Namibia presents MODERATE overall risk but ELEVATED subcategory risk for resource sector and Chinese-built infrastructure. DAYE recommends specific security measures for mining sector data and review of port infrastructure.",
  },
  {
    code: 'BW', name: 'Botswana', lat: -24.65, lon: 25.91,
    threatLevel: 3.8, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Botswana is one of Africa's most prosperous and well-governed states, built on diamond wealth. Its financial sector sophistication and diamond sector make it a target for both financial fraud and commodity espionage.",
      good: "Excellent governance, anti-corruption, and financial regulation. BOCRA provides active cybersecurity oversight.",
      bad: "Diamond sector data is a high-value espionage target. Growing financial sector creates fraud vectors.",
      ugly: "Debswana (De Beers/government JV) systems have been targeted by sophisticated actors seeking production and pricing data.",
      aware: "Diamond trading intelligence is disproportionately targeted. Financial sector faces growing fraud.",
      recommended: "Debswana and diamond sector companies need enhanced operational security for production and pricing data.",
    },
    stats: { breaches: 67, malwareRate: 44, avgBreach: '$0.6M', criticalVulns: 18 },
    headlines: [
      { title: 'Botswana diamond pricing data targeted in coordinated intelligence operation', date: '2026-05-09', severity: 'high' },
      { title: 'BOCRA warns of growing ransomware threat to Gaborone financial sector', date: '2026-05-05', severity: 'medium' },
      { title: 'Botswana government digital services achieve ISO 27001 certification', date: '2026-04-30', severity: 'low' },
    ],
    dayeIntelligence: "Botswana presents MODERATE overall risk with ELEVATED specific risk for diamond sector intelligence. DAYE commends Botswana's governance model but notes the disproportionate targeting of its diamond wealth by state-level actors.",
  },
  {
    code: 'GA', name: 'Gabon', lat: 0.39, lon: 9.45,
    threatLevel: 4.2, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Gabon's 2023 coup that ousted the Bongo dynasty (in power for 56 years) has created political uncertainty. French-connected oil assets and the transition government's alignment toward Russia creates an evolving cyber threat landscape.",
      good: "Limited digital infrastructure reduces broad attack surface.",
      bad: "Political transition creates governance uncertainty for cybersecurity. Russian influence is growing.",
      ugly: "French intelligence and corporate interests in Gabon's Total Energies operations are targets of the new junta-aligned surveillance apparatus.",
      aware: "Oil sector operations linked to French companies face new surveillance risks under the military junta.",
      recommended: "French-connected oil companies should reassess communications security under the new government. Use encrypted channels for all sensitive operational data.",
    },
    stats: { breaches: 45, malwareRate: 57, avgBreach: '$0.4M', criticalVulns: 14 },
    headlines: [
      { title: 'Gabon junta suspected of targeting French oil company communications', date: '2026-05-10', severity: 'high' },
      { title: 'TotalEnergies Gabon operations face new cybersecurity challenges post-coup', date: '2026-05-06', severity: 'medium' },
      { title: 'Russian intelligence team deployed to Libreville following coup', date: '2026-05-01', severity: 'critical' },
    ],
    dayeIntelligence: "Gabon presents ELEVATED risk following its political transition. DAYE assesses growing Russian intelligence presence as a key threat to French and Western business interests in the country's oil sector.",
  },
  {
    code: 'MU', name: 'Mauritius', lat: -20.16, lon: 57.49,
    threatLevel: 5.3, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Mauritius is one of Africa's most advanced digital economies and a major financial center. Its offshore financial services sector handles billions in cross-African investment flows, making it a significant target for financial intelligence gathering and fraud.",
      good: "Advanced financial regulation and governance. CERT-MU is among Africa's most professional. High digital literacy.",
      bad: "Offshore financial sector is exploited for money laundering by African and global criminal networks.",
      ugly: "Mauritius was placed on FATF grey list in 2021 due to money laundering concerns. Significant illicit fund flows via Mauritius-based holding companies.",
      aware: "Mauritius-based holding companies are frequently used to obscure beneficial ownership. Financial services face sophisticated fraud.",
      recommended: "Enhanced due diligence on Mauritius-domiciled entities. Continue post-FATF grey list reforms.",
    },
    stats: { breaches: 123, malwareRate: 51, avgBreach: '$1.8M', criticalVulns: 34 },
    headlines: [
      { title: 'Mauritius offshore banks targeted in sophisticated money laundering scheme', date: '2026-05-12', severity: 'high' },
      { title: 'CERT-MU detects APT targeting Pan-African investment structures in Port Louis', date: '2026-05-08', severity: 'high' },
      { title: 'Mauritius achieves full FATF compliance but financial crime risks remain', date: '2026-05-03', severity: 'medium' },
    ],
    dayeIntelligence: "Mauritius presents ELEVATED risk due to its role as Africa's premier offshore financial center. DAYE assesses that multiple state and criminal actors target Mauritius-based holding structures for both intelligence gathering and illicit fund flows.",
  },
  {
    code: 'GM', name: 'Gambia', lat: 13.45, lon: -16.58,
    threatLevel: 3.4, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Gambia, Africa's smallest mainland country, has a growing digital economy relative to its size. The post-Jammeh democratic transition created political openness. Limited scale constrains both threats and defenses.",
      good: "Democratic transition has improved governance. Growing mobile money sector.",
      bad: "Very limited cybersecurity capacity. PURA has basic regulatory functions only.",
      ugly: "Jammeh-era surveillance infrastructure has not been fully dismantled. Mobile money fraud is growing.",
      aware: "Mobile money platforms have inadequate fraud controls. Political communications still carry some surveillance risk.",
      recommended: "Mobile financial providers need enhanced fraud detection. Review legacy surveillance infrastructure.",
    },
    stats: { breaches: 23, malwareRate: 53, avgBreach: '$0.1M', criticalVulns: 7 },
    headlines: [
      { title: 'Gambia mobile money platform reports significant fraud cases', date: '2026-05-07', severity: 'medium' },
      { title: 'PURA launches basic cybersecurity awareness campaign nationwide', date: '2026-05-03', severity: 'low' },
      { title: 'Gambian civil society groups report residual state surveillance activity', date: '2026-04-28', severity: 'medium' },
    ],
    dayeIntelligence: "Gambia presents MODERATE and largely manageable cyber risk. DAYE recommends basic capacity building and mobile money security improvements as priority investments.",
  },
  {
    code: 'GW', name: 'Guinea-Bissau', lat: 11.87, lon: -15.6,
    threatLevel: 4.3, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Guinea-Bissau is one of the world's most politically unstable countries and a major drug trafficking transit point. The narco-state characteristics create a permissive environment for financial cybercrime and money laundering facilitation.",
      good: "Very limited digital infrastructure constrains sophisticated attacks.",
      bad: "Drug trafficking networks use Guinea-Bissau's financial system for laundering, creating cybercrime adjacency.",
      ugly: "Multiple coups and narco-state characteristics mean law enforcement is effectively non-functional for cybercrime. Financial fraud proceeds are laundered through Bissau-based networks.",
      aware: "Any financial transactions routed through Guinea-Bissau should be treated with extreme caution.",
      recommended: "Block financial transaction patterns consistent with Guinea-Bissau narco-laundering networks. Enhanced due diligence on any Guinea-Bissau counterparts.",
    },
    stats: { breaches: 18, malwareRate: 66, avgBreach: '$0.1M', criticalVulns: 5 },
    headlines: [
      { title: 'Guinea-Bissau drug networks expand into cyber-enabled money laundering', date: '2026-05-09', severity: 'high' },
      { title: 'Political coup creates security vacuum exploited by criminal networks', date: '2026-05-05', severity: 'high' },
      { title: 'UNODC warns of Guinea-Bissau as growing financial crime hub', date: '2026-04-30', severity: 'high' },
    ],
    dayeIntelligence: "Guinea-Bissau presents ELEVATED risk specifically around financial crime facilitation. DAYE notes the country's narco-state characteristics as a key risk amplifier for cyber-enabled financial fraud.",
  },
  {
    code: 'GQ', name: 'Equatorial Guinea', lat: 3.75, lon: 8.78,
    threatLevel: 4.4, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Equatorial Guinea's oil wealth and Obiang family dictatorship create a kleptocratic environment where cybersecurity serves surveillance rather than protection. Chinese and American intelligence compete for oil sector intelligence.",
      good: "Oil revenue provides resources for some infrastructure protection.",
      bad: "Extreme corruption and kleptocracy mean security resources serve ruling family interests.",
      ugly: "Obiang family uses surveillance infrastructure to monitor any challenge to their power. Foreign oil company data is routinely targeted by Chinese intelligence.",
      aware: "Oil sector operations face Chinese intelligence targeting. Communications in Equatorial Guinea should be assumed monitored.",
      recommended: "Oil sector operators need maximum-security protocols for operational data. Limit digital footprint in country.",
    },
    stats: { breaches: 34, malwareRate: 59, avgBreach: '$0.5M', criticalVulns: 11 },
    headlines: [
      { title: 'Chinese intelligence targeting ExxonMobil Equatorial Guinea operations', date: '2026-05-08', severity: 'high' },
      { title: 'Obiang regime deploys surveillance tools against political opposition', date: '2026-05-04', severity: 'high' },
      { title: 'Oil revenue data leaked exposing massive government embezzlement', date: '2026-04-29', severity: 'medium' },
    ],
    dayeIntelligence: "Equatorial Guinea presents ELEVATED risk primarily around oil sector espionage and authoritarian surveillance. DAYE notes the combination of Chinese intelligence interest and kleptocratic governance creates a uniquely hostile operating environment.",
  },
  {
    code: 'SZ', name: 'Eswatini', lat: -26.32, lon: 31.14,
    threatLevel: 3.3, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Eswatini (formerly Swaziland) is Africa's last absolute monarchy with significant political repression. Limited digital infrastructure and small scale mean cyber threats are primarily political surveillance.",
      good: "Very small scale limits the attack surface.",
      bad: "Absolute monarchy uses digital tools to monitor and suppress democratic movements.",
      ugly: "Pro-democracy activists and labor organizers in Eswatini face surveillance. Protests in 2021 were met with internet shutdowns.",
      aware: "Political activism in Eswatini is monitored. Internet can be shut down without notice during political events.",
      recommended: "Political and civil society actors need secure communications. Maintain offline backup systems for critical operations.",
    },
    stats: { breaches: 19, malwareRate: 48, avgBreach: '$0.1M', criticalVulns: 5 },
    headlines: [
      { title: 'Eswatini pro-democracy activists face digital surveillance crackdown', date: '2026-05-07', severity: 'medium' },
      { title: 'Mobile internet restricted during political demonstrations', date: '2026-05-03', severity: 'medium' },
      { title: 'Eswatini sugar industry targeted in payment fraud scheme', date: '2026-04-28', severity: 'low' },
    ],
    dayeIntelligence: "Eswatini presents MODERATE risk primarily around political surveillance. DAYE notes the authoritarian governance as a human rights concern but a limited cybersecurity threat to commercial operations.",
  },
  {
    code: 'LS', name: 'Lesotho', lat: -29.32, lon: 27.48,
    threatLevel: 3.1, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Lesotho, entirely surrounded by South Africa, has a small but growing digital economy. Political instability including multiple coups has created governance challenges, but the country's small scale limits most cyber threats.",
      good: "Very small digital footprint limits exposure to sophisticated attacks.",
      bad: "Political instability creates governance gaps. Water sector data (Lesotho Highlands Water Project) has strategic value.",
      ugly: "Lesotho Highlands Water Project data — critical to South African water supply — has been targeted by actors seeking infrastructure intelligence.",
      aware: "Water infrastructure data is disproportionately targeted due to strategic importance to South Africa.",
      recommended: "LHWP must maintain enhanced cybersecurity for water management systems. Political stability investment reduces overall risk.",
    },
    stats: { breaches: 15, malwareRate: 46, avgBreach: '$0.1M', criticalVulns: 4 },
    headlines: [
      { title: 'Lesotho Highlands Water Project systems flagged in security audit', date: '2026-05-06', severity: 'medium' },
      { title: 'Political coup attempt creates temporary communications disruption', date: '2026-05-02', severity: 'medium' },
      { title: 'Maseru mobile money fraud increases amid economic hardship', date: '2026-04-27', severity: 'low' },
    ],
    dayeIntelligence: "Lesotho presents MODERATE risk with a specific strategic concern around water infrastructure data given its importance to South African water security. DAYE recommends targeted protection of LHWP systems.",
  },
  {
    code: 'DJ', name: 'Djibouti', lat: 11.59, lon: 43.15,
    threatLevel: 4.5, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Djibouti's extraordinary strategic position — hosting U.S., French, Chinese, and Japanese military bases simultaneously — makes it one of the world's most intelligence-saturated environments. Multiple great powers conduct signals intelligence operations from Djiboutian territory.",
      good: "Multiple great power presence creates some deterrent effect on criminal actors.",
      bad: "The same great power competition means Djibouti is subject to intensive intelligence collection from all sides.",
      ugly: "China's first overseas military base in Djibouti gives the PLA direct physical access to undersea cable landing stations that carry data for the entire Horn of Africa region.",
      aware: "All communications in Djibouti should be treated as potentially intercepted by at least two major intelligence services.",
      recommended: "Military and diplomatic personnel must use the highest security communications. Commercial operations should assume monitoring.",
    },
    stats: { breaches: 34, malwareRate: 54, avgBreach: '$0.4M', criticalVulns: 13 },
    headlines: [
      { title: "Chinese PLA base's proximity to undersea cables raises intelligence concerns", date: '2026-05-11', severity: 'critical' },
      { title: 'Multiple intelligence services conduct signals competition in Djibouti', date: '2026-05-07', severity: 'high' },
      { title: 'Djibouti port systems face sophisticated intrusion attempts', date: '2026-05-02', severity: 'high' },
    ],
    dayeIntelligence: "Djibouti presents ELEVATED risk as one of the world's most intelligence-saturated small states. DAYE identifies Chinese access to undersea cable infrastructure as the primary strategic concern with implications for Horn of Africa communications security.",
  },
  {
    code: 'KM', name: 'Comoros', lat: -11.7, lon: 43.26,
    threatLevel: 2.9, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Comoros, a small island nation between Madagascar and Mozambique, has minimal digital infrastructure. Passport selling controversies and political instability create some financial fraud vectors, but overall cyber risk is low.",
      good: "Very limited digital footprint creates minimal attack surface.",
      bad: "Controversial passport-by-investment program creates identity fraud vectors. Political instability.",
      ugly: "Comorian passports have been sold to sanctioned individuals and stateless persons globally, creating an identity fraud infrastructure that is increasingly cyber-enabled.",
      aware: "Comorian passport data and identity documents carry fraud risk. Political communications face some surveillance.",
      recommended: "Organizations verifying Comorian identities should apply enhanced due diligence given passport program controversies.",
    },
    stats: { breaches: 8, malwareRate: 42, avgBreach: '$0.1M', criticalVulns: 2 },
    headlines: [
      { title: 'Comoros passport fraud scheme exposed in Pan-African investigation', date: '2026-05-05', severity: 'medium' },
      { title: 'Moroni government systems targeted in political opposition campaign', date: '2026-05-01', severity: 'low' },
      { title: 'ANRTIC launches first cybersecurity awareness program', date: '2026-04-26', severity: 'low' },
    ],
    dayeIntelligence: "Comoros presents MODERATE risk primarily around identity document fraud. DAYE recommends heightened scrutiny of Comorian passport documents given the country's controversial citizenship-by-investment program.",
  },
  {
    code: 'CV', name: 'Cape Verde', lat: 14.93, lon: -23.51,
    threatLevel: 3.2, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "Cape Verde is one of Africa's most stable and well-governed island nations, with strong democratic institutions. Its position as a mid-Atlantic transit point creates some drug trafficking adjacency, but overall cyber risk is low.",
      good: "Strong democratic governance and rule of law. AGÊNCIA.CV provides reasonable regulatory oversight.",
      bad: "Mid-Atlantic position creates drug transit risk with cybercrime adjacency. Limited cybersecurity capacity.",
      ugly: "Cape Verde's role in extraditing alleged cybercriminals has made it a target for retaliation by criminal networks, notably in the Alex Saab case.",
      aware: "Drug trafficking networks use Cape Verde as a transit point; cybercrime adjacency should be monitored.",
      recommended: "Strengthen cybersecurity cooperation with European partners. Monitor financial sector for drug trafficking money laundering.",
    },
    stats: { breaches: 19, malwareRate: 41, avgBreach: '$0.2M', criticalVulns: 5 },
    headlines: [
      { title: 'Cape Verde targeted by criminal networks after high-profile extradition', date: '2026-05-04', severity: 'medium' },
      { title: 'Praia financial sector reports cybercrime attempts linked to Sahelian networks', date: '2026-04-30', severity: 'medium' },
      { title: 'Cape Verde achieves highest digital governance score in ECOWAS', date: '2026-04-25', severity: 'low' },
    ],
    dayeIntelligence: "Cape Verde presents MODERATE risk with specific vulnerability to criminal network retaliation for law enforcement cooperation. DAYE commends Cape Verde's governance but notes the targeting risk from criminal networks seeking to deter future extraditions.",
  },
  {
    code: 'ST', name: 'São Tomé and Príncipe', lat: 0.33, lon: 6.73,
    threatLevel: 2.5, threatLabel: 'MODERATE',
    color: '#30D158',
    situation: {
      overview: "São Tomé and Príncipe is one of Africa's smallest states, a micro-island democracy in the Gulf of Guinea. Limited digital infrastructure and stable governance create a low cyber risk environment, though the country's small size means any incident has outsized impact.",
      good: "Stable democratic governance. Very small scale limits sophisticated attacks.",
      bad: "Extremely limited cybersecurity capacity. Oil exploration creates some espionage risk.",
      ugly: "Oil exploration data is disproportionately targeted given potential reserves. The country's small size means any successful cyber operation disrupts the entire government.",
      aware: "Oil exploration data is a priority for intelligence gathering. Any financial transactions should be verified carefully.",
      recommended: "Protect oil exploration data as a strategic priority. Build basic cyber hygiene into government systems.",
    },
    stats: { breaches: 5, malwareRate: 38, avgBreach: '$0.1M', criticalVulns: 2 },
    headlines: [
      { title: 'São Tomé oil exploration data suspected target of espionage operation', date: '2026-05-03', severity: 'medium' },
      { title: 'Gulf of Guinea maritime security exercise reveals cyber vulnerability', date: '2026-04-29', severity: 'low' },
      { title: 'São Tomé government launches basic cybersecurity training program', date: '2026-04-24', severity: 'low' },
    ],
    dayeIntelligence: "São Tomé and Príncipe presents LOW overall risk but specific vulnerability in oil exploration data. DAYE recommends this tiny state prioritize basic cyber hygiene investments before more sophisticated threats emerge.",
  },
  {
    code: 'SC', name: 'Seychelles', lat: -4.62, lon: 55.45,
    threatLevel: 4.1, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "Seychelles' offshore financial sector and growing digital economy create targeted fraud vectors. As a major financial center for Pan-African investment structures, it faces sophisticated threats from state and criminal actors seeking to exploit its financial infrastructure.",
      good: "Strong financial regulation relative to other small island states. Growing tech sector.",
      bad: "Offshore financial sector is exploited for money laundering. Limited cybersecurity capacity for the volume of financial flows.",
      ugly: "Seychelles-domiciled holding companies are used extensively to structure illicit financial flows out of Africa. This makes the country's financial infrastructure a priority target for multiple intelligence services.",
      aware: "Seychelles-based financial entities carry elevated due diligence requirements. Marine surveillance data is a strategic target.",
      recommended: "Enhanced oversight of Seychelles-domiciled holding companies. Strengthen maritime surveillance system cybersecurity.",
    },
    stats: { breaches: 34, malwareRate: 48, avgBreach: '$0.9M', criticalVulns: 10 },
    headlines: [
      { title: 'Seychelles offshore banking exposed in pan-African money laundering probe', date: '2026-05-10', severity: 'high' },
      { title: 'Maritime surveillance systems in Indian Ocean targeted by state actors', date: '2026-05-06', severity: 'high' },
      { title: 'CERT-SC established as financial sector incidents rise', date: '2026-05-01', severity: 'medium' },
    ],
    dayeIntelligence: "Seychelles presents ELEVATED risk due to its role as an offshore financial center and strategic Indian Ocean position. DAYE assesses that Chinese and Western intelligence services both operate against Seychellois maritime surveillance and financial infrastructure.",
  },
  {
    code: 'CF', name: 'Central African Republic', lat: 4.36, lon: 18.55,
    threatLevel: 5.1, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "The CAR's Russian Wagner/Africa Corps occupation alongside diamond and gold mining interests creates a dangerous cyber environment. One of the world's least developed countries, it has minimal digital infrastructure but significant strategic resources that attract state-level cyber operations.",
      good: "Very limited digital infrastructure constrains sophisticated threats.",
      bad: "Russian Africa Corps effectively controls the country, conducting intelligence operations against any Western interests.",
      ugly: "Wagner/Africa Corps forces conduct propaganda operations from CAR targeting anti-Russian sentiment across the continent. Diamond and gold trade data is controlled by Russia-aligned entities.",
      aware: "Any Western organization operating in CAR should treat all communications as compromised by Russian intelligence.",
      recommended: "Western organizations should effectively suspend digital operations in CAR. If essential, satellite communications only.",
    },
    stats: { breaches: 23, malwareRate: 73, avgBreach: '$0.2M', criticalVulns: 7 },
    headlines: [
      { title: 'Africa Corps deploys information warfare units from Bangui against EU interests', date: '2026-05-13', severity: 'critical' },
      { title: 'CAR mining sector data flows exclusively to Russia-aligned entities', date: '2026-05-09', severity: 'high' },
      { title: 'UN peacekeepers report systematic jamming of communications in CAR', date: '2026-05-04', severity: 'high' },
    ],
    dayeIntelligence: "CAR presents ELEVATED overall and CRITICAL specific risk for Western-affiliated organizations due to Russia's Africa Corps control. DAYE assesses CAR as effectively a Russian military cyber operations base in Central Africa.",
  },
  {
    code: 'CG', name: 'Republic of Congo', lat: -4.27, lon: 15.27,
    threatLevel: 4.6, threatLabel: 'ELEVATED',
    color: '#FFD60A',
    situation: {
      overview: "The Republic of Congo (not to be confused with the much larger DR Congo) is an oil state under Sassou-Nguesso's long-running authoritarian rule. Oil wealth and French connections create targeted espionage environments.",
      good: "Oil sector benefits from French corporate security standards.",
      bad: "Authoritarian governance enables surveillance of opposition. Oil sector data is a prime espionage target.",
      ugly: "Sassou-Nguesso family's embezzlement of oil revenues has been enabled by cyber-weak financial controls. French and Chinese intelligence compete for oil sector intelligence.",
      aware: "Oil sector data is actively targeted by multiple intelligence services. Government communications are assumed monitored.",
      recommended: "Oil operators need enhanced data protection. Opposition and civil society need secure communications.",
    },
    stats: { breaches: 45, malwareRate: 61, avgBreach: '$0.5M', criticalVulns: 14 },
    headlines: [
      { title: 'Congo oil sector data breach attributed to Chinese intelligence operation', date: '2026-05-09', severity: 'high' },
      { title: 'Sassou-Nguesso government targets opposition with commercial spyware', date: '2026-05-05', severity: 'high' },
      { title: 'Brazzaville port systems targeted in cargo intelligence campaign', date: '2026-04-30', severity: 'medium' },
    ],
    dayeIntelligence: "Republic of Congo presents ELEVATED risk particularly for oil sector operations and political opposition. DAYE notes the competition between French and Chinese intelligence for oil sector data as a persistent threat driver.",
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#FF2D2D'
    case 'high': return '#FF9500'
    case 'medium': return '#FFD60A'
    case 'low': return '#30D158'
    default: return '#98989D'
  }
}

// ─── Globe Grid Lines ─────────────────────────────────────────────────────────

function GlobeGrid() {
  const linesRef = useRef<THREE.LineSegments>(null)

  useEffect(() => {
    const R = 2.21
    const points: number[] = []

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180)
      const segments = 64
      for (let i = 0; i < segments; i++) {
        const t0 = (i / segments) * Math.PI * 2
        const t1 = ((i + 1) / segments) * Math.PI * 2
        points.push(
          R * Math.sin(phi) * Math.cos(t0), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t0),
          R * Math.sin(phi) * Math.cos(t1), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t1),
        )
      }
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = lon * (Math.PI / 180)
      const segments = 64
      for (let i = 0; i < segments; i++) {
        const phi0 = (i / segments) * Math.PI
        const phi1 = ((i + 1) / segments) * Math.PI
        points.push(
          R * Math.sin(phi0) * Math.cos(theta), R * Math.cos(phi0), R * Math.sin(phi0) * Math.sin(theta),
          R * Math.sin(phi1) * Math.cos(theta), R * Math.cos(phi1), R * Math.sin(phi1) * Math.sin(theta),
        )
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    if (linesRef.current) {
      linesRef.current.geometry = geom
    }
  }, [])

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#0A84FF" transparent opacity={0.15} />
    </lineSegments>
  )
}

// ─── Country Marker ───────────────────────────────────────────────────────────

interface MarkerProps {
  country: Country
  isSelected: boolean
  onClick: () => void
}

function CountryMarker({ country, isSelected, onClick }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [pos] = useState(() => latLonToXYZ(country.lat, country.lon, 2.24))

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return
    const t = clock.getElapsedTime()
    const pulse = isSelected ? 1 + Math.sin(t * 4) * 0.4 : 1 + Math.sin(t * 2 + country.lat) * 0.15
    meshRef.current.scale.setScalar(pulse)
    glowRef.current.scale.setScalar(pulse * 2.2)
    const mat = glowRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = isSelected
      ? 0.35 + Math.sin(t * 4) * 0.15
      : 0.12 + Math.sin(t * 2 + country.lat) * 0.05
  })

  return (
    <group position={pos} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={country.color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Core marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={country.color}
          emissive={country.color}
          emissiveIntensity={isSelected ? 2 : 0.8}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}

// ─── Globe Scene ──────────────────────────────────────────────────────────────

interface GlobeSceneProps {
  selectedCountry: Country | null
  onSelectCountry: (country: Country) => void
  rotationRef: React.MutableRefObject<{ y: number; paused: boolean; resumeTimer: number }>
}

function GlobeScene({ selectedCountry, onSelectCountry, rotationRef }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    (camera as any).position.set(0, 0, 6.5)
  }, [camera])

  useFrame(({ clock }) => {
    if (!globeRef.current) return
    const now = clock.getElapsedTime()

    // Handle auto-resume after interaction pause
    if (rotationRef.current.paused && rotationRef.current.resumeTimer > 0) {
      if (now > rotationRef.current.resumeTimer) {
        rotationRef.current.paused = false
        rotationRef.current.resumeTimer = 0
      }
    }

    if (selectedCountry && !rotationRef.current.paused) {
      // Lerp toward target Y so selected country faces camera
      const targetY = -(selectedCountry.lon * Math.PI) / 180
      const diff = targetY - globeRef.current.rotation.y
      const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      globeRef.current.rotation.y += wrapped * 0.04
    } else if (!selectedCountry && !rotationRef.current.paused) {
      globeRef.current.rotation.y += 0.0017
    }

    rotationRef.current.y = globeRef.current.rotation.y
  })

  return (
    <group ref={globeRef}>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshBasicMaterial color="#0A84FF" transparent opacity={0.04} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Main globe sphere */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      <GlobeGrid />

      {/* Country markers */}
      {COUNTRIES.map((country) => (
        <CountryMarker
          key={country.code}
          country={country}
          isSelected={selectedCountry?.code === country.code}
          onClick={() => onSelectCountry(country)}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#0A84FF" />
      <pointLight position={[0, 0, 6]} intensity={0.4} color="#0A84FF" distance={12} />
    </group>
  )
}

// ─── Threat Level Bar ─────────────────────────────────────────────────────────

function ThreatBar({ level, color }: { level: number; color: string }) {
  const pct = (level / 10) * 100
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
        <span>Threat Level</span>
        <span style={{ color, fontWeight: 700 }}>{level.toFixed(1)} / 10</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '14px 16px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ color: '#0A84FF', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ─── Situation Row ────────────────────────────────────────────────────────────

function SituationRow({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{ width: 3, height: 12, background: accent, borderRadius: 99 }} />
        {label}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-2)' }}>{text}</p>
    </div>
  )
}

// ─── Headline Card ────────────────────────────────────────────────────────────

function HeadlineCard({ headline }: { headline: Headline }) {
  const color = severityColor(headline.severity)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '14px 16px',
      marginBottom: 10,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 3,
        flexShrink: 0,
        alignSelf: 'stretch',
        background: color,
        borderRadius: 99,
        boxShadow: `0 0 8px ${color}66`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, letterSpacing: '0.04em' }}>
          {headline.date} &nbsp;·&nbsp;
          <span style={{ color, fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>{headline.severity}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{headline.title}</div>
      </div>
      <ChevronRight size={14} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
    </div>
  )
}

// ─── DAYE Intelligence Bar Chart ──────────────────────────────────────────────

function DayeChart({ country }: { country: Country }) {
  const bars = [
    { label: 'Breaches', value: Math.min(100, (country.stats.breaches / 5000) * 100), color: '#0A84FF' },
    { label: 'Malware', value: country.stats.malwareRate, color: '#FF9500' },
    { label: 'Threat Lvl', value: country.threatLevel * 10, color: country.color },
    { label: 'Crit Vulns', value: Math.min(100, (country.stats.criticalVulns / 600) * 100), color: '#FF2D2D' },
  ]

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Threat Indicators</div>
      {bars.map((bar) => (
        <div key={bar.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>
            <span>{bar.label}</span>
            <span style={{ color: bar.color, fontWeight: 600 }}>{bar.value.toFixed(0)}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bar.value}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                borderRadius: 99,
                background: bar.color,
                boxShadow: `0 0 8px ${bar.color}55`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Country Panel ────────────────────────────────────────────────────────────

type Tab = 'situation' | 'news' | 'daye'

interface CountryPanelProps {
  country: Country
  onClose: () => void
}

function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('situation')
  const [expanded, setExpanded] = useState(false)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'situation', label: 'Cyber Situation', icon: <Shield size={12} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={12} /> },
    { id: 'daye', label: 'DAYE Intelligence', icon: <Brain size={12} /> },
  ]

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1, maxHeight: expanded ? '88vh' : '55vh' }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y < -60) setExpanded(true)
        else if (info.offset.y > 60) {
          if (expanded) setExpanded(false)
          else onClose()
        }
      }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
        touchAction: 'none',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', cursor: 'grab', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.22)', borderRadius: 99 }} />
      </div>

      {/* Header */}
      <div style={{
        padding: '12px 24px 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, Syne, sans-serif' }}>
              {country.name}
            </div>
            <div style={{
              background: `${country.color}22`,
              border: `1px solid ${country.color}55`,
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 700,
              color: country.color,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {country.threatLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-2)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <StatCard label="Breaches" value={country.stats.breaches.toLocaleString()} icon={<AlertTriangle size={14} />} />
          <StatCard label="Malware Rate" value={`${country.stats.malwareRate}%`} icon={<TrendingUp size={14} />} />
          <StatCard label="Avg Breach" value={country.stats.avgBreach} icon={<Shield size={14} />} />
          <StatCard label="Crit Vulns" value={country.stats.criticalVulns} icon={<AlertTriangle size={14} />} />
        </div>

        {/* Threat bar */}
        <ThreatBar level={country.threatLevel} color={country.color} />

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingBottom: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 99,
                border: activeTab === tab.id ? '1px solid rgba(10,132,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? 'rgba(10,132,255,0.18)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? '#0A84FF' : 'var(--text-2)',
                fontSize: 11,
                fontWeight: activeTab === tab.id ? 600 : 400,
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 32px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'situation' && (
            <motion.div key="situation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <SituationRow label="The Overview" text={country.situation.overview} accent="#98989D" />
              <SituationRow label="The Good" text={country.situation.good} accent="#30D158" />
              <SituationRow label="The Bad" text={country.situation.bad} accent="#FF9500" />
              <SituationRow label="The Ugly" text={country.situation.ugly} accent="#FF2D2D" />
              <SituationRow label="Be Aware Of" text={country.situation.aware} accent="#FFD60A" />
              <SituationRow label="Recommended Actions" text={country.situation.recommended} accent="#0A84FF" />
            </motion.div>
          )}
          {activeTab === 'news' && (
            <motion.div key="news" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {country.headlines.map((h, i) => (
                <HeadlineCard key={i} headline={h} />
              ))}
            </motion.div>
          )}
          {activeTab === 'daye' && (
            <motion.div key="daye" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(10,132,255,0.15)',
                  border: '1px solid rgba(10,132,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Brain size={18} color="#0A84FF" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>DAYE Assessment</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>AI-powered threat intelligence</div>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>{country.dayeIntelligence}</p>
              <DayeChart country={country} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  onSelect: (country: Country) => void
}

function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const results = query.length > 0
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${focused ? 'rgba(10,132,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 99,
        padding: '10px 16px',
        transition: 'border-color 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(10,132,255,0.12)' : '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <Search size={14} color={focused ? '#0A84FF' : 'var(--text-3)'} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search countries..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-1)',
            fontSize: 13,
            flex: 1,
            fontFamily: 'system-ui, -apple-system, Syne, sans-serif',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: 0, lineHeight: 0 }}>
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 200,
            }}
          >
            {results.map((country) => (
              <button
                key={country.code}
                onMouseDown={() => { onSelect(country); setQuery(''); setFocused(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: 'var(--text-1)',
                  fontSize: 13,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,132,255,0.08)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <span>{country.name}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: country.color,
                  background: `${country.color}18`,
                  border: `1px solid ${country.color}33`,
                  borderRadius: 6,
                  padding: '2px 7px',
                  letterSpacing: '0.06em',
                }}>
                  {country.threatLabel}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Globe Page ──────────────────────────────────────────────────────────

export default function Globe() {
  const { profile, signOut } = useAuth()
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const rotationRef = useRef({ y: 0, paused: false, resumeTimer: 0 })
  const orbitRef = useRef<any>(null)

  // Hide hint after first interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
      gsap.to({}, {
        duration: 0.6,
        onComplete: () => setShowHint(false),
      })
    }
  }, [hasInteracted])

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country)
    setShowHint(false)
    setHasInteracted(true)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedCountry(null)
    // Resume auto-rotation after 3s
    rotationRef.current.paused = false
  }, [])

  // Pause rotation on OrbitControls interaction
  const handleOrbitStart = useCallback(() => {
    rotationRef.current.paused = true
    rotationRef.current.resumeTimer = 0
    handleInteraction()
  }, [handleInteraction])

  const handleOrbitEnd = useCallback(() => {
    // Schedule resume in 3 seconds (will be read in useFrame via clock time)
    rotationRef.current.resumeTimer = Date.now() / 1000 + 3
  }, [])

  return (
    <Layout profile={profile} onSignOut={signOut} title="Global Threat Map">
      <div style={{ height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', background: '#000508' }}>

        {/* Three.js Canvas */}
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          onPointerDown={handleInteraction}
        >
          <Canvas
            gl={{ antialias: true, alpha: false }}
            camera={{ position: [0, 0, 6.5], fov: 45 }}
            style={{ background: 'transparent' }}
          >
            <GlobeScene
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              rotationRef={rotationRef}
            />
            <OrbitControls
              ref={orbitRef}
              enablePan={false}
              minDistance={4}
              maxDistance={8}
              enableDamping
              dampingFactor={0.08}
              onStart={handleOrbitStart}
              onEnd={handleOrbitEnd}
            />
          </Canvas>
        </div>

        {/* Top-center: Search bar overlay */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: '90%',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <SearchBar onSelect={handleSelectCountry} />
        </div>

        {/* Top-left: Legend */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 20,
            left: 16,
            zIndex: 20,
            background: 'rgba(6,6,6,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: '10px 14px',
          }}
        >
          {[
            { label: 'Critical', color: '#FF2D2D' },
            { label: 'High', color: '#FF9500' },
            { label: 'Elevated', color: '#FFD60A' },
            { label: 'Moderate', color: '#30D158' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.04em' }}>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom center: "DRAG TO EXPLORE" hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{
                position: 'absolute',
                bottom: selectedCountry ? 'calc(55vh + 16px)' : 32,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                Drag to explore · Click markers
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country count badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            zIndex: 20,
            background: 'rgba(10,132,255,0.12)',
            border: '1px solid rgba(10,132,255,0.3)',
            borderRadius: 12,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A84FF', boxShadow: '0 0 8px #0A84FF' }} />
          <span style={{ fontSize: 11, color: '#0A84FF', fontWeight: 600, letterSpacing: '0.04em' }}>
            {COUNTRIES.length} Nations Monitored
          </span>
        </motion.div>

        {/* Country Panel */}
        <AnimatePresence>
          {selectedCountry && (
            <CountryPanel country={selectedCountry} onClose={handleClosePanel} />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
