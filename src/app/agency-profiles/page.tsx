"use client";

import { useState, useMemo } from "react";

interface Agency {
  id: number;
  name: string;
  founded: number;
  headquarters: string;
  employees: string;
  employeeRange: [number, number];
  website: string;
  services: string[];
  industries: string[];
  notableClients: string[];
  hourlyRate: string;
  projectBudget: string;
  annualRevenue: string;
  clutchRating: number;
  description: string;
  specialization: string;
  decisionMakers: string[];
  toolStack: string[];
  painPoints: string[];
  designCheckerFit: "High" | "Medium" | "Low";
  fitReason: string;
}

const agencies: Agency[] = [
  {
    id: 1,
    name: "SmartSites",
    founded: 2011,
    headquarters: "Paramus, New Jersey",
    employees: "400+",
    employeeRange: [400, 500],
    website: "smartsites.com",
    services: ["Web Design", "SEO", "PPC", "Social Media", "Email Marketing", "SMS Marketing"],
    industries: ["Automotive", "Healthcare", "Education", "Legal", "Home Services", "B2B"],
    notableClients: ["Porsche", "Harvard University", "A&E", "US Army"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$10,000-$200,000",
    annualRevenue: "$100M+",
    clutchRating: 4.9,
    description:
      "Full-service digital marketing agency founded by brothers Alex and Michael Melen. Google Premier Partner, Microsoft Advertising Select Partner, and Facebook Marketing Partner with 1,000+ five-star reviews. Six-time Inc. 5000 fastest-growing company managing over $100M/year in advertising spend.",
    specialization: "Full-Service Digital Marketing & Web Design",
    decisionMakers: ["Co-CEO (Alex Melen)", "Co-CEO/COO (Michael Melen)"],
    toolStack: ["WordPress", "Shopify", "Google Ads", "Meta Ads", "Semrush", "HubSpot"],
    painPoints: [
      "Managing design quality across 400+ team members",
      "Standardizing QA across high volume of concurrent projects",
      "Client-facing quality documentation at scale",
    ],
    designCheckerFit: "High",
    fitReason:
      "Large agency with high project volume needs automated design QA to maintain quality consistency across hundreds of team members and projects.",
  },
  {
    id: 2,
    name: "Lounge Lizard",
    founded: 1998,
    headquarters: "New York, New York",
    employees: "50-60",
    employeeRange: [50, 60],
    website: "loungelizard.com",
    services: [
      "Web Design",
      "Web Development",
      "SEO",
      "PPC",
      "Social Media",
      "Branding",
      "E-Commerce",
      "Mobile Apps",
    ],
    industries: ["Fashion", "Healthcare", "Legal", "Hospitality", "Finance", "Manufacturing"],
    notableClients: ["Dylan's Candy Bar", "Andersen", "Whelen Engineering", "LOOP-LOC", "Jacobs Entertainment"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$5,000-$180,000",
    annualRevenue: "$5.8M",
    clutchRating: 4.8,
    description:
      "Full-service web design and digital marketing agency operating since 1998 with offices in NYC, Long Island, Miami, Nashville, Charleston, and Washington D.C. Ranked #1 web agency on Clutch for 10+ consecutive years. Known for high-performance websites and scalable digital platforms.",
    specialization: "Custom Web Design & Digital Marketing",
    decisionMakers: ["CEO/Co-Founder", "VP of Sales & Operations", "Chief Creative Officer"],
    toolStack: ["WordPress", "Laravel", "Shopify", "Custom CMS", "Google Analytics"],
    painPoints: [
      "Maintaining design consistency across 6 office locations",
      "Multi-industry design quality standards",
      "Client expectation management for design fidelity",
    ],
    designCheckerFit: "High",
    fitReason:
      "Mid-size agency with 25+ years of experience and multiple offices. Needs standardized design evaluation across distributed teams and diverse client industries.",
  },
  {
    id: 3,
    name: "Bop Design",
    founded: 2008,
    headquarters: "San Diego, California",
    employees: "11-50",
    employeeRange: [11, 50],
    website: "bopdesign.com",
    services: [
      "B2B Web Design",
      "Branding",
      "Content Marketing",
      "SEO",
      "Social Media",
      "Logo Design",
      "Email Marketing",
    ],
    industries: ["Technology", "SaaS", "Finance", "Consulting", "Energy", "Industrial", "Engineering"],
    notableClients: ["B2B technology firms", "SaaS companies", "Financial services firms", "Consulting agencies"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$10,000-$50,000",
    annualRevenue: "$18.1M",
    clutchRating: 4.9,
    description:
      "Woman-owned B2B marketing and web design agency with offices in San Diego, Irvine, and Los Angeles. Exclusively serves B2B companies with fewer than 250 employees. Named to Inc. 5000 list and ranked #35 on Newsweek's 2025 America's Most Reliable Companies.",
    specialization: "B2B-Exclusive Web Design & Marketing",
    decisionMakers: ["Agency Principal", "Creative Director", "Account Director"],
    toolStack: ["WordPress", "HubSpot", "Figma", "Google Analytics", "Mailchimp"],
    painPoints: [
      "Ensuring B2B design best practices across client industries",
      "Lead generation optimization through design quality",
      "Scaling holistic marketing approach while maintaining design standards",
    ],
    designCheckerFit: "High",
    fitReason:
      "Perfect beachhead customer: mid-size B2B-focused agency that values design quality as a differentiator. Would benefit from automated design scoring to validate their premium positioning.",
  },
  {
    id: 4,
    name: "Dotlogics",
    founded: 2007,
    headquarters: "East Northport, New York",
    employees: "10-15",
    employeeRange: [10, 15],
    website: "dotlogics.com",
    services: [
      "Web Design",
      "Custom Development",
      "E-Commerce",
      "Mobile Apps",
      "AI Solutions",
      "Digital Transformation",
    ],
    industries: ["Retail", "Healthcare", "Finance", "Education", "Enterprise", "Midmarket"],
    notableClients: ["McDonald's", "Brown University", "Unilever"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$25,000-$100,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Web design, custom development, and eCommerce agency founded in 2007. Despite a small team, they serve major enterprise clients including McDonald's and Unilever. Specialize in digital design, digital transformation, and AI-driven solutions across retail, healthcare, and finance.",
    specialization: "Enterprise Custom Web Design & Development",
    decisionMakers: ["Agency Owner", "Lead Developer", "Project Manager"],
    toolStack: ["React", "Node.js", "Shopify", "Custom Platforms", "AI/ML Tools"],
    painPoints: [
      "Small team managing enterprise-level quality expectations",
      "Design fidelity across complex custom builds",
      "Scaling QA processes without adding headcount",
    ],
    designCheckerFit: "High",
    fitReason:
      "Small team with enterprise clients creates high leverage for automated design QA. Every hour saved on manual review directly impacts profitability.",
  },
  {
    id: 5,
    name: "500 Designs",
    founded: 2016,
    headquarters: "Irvine, California",
    employees: "120+",
    employeeRange: [120, 150],
    website: "500designs.com",
    services: [
      "Branding",
      "Web Design",
      "UI/UX Design",
      "Web Development",
      "AI Strategy",
      "Digital Marketing",
      "SEO",
    ],
    industries: [
      "Technology",
      "Healthcare",
      "Finance",
      "Construction",
      "Legal",
      "Manufacturing",
      "Retail",
      "Energy",
    ],
    notableClients: ["Google", "TikTok", "3M", "Cisco", "HubSpot", "FedEx", "BetterHelp"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$25,000-$150,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Award-winning UI/UX and branding agency that has worked with 700+ businesses including Google, TikTok, and FedEx. Ranked #426 on Inc. 5000 and #2 fastest growing branding and web design agency. Known for increasing engagement rates (26% to 45% for TeamBridge) and reducing bounce rates.",
    specialization: "UI/UX Design & Brand Strategy",
    decisionMakers: ["CEO", "Creative Director", "Head of Design"],
    toolStack: ["Figma", "WordPress", "Webflow", "Shopify", "Custom Development"],
    painPoints: [
      "Maintaining design quality across 120+ person team",
      "Measuring design impact on client KPIs objectively",
      "Standardizing UI/UX evaluation across diverse industries",
    ],
    designCheckerFit: "High",
    fitReason:
      "Design-first agency with data-driven approach. Automated design scoring would complement their focus on measurable outcomes and help validate design quality at scale.",
  },
  {
    id: 6,
    name: "Huemor",
    founded: 2011,
    headquarters: "Pittsburgh, Pennsylvania",
    employees: "40-50",
    employeeRange: [40, 50],
    website: "huemor.rocks",
    services: ["Web Design", "Web Development", "WordPress", "Shopify", "E-Commerce", "UX/UI", "Brand Strategy"],
    industries: ["B2B", "SaaS", "eCommerce", "Beauty", "Nonprofit", "Healthcare", "Real Estate"],
    notableClients: ["Boston Dynamics", "NBC Sports", "Live Nation", "Geico", "United Way", "American Crew"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$50,000-$100,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "B2B-focused web design agency co-founded by Michael Cleary. Clutch Best Website 2025 Winner. Known for conversion-focused design with major clients including Boston Dynamics and NBC Sports. Rated #1 LGBTQ agency and #1 website design agency by Clutch.",
    specialization: "B2B Conversion-Focused Web Design",
    decisionMakers: ["Founder/CEO (Michael Cleary)", "COO (Christi Carnahan)", "Creative Director"],
    toolStack: ["WordPress", "Shopify", "Figma", "Drupal", "WooCommerce", "Magento"],
    painPoints: [
      "Ensuring conversion-optimized designs meet quality standards",
      "Design-to-development fidelity for premium projects",
      "Scaling QA with 40+ web production team members",
    ],
    designCheckerFit: "High",
    fitReason:
      "Premium agency with $50K-$100K projects. High stakes per project makes automated design QA extremely valuable for catching issues before client review.",
  },
  {
    id: 7,
    name: "Ramotion",
    founded: 2009,
    headquarters: "San Francisco, California",
    employees: "~70",
    employeeRange: [60, 80],
    website: "ramotion.com",
    services: [
      "Brand Strategy",
      "Visual Identity",
      "UI/UX Design",
      "Web Design",
      "Mobile App Design",
      "Front-End Development",
    ],
    industries: ["SaaS", "Fintech", "Enterprise Tech", "Security", "Automotive", "Consumer Apps"],
    notableClients: ["Salesforce", "Netflix", "Adobe", "Mozilla Firefox", "Stripe", "Xero", "Okta"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$50,000-$200,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Design and branding agency with 15+ years of experience serving startups through Fortune 500 companies. Client exits total $6B+ with $1B+ raised. Notable work includes Stripe iconography, Firefox identity system, and Flatfile redesign that drove $50M in funding.",
    specialization: "Enterprise Brand Design & Product Design",
    decisionMakers: ["Managing Director", "Design Director", "Head of Strategy"],
    toolStack: ["Figma", "Sketch", "React", "Next.js", "Framer", "Custom Tools"],
    painPoints: [
      "Ensuring brand identity consistency across digital touchpoints",
      "Design system compliance verification at scale",
      "Maintaining pixel-perfect quality for premium tech clients",
    ],
    designCheckerFit: "Medium",
    fitReason:
      "High-end design agency with premium clients. Design system compliance checking would be valuable, though their focus on brand identity may require specialized evaluation criteria.",
  },
  {
    id: 8,
    name: "Flightpath",
    founded: 1994,
    headquarters: "New York, New York (Flatiron)",
    employees: "25-30",
    employeeRange: [25, 30],
    website: "flightpath.com",
    services: [
      "Web Design",
      "Web Development",
      "SEO/SEM",
      "Social Media",
      "Content Marketing",
      "Email/CRM",
      "Online Video",
    ],
    industries: ["CPG", "Healthcare", "Pharmaceutical", "Media", "Nonprofit", "B2B", "Financial Services"],
    notableClients: ["Goya Foods", "Sherwin-Williams", "BMW", "Showtime", "Merck Animal Health", "ConvaTec"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$10,000-$60,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.7,
    description:
      "NYC-based digital creative agency operating since 1994, now part of Ruder Finn. Culturally diverse team of 25 digital specialists serving major B2B and B2C brands. Named top 5 digital agency in NYC by Agency Spotter. Clients report 75% reduction in cost per lead.",
    specialization: "B2B & B2C Digital Marketing & Web Design",
    decisionMakers: ["Agency Principal (Jon Fox)", "Creative Director (Steven Louie)", "Account Directors"],
    toolStack: ["WordPress", "Custom CMS", "Google Ads", "Mailchimp", "HubSpot"],
    painPoints: [
      "Multi-industry design standards across CPG, pharma, and media",
      "Maintaining quality with lean team structure",
      "Meeting pharmaceutical/healthcare design compliance requirements",
    ],
    designCheckerFit: "High",
    fitReason:
      "Mid-size agency with diverse client portfolio. Automated design evaluation would help standardize quality across regulated industries (pharma, healthcare) and reduce manual QA burden on a lean team.",
  },
  {
    id: 9,
    name: "The Creative Momentum",
    founded: 2012,
    headquarters: "Alpharetta, Georgia",
    employees: "10-15",
    employeeRange: [10, 15],
    website: "thecreativemomentum.com",
    services: [
      "Web Design",
      "Web Development",
      "UI/UX",
      "SEO",
      "PPC",
      "Branding",
      "Inbound Marketing",
      "ADA Compliance",
    ],
    industries: [
      "Business Services",
      "IT",
      "Financial Services",
      "Medical",
      "Nonprofit",
      "Enterprise",
    ],
    notableClients: [
      "Humana",
      "Dian Fossey Gorilla Fund",
      "Encompass Digital Media",
      "Atlanta Children's Foundation",
      "Peachtree Women's Clinic",
    ],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$25,000-$100,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Full-service creative and digital marketing agency based in Atlanta area. Achieved +3,400% revenue growth in first two years. HubSpot Partner agency. Known as one of the top ADA-compliant web development experts. Acquired by CloudMellow.",
    specialization: "Custom Web Design & ADA Compliance",
    decisionMakers: ["CCO/Founder (Carl Widdowson)", "Project Manager", "Lead Developer"],
    toolStack: ["PHP", ".NET", "React Native", "Node.js", "HubSpot", "WordPress"],
    painPoints: [
      "ADA compliance verification across all client projects",
      "Design quality consistency with small team handling enterprise clients",
      "Balancing speed-to-market with design excellence",
    ],
    designCheckerFit: "High",
    fitReason:
      "ADA compliance specialization makes this agency a natural early adopter. Combined design quality and accessibility scoring would be a key selling point.",
  },
  {
    id: 10,
    name: "Trajectory Web Design",
    founded: 2005,
    headquarters: "Atlanta, Georgia",
    employees: "5-10",
    employeeRange: [5, 10],
    website: "trajectorywebdesign.com",
    services: [
      "Web Design",
      "Web Development",
      "Content Strategy",
      "UX Design",
      "SEO",
      "Website Maintenance",
    ],
    industries: ["B2B", "Nonprofits", "Public Sector", "Cybersecurity", "Manufacturing"],
    notableClients: [
      "Lannan Foundation",
      "Ronald McDonald House Charities",
      "Data for Democracy",
      "Bowtie (Cybersecurity)",
      "CMP Advanced Mechanical",
    ],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$10,000-$25,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.8,
    description:
      "Strategy-first boutique web design agency for B2B companies and nonprofits. 185+ successful projects since 2005. Distributed team across US and Europe with founder personally leading every project. Specializes in Webflow development with a messaging-strategy-first approach.",
    specialization: "B2B & Nonprofit Strategic Web Design",
    decisionMakers: ["Founder (Josh)", "UX Lead (Tom)", "Content Strategist (Bree)"],
    toolStack: ["Webflow", "Figma", "Custom APIs", "Google Analytics"],
    painPoints: [
      "Maintaining quality standards across distributed remote team",
      "Nonprofit clients have limited budgets for extensive manual QA",
      "Ensuring design quality at lower price points",
    ],
    designCheckerFit: "Medium",
    fitReason:
      "Boutique agency where automated QA could replace expensive manual review. Nonprofit focus means cost-effective quality tools are especially valuable.",
  },
  {
    id: 11,
    name: "OuterBox",
    founded: 2004,
    headquarters: "Akron, Ohio",
    employees: "250+",
    employeeRange: [250, 300],
    website: "outerboxdesign.com",
    services: [
      "eCommerce Web Design",
      "SEO",
      "PPC/SEM",
      "CRO",
      "Custom Development",
      "Website Maintenance",
      "Email Marketing",
    ],
    industries: ["eCommerce", "Industrial Manufacturing", "Automotive", "Software", "Medical", "Fashion", "Legal"],
    notableClients: ["Morton Salt", "Romeo's Pizza", "K2 Awards", "Atlas Oil", "JetDock"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$10,000-$100,000+",
    annualRevenue: "$28.9M",
    clutchRating: 4.9,
    description:
      "Nationally rated #1 eCommerce SEO agency with 250+ US-based employees. Founded in 2004, all work is done in-house with no overseas outsourcing. Endorsed by Neil Patel as #1 eCommerce SEO agency. Works across WordPress, Shopify, BigCommerce, and Magento.",
    specialization: "eCommerce Web Design & SEO",
    decisionMakers: ["Founder (Justin Smith)", "VP of Operations", "Design Director"],
    toolStack: ["WordPress", "Shopify", "BigCommerce", "Magento", "Google Analytics", "Semrush"],
    painPoints: [
      "eCommerce design quality across thousands of product pages",
      "Maintaining responsive design standards across multiple platforms",
      "Scaling QA for 250+ person US-based team",
    ],
    designCheckerFit: "High",
    fitReason:
      "Large eCommerce-focused agency with massive project volume. Automated design evaluation across product pages and checkout flows would save hundreds of hours annually.",
  },
  {
    id: 12,
    name: "Solid Digital",
    founded: 2007,
    headquarters: "Portland, Oregon",
    employees: "25-30",
    employeeRange: [25, 30],
    website: "soliddigital.com",
    services: [
      "Web Design",
      "Web Development",
      "UI/UX Design",
      "Digital Marketing",
      "SEO",
      "Custom Software",
      "eCommerce",
    ],
    industries: ["Healthcare", "Finance", "SaaS", "Nonprofit", "Financial Technology", "Restaurant Tech"],
    notableClients: ["6sense", "Baker Hill", "Restaurant365", "NAVS (Nonprofit)", "HiSET"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$25,000-$100,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Award-winning B2B web design agency with offices in Portland and Chicago. Known for collaborative Digital Growth program combining web design with ongoing support. 100 eNPS score indicating exceptional employee satisfaction. Clutch Gold Verified agency.",
    specialization: "B2B Web Design & Digital Growth",
    decisionMakers: ["Agency Principal", "Design Director", "Digital Growth Manager"],
    toolStack: ["WordPress", "Elementor", "Figma", "Google Analytics", "SEO Tools"],
    painPoints: [
      "Design quality consistency across Portland and Chicago offices",
      "Ongoing website maintenance quality monitoring",
      "Balancing competitive pricing with high design standards",
    ],
    designCheckerFit: "High",
    fitReason:
      "B2B-focused mid-size agency with ongoing maintenance services. Continuous design monitoring would enhance their Digital Growth offering and differentiate from competitors.",
  },
  {
    id: 13,
    name: "Digital Silk",
    founded: 2015,
    headquarters: "New York, New York",
    employees: "100-200",
    employeeRange: [100, 200],
    website: "digitalsilk.com",
    services: [
      "Web Design",
      "Web Development",
      "Branding",
      "Digital Marketing",
      "eCommerce",
      "Custom Software",
      "SEO",
      "PPC",
    ],
    industries: ["Technology", "Education", "Healthcare", "Enterprise", "Consumer Electronics", "Finance"],
    notableClients: ["Sony", "Northwestern University", "P&G", "Xerox", "NYU", "IBM", "AT&T", "NFL", "HP", "Amazon"],
    hourlyRate: "$150/hr",
    projectBudget: "$30,000-$100,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.8,
    description:
      "Full-service web design agency focused on growing brands online. Works with Fortune 500 leaders including Sony, P&G, IBM, and AT&T. Manhattan-based with award-winning designers, branding specialists, and marketing experts driving end-to-end business growth.",
    specialization: "Enterprise Brand & Web Design",
    decisionMakers: ["CEO", "VP of Design", "Account Directors"],
    toolStack: ["Custom Development", "WordPress", "Shopify", "React", "Figma"],
    painPoints: [
      "Enterprise-grade design quality for Fortune 500 clients",
      "Managing complex project scopes with strict brand guidelines",
      "Design consistency across large multi-page enterprise sites",
    ],
    designCheckerFit: "High",
    fitReason:
      "Enterprise-focused agency where design quality failures carry significant reputational and financial risk. Automated design evaluation would reduce risk on high-stakes projects.",
  },
  {
    id: 14,
    name: "KlientBoost",
    founded: 2015,
    headquarters: "Costa Mesa, California",
    employees: "60-95",
    employeeRange: [60, 95],
    website: "klientboost.com",
    services: ["PPC Management", "CRO", "Social Media Marketing", "SEO", "Email Marketing", "Landing Page Design"],
    industries: ["SaaS", "eCommerce", "Lead Generation", "B2B", "Healthcare", "Education"],
    notableClients: ["200+ case study clients across SaaS, eCommerce, and lead generation"],
    hourlyRate: "Monthly retainer model",
    projectBudget: "Retainer-based",
    annualRevenue: "Not disclosed",
    clutchRating: 4.8,
    description:
      "Performance marketing agency that increases client ROI by an average of 63% in the first 3 months. With 134K monthly visitors and 1,400+ verified reviews, KlientBoost is known for PPC, CRO, and conversion optimization. Clients report 30%+ CPA reductions.",
    specialization: "Performance Marketing & CRO",
    decisionMakers: ["CEO", "VP of Strategy", "Account Managers"],
    toolStack: ["Google Ads", "Meta Ads", "Unbounce", "Google Analytics", "Custom Landing Pages"],
    painPoints: [
      "Landing page design quality impacting conversion rates",
      "A/B testing design variants at scale",
      "Ensuring design best practices across CRO experiments",
    ],
    designCheckerFit: "Medium",
    fitReason:
      "CRO-focused agency where design quality directly impacts conversion metrics. Design scoring could enhance their data-driven approach to landing page optimization.",
  },
  {
    id: 15,
    name: "WebFX",
    founded: 1996,
    headquarters: "Harrisburg, Pennsylvania",
    employees: "500+",
    employeeRange: [500, 600],
    website: "webfx.com",
    services: [
      "Web Design",
      "SEO",
      "PPC",
      "Content Marketing",
      "Social Media",
      "Email Marketing",
      "Marketing Automation",
    ],
    industries: ["B2B", "Healthcare", "Manufacturing", "Retail", "Education", "Finance", "Real Estate"],
    notableClients: ["Caterpillar", "Verizon", "Hilton", "Auntie Anne's", "Subway", "Wrangler"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$10,000-$200,000+",
    annualRevenue: "$100M+",
    clutchRating: 4.9,
    description:
      "Full-service digital marketing agency with 25+ years of experience and a team of 500+ experts. Known for proprietary MarketingCloudFX technology platform. Top-ranked on Clutch.co for February 2026. Combines strategic expertise with marketing technology to deliver measurable results for mid-market and enterprise clients.",
    specialization: "Full-Service Digital Marketing with Proprietary Technology",
    decisionMakers: ["CEO (Bill Craig)", "VP of Marketing Operations", "VP of Client Services"],
    toolStack: ["MarketingCloudFX", "WordPress", "Google Ads", "HubSpot", "Salesforce", "Semrush"],
    painPoints: [
      "Maintaining design quality across 500+ team members and hundreds of concurrent projects",
      "Standardizing web design evaluation at enterprise scale",
      "Ensuring consistent client deliverable quality across diverse industries",
    ],
    designCheckerFit: "High",
    fitReason:
      "Massive agency with very high project volume. Automated design QA would yield significant ROI through time savings and quality consistency at scale. Top Clutch-ranked for 2026.",
  },
  {
    id: 16,
    name: "Disruptive Advertising",
    founded: 2013,
    headquarters: "Pleasant Grove, Utah",
    employees: "51-200",
    employeeRange: [51, 200],
    website: "disruptiveadvertising.com",
    services: ["PPC Management", "Social Media Ads", "CRO", "Landing Page Design", "SEO", "Analytics"],
    industries: ["SaaS", "eCommerce", "Lead Generation", "B2B", "Healthcare", "Legal"],
    notableClients: ["Adobe", "ConocoPhillips", "Guitar Center", "Litter-Robot"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$5,000-$100,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.8,
    description:
      "Performance marketing agency laser-focused on turning advertising spend into predictable, scalable revenue. Known for a data-driven approach with deep expertise in paid search, paid social, and conversion rate optimization. Ranked among top digital marketing agencies in Clutch.co 2026 rankings.",
    specialization: "Performance Marketing & CRO",
    decisionMakers: ["CEO", "VP of Strategy", "Director of Client Services"],
    toolStack: ["Google Ads", "Meta Ads", "Google Analytics", "Unbounce", "VWO", "Custom Dashboards"],
    painPoints: [
      "Landing page design quality directly impacts ad conversion rates",
      "Rapid A/B test design iterations need quality consistency",
      "Scaling design review across 50-200 person team",
    ],
    designCheckerFit: "Medium",
    fitReason:
      "Performance-focused agency where landing page design quality directly impacts ROAS. Automated design scoring could enhance their data-driven optimization approach.",
  },
  {
    id: 17,
    name: "Ignite Visibility",
    founded: 2013,
    headquarters: "San Diego, California",
    employees: "100-150",
    employeeRange: [100, 150],
    website: "ignitevisibility.com",
    services: ["SEO", "PPC", "Social Media", "Email Marketing", "CRO", "Web Design", "Amazon Marketing"],
    industries: ["eCommerce", "Healthcare", "Finance", "Education", "B2B SaaS", "Retail"],
    notableClients: ["Tony Robbins", "The Knot Worldwide", "National Funding", "5-Hour Energy"],
    hourlyRate: "$100-$149/hr",
    projectBudget: "$10,000-$100,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Award-winning digital marketing agency consistently ranked among top agencies on Clutch.co. Known for exceptional communication and client management with over 90% positive Clutch reviews. Specializes in integrated digital strategies combining SEO, paid media, and conversion optimization.",
    specialization: "Integrated Digital Marketing & SEO",
    decisionMakers: ["CEO (John Lincoln)", "VP of Operations", "Director of Strategy"],
    toolStack: ["Semrush", "Google Ads", "Salesforce", "WordPress", "Shopify", "Custom Analytics"],
    painPoints: [
      "Web design quality consistency across integrated campaigns",
      "Ensuring design standards for high-profile client websites",
      "Scaling QA across 100+ person team with diverse project types",
    ],
    designCheckerFit: "High",
    fitReason:
      "Top Clutch-ranked agency with 100+ employees where web design is increasingly central to their integrated service offering. Automated design evaluation would complement their data-driven approach.",
  },
  {
    id: 18,
    name: "Silverback Strategies",
    founded: 2007,
    headquarters: "Arlington, Virginia",
    employees: "50-100",
    employeeRange: [50, 100],
    website: "silverbackstrategies.com",
    services: ["SEO", "PPC", "Content Marketing", "Analytics", "Web Design", "Social Media", "CRO"],
    industries: ["B2B", "Healthcare", "Finance", "SaaS", "Education", "Retail"],
    notableClients: ["Aruba Networks", "Mitel", "Cvent", "Vonage"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$10,000-$75,000",
    annualRevenue: "Not disclosed",
    clutchRating: 4.8,
    description:
      "Award-winning performance marketing agency known for blending creative energy with data-driven rigor. Recognized by Inc. 5000, Clutch, and The Washington Post's Top Workplaces. Helps brands grow with integrated strategies across SEO, paid media, content, and analytics.",
    specialization: "Performance Marketing & Data-Driven Growth",
    decisionMakers: ["CEO", "VP of Strategy", "Director of Analytics"],
    toolStack: ["Google Analytics", "Semrush", "Google Ads", "Salesforce", "HubSpot", "WordPress"],
    painPoints: [
      "Ensuring design quality in performance-driven landing pages",
      "Maintaining brand consistency across multiple client campaigns",
      "Scaling creative QA as the team grows",
    ],
    designCheckerFit: "Medium",
    fitReason:
      "Performance-focused agency where landing page and web design quality directly impacts campaign effectiveness. Automated design evaluation would enhance their data-driven optimization approach.",
  },
  {
    id: 19,
    name: "Baunfire",
    founded: 2009,
    headquarters: "San Jose, California",
    employees: "10-50",
    employeeRange: [10, 50],
    website: "baunfire.com",
    services: ["Web Design", "UI/UX Design", "Front-End Development", "Custom Website Development", "Responsive Design"],
    industries: ["Technology", "Enterprise", "B2B", "Healthcare", "Education"],
    notableClients: ["Stanford University", "Google", "Box", "Logitech", "Santa Clara University"],
    hourlyRate: "$150-$199/hr",
    projectBudget: "$50,000-$250,000+",
    annualRevenue: "Not disclosed",
    clutchRating: 4.9,
    description:
      "Distinguished Silicon Valley web design agency specializing in custom website development and UI/UX design. 85% of reviewers highlight expertise in custom development and front-end work. Known for balancing creative vision with strategic execution for enterprise technology clients.",
    specialization: "Enterprise Custom Web Design & UI/UX",
    decisionMakers: ["Creative Director", "Technical Director", "Project Lead"],
    toolStack: ["Custom Front-End", "React", "Figma", "Craft CMS", "WordPress"],
    painPoints: [
      "Pixel-perfect implementation for premium Silicon Valley clients",
      "Design-to-development fidelity on complex custom builds",
      "Responsive design quality across enterprise platforms",
    ],
    designCheckerFit: "High",
    fitReason:
      "Premium design agency where implementation precision is critical. Automated design-to-code comparison would be extremely valuable for their high-end projects.",
  },
];

type SortField = "name" | "founded" | "employees" | "clutchRating" | "designCheckerFit";
type FilterFit = "All" | "High" | "Medium" | "Low";

export default function AgencyProfiles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("designCheckerFit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterFit, setFilterFit] = useState<FilterFit>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "table">("grid");

  const filteredAgencies = useMemo(() => {
    let result = agencies.filter((a) => {
      const matchesSearch =
        searchTerm === "" ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.headquarters.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.industries.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFit = filterFit === "All" || a.designCheckerFit === filterFit;
      return matchesSearch && matchesFit;
    });

    result.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "founded":
          return dir * (a.founded - b.founded);
        case "employees":
          return dir * (a.employeeRange[0] - b.employeeRange[0]);
        case "clutchRating":
          return dir * (a.clutchRating - b.clutchRating);
        case "designCheckerFit": {
          const fitOrder = { High: 3, Medium: 2, Low: 1 };
          return dir * (fitOrder[a.designCheckerFit] - fitOrder[b.designCheckerFit]);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [searchTerm, sortField, sortDirection, filterFit]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const fitColor = (fit: string) => {
    switch (fit) {
      case "High":
        return { bg: "#dcfce7", text: "#166534", border: "#86efac" };
      case "Medium":
        return { bg: "#fef9c3", text: "#854d0e", border: "#fde047" };
      case "Low":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
    }
  };

  const stats = useMemo(() => {
    const highFit = agencies.filter((a) => a.designCheckerFit === "High").length;
    const medFit = agencies.filter((a) => a.designCheckerFit === "Medium").length;
    const totalEmployees = agencies.reduce((sum, a) => sum + a.employeeRange[0], 0);
    const avgRating = (agencies.reduce((sum, a) => sum + a.clutchRating, 0) / agencies.length).toFixed(1);
    return { highFit, medFit, totalEmployees, avgRating, total: agencies.length };
  }, []);

  return (
    <main
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        color: "#1e293b",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          color: "#fff",
          padding: "48px 24px 36px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                textAlign: "center",
                lineHeight: "40px",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              DC
            </span>
            <span style={{ fontSize: 14, opacity: 0.7, letterSpacing: 2, textTransform: "uppercase" }}>
              DesignChecker Market Research
            </span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "16px 0 8px", letterSpacing: -0.5 }}>
            Agency Customer Profile Database
          </h1>
          <p style={{ fontSize: 16, opacity: 0.8, maxWidth: 720, lineHeight: 1.6 }}>
            Comprehensive profiles of {stats.total} target digital agencies for DesignChecker customer discovery. Each
            profile includes company data, pain points, tool stack, decision makers, and product-market fit assessment.
          </p>

          {/* Summary Stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { label: "Total Agencies", value: stats.total },
              { label: "High Fit", value: stats.highFit },
              { label: "Medium Fit", value: stats.medFit },
              { label: "Avg. Clutch Rating", value: stats.avgRating },
              { label: "Combined Employees", value: `${stats.totalEmployees.toLocaleString()}+` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "14px 22px",
                  minWidth: 140,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Controls */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 0" }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <input
            type="text"
            placeholder="Search agencies by name, location, industry, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: "1 1 300px",
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 14,
              outline: "none",
              backgroundColor: "#fff",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {(["All", "High", "Medium"] as FilterFit[]).map((fit) => (
              <button
                key={fit}
                onClick={() => setFilterFit(fit)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: filterFit === fit ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                  backgroundColor: filterFit === fit ? "#eff6ff" : "#fff",
                  color: filterFit === fit ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: filterFit === fit ? 600 : 400,
                }}
              >
                {fit === "All" ? "All Agencies" : `${fit} Fit`}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: "#e2e8f0", borderRadius: 6, padding: 2 }}>
            {(["grid", "table"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? "#1e293b" : "#64748b",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab === "grid" ? "Cards" : "Table"}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          Showing {filteredAgencies.length} of {agencies.length} agencies
          {searchTerm && ` matching "${searchTerm}"`}
          {filterFit !== "All" && ` with ${filterFit} product fit`}
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 48px" }}>
        {activeTab === "grid" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: 20,
            }}
          >
            {filteredAgencies.map((agency) => {
              const expanded = expandedId === agency.id;
              const colors = fitColor(agency.designCheckerFit);
              return (
                <div
                  key={agency.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: "20px 20px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{agency.name}</h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{agency.headquarters}</p>
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {agency.designCheckerFit} Fit
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        margin: "12px 0",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: expanded ? 100 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {agency.description}
                    </p>

                    {/* Quick Stats */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      {[
                        { label: "Founded", value: agency.founded },
                        { label: "Employees", value: agency.employees },
                        { label: "Clutch", value: `${agency.clutchRating}/5.0` },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            backgroundColor: "#f8fafc",
                            borderRadius: 6,
                            padding: "8px 10px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Services Tags */}
                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {agency.services.slice(0, expanded ? undefined : 4).map((s) => (
                        <span
                          key={s}
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {!expanded && agency.services.length > 4 && (
                        <span style={{ fontSize: 11, color: "#94a3b8", padding: "3px 4px" }}>
                          +{agency.services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <div
                      style={{
                        padding: "0 20px 20px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      {/* Notable Clients */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Notable Clients
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {agency.notableClients.map((c) => (
                            <span
                              key={c}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: 6, padding: 10 }}>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Hourly Rate</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{agency.hourlyRate}</div>
                        </div>
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: 6, padding: 10 }}>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Project Budget</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{agency.projectBudget}</div>
                        </div>
                      </div>

                      {/* Decision Makers */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Decision Makers
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
                          {agency.decisionMakers.map((dm) => (
                            <li key={dm}>{dm}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Tool Stack */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Technology Stack
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {agency.toolStack.map((t) => (
                            <span
                              key={t}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                backgroundColor: "#f0fdf4",
                                color: "#166534",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pain Points */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Key Pain Points
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
                          {agency.painPoints.map((pp) => (
                            <li key={pp}>{pp}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Fit Assessment */}
                      <div
                        style={{
                          marginTop: 16,
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                          DesignChecker Fit Assessment: {agency.designCheckerFit}
                        </h4>
                        <p style={{ fontSize: 13, color: colors.text, margin: 0, lineHeight: 1.5 }}>
                          {agency.fitReason}
                        </p>
                      </div>

                      {/* Industries */}
                      <div style={{ marginTop: 16 }}>
                        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Industries Served
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {agency.industries.map((ind) => (
                            <span
                              key={ind}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                backgroundColor: "#faf5ff",
                                color: "#7e22ce",
                              }}
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : agency.id)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "none",
                      borderTop: "1px solid #f1f5f9",
                      backgroundColor: expanded ? "#f8fafc" : "#fff",
                      color: "#3b82f6",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {expanded ? "Show Less" : "View Full Profile"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#fff",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {[
                    { field: "name" as SortField, label: "Agency" },
                    { field: "founded" as SortField, label: "Founded" },
                    { field: "employees" as SortField, label: "Employees" },
                    { field: null, label: "Specialization" },
                    { field: null, label: "Hourly Rate" },
                    { field: "clutchRating" as SortField, label: "Clutch" },
                    { field: "designCheckerFit" as SortField, label: "Fit" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.field && toggleSort(col.field)}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#475569",
                        borderBottom: "2px solid #e2e8f0",
                        cursor: col.field ? "pointer" : "default",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      {col.label}
                      {col.field && sortField === col.field && (
                        <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? " ^" : " v"}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.map((agency, i) => {
                  const colors = fitColor(agency.designCheckerFit);
                  return (
                    <tr
                      key={agency.id}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#fff" : "#fafbfc",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                        <div>{agency.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{agency.headquarters}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>{agency.founded}</td>
                      <td style={{ padding: "10px 14px" }}>{agency.employees}</td>
                      <td style={{ padding: "10px 14px", maxWidth: 200 }}>
                        <div style={{ fontSize: 12 }}>{agency.specialization}</div>
                      </td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{agency.hourlyRate}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{agency.clutchRating}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {agency.designCheckerFit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Methodology Section */}
        <div
          style={{
            marginTop: 40,
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: 28,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Research Methodology</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1e40af" }}>Data Sources</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
                <li>Clutch.co verified agency profiles and reviews (Feb 2026)</li>
                <li>DesignRush agency directory (22,000+ companies)</li>
                <li>Digital Agency Network rankings</li>
                <li>ZoomInfo and LinkedIn company data</li>
                <li>Agency Spotter and Manifest listings</li>
                <li>Individual agency websites and case studies</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1e40af" }}>Fit Scoring Criteria</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
                <li>
                  <strong>High:</strong> Web design is a core service; 10-250 employees; design quality directly impacts
                  revenue; existing tool adoption suggests willingness to pay
                </li>
                <li>
                  <strong>Medium:</strong> Web design is secondary to other services; design evaluation would add value
                  but is not a primary pain point
                </li>
                <li>
                  <strong>Low:</strong> Limited web design focus; unlikely to adopt design-specific tooling
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1e40af" }}>
                Profile Data Points
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: "#475569" }}>
                <li>Company overview, founding year, and headquarters</li>
                <li>Employee count and organizational structure</li>
                <li>Service offerings and industry specializations</li>
                <li>Pricing models and project budget ranges</li>
                <li>Technology stack and tool ecosystem</li>
                <li>Decision makers and purchasing process</li>
                <li>Pain points relevant to design evaluation</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 20, marginBottom: 0 }}>
            Last updated: February 13, 2026. Data sourced from Clutch.co (Feb 2026 rankings), DesignRush, Digital Agency Network, ZoomInfo,
            LinkedIn, Agency Spotter, Semrush Agency Directory, and individual agency websites. All information is based on publicly available data. Includes agencies from Clutch.co&apos;s top-ranked digital marketing companies for February 2026.
          </p>
        </div>
      </div>
    </main>
  );
}
