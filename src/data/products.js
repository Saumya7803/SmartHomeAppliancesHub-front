import bajajShieldSeriesElevate90Image from "../assets/products/coolers/bajaj-shield-series-elevate-90l.webp";
import symphonyMaxwind80XlPlusImage from "../assets/products/coolers/symphony-maxwind-80-xl-plus.webp";
import cromptonOptimusWac70Image from "../assets/products/coolers/crompton-optimus-wac-70.webp";
import havellsKoolmaster105Image from "../assets/products/coolers/havells-koolmaster-105l.webp";
import lg260lRefrigeratorImage from "../assets/products/lg-260l-refrigerator.webp";
import samsung15TonAcImage from "../assets/products/samsung-1-5-ton-ac.webp";
import voltas15TonAcImage from "../assets/products/voltas-1-5-ac.webp";
import sony55TvImage from "../assets/products/sony-55-4k-tv.webp";
import ifb7KgWasherImage from "../assets/products/ifb-7kg-washer.webp";

const BROCHURE_URL = null;

const rawProducts = [
  {
    id: "tv-sony-bravia-pro-55",
    name: "Sony Bravia Pro Display 55-inch",
    category: "TV",
    brand: "Sony",
    modelNumber: "SBP-55X900",
    applicationUse: "Control rooms, corporate briefing spaces, and customer demo lounges.",
    shortDescription:
      "4K professional display built for continuous operation with vibrant color accuracy.",
    longDescription:
      "The Sony Bravia Pro Display 55-inch is designed for industrial and enterprise visual environments where uptime, sharp detail, and reliable connectivity are critical. It supports centralized device management and integrates smoothly with digital signage ecosystems.",
    image: sony55TvImage,
    technicalSpecifications: {
      "Display Size": "55 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      "Panel Type": "LED",
      Connectivity: "HDMI x3, USB x2, LAN",
      "Power Supply": "220-240V AC",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "tv-samsung-uhd-50",
    name: "Samsung UHD Commercial TV 50-inch",
    category: "TV",
    brand: "Samsung",
    modelNumber: "SMC-50U7",
    applicationUse: "Reception areas, training centers, and showroom content playback.",
    shortDescription:
      "Industrial-ready UHD television optimized for long-hour commercial presentation.",
    longDescription:
      "Samsung UHD Commercial TV 50-inch delivers reliable performance for professional spaces that need clear visuals and simple remote management. The chassis and thermal profile are tuned for high-duty cycle operation.",
    image: sony55TvImage,
    technicalSpecifications: {
      "Display Size": "50 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      Brightness: "350 nits",
      Connectivity: "HDMI x2, USB x1",
      "Mount Standard": "VESA 200 x 200",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "tv-lg-signage-43",
    name: "LG Digital Signage TV 43-inch",
    category: "TV",
    brand: "LG",
    modelNumber: "LGS-43D",
    applicationUse: "Information walls, waiting lounges, and production floor dashboards.",
    shortDescription:
      "Commercial signage display with stable playback and easy wall integration.",
    longDescription:
      "LG Digital Signage TV 43-inch is engineered for business environments requiring crisp messaging and dependable operation. It supports both media playback and external feed inputs for dynamic announcements.",
    image: sony55TvImage,
    technicalSpecifications: {
      "Display Size": "43 inches",
      Resolution: "1920 x 1080 (Full HD)",
      "Viewing Angle": "178 degrees",
      Connectivity: "HDMI x2, USB x2, LAN",
      "Operating Time": "16/7",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "tv-panasonic-pro-65",
    name: "Panasonic ProVision Display 65-inch",
    category: "TV",
    brand: "Panasonic",
    modelNumber: "PVP-65C",
    applicationUse: "Command centers, boardrooms, and industrial visitor galleries.",
    shortDescription:
      "Large format business television with high contrast and secure connectivity.",
    longDescription:
      "Panasonic ProVision Display 65-inch offers immersive viewing and durable build quality for corporate and industrial deployments. It is ideal for centrally managed AV infrastructures in multi-site organizations.",
    image: sony55TvImage,
    technicalSpecifications: {
      "Display Size": "65 inches",
      Resolution: "3840 x 2160 (4K UHD)",
      "Response Time": "8 ms",
      Connectivity: "HDMI x3, USB x2, LAN",
      "Audio Output": "20W",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ac-daikin-inverter-1-5",
    name: "Daikin Inverter Split AC 1.5 Ton",
    category: "AC",
    brand: "Daikin",
    modelNumber: "DKN-INV15",
    applicationUse: "Server rooms, engineering offices, and production monitoring cabins.",
    shortDescription:
      "Energy-efficient split AC with stable cooling for continuous business use.",
    longDescription:
      "Daikin Inverter Split AC 1.5 Ton is built for high-performance cooling in operational spaces that require temperature consistency and efficient energy consumption. It supports long daily runtime with low maintenance demands.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e7/Air_Conditioner_for_a_single_room.jpg",
    technicalSpecifications: {
      Capacity: "1.5 Ton",
      "Compressor Type": "Inverter",
      "Cooling Mode": "Turbo / Eco",
      Refrigerant: "R32",
      "Power Input": "230V / 50Hz",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ac-voltas-industrial-2",
    name: "Voltas Industrial Split AC 2.0 Ton",
    category: "AC",
    brand: "Voltas",
    modelNumber: "VLT-IND20",
    applicationUse: "Warehouse cabins, floor supervisor stations, and process control rooms.",
    shortDescription:
      "High-capacity split AC for hot climate industrial operations.",
    longDescription:
      "Voltas Industrial Split AC 2.0 Ton is designed for demanding commercial sites where thermal load varies across the day. Its airflow profile and compressor durability make it suitable for extended shift operations.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/9a/Air_conditioner_14.jpg",
    technicalSpecifications: {
      Capacity: "2.0 Ton",
      "Compressor Type": "Heavy Duty Rotary",
      Airflow: "High Throw",
      Refrigerant: "R32",
      "Indoor Noise": "Low Noise Mode",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ac-carrier-commercial-1-8",
    name: "Carrier Commercial AC 1.8 Ton",
    category: "AC",
    brand: "Carrier",
    modelNumber: "CAR-CM18",
    applicationUse: "Retail floors, quality labs, and assembly documentation rooms.",
    shortDescription:
      "Commercial-grade split cooling unit with optimized airflow and controls.",
    longDescription:
      "Carrier Commercial AC 1.8 Ton combines efficient cooling output with robust components to handle heavy use. The unit is tailored for business spaces that need reliability under varying occupancy and heat conditions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e2/Air_conditioner_2.jpg",
    technicalSpecifications: {
      Capacity: "1.8 Ton",
      "Energy Rating": "High Efficiency",
      "Air Distribution": "4-Way",
      Refrigerant: "R410A",
      Controls: "Remote + Wired",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ac-lg-dualcool-1-5",
    name: "LG DualCool Pro AC 1.5 Ton",
    category: "AC",
    brand: "LG",
    modelNumber: "LGD-15P",
    applicationUse: "Meeting rooms, client experience zones, and IT operator cabins.",
    shortDescription:
      "Dual-inverter air conditioning with rapid pull-down and quiet operation.",
    longDescription:
      "LG DualCool Pro AC 1.5 Ton is engineered for commercial comfort and efficient long-hour operation. It supports quick stabilization of room temperature while minimizing vibration and acoustic impact.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Daikin_ceiling_suspended_air_conditioner.jpg",
    technicalSpecifications: {
      Capacity: "1.5 Ton",
      "Compressor Type": "Dual Inverter",
      "Cooling Speed": "Fast Cool",
      Filters: "Multi-layer",
      "Power Supply": "220-240V AC",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ref-samsung-sidebyside-600",
    name: "Samsung Side-by-Side Refrigerator 600L",
    category: "Refrigerator",
    brand: "Samsung",
    modelNumber: "SAM-RF600",
    applicationUse: "Corporate cafeterias, hospitality prep zones, and staff pantry areas.",
    shortDescription:
      "Large capacity refrigerator with multi-zone cooling and reliable insulation.",
    longDescription:
      "Samsung Side-by-Side Refrigerator 600L is suited for institutional kitchens and shared food storage environments. It balances capacity, temperature stability, and practical shelf organization for daily operations.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/42/SAMSUNG_REFRIGERATOR_RF60J9030WZ.jpg",
    technicalSpecifications: {
      Capacity: "600 Liters",
      Type: "Side-by-Side",
      "Cooling Technology": "Frost Free",
      Shelving: "Tempered Glass",
      "Door Design": "Double Door",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ref-lg-doubledoor-420",
    name: "LG Double Door Refrigerator 420L",
    category: "Refrigerator",
    brand: "LG",
    modelNumber: "LGR-420D",
    applicationUse: "Office break rooms, executive pantry sections, and test kitchens.",
    shortDescription:
      "Efficient double-door refrigerator built for medium-duty business usage.",
    longDescription:
      "LG Double Door Refrigerator 420L provides consistent cooling and practical storage zoning for offices and light commercial use. The build supports frequent access while maintaining interior temperature integrity.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/61/Panasonic_HOME_REFRIGERATOR_NR-C320WP-N.jpg",
    technicalSpecifications: {
      Capacity: "420 Liters",
      Type: "Double Door",
      Compressor: "Inverter",
      Defrosting: "Automatic",
      "Finish": "Metallic",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ref-whirlpool-vertical-310",
    name: "Whirlpool Vertical Refrigerator 310L",
    category: "Refrigerator",
    brand: "Whirlpool",
    modelNumber: "WHR-310V",
    applicationUse: "Medical support rooms, staff cafeterias, and utility kitchens.",
    shortDescription:
      "Compact vertical refrigerator focused on organized industrial storage.",
    longDescription:
      "Whirlpool Vertical Refrigerator 310L is ideal for teams that need dependable, space-efficient refrigeration. It is engineered for quick access, robust internal trays, and predictable day-long thermal performance.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/US_Domestic_Refrigerator_-_Frigidaire.jpg",
    technicalSpecifications: {
      Capacity: "310 Liters",
      Type: "Top Freezer",
      "Cooling System": "Direct Cool",
      "Energy Class": "High Efficiency",
      Mobility: "Adjustable Feet",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "ref-haier-smart-350",
    name: "Haier Smart Refrigerator 350L",
    category: "Refrigerator",
    brand: "Haier",
    modelNumber: "HAI-SM350",
    applicationUse: "Corporate guest houses, collaborative work hubs, and office lounges.",
    shortDescription:
      "Smart cooling platform with adaptive temperature control for mixed loads.",
    longDescription:
      "Haier Smart Refrigerator 350L combines clean design and modern cooling control for dynamic office and hospitality setups. The unit is optimized for reliability, shelf flexibility, and efficient energy usage.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Hisense%2C_IFA_2018%2C_Berlin_%28P1070179%29.jpg",
    technicalSpecifications: {
      Capacity: "350 Liters",
      Type: "Bottom Freezer",
      "Control Panel": "Digital",
      Refrigerant: "Eco Friendly",
      "Temperature Zones": "Dual",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "cooler-bajaj-desert-90",
    name: "Bajaj Shield Series Elevate Desert Air Cooler 90L",
    category: "Cooler",
    brand: "Bajaj",
    modelNumber: "480150",
    applicationUse: "Production halls, loading docks, and semi-open workshops.",
    shortDescription:
      "90L desert cooler for high airflow in large, ventilated spaces.",
    longDescription:
      "Bajaj Shield Series Elevate Desert Air Cooler 90L is built for strong evaporative cooling in hot, semi-open environments. Its large tank and heavy-duty airflow profile support long operating cycles where conventional AC deployment is impractical.",
    image: bajajShieldSeriesElevate90Image,
    technicalSpecifications: {
      "Tank Capacity": "90 Liters",
      "Product Series": "Shield Series Elevate",
      Pads: "Honeycomb",
      Mobility: "Caster Wheels",
      "Power Supply": "220-240V AC",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "cooler-symphony-industrial-80",
    name: "Symphony Maxwind 80 XL+ Desert Air Cooler",
    category: "Cooler",
    brand: "Symphony",
    modelNumber: "ACODE495",
    applicationUse: "Factory aisles, dispatch points, and covered warehouse sections.",
    shortDescription:
      "Desert cooler optimized for strong airflow and sustained daytime operation.",
    longDescription:
      "Symphony Maxwind 80 XL+ Desert Air Cooler is designed for ventilated commercial and utility spaces that need stable evaporative cooling. Its high-capacity body and multi-side cooling architecture support long-shift usage.",
    image: symphonyMaxwind80XlPlusImage,
    technicalSpecifications: {
      "Tank Capacity": "77 Liters",
      "Product Series": "Maxwind 80 XL+",
      Cooling: "3-Side Honeycomb Pads",
      Airflow: "Fan-based High Throw",
      "Power Consumption": "190W",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "cooler-crompton-optimus-70",
    name: "Crompton Optimus WAC 70 Window Air Cooler",
    category: "Cooler",
    brand: "Crompton",
    modelNumber: "ACGC-OPTIWAC70",
    applicationUse: "Security cabins, utility stations, and temporary field offices.",
    shortDescription:
      "Window-format 70L air cooler designed for reliable targeted airflow.",
    longDescription:
      "Crompton Optimus WAC 70 is a high-capacity window cooler engineered for compact deployment zones that still demand broad cooling coverage. The chassis and louver design prioritize directional air control and practical day-to-day operation.",
    image: cromptonOptimusWac70Image,
    technicalSpecifications: {
      "Tank Capacity": "70 Liters",
      Type: "Window Air Cooler",
      "Air Deflection": "4-Way",
      Louvers: "Auto Swing",
      "Product Variant": "Grey",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "cooler-havells-celia-100",
    name: "Havells KoolMaster 105 L Desert Air Cooler",
    category: "Cooler",
    brand: "Havells",
    modelNumber: "GHRACEUE0105",
    applicationUse: "Assembly bays, workshop lanes, and industrial canteens.",
    shortDescription:
      "High-capacity desert cooler built for broad coverage in ventilated facilities.",
    longDescription:
      "Havells KoolMaster 105 L Desert Air Cooler is engineered for high airflow and long cooling cycles in open or semi-open business environments. Its large tank and multi-side honeycomb pad configuration support prolonged summer operation.",
    image: havellsKoolmaster105Image,
    technicalSpecifications: {
      "Tank Capacity": "105 Liters",
      "Product Variant": "White Grey",
      Motor: "Double Ball Bearing",
      Cooling: "3-Side Honeycomb Pads",
      "Pad Feature": "Bacteria Shield Technology",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "wm-ifb-frontload-8",
    name: "IFB Front Load Washer 8kg",
    category: "Washing Machine",
    brand: "IFB",
    modelNumber: "IFB-FL8P",
    applicationUse: "Hospitality linen rooms, uniform processing, and facility laundry units.",
    shortDescription:
      "Front-load washing machine engineered for repetitive commercial wash cycles.",
    longDescription:
      "IFB Front Load Washer 8kg offers stable performance, fabric care programs, and controlled water usage for professional laundry applications. It is a strong fit for medium-volume institutional operations.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/SAMSUNG_WASHING_MACHINE_%282%29.jpg",
    technicalSpecifications: {
      Capacity: "8 kg",
      Type: "Front Load",
      "Spin Speed": "1200 RPM",
      Programs: "Multiple",
      Heating: "In-built Heater",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "wm-samsung-topload-9",
    name: "Samsung Top Load Washer 9kg",
    category: "Washing Machine",
    brand: "Samsung",
    modelNumber: "SAM-TL9",
    applicationUse: "Staff accommodation laundry and high-turnover wash requirements.",
    shortDescription:
      "Top-load washer with high capacity drum and simple cycle management.",
    longDescription:
      "Samsung Top Load Washer 9kg is suitable for business units that prioritize throughput and ease of operation. It provides dependable wash quality with optimized water and detergent distribution.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Panasonic_WASHING_MACHINE_XQB70-H710U.jpg",
    technicalSpecifications: {
      Capacity: "9 kg",
      Type: "Top Load",
      Motor: "Digital Inverter",
      Controls: "Soft Touch",
      "Power Supply": "220-240V AC",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "wm-lg-commercial-10",
    name: "LG Commercial Washer 10kg",
    category: "Washing Machine",
    brand: "LG",
    modelNumber: "LGC-10W",
    applicationUse: "Large office laundry rooms and light industrial wash operations.",
    shortDescription:
      "10kg washing machine designed for continuous and balanced performance.",
    longDescription:
      "LG Commercial Washer 10kg combines capacity and control for institutional laundry workflows. The system is built for repeated operation while maintaining cleaning consistency and cycle stability.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Washing_Machine_Beko.jpg",
    technicalSpecifications: {
      Capacity: "10 kg",
      Type: "Front Load",
      "Drum Material": "Stainless Steel",
      Programs: "Quick + Heavy",
      "Usage Class": "Commercial",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "wm-panasonic-eco-7-5",
    name: "Panasonic Eco Washer 7.5kg",
    category: "Washing Machine",
    brand: "Panasonic",
    modelNumber: "PAN-E75",
    applicationUse: "Small business laundry, pantry cloth cleaning, and utility service rooms.",
    shortDescription:
      "Compact washer platform with efficient water and energy consumption.",
    longDescription:
      "Panasonic Eco Washer 7.5kg is built for teams requiring a dependable, efficient appliance in compact operational areas. It supports routine wash cycles with low maintenance overhead.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/42/Washing_machine_LG.png",
    technicalSpecifications: {
      Capacity: "7.5 kg",
      Type: "Top Load",
      "Spin Speed": "700 RPM",
      "Wash Programs": "Daily + Eco",
      "Energy Profile": "Efficient",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "mw-lg-convection-32",
    name: "LG Convection Microwave 32L",
    category: "Microwave Oven",
    brand: "LG",
    modelNumber: "LGM-32C",
    applicationUse: "Corporate cafeterias, R&D food prep, and executive pantry support.",
    shortDescription:
      "Convection microwave with multipurpose cooking for commercial pantry use.",
    longDescription:
      "LG Convection Microwave 32L delivers flexible cooking modes for business environments needing reheating, baking, and grilling support. It is designed for frequent daily operation and straightforward controls.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg",
    technicalSpecifications: {
      Capacity: "32 Liters",
      Type: "Convection",
      "Auto Menus": "Multiple",
      "Power Levels": "10",
      Safety: "Child Lock",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "mw-samsung-solo-28",
    name: "Samsung Solo Microwave 28L",
    category: "Microwave Oven",
    brand: "Samsung",
    modelNumber: "SAM-MW28",
    applicationUse: "Office pantry reheating and shared meal support stations.",
    shortDescription:
      "Reliable solo microwave engineered for high-frequency reheating cycles.",
    longDescription:
      "Samsung Solo Microwave 28L is a practical unit for quick heating workloads in staff areas. Its cavity design and control interface are optimized for routine use in commercial environments.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/95/Panasonic_MICROWAVE_OVEN_NN-GM333W.jpg",
    technicalSpecifications: {
      Capacity: "28 Liters",
      Type: "Solo",
      Controls: "Dial + Touch",
      "Interior Coating": "Ceramic",
      "Power Input": "220-240V AC",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "mw-panasonic-grill-30",
    name: "Panasonic Grill Microwave 30L",
    category: "Microwave Oven",
    brand: "Panasonic",
    modelNumber: "PAN-G30",
    applicationUse: "Hospitality pantries, demo kitchens, and team dining facilities.",
    shortDescription:
      "30L grill microwave with reliable heating and controlled browning.",
    longDescription:
      "Panasonic Grill Microwave 30L supports fast and consistent meal preparation for business settings. Its mode combinations allow reheating and grill finishing without additional equipment.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/74/TOSHIBA_Microwave_Oven_ER-J3_.jpg",
    technicalSpecifications: {
      Capacity: "30 Liters",
      Type: "Grill",
      "Cooking Modes": "Microwave + Grill",
      Timer: "Digital",
      "Door Type": "Pull Handle",
    },
    brochureUrl: BROCHURE_URL,
  },
  {
    id: "mw-toshiba-pro-27",
    name: "Toshiba Pro Microwave 27L",
    category: "Microwave Oven",
    brand: "Toshiba",
    modelNumber: "TSB-P27",
    applicationUse: "Business kitchenettes, medical break rooms, and admin pantry areas.",
    shortDescription:
      "Compact professional microwave with dependable day-to-day operation.",
    longDescription:
      "Toshiba Pro Microwave 27L is designed for organizations requiring a robust and compact cooking appliance. It offers repeatable heating performance and user-friendly controls for shared teams.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Microwave_Oven.jpg",
    technicalSpecifications: {
      Capacity: "27 Liters",
      Type: "Solo",
      "Power Output": "900W",
      Controls: "Digital Touch",
      Safety: "Overheat Protection",
    },
    brochureUrl: BROCHURE_URL,
  },
];

const categoryImageBank = {
  TV: [sony55TvImage],
  AC: [samsung15TonAcImage, voltas15TonAcImage],
  Refrigerator: [lg260lRefrigeratorImage],
  "Washing Machine": [ifb7KgWasherImage],
  Cooler: [
    bajajShieldSeriesElevate90Image,
    symphonyMaxwind80XlPlusImage,
    cromptonOptimusWac70Image,
    havellsKoolmaster105Image,
  ],
};

const categoryPricing = {
  TV: { base: 37990, step: 6500 },
  AC: { base: 32990, step: 4200 },
  Refrigerator: { base: 28990, step: 3600 },
  "Washing Machine": { base: 21990, step: 3000 },
  Cooler: { base: 9490, step: 1800 },
  "Microwave Oven": { base: 13990, step: 2500 },
};

const categoryRatings = {
  TV: [4.8, 4.6, 4.5, 4.7],
  AC: [4.7, 4.6, 4.4, 4.5],
  Refrigerator: [4.6, 4.7, 4.4, 4.5],
  "Washing Machine": [4.6, 4.5, 4.7, 4.4],
  Cooler: [4.4, 4.6, 4.3, 4.5],
  "Microwave Oven": [4.4, 4.5, 4.3, 4.2],
};

const categoryEnterpriseProfiles = {
  TV: {
    solutionCluster: "Visual Communication Systems",
    deploymentEnvironment: "Control rooms, boardrooms, and visitor communication zones",
    procurementModel: "Project quotation with mounting and commissioning scope",
    leadTimeRange: "7-12 business days",
    warrantyPlan: "1 year on-site warranty, extendable AMC support",
    supportSla: "48-hour service response in major cities",
    complianceStandards: "Commercial duty cycle and BIS compliant electricals",
  },
  AC: {
    solutionCluster: "Climate Control Infrastructure",
    deploymentEnvironment: "Operations cabins, server rooms, and production support spaces",
    procurementModel: "Capacity planning based procurement with installation mapping",
    leadTimeRange: "5-10 business days",
    warrantyPlan: "1 year comprehensive + compressor warranty as per OEM",
    supportSla: "Preventive maintenance options with seasonal service plans",
    complianceStandards: "Energy-efficient systems with approved refrigerant standards",
  },
  Refrigerator: {
    solutionCluster: "Cold Storage Utility Appliances",
    deploymentEnvironment: "Corporate pantry, institutional kitchens, and hospitality units",
    procurementModel: "Bulk procurement with site delivery coordination",
    leadTimeRange: "6-11 business days",
    warrantyPlan: "Standard manufacturer warranty with optional annual maintenance",
    supportSla: "Installation and post-delivery support on request",
    complianceStandards: "Food-safe storage design and energy-rated operation",
  },
  "Washing Machine": {
    solutionCluster: "Laundry Operations Systems",
    deploymentEnvironment: "Facility management, hospitality, and institutional laundry rooms",
    procurementModel: "Volume-based quotation with deployment advisory",
    leadTimeRange: "8-14 business days",
    warrantyPlan: "OEM warranty with optional enterprise service contract",
    supportSla: "Service scheduling and preventive checks for high-usage sites",
    complianceStandards: "Commercial usage profile with utility-efficient operation",
  },
  Cooler: {
    solutionCluster: "Evaporative Cooling Solutions",
    deploymentEnvironment: "Semi-open warehouses, workshops, and utility corridors",
    procurementModel: "Site ventilation assessment followed by project quotation",
    leadTimeRange: "4-9 business days",
    warrantyPlan: "Manufacturer warranty with seasonal readiness support",
    supportSla: "Scheduled maintenance and consumable guidance",
    complianceStandards: "Industrial airflow design and safe electrical operation",
  },
  "Microwave Oven": {
    solutionCluster: "Pantry and Utility Heating Solutions",
    deploymentEnvironment: "Business cafeterias, office pantries, and staff support rooms",
    procurementModel: "Consolidated corporate procurement with delivery planning",
    leadTimeRange: "5-8 business days",
    warrantyPlan: "OEM warranty with optional support extensions",
    supportSla: "On-call support and periodic check options",
    complianceStandards: "Commercial usage compatibility and safety lock features",
  },
};

function getEnterpriseProfile(category, categoryPosition) {
  const profile = categoryEnterpriseProfiles[category] ?? {
    solutionCluster: "Enterprise Utility Systems",
    deploymentEnvironment: "Corporate and institutional deployment environments",
    procurementModel: "Project-based B2B procurement",
    leadTimeRange: "7-12 business days",
    warrantyPlan: "Manufacturer warranty with optional service plan",
    supportSla: "Response SLA as per service region",
    complianceStandards: "Standard electrical and safety compliance",
  };

  const moqBase = categoryPosition < 2 ? "2 units" : "4 units";

  return {
    ...profile,
    moqGuideline: `${moqBase} (project scope may vary)`,
    implementationWindow: categoryPosition % 2 === 0 ? "Weekday deployment support" : "Flexible deployment scheduling",
  };
}

const categoryPositionMap = {};

export const products = rawProducts.map((product) => {
  const categoryPosition = categoryPositionMap[product.category] ?? 0;
  categoryPositionMap[product.category] = categoryPosition + 1;

  const imageBank = categoryImageBank[product.category];
  const pricingRule = categoryPricing[product.category] ?? { base: 17990, step: 1200 };
  const ratingRule = categoryRatings[product.category] ?? [4.4];
  const enterpriseProfile = getEnterpriseProfile(product.category, categoryPosition);

  return {
    ...product,
    image: imageBank?.[categoryPosition % imageBank.length] ?? product.image,
    price: Math.round((pricingRule.base + pricingRule.step * categoryPosition) / 10) * 10,
    rating: ratingRule[categoryPosition % ratingRule.length],
    enterpriseProfile,
  };
});

export const categories = [...new Set(products.map((product) => product.category))];

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category) {
  return products.filter((product) => product.category === category);
}

export default products;
