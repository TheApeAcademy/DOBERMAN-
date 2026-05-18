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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'situation', label: 'Cyber Situation', icon: <Shield size={12} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={12} /> },
    { id: 'daye', label: 'DAYE Intelligence', icon: <Brain size={12} /> },
  ]

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        maxHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px 24px 0',
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
