/* ==========================================================================
   #CAFFIENATION — FIELD DATA
   --------------------------------------------------------------------------
   Everything the committee is expected to edit lives in this file.
   No build step: change a value, commit, reload.

   - config          global switches (contact address, current phase, ...)
   - situationRoom   the decision branches, grouped into "fronts"
   - dossiers        candidate machines & suppliers (Intelligence Files)
   - phases          the operation timeline
   - transmissions   committee announcements, newest first
   - briefing        next meeting + standing orders
   ========================================================================== */

window.CFN = {
  config: {
    // Where "TRANSMIT POSITION →" sends people. Leave empty to open a blank
    // email with only the subject filled in.
    contactEmail: "",
    contactSubject: "#CaffieNation // Position transmitted",

    // Which phase of the operation is currently active (1–6).
    currentPhase: 1,

    // Defaults for the Field Calculator in the Situation Room.
    // All money values in GBP. Replace with real quotes when known.
    calculator: {
      staff: 60,          // people in the office on a busy day
      drinks: 2,          // drinks per person per day
      machines: 1,
      days: 20,           // office days per month
      beanPrice: 22,      // £ per kg
      grams: 10,          // grams of coffee per drink
      milkShare: 65,      // % of drinks containing milk
      milkMl: 150,        // ml of milk per milk drink
      milkPrice: 1.1,     // £ per litre
      fixed: 180,         // rental / lease / service contract, £ per month
      consumables: 40,    // cleaning tablets, filters, cups, £ per month
      rush: 20,           // people wanting a drink in the same 15 minutes
      seconds: 45         // seconds per drink
    }
  },

  /* ------------------------------------------------------------------------
     03 — THE SITUATION ROOM
     status: "PRIORITY" | "CONTESTED" | "OPEN" | "RESOLVED"
     position: the committee's agreed position. null = still pending.
     options[].verdict: short label shown next to each option.
     ------------------------------------------------------------------------ */
  situationRoom: [
    {
      front: "I",
      name: "THE MACHINE",
      items: [
        {
          code: "SR-01",
          title: "Machine type",
          status: "PRIORITY",
          question: "Which class of machine actually delivers proper coffee at office scale?",
          intel: [
            "Bean-to-cup machines grind whole beans for every drink and make espresso and milk drinks at one touch. This is the movement's stated objective.",
            "Traditional espresso machines are excellent in trained hands, but need a separate grinder and someone making every drink. (Candidate CFN-D03.)",
            "Capsule/pod machines are consistent but expensive per cup, generate constant waste and rarely do fresh milk well.",
            "Bulk filter brewers are fast for volume but cannot produce espresso-based drinks."
          ],
          options: [
            { label: "Bean-to-cup, fully automatic", verdict: "PREFERRED" },
            { label: "Traditional espresso", verdict: "NEEDS A BARISTA" },
            { label: "Capsule / pod", verdict: "REJECTED" },
            { label: "Bulk filter (as a supplement)", verdict: "POSSIBLE" }
          ],
          position: null
        },
        {
          code: "SR-02",
          title: "Drink quality",
          status: "OPEN",
          question: "How do we judge “proper” objectively, rather than by whoever argues loudest?",
          intel: [
            "Grinder quality and brew-unit design matter more than the size of the drinks menu.",
            "Ask whether grind size, dose and temperature can be adjusted — and by whom.",
            "The beans are half the result. Check whether the supplier locks us into their own beans.",
            "Demand a demonstration or trial using our own water, beans and milk."
          ],
          options: [
            { label: "Blind tasting at supplier demos", verdict: "RECOMMENDED" },
            { label: "Score sheet: espresso, flat white, cappuccino, plant-milk drink", verdict: "RECOMMENDED" },
            { label: "Trust the brochure", verdict: "REJECTED" }
          ],
          position: null
        },
        {
          code: "SR-03",
          title: "Fresh milk vs powdered milk",
          status: "CONTESTED",
          question: "Fresh milk for a far better drink, or powder for a far easier life?",
          intel: [
            "Fresh milk gives noticeably better taste and texture. It needs a fridge unit, a daily milk-system clean, stock management and occasional waste.",
            "Powdered milk is shelf-stable, cheaper and easier to maintain. It is also the reason the first uprising happened.",
            "Plant milk: check whether the machine supports a second milk line, or whether it will be added by hand.",
            "Whoever buys the milk and keeps the fridge stocked must be decided before installation, not after."
          ],
          options: [
            { label: "Fresh milk (single line)", verdict: "DEMANDED" },
            { label: "Fresh + plant milk (dual line)", verdict: "INVESTIGATE" },
            { label: "Powdered milk", verdict: "UNDER PROTEST" }
          ],
          position: null
        }
      ]
    },
    {
      front: "II",
      name: "THROUGHPUT",
      items: [
        {
          code: "SR-04",
          title: "Number of machines",
          status: "OPEN",
          question: "One large machine, or several smaller ones?",
          intel: [
            "One high-capacity machine is usually cheaper to buy, supply and service.",
            "Two machines give redundancy — a breakdown is an inconvenience, not a total blackout — and split peak-time queues.",
            "On a multi-floor office, compare one central hub against one machine per floor.",
            "Every additional machine means additional cleaning, refills and contract cost."
          ],
          options: [
            { label: "One high-capacity machine", verdict: "OPTION" },
            { label: "Two mid-capacity machines", verdict: "OPTION" },
            { label: "One per floor", verdict: "DEPENDS ON SR-07" }
          ],
          position: null
        },
        {
          code: "SR-05",
          title: "Capacity",
          status: "PRIORITY",
          question: "How many drinks per day do we actually need to serve?",
          intel: [
            "Estimate: people in the office × drinks per person per day. Use the busiest office day, not the average — hybrid attendance lies.",
            "Pick a machine whose recommended daily output exceeds peak-day demand with roughly 25–30% headroom.",
            "Check bean hopper, milk fridge and grounds-bin sizes: they decide how often someone has to refill and empty it, whatever the headline cups/day says.",
            "Run the numbers in the Field Calculator below."
          ],
          options: [
            { label: "Size for peak day + 30%", verdict: "RECOMMENDED" },
            { label: "Size for an average day", verdict: "RISKY" }
          ],
          position: null
        },
        {
          code: "SR-06",
          title: "Peak-time queues",
          status: "PRIORITY",
          question: "What happens at 09:00, and again straight after lunch?",
          intel: [
            "A milk drink commonly takes somewhere in the region of 30–60 seconds. Ask each supplier for the real figure for our most popular drink.",
            "Twenty people arriving together at 45 seconds a drink means the last person waits about 15 minutes. Morale does not survive this.",
            "Ask whether the machine can make two drinks at once, and whether it can grind while it steams.",
            "Plan physical queue space so people waiting do not block a corridor or a fire route."
          ],
          options: [
            { label: "Observe current peak usage for one week", verdict: "ACTION" },
            { label: "Two-cup / twin-spout capability", verdict: "DESIRABLE" }
          ],
          position: null
        }
      ]
    },
    {
      front: "III",
      name: "TERRITORY",
      items: [
        {
          code: "SR-07",
          title: "Location / floor",
          status: "OPEN",
          question: "Where will the machine live?",
          intel: [
            "It needs power, water, a bin and — if plumbed in — drainage.",
            "Central enough to be convenient, far enough from desks that the grinder is not a meeting participant.",
            "Consider the route for deliveries, refills and the engineer.",
            "On a multi-floor office, which floor holds the most people on peak days?"
          ],
          options: [
            { label: "Main kitchen", verdict: "OPTION" },
            { label: "Central breakout area", verdict: "OPTION" },
            { label: "Next to the committee's desks", verdict: "SUSPICIOUS" }
          ],
          position: null
        },
        {
          code: "SR-08",
          title: "Installation requirements",
          status: "OPEN",
          question: "Can the building actually take it?",
          intel: [
            "Plumbed-in water supply, or a tank someone refills by hand?",
            "Drainage for plumbed machines, and a water filter matched to local water hardness.",
            "Electrical supply: some commercial machines need a dedicated circuit. Confirm with the supplier and facilities before ordering.",
            "Counter space, depth and load for the machine plus milk fridge and cup warmer. Landlord or building-management approval if required."
          ],
          options: [
            { label: "Site survey by shortlisted suppliers", verdict: "REQUIRED" },
            { label: "Facilities sign-off", verdict: "REQUIRED" }
          ],
          position: null
        },
        {
          code: "SR-09",
          title: "Staff convenience",
          status: "OPEN",
          question: "Is it genuinely easy for everyone to use?",
          intel: [
            "Clear one-touch menu. Controls and screen at an accessible height.",
            "Storage for cups, mugs, sugar, stirrers and alternative milks close by.",
            "Plain-English instructions for everyday errors. “Empty grounds bin” must not require an engineer.",
            "Noise impact on the nearest desks."
          ],
          options: [
            { label: "Include non-coffee drinkers in the trial", verdict: "RECOMMENDED" },
            { label: "Hot water / tea function", verdict: "DESIRABLE" }
          ],
          position: null
        }
      ]
    },
    {
      front: "IV",
      name: "UPKEEP",
      items: [
        {
          code: "SR-10",
          title: "Cleaning",
          status: "CONTESTED",
          question: "Who cleans it — every day, forever?",
          intel: [
            "Fresh-milk systems need daily cleaning: usually an automatic cycle with a cleaning tablet or fluid, plus a few manual parts.",
            "Weekly: brew unit, drip tray, grounds bin. Periodically: descaling, depending on water hardness and filter.",
            "A neglected milk system means bad coffee and a genuine hygiene risk.",
            "Decide the owner: facilities, the cleaning contractor, the supplier, or a volunteer rota. The rota is where movements go to die."
          ],
          options: [
            { label: "Cleaning contractor / facilities", verdict: "PREFERRED" },
            { label: "Supplier-managed", verdict: "INVESTIGATE" },
            { label: "Volunteer rota", verdict: "HIGH RISK" }
          ],
          position: null
        },
        {
          code: "SR-11",
          title: "Maintenance",
          status: "OPEN",
          question: "How do we keep it running for years, not weeks?",
          intel: [
            "Water-filter changes and descaling on a schedule set by our water hardness.",
            "Preventative service visits: how often, and what is included?",
            "Parts and labour cover — and what is excluded.",
            "Expected lifespan and what happens at the end of it."
          ],
          options: [
            { label: "Preventative service plan", verdict: "RECOMMENDED" },
            { label: "Pay-per-callout", verdict: "RISKY" }
          ],
          position: null
        },
        {
          code: "SR-12",
          title: "Supplier support",
          status: "PRIORITY",
          question: "It breaks at 08:55 on a Monday. What happens next?",
          intel: [
            "Engineer response time, in writing, in the contract.",
            "A loan or replacement machine during long repairs.",
            "Initial training for staff and for whoever owns cleaning.",
            "Beans and consumables: included, optional or locked in? Contract length, exit terms and annual price increases."
          ],
          options: [
            { label: "Written response-time SLA", verdict: "REQUIRED" },
            { label: "Loan machine clause", verdict: "DESIRABLE" },
            { label: "Mandatory supplier beans", verdict: "NEGOTIATE" }
          ],
          position: null
        }
      ]
    },
    {
      front: "V",
      name: "WAR CHEST",
      items: [
        {
          code: "SR-13",
          title: "Purchase vs rental",
          status: "CONTESTED",
          question: "Buy it outright, lease it, or rent it with service included?",
          intel: [
            "Purchase: higher up-front cost, often cheaper over a long life. Service contract usually separate.",
            "Lease/rental: predictable monthly cost, often includes maintenance and replacement.",
            "Watch minimum terms, auto-renewal, end-of-term charges and price-rise clauses.",
            "Compare the total cost over the same period (e.g. 3–5 years), never the monthly headline."
          ],
          options: [
            { label: "Outright purchase + service plan", verdict: "OPTION" },
            { label: "Rental including service", verdict: "OPTION" },
            { label: "Lease-to-own", verdict: "OPTION" }
          ],
          position: null
        },
        {
          code: "SR-14",
          title: "Cost per cup",
          status: "PRIORITY",
          question: "What does one proper coffee actually cost?",
          intel: [
            "Cost per cup = (beans + milk + consumables + rental/service) ÷ drinks served.",
            "A single shot typically uses roughly 7–10 g of coffee; a milk drink roughly 100–200 ml of milk.",
            "Hidden costs: cleaning products, water filters, cups, electricity, somebody's time.",
            "Compare against what we already spend on instant, pods and café runs. That is the real baseline."
          ],
          options: [
            { label: "Model it in the Field Calculator", verdict: "ACTION" },
            { label: "Request itemised quotes", verdict: "ACTION" }
          ],
          position: null
        }
      ]
    }
  ],

  /* ------------------------------------------------------------------------
     04 — INTELLIGENCE FILES
     The candidate machines. Figures are manufacturer / retailer claims.
       type:    "MACHINE" | "SUPPLIER"
       summary: [label, value] rows shown on the card
       threat:  1–5 (maintenance complexity / operational risk)
       specs:   [label, value] rows shown in the full dossier
       details: { heading: [bullets] } shown in the full dossier
       source:  { name, url, retrieved }
       image:   optional photo path (4:3 works best); imageAlt: its description
     ------------------------------------------------------------------------ */
  dossiers: [
    {
      id: "CFN-D01",
      type: "MACHINE",
      subject: "avari B20",
      image: "img/avari-b20.jpg",
      imageAlt: "avari B20 bean-to-cup machine with its milk fridge",
      codename: "The Steady Hand",
      summary: [
        ["Supplier", "rijo42"],
        ["Class", "Bean-to-cup"],
        ["Capacity", "200 cups/day (maker)"],
        ["Milk system", "Fresh — 6 L fridge included"],
        ["Price", "On enquiry (lease, rent or buy)"]
      ],
      threat: 3,
      threatNote: "Automatic daily clean of about 14–15 minutes. Runs from a standard 13 A supply.",
      intel: "Fresh-milk bean-to-cup with twin ceramic grinders and a 10.1\" touchscreen. Compact, and it runs from a normal plug. Rated for 200 cups a day, so check that against peak demand.",
      status: "UNDER REVIEW",
      specs: [
        ["Rated output", "200 cups/day"],
        ["Grinders", "2× ceramic"],
        ["Brew chamber", "21 g"],
        ["Hoppers", "2× 700 g beans, 2× 800 g powder"],
        ["Display", "10.1\" HD touchscreen"],
        ["Drinks", "Espresso, americano, latte, cappuccino, flat white, cortado, mocha, hot chocolate, iced/chilled drinks, hot water"],
        ["Milk", "Fresh, refrigerated (6 L fridge included), incl. cold milk foam"],
        ["Cleaning", "Automatic daily cycle, ~14–15 min"],
        ["Power", "Machine 2,900 W / 13 A; fridge 65 W / 13 A"],
        ["Machine size", "W320 × H680 × D545 mm, 25 kg"],
        ["Fridge size", "W240 × H527 × D420 mm, 14 kg"],
        ["Supplier includes", "Installation & plumbing, training, service, starter package"],
        ["Optional extras", "Base cabinet, cup warmer, contactless payment, expulsion kit"]
      ],
      details: {
        "For": [
          "Fresh milk as standard, fridge included",
          "13 A supply: no special electrical work expected",
          "Smallest footprint of the three (~56 cm wide with fridge)",
          "Installation, plumbing and training included by the supplier"
        ],
        "Against": [
          "200 cups/day ceiling leaves limited headroom for a large office",
          "Price not published",
          "Longest daily clean of the two bean-to-cup options (~15 min)"
        ],
        "Questions for the supplier": [
          "Lease, rental and purchase prices, and what each includes?",
          "Real drinks per hour for a flat white at peak?",
          "Engineer response time, in writing?",
          "Are we required to buy rijo42 beans and milk products?",
          "Plant-milk option?"
        ]
      },
      source: {
        name: "rijo42",
        url: "https://www.rijo42.co.uk/coffee-machines/bean-cup-machines/avari-b20",
        retrieved: "25.09.2026"
      }
    },
    {
      id: "CFN-D02",
      type: "MACHINE",
      subject: "R42 Touch",
      image: "img/r42-touch.jpg",
      imageAlt: "R42 Touch bean-to-cup machine with milk fridge and powder module",
      codename: "The Flagship",
      summary: [
        ["Supplier", "rijo42"],
        ["Class", "Bean-to-cup"],
        ["Capacity", "207 cups/hour (maker)"],
        ["Milk system", "Fresh — 6 L fridge; dual fridge optional"],
        ["Price", "On enquiry (lease, rent or buy)"]
      ],
      threat: 4,
      threatNote: "Shortest daily clean (~9 min), but three heavy units and a 3.1 kW draw. Confirm the electrical supply.",
      intel: "rijo42's most advanced machine. Self-adjusting double grinders, separate coffee and steam boilers, and a double outlet, so it's built for queues. Hot and chilled milk foam. It's also the biggest and probably the most expensive.",
      status: "UNDER REVIEW",
      specs: [
        ["Rated output", "207 cups/hour"],
        ["Outlet", "Automatic double"],
        ["Grinders", "2× self-adjusting"],
        ["Boilers", "Separate coffee and steam"],
        ["Brew chamber", "18 g (stainless steel brewing unit)"],
        ["Hoppers", "2× 1.3 kg beans; powder module 2× 1.8 L"],
        ["Display", "10\" HD touchscreen, up to 300 drink selections"],
        ["Milk", "Fresh, hot and chilled foam; 6 L fridge (dual fridge optional)"],
        ["Cleaning", "Daily, ~9 min"],
        ["Power", "3.1 kW single-phase (220–240 V) or 6 kW three-phase; fridge and powder module 0.10 kW each"],
        ["Machine size", "W300 × H770 × D575 mm, 57 kg"],
        ["Fridge size", "W300 × H576 × D385 mm, 29 kg"],
        ["Powder module", "W160 × H770 × D378 mm, 13 kg"],
        ["Supplier includes", "Installation & plumbing, training, service, starter package"],
        ["Optional extras", "Under-counter fridge, dual milk fridge, contactless payment, expulsion kit, AutoSteam wand"]
      ],
      details: {
        "For": [
          "Highest throughput, with a double outlet for peak queues",
          "Dual milk fridge option: dairy and plant milk without bodging",
          "Shortest daily clean of the three",
          "Self-adjusting grinders keep quality consistent without tinkering"
        ],
        "Against": [
          "Largest footprint: ~76 cm wide across machine, fridge and powder module",
          "Heaviest: ~99 kg in total, so check the counter",
          "3.1 kW draw: check whether a dedicated circuit is needed",
          "Price not published; likely the most expensive"
        ],
        "Questions for the supplier": [
          "Lease, rental and purchase prices, and what each includes?",
          "Electrical requirement for our building: 13 A plug or dedicated circuit?",
          "Cost of the dual milk fridge?",
          "Engineer response time, in writing?",
          "Are we required to buy rijo42 beans and milk products?"
        ]
      },
      source: {
        name: "rijo42",
        url: "https://www.rijo42.co.uk/coffee-machines/bean-cup-machines/r42-touch",
        retrieved: "25.09.2026"
      }
    },
    {
      id: "CFN-D03",
      type: "MACHINE",
      subject: "Fracino 2-Group",
      image: "img/fracino-2-group.jpg",
      imageAlt: "Fracino 2-group stainless steel espresso machine",
      codename: "The Old Guard",
      summary: [
        ["Supplier", "Kitchen Solutions"],
        ["Class", "Traditional espresso — not bean-to-cup"],
        ["Capacity", "120/200 cups/hour (maker)"],
        ["Milk system", "Fresh — manual steam wands"],
        ["Price", "£1,875 ex VAT (purchase)"]
      ],
      threat: 5,
      threatNote: "Every drink is made by hand. Needs a separate grinder, trained people and manual cleaning.",
      intel: "Proper café equipment, handmade in Birmingham, and the only candidate with a published price. It makes the best coffee on the list in skilled hands and the worst in unskilled ones. No grinder is listed, so one must be bought separately.",
      status: "UNDER REVIEW — CONTESTED",
      specs: [
        ["Model", "BAM2E-C"],
        ["Type", "2-group electronic espresso machine"],
        ["Rated output", "120/200 cups/hour"],
        ["Dosing", "Touch pad with pre-programmed measures, override button"],
        ["Boiler", "4 L"],
        ["Hot water", "15 L/hour"],
        ["Milk", "Steam wands for frothing and steaming (manual)"],
        ["Group height", "120 mm (taller cups)"],
        ["Grinder", "Not listed — required separately"],
        ["Power", "2.4 kW, single-phase, 10 A"],
        ["Size", "W380 × D500 × H535 mm, 35 kg"],
        ["Build", "Polished 304 stainless steel, rotary brass valves"],
        ["Warranty", "1 year parts & labour"],
        ["Price", "£1,875 ex VAT; optional all-inclusive package (delivery, installation, set-up, training)"]
      ],
      details: {
        "For": [
          "Lowest known price, published, and ours to own outright",
          "Highest quality ceiling: real café-style espresso and milk",
          "Two groups: two people can serve at once",
          "UK-built, simple, long-lived machinery"
        ],
        "Against": [
          "Not bean-to-cup: conflicts with Objective 01",
          "Separate grinder needed: extra cost and counter space",
          "Someone has to make every drink, which is slow at 09:00 unless people are trained",
          "Manual milk steaming and manual daily cleaning (backflush, wands)",
          "Only 1-year warranty; servicing arranged separately"
        ],
        "Questions for the supplier": [
          "Price of the all-inclusive package?",
          "Recommended grinder and its cost?",
          "Service and maintenance options after year one?",
          "Water filter requirements for plumbing in?"
        ]
      },
      source: {
        name: "Kitchen Solutions",
        url: "https://www.kitchensolutions.co.uk/products/fracino-2-group-espresso-machine-bam2e-c?variant=55569870389624&country=GB&currency=GB",
        retrieved: "25.09.2026"
      }
    }
  ],

  /* ------------------------------------------------------------------------
     05 — OPERATION TIMELINE
     Status is derived from config.currentPhase.
     ------------------------------------------------------------------------ */
  phases: [
    {
      name: "Mobilisation",
      summary: "Kickoff meeting.",
      detail: "Committee reconvenes. Scope, budget boundaries and investigation assignments agreed.",
      window: "SEP 2026"
    },
    {
      name: "Intelligence gathering",
      summary: "Committee members investigate options and formulate positions.",
      detail: "Supplier contact, quotes, demos, site survey, peak-time observation.",
      window: "TBC"
    },
    {
      name: "The debate",
      summary: "Trade-offs and proposals are challenged.",
      detail: "Each branch in the Situation Room is argued until it has a position.",
      window: "TBC"
    },
    {
      name: "The vote",
      summary: "Final decision.",
      detail: "One machine. One supplier. One contract. No abstentions on milk.",
      window: "TBC"
    },
    {
      name: "Procurement",
      summary: "Machine ordered and installed.",
      detail: "Purchase approved, installation booked, cleaning owner confirmed, training delivered.",
      window: "TBC"
    },
    {
      name: "Liberation day",
      summary: "The first proper coffee is served.",
      detail: "Attendance mandatory. Instant coffee formally retired.",
      window: "TBC"
    }
  ],

  /* ------------------------------------------------------------------------
     06 — COMMITTEE TRANSMISSION  (newest first)
     body: array of paragraphs. meta: optional [label, value] pairs.
     ------------------------------------------------------------------------ */
  transmissions: [
    {
      number: "002",
      date: "25.09.2026",
      time: "08:42",
      classification: "CAFFEINATED",
      title: "The committee reconvenes",
      live: true,
      body: [
        "After a long silence the committee is operational again. Phase 01 — Mobilisation — is now active.",
        "A kickoff meeting will agree the scope of the decision, the budget boundaries and who investigates which branch of the Situation Room.",
        "Bring opinions. Bring evidence. Bring your own mug."
      ],
      meta: [
        ["Kickoff", "Date TBC"],
        ["Location", "[REDACTED]"],
        ["Attendance", "Open to all comrades"]
      ]
    },
    {
      number: "001",
      date: "██.██.2025",
      time: "09:15",
      classification: "ARCHIVED",
      title: "The first uprising",
      live: false,
      body: [
        "Initial demands drafted: fresh beans, fresh milk, proper coffee, no compromise.",
        "Signal lost shortly afterwards. Recovered from the archive."
      ],
      meta: []
    }
  ],

  briefing: {
    title: "Next briefing",
    rows: [
      ["Date", "TBC"],
      ["Time", "TBC"],
      ["Location", "[REDACTED]"],
      ["Agenda", "Kickoff — scope, budget, assignments"]
    ],
    orders: [
      "Note how many people queue for hot drinks between 08:45 and 09:30.",
      "Count your own drinks per day. Honestly.",
      "Report any supplier contacts to the committee.",
      "Do not accept instant coffee as a compromise."
    ]
  }
};
