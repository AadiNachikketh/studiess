import { ChapterDoc, LectureDoc, PriorityLevel, SubjectName, TaskDoc } from '../types/mission';

export interface DronaLectureTemplate {
  code: string;
  title: string;
  scheduledDate: string;
  notes: string;
  durationMinutes?: number;
}

export interface DronaChapterBlueprint {
  id: string;
  subject: SubjectName;
  title: string;
  totalLectures: number;
  priority: 'High' | 'Medium' | 'Low';
  dateRange: string;
  subtopicsSummary: string;
  sampleLectures: DronaLectureTemplate[];
}

export interface DronaTestMilestone {
  id: string;
  title: string;
  type: 'Short Test' | 'JEE Main' | 'JEE Advance' | 'Revision';
  date: string;
  syllabusNote: string;
  priority: PriorityLevel;
}

export const DRONA_TEST_MILESTONES: DronaTestMilestone[] = [
  {
    id: 'task_drona_test_st1',
    title: 'Drona 2.0 — Short Test-1 (Basic Math, Vectors, Mole Concept)',
    type: 'Short Test',
    date: '2026-06-28',
    syllabusNote: 'Physics: Basic Math & Vectors · Chem: Mole Concept · Math: Wavy Curve & Inequalities',
    priority: 'High',
  },
  {
    id: 'task_drona_test_jm1',
    title: 'Drona 2.0 — JEE Main Test - 1',
    type: 'JEE Main',
    date: '2026-07-12',
    syllabusNote: 'Vectors, Units & Dimensions, Mole Concept Complete, Set Theory',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm2',
    title: 'Drona 2.0 — JEE Main Test - 2',
    type: 'JEE Main',
    date: '2026-07-26',
    syllabusNote: 'Motion in Straight Line, Structure of Atom, Trigonometric Ratios & Identities',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_ja1',
    title: 'Drona 2.0 — JEE Advance Test - 1',
    type: 'JEE Advance',
    date: '2026-08-09',
    syllabusNote: 'Cumulative Paper 1 & 2: Kinematics 1D, Atomic Structure, Trigonometry',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm3',
    title: 'Drona 2.0 — JEE Main Test - 3',
    type: 'JEE Main',
    date: '2026-08-23',
    syllabusNote: 'Motion in a Plane (Projectile & Relative), Periodic Table, Trigonometric Equations',
    priority: 'High',
  },
  {
    id: 'task_drona_test_jm4',
    title: 'Drona 2.0 — JEE Main Test - 4',
    type: 'JEE Main',
    date: '2026-09-06',
    syllabusNote: 'Laws of Motion (NLM), Periodic Properties Complete, Quadratic Equations',
    priority: 'High',
  },
  {
    id: 'task_drona_test_ja2',
    title: 'Drona 2.0 — JEE Advance Test - 2',
    type: 'JEE Advance',
    date: '2026-09-20',
    syllabusNote: 'NLM, Friction, Chemical Bonding (VSEPR & Hybridization), Quadratic Equations',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm5',
    title: 'Drona 2.0 — JEE Main Test - 5',
    type: 'JEE Main',
    date: '2026-10-04',
    syllabusNote: 'Circular Motion, Chemical Bonding Complete, IUPAC Naming, Sequence & Series',
    priority: 'High',
  },
  {
    id: 'task_drona_test_jm6',
    title: 'Drona 2.0 — JEE Main Test - 6',
    type: 'JEE Main',
    date: '2026-10-18',
    syllabusNote: 'Work Energy Power, IUPAC Complete, Gaseous State, Relation & Function',
    priority: 'High',
  },
  {
    id: 'task_drona_test_ja3',
    title: 'Drona 2.0 — JEE Advance Test - 3',
    type: 'JEE Advance',
    date: '2026-11-01',
    syllabusNote: 'Centre of Mass & Collisions, Thermodynamics, Permutations & Combinations',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm7',
    title: 'Drona 2.0 — JEE Main Test - 7',
    type: 'JEE Main',
    date: '2026-11-22',
    syllabusNote: 'Rotational Motion, Redox & Chemical Equilibrium, Binomial Theorem & Straight Lines',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm8',
    title: 'Drona 2.0 — JEE Main Test - 8',
    type: 'JEE Main',
    date: '2026-12-06',
    syllabusNote: 'Rotational Motion & Gravitation, Ionic Equilibrium Complete, Straight Lines & Circles',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_ja4',
    title: 'Drona 2.0 — JEE Advance Test - 4',
    type: 'JEE Advance',
    date: '2026-12-20',
    syllabusNote: 'Thermal Properties, Structural & Stereo Isomerism Complete, Circles & Parabola',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm9',
    title: 'Drona 2.0 — JEE Test - 9',
    type: 'JEE Main',
    date: '2027-01-03',
    syllabusNote: 'Mechanical Properties of Solids & Fluids, GOC (Inductive, Resonance, Aromaticity), Ellipse',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm10',
    title: 'Drona 2.0 — JEE Test - 10',
    type: 'JEE Main',
    date: '2027-01-17',
    syllabusNote: 'Fluids & Physics Thermodynamics, GOC Complete & Hydrocarbons, Hyperbola & Complex Numbers',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_ja5',
    title: 'Drona 2.0 — JEE Advance Test - 5',
    type: 'JEE Advance',
    date: '2027-01-31',
    syllabusNote: 'SHM, Hydrocarbons & Purification, Complex Numbers & Limits/Derivatives',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_jm11',
    title: 'Drona 2.0 — JEE Test - 11',
    type: 'JEE Main',
    date: '2027-02-14',
    syllabusNote: 'Waves & Experimental Physics, P-Block & S-Block/Hydrogen, Statistics, Probability & SOT',
    priority: 'Critical',
  },
  {
    id: 'task_drona_rev_block',
    title: 'Drona 2.0 — Full Batch Revision Classes Block (Feb 15 – Feb 27)',
    type: 'Revision',
    date: '2027-02-15',
    syllabusNote: '12-Day Intensive Revision across Physics, Chemistry (Organic 32 + Physical 47 + Inorganic), and Math',
    priority: 'High',
  },
  {
    id: 'task_drona_test_jm12',
    title: 'Drona 2.0 — JEE Test - 12 (Full Syllabus Mock)',
    type: 'JEE Main',
    date: '2027-02-28',
    syllabusNote: 'Complete Class 11 Drona JEE 2.0 2027 Full Syllabus Main Pattern Test',
    priority: 'Critical',
  },
  {
    id: 'task_drona_test_ja6',
    title: 'Drona 2.0 — JEE Advance Test - 6 (Full Syllabus Finale)',
    type: 'JEE Advance',
    date: '2027-03-14',
    syllabusNote: 'Complete Class 11 Drona JEE 2.0 2027 Full Syllabus Advanced Paper 1 & 2',
    priority: 'Critical',
  },
];

export const DRONA_CHAPTER_BLUEPRINTS: DronaChapterBlueprint[] = [
  // ===========================================================================
  // CHEMISTRY — EXACT DRONA JEE 2.0 2027 BREAKDOWN
  // Organic Chemistry = 32 Lectures | Physical Chemistry = 47 Lectures | Inorganic = 32 Lectures
  // ===========================================================================
  {
    id: 'ch_chem_organic',
    subject: 'Chemistry',
    title: 'Organic Chemistry',
    totalLectures: 32,
    priority: 'High',
    dateRange: 'Sep 30, 2026 – Jan 29, 2027',
    subtopicsSummary:
      'Drona 2.0 Complete Organic Track (32 Lectures): IUPAC Naming (6) · Structural & Stereo Isomerism (8) · General Organic Chemistry GOC (9) · Hydrocarbons (7) · Purification & Quantitative Analysis (2)',
    sampleLectures: [
      {
        code: 'ORG-L01',
        title: 'IUPAC L1: Tetravalency of Carbon, Hybridization (sp3/sp2/sp) & 2D/3D Representation',
        scheduledDate: '2026-09-30',
        notes: 'Drona 2.0 Sep 30: Sigma & Pi bond counting, Condensed & Bond-line structural formulas.',
      },
      {
        code: 'ORG-L02',
        title: 'IUPAC L2: Functional Groups, Homologous Series & Degree of C/H/N/Alcohol',
        scheduledDate: '2026-10-01',
        notes: 'Drona 2.0 Oct 1: Classification of organic compounds (Benzenoid/Non-benzenoid, Heterocyclic).',
      },
      {
        code: 'ORG-L03',
        title: 'IUPAC L3: Degree of Unsaturation (DU / DBE) & Alkanes/Alkenes/Alkynes Nomenclature',
        scheduledDate: '2026-10-02',
        notes: 'Drona 2.0 Oct 2: Ring + Double Bond Equivalent calculation & longest chain selection rules.',
      },
      {
        code: 'ORG-L04',
        title: 'IUPAC L4: Cycloalkanes, Functional Groups with/without Carbon & Priority Table',
        scheduledDate: '2026-10-03',
        notes: 'Drona 2.0 Oct 3: Principal functional group suffix vs substituent prefix rules.',
      },
      {
        code: 'ORG-L05',
        title: 'IUPAC L5: Polyfunctional Compounds & Aromatic Substituted Benzene Nomenclature',
        scheduledDate: '2026-10-08',
        notes: 'Drona 2.0 Oct 8: Ortho/Meta/Para conventions & multi-substituted aromatic rings.',
      },
      {
        code: 'ORG-L06',
        title: 'IUPAC L6: Bicyclo & Spiro Naming, Common Names & JEE PYQs',
        scheduledDate: '2026-10-09',
        notes: 'Drona 2.0 Oct 9: Bridgehead numbering in bicyclo [x.y.z] vs spiro [x.y] systems.',
      },
      {
        code: 'ORG-L07',
        title: 'Isomerism L1: Classification of Isomerism — Chain & Position Isomerism',
        scheduledDate: '2026-12-05',
        notes: 'Drona 2.0 Dec 5: Minimum carbons required for chain & position isomers.',
      },
      {
        code: 'ORG-L08',
        title: 'Isomerism L2: Metamers, Ring-Chain Isomerism & Functional Group Isomerism',
        scheduledDate: '2026-12-08',
        notes: 'Drona 2.0 Dec 8: Bridging bivalent functional groups & ring-chain DU matching.',
      },
      {
        code: 'ORG-L09',
        title: 'Isomerism L3: Tautomerism — Keto-Enol System, Enol Content & Acid/Base Catalysis',
        scheduledDate: '2026-12-10',
        notes: 'Drona 2.0 Dec 10: Intramolecular H-bonding & aromaticity driving enol stability.',
      },
      {
        code: 'ORG-L10',
        title: 'Isomerism L4: Calculation of Structural Isomers (Part 1 — Monovalent Group Replacement)',
        scheduledDate: '2026-12-11',
        notes: 'Drona 2.0 Dec 11: Equivalent hydrogens & structural isomer enumeration.',
      },
      {
        code: 'ORG-L11',
        title: 'Isomerism L5: Calculation of Structural Isomers (Part 2 — Cyclic & Aromatic) + PYQs',
        scheduledDate: '2026-12-12',
        notes: 'Drona 2.0 Dec 12: Dihalobenzene & trisubstituted benzene isomer counts.',
      },
      {
        code: 'ORG-L12',
        title: 'Isomerism L6: Geometrical Isomerism — Cis/Trans, CIP Sequence Rules (E/Z) & Cycloalkanes',
        scheduledDate: '2026-12-15',
        notes: 'Drona 2.0 Dec 15: Restricted rotation in alkenes, oximes, cumulenes & biphenyls.',
      },
      {
        code: 'ORG-L13',
        title: 'Isomerism L7: Conformational Isomerism — Sawhorse, Newman Projections & Gauche Effect',
        scheduledDate: '2026-12-17',
        notes: 'Drona 2.0 Dec 17: Ethane, butane & ethylene glycol dihedral angle potential energy graphs.',
      },
      {
        code: 'ORG-L14',
        title: 'Isomerism L8: Optical Isomerism — POS/COS/AOS, Chiral Centers, R/S, Enantiomers & Meso',
        scheduledDate: '2026-12-19',
        notes: 'Drona 2.0 Dec 19: Fischer projection R/S, diastereomers, racemic mixture & total stereoisomers.',
      },
      {
        code: 'ORG-L15',
        title: 'GOC L1: Homolytic/Heterolytic Bond Fission, Nucleophiles/Electrophiles & Inductive Effect',
        scheduledDate: '2026-12-23',
        notes: 'Drona 2.0 Dec 23: +I and -I order & distance-dependent sigma polarization.',
      },
      {
        code: 'ORG-L16',
        title: 'GOC L2: Applications of Inductive Effect — Carbocation, Carbanion & Free Radical Stability',
        scheduledDate: '2026-12-26',
        notes: 'Drona 2.0 Dec 26: Bredt rule at bridgehead carbons & intermediate hybridization.',
      },
      {
        code: 'ORG-L17',
        title: 'GOC L3: Hyperconjugation — Alpha-H Counting, Alkene Heat of Hydrogenation & Bond Length',
        scheduledDate: '2026-12-29',
        notes: 'Drona 2.0 Dec 29: No-bond resonance in carbocations, free radicals & alkylbenzenes.',
      },
      {
        code: 'ORG-L18',
        title: 'GOC L4: Resonance (Part 1) — Conjugation Types, Canonical Forms & Resonance Hybrid',
        scheduledDate: '2026-12-31',
        notes: 'Drona 2.0 Dec 31: Rules for comparing stability of resonating structures.',
      },
      {
        code: 'ORG-L19',
        title: 'GOC L5: Resonance (Part 2) & Aromaticity — Huckel Rule, Annulenes & Quasi-Aromatic',
        scheduledDate: '2027-01-05',
        notes: 'Drona 2.0 Jan 5: Aromatic vs Anti-aromatic vs Non-aromatic ions & Frost circle.',
      },
      {
        code: 'ORG-L20',
        title: 'GOC L6: Mesomeric Effect (+M / -M) & Comprehensive Stability of Reaction Intermediates',
        scheduledDate: '2027-01-07',
        notes: 'Drona 2.0 Jan 7: Dancing resonance in cyclopropylmethyl carbocation & SIR effect.',
      },
      {
        code: 'ORG-L21',
        title: 'GOC L7: Acidic & Basic Strength Comparison, Ortho Effect & SIR in Substituted Anilines',
        scheduledDate: '2027-01-09',
        notes: 'Drona 2.0 Jan 9: pKa and pKb orders in phenols, carboxylic acids, amines & guanidine.',
      },
      {
        code: 'ORG-L22',
        title: 'GOC L8: Advanced Tautomerism & Organic Reaction Types (Addition, Elimination, Substitution)',
        scheduledDate: '2027-01-12',
        notes: 'Drona 2.0 Jan 12: Leaving group ability & nucleophilicity vs basicity.',
      },
      {
        code: 'ORG-L23',
        title: 'GOC L9: Qualitative Analysis (Lassaigne Test for N, S, Halogens) & GOC PYQs',
        scheduledDate: '2027-01-15',
        notes: 'Drona 2.0 Jan 15: Prussian blue, sodium nitroprusside test & AgNO3 precipitation.',
      },
      {
        code: 'ORG-L24',
        title: 'Hydrocarbon L1: Alkanes — Wurtz, Kolbe Electrolysis, Decarboxylation & Corey-House',
        scheduledDate: '2027-01-16',
        notes: 'Drona 2.0 Jan 16: Grignard reagent protonation & Clemmensen/Wolff-Kishner reductions.',
      },
      {
        code: 'ORG-L25',
        title: 'Hydrocarbon L2: Alkanes — Free Radical Halogenation, Selectivity & Aromatization',
        scheduledDate: '2027-01-19',
        notes: 'Drona 2.0 Jan 19: Reactivity-selectivity principle (Cl2 vs Br2) & NBS allylic bromination.',
      },
      {
        code: 'ORG-L26',
        title: 'Hydrocarbon L3: Alkenes — Dehydration, Dehydrohalogenation (Saytzeff/Hofmann) & Birch/Lindlar',
        scheduledDate: '2027-01-21',
        notes: 'Drona 2.0 Jan 21: Syn vs Anti hydrogenation of alkynes & E1/E2 stereochemistry.',
      },
      {
        code: 'ORG-L27',
        title: 'Hydrocarbon L4: Alkenes — Markownikoff, Kharasch Peroxide Effect, OM-DM & HBO',
        scheduledDate: '2027-01-22',
        notes: 'Drona 2.0 Jan 22: Oxymercuration-demercuration vs Hydroboration-oxidation regioselectivity.',
      },
      {
        code: 'ORG-L28',
        title: 'Hydrocarbon L5: Alkenes — Baeyer Reagent, Epoxidation, Reductive/Oxidative Ozonolysis',
        scheduledDate: '2027-01-23',
        notes: 'Drona 2.0 Jan 23: Syn vs Anti hydroxylation (OsO4 vs mCPBA) & ozonolysis retro-synthesis.',
      },
      {
        code: 'ORG-L29',
        title: 'Hydrocarbon L6: Alkynes — Preparation, Terminal Acidic H Reactions, Kucherov Hydration',
        scheduledDate: '2027-01-24',
        notes: 'Drona 2.0 Jan 24: Tollens/Fehling distinction of terminal vs internal alkynes & cyclic polymerization.',
      },
      {
        code: 'ORG-L30',
        title: 'Hydrocarbon L7: Benzene & Aromatic Hydrocarbons — EAS Nitration, Sulfonation & Friedel-Crafts',
        scheduledDate: '2027-01-25',
        notes: 'Drona 2.0 Jan 25: Activating/deactivating groups, o/p vs meta directors & Birch reduction.',
      },
      {
        code: 'ORG-L31',
        title: 'Purification & Quantitative Analysis L1: Distillation, Chromatography, Dumas & Kjeldahl Method',
        scheduledDate: '2027-01-27',
        notes: 'Drona 2.0 Jan 27: Carius method for halogens/sulfur/phosphorus & %N numericals.',
      },
      {
        code: 'ORG-L32',
        title: 'Environmental Chemistry L1: Tropospheric/Stratospheric Pollution, Smog, BOD & Green Chemistry',
        scheduledDate: '2027-01-29',
        notes: 'Drona 2.0 Jan 29: Photochemical vs classical smog, ozone depletion & water quality standards.',
      },
    ],
  },
  {
    id: 'ch_chem_physical',
    subject: 'Chemistry',
    title: 'Physical Chemistry',
    totalLectures: 47,
    priority: 'High',
    dateRange: 'Jun 6, 2026 – Dec 4, 2026',
    subtopicsSummary:
      'Drona 2.0 Complete Physical Track (47 Lectures): Mole Concept (10) · Structure of Atom (7) · Gaseous State (6) · Thermodynamics & Thermochemistry (8) · Redox Reaction (3) · Chemical Equilibrium (5) · Ionic Equilibrium (8)',
    sampleLectures: [
      {
        code: 'PHYCHEM-L01',
        title: 'Mole Concept L1: Classification of Matter, Dalton Theory, AMU & Mole Definition',
        scheduledDate: '2026-06-06',
        notes: 'Drona 2.0 Jun 6: Avogadro constant NA & subatomic particle counting in ions/molecules.',
      },
      {
        code: 'PHYCHEM-L02',
        title: 'Mole Concept L2: Ideal Gas Equation (PV=nRT), Molar Volume at STP/NTP & Y-Map',
        scheduledDate: '2026-06-12',
        notes: 'Drona 2.0 Jun 12: Interconversion of mass, moles, number of particles & gas volume.',
      },
      {
        code: 'PHYCHEM-L03',
        title: 'Mole Concept L3: Laws of Chemical Combination (Conservation, Definite & Multiple Proportions)',
        scheduledDate: '2026-06-13',
        notes: 'Drona 2.0 Jun 13: Gay-Lussac law of gaseous volumes & Avogadro hypothesis.',
      },
      {
        code: 'PHYCHEM-L04',
        title: 'Mole Concept L4: Percentage Composition, Empirical Formula & Molecular Formula',
        scheduledDate: '2026-06-19',
        notes: 'Drona 2.0 Jun 19: Combustion analysis of CxHyOz organic compounds.',
      },
      {
        code: 'PHYCHEM-L05',
        title: 'Mole Concept L5: Relative Density, Vapour Density, Average Atomic & Molar Mass',
        scheduledDate: '2026-06-20',
        notes: 'Drona 2.0 Jun 20: Isotopic abundance & gaseous mixture average molecular weight.',
      },
      {
        code: 'PHYCHEM-L06',
        title: 'Mole Concept L6: Gram Atomic Mass, Gram Molecular Mass & Formula Mass',
        scheduledDate: '2026-06-26',
        notes: 'Drona 2.0 Jun 26: Minimum molecular weight calculations from % element data.',
      },
      {
        code: 'PHYCHEM-L07',
        title: 'Mole Concept L7: Stoichiometry of Balanced Chemical Equations',
        scheduledDate: '2026-06-27',
        notes: 'Drona 2.0 Jun 27: Stoichiometric coefficients & mole ratio method.',
      },
      {
        code: 'PHYCHEM-L08',
        title: 'Mole Concept L8: Mass-Mass, Mass-Mole & Mole-Volume Analysis',
        scheduledDate: '2026-07-03',
        notes: 'Drona 2.0 Jul 3: Thermal decomposition of carbonates, chlorates & nitrates.',
      },
      {
        code: 'PHYCHEM-L09',
        title: 'Mole Concept L9: Limiting Reagent, % Yield, % Purity & Principle of Atom Conservation (POAC)',
        scheduledDate: '2026-07-04',
        notes: 'Drona 2.0 Jul 4: POAC multi-step reaction shortcuts.',
      },
      {
        code: 'PHYCHEM-L10',
        title: 'Mole Concept L10: Concentration Terms (Molarity, Molality, Mole Fraction, ppm) & Mixing',
        scheduledDate: '2026-07-10',
        notes: 'Drona 2.0 Jul 10: Dilution, acid-base mixing & sequential/parallel reactions.',
      },
      {
        code: 'PHYCHEM-L11',
        title: 'Structure of Atom L1: Discovery of e-, p+, n0, Charge-to-Mass Ratio & Rutherford Model',
        scheduledDate: '2026-07-11',
        notes: 'Drona 2.0 Jul 11: Distance of closest approach & impact parameter.',
      },
      {
        code: 'PHYCHEM-L12',
        title: 'Structure of Atom L2: Electromagnetic Waves & Planck Quantum Theory (E = nhv)',
        scheduledDate: '2026-07-17',
        notes: 'Drona 2.0 Jul 17: Photon flux, power of monochromatic source & wavenumber.',
      },
      {
        code: 'PHYCHEM-L13',
        title: 'Structure of Atom L3: Photoelectric Effect (Stopping Potential) & Bohr Model Postulates',
        scheduledDate: '2026-07-18',
        notes: 'Drona 2.0 Jul 18: Bohr radius r_n, velocity v_n & quantized angular momentum.',
      },
      {
        code: 'PHYCHEM-L14',
        title: 'Structure of Atom L4: Ionization Energy, Excitation Potential & Binding Energy',
        scheduledDate: '2026-07-24',
        notes: 'Drona 2.0 Jul 24: KE, PE and Total Energy ratios in H-like species.',
      },
      {
        code: 'PHYCHEM-L15',
        title: 'Structure of Atom L5: Hydrogen Spectrum (Lyman to Humphrey), Rydberg, de Broglie & Heisenberg',
        scheduledDate: '2026-07-25',
        notes: 'Drona 2.0 Jul 25: Max spectral lines n(n-1)/2 & de Broglie wavelength in Bohr orbits.',
      },
      {
        code: 'PHYCHEM-L16',
        title: 'Structure of Atom L6: Quantum Mechanical Model, Orbitals & Quantum Numbers (n, l, m, s)',
        scheduledDate: '2026-07-31',
        notes: 'Drona 2.0 Jul 31: Orbital angular momentum & allowed quantum number combinations.',
      },
      {
        code: 'PHYCHEM-L17',
        title: 'Structure of Atom L7: Aufbau, Pauli, Hund Rule, Magnetic Moment & Radial/Angular Nodes',
        scheduledDate: '2026-08-07',
        notes: 'Drona 2.0 Aug 7: Psi and Psi^2 vs r radial probability distribution graphs.',
      },
      {
        code: 'PHYCHEM-L18',
        title: 'Gaseous State L1: Intermolecular Forces, Measurable Properties & Barometer/Manometer',
        scheduledDate: '2026-10-10',
        notes: 'Drona 2.0 Oct 10: Faulty barometer & open/closed end manometer pressure problems.',
      },
      {
        code: 'PHYCHEM-L19',
        title: 'Gaseous State L2: Boyle, Charles, Gay-Lussac Laws, Ideal Gas Equation & Density Form',
        scheduledDate: '2026-10-15',
        notes: 'Drona 2.0 Oct 15: Pay-load of hot air balloon & connected bulbs gas transfer.',
      },
      {
        code: 'PHYCHEM-L20',
        title: 'Gaseous State L3: Dalton Law of Partial Pressures, Aqueous Tension & Graham Diffusion Law',
        scheduledDate: '2026-10-16',
        notes: 'Drona 2.0 Oct 16: Rate of effusion through pinhole & enrichment factor.',
      },
      {
        code: 'PHYCHEM-L21',
        title: 'Gaseous State L4: Kinetic Theory of Gases (KTG) & Molecular Speeds (u_rms, u_avg, u_mp)',
        scheduledDate: '2026-10-17',
        notes: 'Drona 2.0 Oct 17: Translational KE per mole (3/2 RT) & speed ratio 1 : 1.128 : 1.224.',
      },
      {
        code: 'PHYCHEM-L22',
        title: 'Gaseous State L5: Maxwell-Boltzmann Distribution, Real Gases & Compressibility Factor Z',
        scheduledDate: '2026-10-20',
        notes: 'Drona 2.0 Oct 20: Z vs P isotherms, Boyle temperature T_B & Virial equation.',
      },
      {
        code: 'PHYCHEM-L23',
        title: 'Gaseous State L6: Van der Waals Equation (a & b), Critical Constants (Tc, Pc, Vc) & Eudiometry',
        scheduledDate: '2026-10-21',
        notes: 'Drona 2.0 Oct 21: Liquefaction of gases (Z = 3/8 at critical point) & eudiometry gas contraction.',
      },
      {
        code: 'PHYCHEM-L24',
        title: 'Thermodynamics L1: System/Surroundings, Intensive vs Extensive & State vs Path Functions',
        scheduledDate: '2026-10-22',
        notes: 'Drona 2.0 Oct 22: Exact vs inexact differentials.',
      },
      {
        code: 'PHYCHEM-L25',
        title: 'Thermodynamics L2: Reversible vs Irreversible Processes, Polytropic Process & PV Work',
        scheduledDate: '2026-10-23',
        notes: 'Drona 2.0 Oct 23: Area under PV indicator diagrams & IUPAC sign convention for work.',
      },
      {
        code: 'PHYCHEM-L26',
        title: 'Thermodynamics L3: Internal Energy U, First Law of Thermodynamics, Enthalpy H & Cp - Cv = R',
        scheduledDate: '2026-10-24',
        notes: 'Drona 2.0 Oct 24: Poisson ratio gamma for monoatomic, diatomic & polyatomic gases.',
      },
      {
        code: 'PHYCHEM-L27',
        title: 'Thermodynamics L4: Calculation of q, w, dU, dH in Isothermal, Adiabatic & Isobaric + Hess Law',
        scheduledDate: '2026-10-27',
        notes: 'Drona 2.0 Oct 27: Enthalpy of formation, combustion, bond dissociation & Born-Haber cycle.',
      },
      {
        code: 'PHYCHEM-L28',
        title: 'Thermodynamics L5: Second Law of Thermodynamics, Spontaneity & Entropy Change of Ideal Gas',
        scheduledDate: '2026-10-29',
        notes: 'Drona 2.0 Oct 29: dS = nCv ln(T2/T1) + nR ln(V2/V1) & Carnot efficiency.',
      },
      {
        code: 'PHYCHEM-L29',
        title: 'Thermodynamics L6: Entropy Change for Phase Transitions, Solids/Liquids & Chemical Reactions',
        scheduledDate: '2026-10-30',
        notes: 'Drona 2.0 Oct 30: Trouton rule & dS_fusion / dS_vaporization.',
      },
      {
        code: 'PHYCHEM-L30',
        title: 'Thermodynamics L7: Third Law of Thermodynamics & Standard Absolute Molar Entropy',
        scheduledDate: '2026-10-31',
        notes: 'Drona 2.0 Oct 31: Residual entropy in CO, NO, N2O & ice crystals.',
      },
      {
        code: 'PHYCHEM-L31',
        title: 'Thermodynamics L8: Gibbs Free Energy (dG = dH - TdS), dG° = -RT ln K & Thermochemistry PYQs',
        scheduledDate: '2026-11-04',
        notes: 'Drona 2.0 Nov 4: Temperature dependence of spontaneity & Kirchhoff equation.',
      },
      {
        code: 'PHYCHEM-L32',
        title: 'Redox Reaction L1: Classical & Electronic Concept, Oxidation Number & Paradoxical Structures',
        scheduledDate: '2026-11-05',
        notes: 'Drona 2.0 Nov 5: CrO5, H2SO5 (Caro acid), H2S2O8 (Marshall acid), Br3O8 & C3O2.',
      },
      {
        code: 'PHYCHEM-L33',
        title: 'Redox Reaction L2: Types of Redox (Disproportionation/Comproportionation) & Ion-Electron Balancing',
        scheduledDate: '2026-11-12',
        notes: 'Drona 2.0 Nov 12: Acidic vs Basic medium redox balancing.',
      },
      {
        code: 'PHYCHEM-L34',
        title: 'Redox Reaction L3: Valency Factor (n-Factor), Equivalent Concept & Redox Titrations',
        scheduledDate: '2026-11-13',
        notes: 'Drona 2.0 Nov 13: KMnO4, K2Cr2O7, Iodometric & Iodimetric back titrations.',
      },
      {
        code: 'PHYCHEM-L35',
        title: 'Chemical Equilibrium L1: Reversible vs Irreversible Reactions, Dynamic Equilibrium & Active Mass',
        scheduledDate: '2026-11-14',
        notes: 'Drona 2.0 Nov 14: Rate of forward vs backward reaction graphs.',
      },
      {
        code: 'PHYCHEM-L36',
        title: 'Chemical Equilibrium L2: Law of Mass Action, Kp, Kc, Kx & Relation Kp = Kc(RT)^dn_g',
        scheduledDate: '2026-11-18',
        notes: 'Drona 2.0 Nov 18: Homogeneous vs heterogeneous equilibria & solid-gas dissociation.',
      },
      {
        code: 'PHYCHEM-L37',
        title: 'Chemical Equilibrium L3: Reaction Quotient Q, Van t Hoff Equation & Factors Affecting K',
        scheduledDate: '2026-11-19',
        notes: 'Drona 2.0 Nov 19: Stoichiometric manipulation of equilibrium constants.',
      },
      {
        code: 'PHYCHEM-L38',
        title: 'Chemical Equilibrium L4: Degree of Dissociation (alpha) from Vapour Density (D/d = 1 + (n-1)alpha)',
        scheduledDate: '2026-11-20',
        notes: 'Drona 2.0 Nov 20: PCl5, N2O4 & NH3 synthesis equilibrium tables.',
      },
      {
        code: 'PHYCHEM-L39',
        title: 'Chemical Equilibrium L5: Le Chatelier Principle (Inert Gas Addition, T, P) & Simultaneous Equilibrium',
        scheduledDate: '2026-11-21',
        notes: 'Drona 2.0 Nov 21: Effect of inert gas at constant V vs constant P.',
      },
      {
        code: 'PHYCHEM-L40',
        title: 'Ionic Equilibrium L1: Strong/Weak Electrolytes & Arrhenius, Bronsted-Lowry, Lewis Acid-Base',
        scheduledDate: '2026-11-25',
        notes: 'Drona 2.0 Nov 25: Conjugate acid-base pairs & amphoteric species.',
      },
      {
        code: 'PHYCHEM-L41',
        title: 'Ionic Equilibrium L2: Ostwald Dilution Law, Self-Ionization of Water (Kw) & Temperature Effect',
        scheduledDate: '2026-11-26',
        notes: 'Drona 2.0 Nov 26: Neutral pH at 60°C (pKw = 13.0 -> neutral pH = 6.5).',
      },
      {
        code: 'PHYCHEM-L42',
        title: 'Ionic Equilibrium L3: pH Scale, Strong Acid/Base Mixtures & Very Dilute Solutions (10^-8 M HCl)',
        scheduledDate: '2026-11-27',
        notes: 'Drona 2.0 Nov 27: Quadratic water contribution in 10^-7 M and 10^-8 M acids.',
      },
      {
        code: 'PHYCHEM-L43',
        title: 'Ionic Equilibrium L4: Weak Monoprotic/Polyprotic Acids & Common Ion / Leveling Effect',
        scheduledDate: '2026-11-28',
        notes: 'Drona 2.0 Nov 28: Simultaneous ionization of two weak acids.',
      },
      {
        code: 'PHYCHEM-L44',
        title: 'Ionic Equilibrium L5: Salt Hydrolysis (WASB, SAWB, WAWB) — Kh, Degree h & Exact pH Formulas',
        scheduledDate: '2026-12-01',
        notes: 'Drona 2.0 Dec 1: Amphiprotic salts (NaHCO3, NaH2PO4) pH = (pKa1 + pKa2)/2.',
      },
      {
        code: 'PHYCHEM-L45',
        title: 'Ionic Equilibrium L6: Buffer Solutions — Henderson-Hasselbalch, Buffer Capacity & Range',
        scheduledDate: '2026-12-02',
        notes: 'Drona 2.0 Dec 2: Acidic & basic buffers formed by partial neutralization.',
      },
      {
        code: 'PHYCHEM-L46',
        title: 'Ionic Equilibrium L7: Acid-Base Indicators (Ostwald/Quinonoid) & pH Titration Curves',
        scheduledDate: '2026-12-03',
        notes: 'Drona 2.0 Dec 3: Phenolphthalein vs Methyl orange indicator selection at equivalence point.',
      },
      {
        code: 'PHYCHEM-L47',
        title: 'Ionic Equilibrium L8: Solubility Product (Ksp), Selective Precipitation & Complexation',
        scheduledDate: '2026-12-04',
        notes: 'Drona 2.0 Dec 4: Common ion effect, simultaneous solubility & solubility in acidic buffer.',
      },
    ],
  },
  {
    id: 'ch_chem_inorganic_periodic',
    subject: 'Chemistry',
    title: 'Classification of Elements & Periodicity in Properties',
    totalLectures: 9,
    priority: 'High',
    dateRange: 'Aug 8, 2026 – Sep 3, 2026',
    subtopicsSummary:
      'Drona 2.0 Inorganic Track (9 Lectures): Historical Development, Slater Rule & Zeff, Atomic/Ionic Radii, Ionization Energy, Electron Affinity, Electronegativity (Pauling/Mulliken) & Oxide Nature',
    sampleLectures: [
      {
        code: 'IOC-PER-L01',
        title: 'Periodic Table L1: Dobereiner, Newlands, Mendeleev, Moseley Law & Block/Group/Period Prediction',
        scheduledDate: '2026-08-08',
        notes: 'Drona 2.0 Aug 8: IUPAC naming of Z > 100 elements.',
      },
      {
        code: 'IOC-PER-L02',
        title: 'Periodic Table L2: Screening Effect, Slater Rules & Effective Nuclear Charge (Zeff)',
        scheduledDate: '2026-08-13',
        notes: 'Drona 2.0 Aug 13: Penetration power s > p > d > f & Lanthanoid contraction.',
      },
      {
        code: 'IOC-PER-L03',
        title: 'Periodic Table L3: Covalent, Metallic, Van der Waals & Isoelectronic Ionic Radii Trends',
        scheduledDate: '2026-08-14',
        notes: 'Drona 2.0 Aug 14: Ga vs Al radius exception & Zr ≈ Hf size similarity.',
      },
      {
        code: 'IOC-PER-L04',
        title: 'Periodic Table L4: Ionization Enthalpy (IE1, IE2, IE3) — Half/Full-Filled Stability Exceptions',
        scheduledDate: '2026-08-21',
        notes: 'Drona 2.0 Aug 21: Valency prediction from sudden jump in successive IE.',
      },
      {
        code: 'IOC-PER-L05',
        title: 'Periodic Table L5: Electron Gain Enthalpy (EGE) & Electron Affinity (Cl > F > Br > I)',
        scheduledDate: '2026-08-27',
        notes: 'Drona 2.0 Aug 27: Endothermic 2nd electron addition (O -> O2-) & group 15/16/17 trends.',
      },
      {
        code: 'IOC-PER-L06',
        title: 'Periodic Table L6: Electronegativity Scales (Pauling, Mulliken, Allred-Rochow) & Diagonal Relationship',
        scheduledDate: '2026-09-03',
        notes: 'Drona 2.0 Sep 3: Acidic, basic, amphoteric & neutral oxides classification.',
      },
    ],
  },
  {
    id: 'ch_chem_inorganic_bonding',
    subject: 'Chemistry',
    title: 'Chemical Bonding & Molecular Structure',
    totalLectures: 13,
    priority: 'High',
    dateRange: 'Sep 4, 2026 – Sep 26, 2026',
    subtopicsSummary:
      'Drona 2.0 Inorganic Track (13 Lectures): Octet Exceptions, VBT, Hybridization, VSEPR, Bent Rule, Dipole Moment, MOT, Fajans Rule, H-Bonding & Back Bonding',
    sampleLectures: [
      {
        code: 'IOC-CB-L01',
        title: 'Chemical Bonding L1: Kossel-Lewis Approach, Formal Charge, Octet Exceptions & VBT',
        scheduledDate: '2026-09-04',
        notes: 'Drona 2.0 Sep 4: Hypovalent, hypervalent & odd-electron molecules (NO, NO2, ClO2).',
      },
      {
        code: 'IOC-CB-L02',
        title: 'Chemical Bonding L2: Hybridization (sp to sp3d3), VSEPR Shapes & Bent Rule / Drago Rule',
        scheduledDate: '2026-09-11',
        notes: 'Drona 2.0 Sep 11: Axial vs equatorial bond lengths in PCl5, SF4 & ClF3.',
      },
      {
        code: 'IOC-CB-L03',
        title: 'Chemical Bonding L3: Bond Angle Comparison, Dipole Moment & Molecular Orbital Theory (MOT)',
        scheduledDate: '2026-09-18',
        notes: 'Drona 2.0 Sep 18: s-p mixing in B2, C2, N2 vs O2, F2; bond order & paramagnetism.',
      },
      {
        code: 'IOC-CB-L04',
        title: 'Chemical Bonding L4: Fajans Rule (Polarization), Lattice Energy, Hydration, Back Bonding & H-Bonding',
        scheduledDate: '2026-09-25',
        notes: 'Drona 2.0 Sep 25: Thermal stability & solubility of s-block carbonates/sulfates; B2H6 banana bonds.',
      },
    ],
  },
  {
    id: 'ch_chem_inorganic_blocks',
    subject: 'Chemistry',
    title: 'P-Block (Group 13 & 14), S-Block & Hydrogen',
    totalLectures: 10,
    priority: 'Medium',
    dateRange: 'Jan 30, 2027 – Feb 10, 2027',
    subtopicsSummary:
      'Drona 2.0 Inorganic Track (10 Lectures): Boron & Carbon Family (Diborane, Borax, Silicones, Silicates) (5) · Alkali/Alkaline Earth Metals & Hydrogen/H2O2 (5)',
    sampleLectures: [
      {
        code: 'IOC-BLK-L01',
        title: 'P-Block L1: Group 13 (Boron Family) — Inert Pair Effect, Borax Bead, Orthoboric Acid & Diborane',
        scheduledDate: '2027-01-30',
        notes: 'Drona 2.0 Jan 30: Borazine (inorganic benzene) & AlCl3 dimer structure.',
      },
      {
        code: 'IOC-BLK-L02',
        title: 'P-Block L2: Group 14 (Carbon Family) — Allotropes, CO/CO2, Silicones, Silicates & Zeolites',
        scheduledDate: '2027-02-03',
        notes: 'Drona 2.0 Feb 3: Ortho, pyro, cyclic, chain & sheet silicates.',
      },
      {
        code: 'IOC-BLK-L03',
        title: 'S-Block & Hydrogen L1: Alkali/Alkaline Earth Metals in Liquid NH3, Solvay Process & H2O2 Volume Strength',
        scheduledDate: '2027-02-06',
        notes: 'Drona 2.0 Feb 6: Temporary vs permanent hardness of water (Calgon/Permutit) & H2O2 structure.',
      },
    ],
  },

  // ===========================================================================
  // PHYSICS — COMPLETE DRONA JEE 2.0 2027 CHAPTER BREAKDOWN (16 CHAPTERS)
  // ===========================================================================
  {
    id: 'ch_phys_basic_math_vectors',
    subject: 'Physics',
    title: 'Basic Mathematics, Vectors & Units/Dimensions',
    totalLectures: 24,
    priority: 'High',
    dateRange: 'Jun 1, 2026 – Jul 17, 2026',
    subtopicsSummary:
      'Drona 2.0 Physics Track (24 Lectures): Basic Math Differentiation/Integration (10) · Vectors Dot/Cross Product (9) · Units, Dimensions & Error Analysis (5)',
    sampleLectures: [
      {
        code: 'PHY-BM-L01',
        title: 'Basic Math & Vectors L1: Trigonometry, Coordinate Geometry, Maxima/Minima & Definite Integration',
        scheduledDate: '2026-06-08',
        notes: 'Drona 2.0 Jun 1–19: Chain rule differentiation & area under curves for kinematics.',
      },
      {
        code: 'PHY-VEC-L02',
        title: 'Vectors L2: Triangle/Parallelogram/Polygon Law, 3D Unit Vectors & Scalar/Vector Products',
        scheduledDate: '2026-06-29',
        notes: 'Drona 2.0 Jun 20–Jul 7: Projection of A on B, direction cosines & right-hand screw rule.',
      },
      {
        code: 'PHY-UD-L03',
        title: 'Units & Dimensions L3: Principle of Homogeneity, Dimensional Formula Derivation & Vernier/Screw Gauge',
        scheduledDate: '2026-07-14',
        notes: 'Drona 2.0 Jul 9–17: Conversion of units & dimensional analysis limitations.',
      },
    ],
  },
  {
    id: 'ch_phys_kinematics',
    subject: 'Physics',
    title: 'Kinematics: Motion in a Straight Line & Motion in a Plane',
    totalLectures: 22,
    priority: 'High',
    dateRange: 'Jul 18, 2026 – Sep 1, 2026',
    subtopicsSummary:
      'Drona 2.0 Physics Track (22 Lectures): 1D Motion, Calculus Kinematics & Motion Graphs (12) · Ground/Inclined Projectile, Relative Motion & Rain-River Boat (10)',
    sampleLectures: [
      {
        code: 'PHY-KIN-L01',
        title: 'Motion in 1D L1: Distance/Displacement, Variable Acceleration (a = v dv/dx) & Motion under Gravity',
        scheduledDate: '2026-07-23',
        notes: 'Drona 2.0 Jul 18–Aug 11: Stopping distance, Galileo odd-number ratio & x-t, v-t, a-t graphs.',
      },
      {
        code: 'PHY-KIN-L02',
        title: 'Motion in 2D L2: Oblique Projectile, Trajectory Equation, Inclined Plane Projectile',
        scheduledDate: '2026-08-18',
        notes: 'Drona 2.0 Aug 13–24: Radius of curvature at any point & range maximization on incline.',
      },
      {
        code: 'PHY-KIN-L03',
        title: 'Relative Motion L3: Shortest Distance of Approach, River-Swimmer & Rain-Man Problems',
        scheduledDate: '2026-08-29',
        notes: 'Drona 2.0 Aug 25–Sep 1: Minimum drift vs minimum time river crossing.',
      },
    ],
  },
  {
    id: 'ch_phys_nlm_friction_circular',
    subject: 'Physics',
    title: 'Laws of Motion, Friction & Circular Motion',
    totalLectures: 18,
    priority: 'High',
    dateRange: 'Sep 3, 2026 – Oct 5, 2026',
    subtopicsSummary:
      'Drona 2.0 Physics Track (18 Lectures): FBD, Pulleys, Springs, Pseudo Force & Wedge Constraints (8) · Two-Block Friction (4) · Banking of Roads & Circular Dynamics (6)',
    sampleLectures: [
      {
        code: 'PHY-NLM-L01',
        title: 'Laws of Motion L1: FBD, Pulley-Block Systems, Spring Cutting & Wedge-Pulley Constraint Relations',
        scheduledDate: '2026-09-10',
        notes: 'Drona 2.0 Sep 3–18: Virtual work method sum(T.a) = 0 & pseudo force in accelerated frames.',
      },
      {
        code: 'PHY-FRIC-L02',
        title: 'Friction L2: Static vs Kinetic Friction, Angle of Repose & Two/Three-Block Friction Problems',
        scheduledDate: '2026-09-22',
        notes: 'Drona 2.0 Sep 19–25: Minimum force to move a block & step-by-step slip check.',
      },
      {
        code: 'PHY-CIRC-L03',
        title: 'Circular Motion L3: Centripetal/Tangential Acceleration, Conical Pendulum & Banking with Friction',
        scheduledDate: '2026-10-01',
        notes: 'Drona 2.0 Sep 26–Oct 5: v_min and v_max on banked rough tracks & death well.',
      },
    ],
  },
  {
    id: 'ch_phys_wep_com',
    subject: 'Physics',
    title: 'Work, Energy, Power & Centre of Mass / Collisions',
    totalLectures: 22,
    priority: 'High',
    dateRange: 'Oct 6, 2026 – Nov 4, 2026',
    subtopicsSummary:
      'Drona 2.0 Physics Track (22 Lectures): Variable Force Work, Potential Energy & Vertical Circular Motion (9) · Continuous COM, Momentum Conservation, Impulse & 1D/2D Oblique Collisions (13)',
    sampleLectures: [
      {
        code: 'PHY-WEP-L01',
        title: 'Work Energy Power L1: Work-Energy Theorem, Conservative Forces (F = -dU/dr) & Vertical Circle',
        scheduledDate: '2026-10-12',
        notes: 'Drona 2.0 Oct 6–16: Equilibrium stability from U(x) curve & √(5gR) critical velocity.',
      },
      {
        code: 'PHY-COM-L02',
        title: 'Centre of Mass L2: COM of Continuous Bodies (Cone, Hemisphere, Cavity) & Velocity/Acceleration of COM',
        scheduledDate: '2026-10-22',
        notes: 'Drona 2.0 Oct 17–26: Plank-man displacement problems & C-frame kinetic energy.',
      },
      {
        code: 'PHY-COL-L03',
        title: 'Collisions L3: Impulse-Momentum, Coefficient of Restitution (e) & 2D Oblique Collisions',
        scheduledDate: '2026-11-02',
        notes: 'Drona 2.0 Oct 27–Nov 4: Ball bouncing on inclined plane & variable mass (rocket propulsion).',
      },
    ],
  },
  {
    id: 'ch_phys_rotation_gravitation',
    subject: 'Physics',
    title: 'Rotational Motion & Gravitation',
    totalLectures: 20,
    priority: 'High',
    dateRange: 'Nov 5, 2026 – Dec 5, 2026',
    subtopicsSummary:
      'Drona 2.0 Physics Track (20 Lectures): Moment of Inertia, Torque, Pure Rolling, Angular Momentum, Instantaneous Axis & Toppling (15) · Gravitational Field/Potential, Satellites & Kepler Laws (5)',
    sampleLectures: [
      {
        code: 'PHY-ROT-L01',
        title: 'Rotational Motion L1: Moment of Inertia (Parallel/Perpendicular Axis, Cavity) & Torque = I alpha',
        scheduledDate: '2026-11-11',
        notes: 'Drona 2.0 Nov 5–16: MOI of rod, disc, ring, sphere, cone & square lamina.',
      },
      {
        code: 'PHY-ROT-L02',
        title: 'Rotational Motion L2: Combined Translation + Rotation, Pure Rolling on Incline & Toppling',
        scheduledDate: '2026-11-23',
        notes: 'Drona 2.0 Nov 17–28: Angular momentum conservation in eccentric collisions & impulsive torque.',
      },
      {
        code: 'PHY-GRAV-L03',
        title: 'Gravitation L3: Field & Potential of Spherical Shells/Solid Sphere, Escape Velocity & Kepler Laws',
        scheduledDate: '2026-12-03',
        notes: 'Drona 2.0 Nov 30–Dec 5: Variation of g with altitude/depth/rotation & satellite orbital energy.',
      },
    ],
  },
  {
    id: 'ch_phys_matter_thermal_thermo',
    subject: 'Physics',
    title: 'Solids, Fluids, Thermal Properties & Physics Thermodynamics',
    totalLectures: 28,
    priority: 'High',
    dateRange: 'Dec 7, 2026 – Jan 20, 2027',
    subtopicsSummary:
      'Drona 2.0 Physics Track (28 Lectures): Thermal Expansion, Calorimetry, Conduction & Radiation (9) · Elasticity, Fluid Statics, Bernoulli, Viscosity & Surface Tension (13) · Thermodynamics Laws & Cycles (6)',
    sampleLectures: [
      {
        code: 'PHY-THM-L01',
        title: 'Thermal Properties L1: Calorimetry Phase Change, Thermal Stress, Conduction Rods & Stefan/Wien Law',
        scheduledDate: '2026-12-12',
        notes: 'Drona 2.0 Dec 7–17: Newton law of cooling, ice layer growth & cavity radiation.',
      },
      {
        code: 'PHY-FLD-L02',
        title: 'Solids & Fluids L2: Young Modulus, Accelerated/Rotating Fluids, Archimedes, Bernoulli & Surface Tension',
        scheduledDate: '2026-12-28',
        notes: 'Drona 2.0 Dec 18–Jan 8: Torricelli efflux velocity, capillary rise in tilted tube & soap bubble excess pressure.',
      },
      {
        code: 'PHY-TD-L03',
        title: 'Physics Thermodynamics L3: Indicator Diagrams, Polytropic Processes, Carnot Cycle & Refrigerator',
        scheduledDate: '2027-01-15',
        notes: 'Drona 2.0 Jan 9–20: Molar heat capacity C = Cv + R/(1-x) & cyclic efficiency.',
      },
    ],
  },
  {
    id: 'ch_phys_shm_waves',
    subject: 'Physics',
    title: 'Simple Harmonic Motion (SHM) & Mechanical Waves',
    totalLectures: 13,
    priority: 'Medium',
    dateRange: 'Jan 21, 2027 – Feb 13, 2027',
    subtopicsSummary:
      'Drona 2.0 Physics Track (13 Lectures): Phasor Diagram, Spring-Block Time Period, Simple/Physical/Torsional Pendulum (7) · String/Sound Waves, Standing Waves, Organ Pipes & Beats (6)',
    sampleLectures: [
      {
        code: 'PHY-SHM-L01',
        title: 'Oscillations L1: SHM Kinematics, Circular Phasor, Reduced Mass Spring System & Physical Pendulum',
        scheduledDate: '2027-01-25',
        notes: 'Drona 2.0 Jan 21–30: Superposition of SHMs & liquid U-tube/floating cylinder oscillations.',
      },
      {
        code: 'PHY-WAV-L02',
        title: 'Mechanical Waves L2: Wave Equation, Power Transmitted on String, Organ Pipes, Resonance Tube & Beats',
        scheduledDate: '2027-02-08',
        notes: 'Drona 2.0 Feb 1–13: End correction in Kundt/Resonance tube & interference of sound waves.',
      },
    ],
  },

  // ===========================================================================
  // MATHEMATICS — COMPLETE DRONA JEE 2.0 2027 CHAPTER BREAKDOWN (14 CHAPTERS)
  // ===========================================================================
  {
    id: 'ch_math_basic_sets_trig',
    subject: 'Mathematics',
    title: 'Basic Mathematics, Set Theory & Trigonometric Ratios/Equations',
    totalLectures: 41,
    priority: 'High',
    dateRange: 'Jun 1, 2026 – Aug 28, 2026',
    subtopicsSummary:
      'Drona 2.0 Math Track (41 Lectures): Wavy Curve, Modulus & Logarithms (15) · Set Theory & Venn Diagrams (6) · Trigonometric Ratios & Conditional Identities (12) · Trigonometric Equations & Inequalities (8)',
    sampleLectures: [
      {
        code: 'MAT-BM-L01',
        title: 'Basic Math L1: Wavy Curve Method, Modulus Equations/Inequalities & Logarithmic Properties',
        scheduledDate: '2026-06-15',
        notes: 'Drona 2.0 Jun 1–Jul 1: Base-change inequality reversal in logarithms & irrational equations.',
      },
      {
        code: 'MAT-SET-L02',
        title: 'Set Theory L2: Power Set, Symmetric Difference, De Morgan Laws & Inclusion-Exclusion Principle',
        scheduledDate: '2026-07-08',
        notes: 'Drona 2.0 Jul 3–13: Cardinality problems for 3-set Venn diagrams.',
      },
      {
        code: 'MAT-TRG-L03',
        title: 'Trigonometry L3: Compound/Multiple Angles, Cosine Product Series, Conditional Identities & Trig Equations',
        scheduledDate: '2026-08-05',
        notes: 'Drona 2.0 Jul 15–Aug 28: Range of a cos x + b sin x & general solutions of trigonometric equations.',
      },
    ],
  },
  {
    id: 'ch_math_algebra_core',
    subject: 'Mathematics',
    title: 'Quadratic Equations, Sequence & Series, P&C, Binomial & Complex Numbers',
    totalLectures: 47,
    priority: 'High',
    dateRange: 'Aug 31, 2026 – Jan 27, 2027',
    subtopicsSummary:
      'Drona 2.0 Math Track (47 Lectures): Quadratic Location of Roots (9) · AP/GP/AGP & Telescopic Series (10) · Permutations & Combinations (10) · Binomial Theorem (8) · Complex Numbers & De Moivre/Cube Roots of Unity (10)',
    sampleLectures: [
      {
        code: 'MAT-QE-L01',
        title: 'Quadratic Equations L1: Vieta Relations, Common Roots, Graph of Quadratic & Location of Roots',
        scheduledDate: '2026-09-10',
        notes: 'Drona 2.0 Aug 31–Sep 19: Condition for both roots in (k1, k2) using D, f(k) & -b/2a.',
      },
      {
        code: 'MAT-SNS-L02',
        title: 'Sequence & Series L2: AP, GP, HP, AM-GM-HM Inequality, AGP & Method of Difference (Vn)',
        scheduledDate: '2026-09-30',
        notes: 'Drona 2.0 Sep 21–Oct 7: Telescopic cancellation series & sigma notation.',
      },
      {
        code: 'MAT-PNC-L03',
        title: 'P&C & Binomial L3: Circular Permutation, Beggar Method, Derangement & Binomial Series Properties',
        scheduledDate: '2026-10-28',
        notes: 'Drona 2.0 Oct 16–Nov 16: Numerically greatest term, multinomial theorem & remainder problems.',
      },
      {
        code: 'MAT-CMP-L04',
        title: 'Complex Numbers L4: Argand Plane, Euler Form, De Moivre, Cube/nth Roots of Unity & Coni Rotation',
        scheduledDate: '2027-01-20',
        notes: 'Drona 2.0 Jan 14–27: Locus problems (circle, perpendicular bisector, ellipse) in complex plane.',
      },
    ],
  },
  {
    id: 'ch_math_coord_calc',
    subject: 'Mathematics',
    title: 'Coordinate Geometry (Straight Lines, Circles, Conics), Relations, Limits & Probability',
    totalLectures: 38,
    priority: 'High',
    dateRange: 'Oct 8, 2026 – Feb 13, 2027',
    subtopicsSummary:
      'Drona 2.0 Math Track (38 Lectures): Straight Lines & Pair of Lines (12) · Circles & Radical Axis (8) · Parabola, Ellipse & Hyperbola (18) · Relations, Limits/Derivatives, Statistics, Probability & SOT',
    sampleLectures: [
      {
        code: 'MAT-STL-L01',
        title: 'Straight Lines & Circles L1: Family of Lines, Homogenization, Director Circle, Radical Axis & Orthogonality',
        scheduledDate: '2026-11-28',
        notes: 'Drona 2.0 Nov 17–Dec 14: Image/foot of perpendicular, optical reflection & chord of contact T = 0.',
      },
      {
        code: 'MAT-CON-L02',
        title: 'Conic Sections L2: Parabola, Ellipse & Hyperbola — Parametric Tangents, Normals & Focal Chord Properties',
        scheduledDate: '2026-12-28',
        notes: 'Drona 2.0 Dec 15–Jan 13: Rectangular hyperbola xy = c^2 & auxiliary circle properties.',
      },
      {
        code: 'MAT-LIM-L03',
        title: 'Limits, Derivatives, Statistics & Probability L3: 1^infinity Indeterminate Forms, Variance & Sine/Cosine Rule',
        scheduledDate: '2027-02-05',
        notes: 'Drona 2.0 Jan 28–Feb 13: L Hospital rule, standard deviation transformations & Solution of Triangle.',
      },
    ],
  },
];

export function buildDronaInitialChaptersAndLectures(uid: string): {
  chapters: ChapterDoc[];
  lectures: LectureDoc[];
  milestoneTasks: TaskDoc[];
} {
  const chapters: ChapterDoc[] = DRONA_CHAPTER_BLUEPRINTS.map((bp) => ({
    id: bp.id,
    uid,
    subject: bp.subject,
    title: bp.title,
    totalLectures: bp.totalLectures,
    completedLectures: 0,
    priority: bp.priority,
  }));

  const lectures: LectureDoc[] = [];

  // For initial seed, populate the first 12 Organic Chemistry lectures, first 12 Physical Chemistry lectures,
  // and all sample lectures from Inorganic, Physics, and Mathematics (~52 total lectures so Firestore batch stays fast),
  // while keeping the full 32 Organic and 47 Physical templates ready for 1-click "+Populate Drona Lectures".
  for (const bp of DRONA_CHAPTER_BLUEPRINTS) {
    const initialSlice =
      bp.id === 'ch_chem_organic' || bp.id === 'ch_chem_physical'
        ? bp.sampleLectures.slice(0, 10)
        : bp.sampleLectures;

    initialSlice.forEach((tpl, idx) => {
      lectures.push({
        id: `lec_${bp.id}_${String(idx + 1).padStart(2, '0')}`,
        uid,
        title: `${tpl.code}: ${tpl.title}`,
        subject: bp.subject,
        chapterId: bp.id,
        chapterTitle: bp.title,
        durationMinutes: tpl.durationMinutes || 90,
        playbackSpeed: 1.5,
        actualWatchMinutes: 60,
        completed: false,
        completedDate: '',
        notes: `${tpl.notes} (Scheduled: ${tpl.scheduledDate})`,
      });
    });
  }

  const milestoneTasks: TaskDoc[] = DRONA_TEST_MILESTONES.slice(0, 6).map((m) => ({
    id: m.id,
    uid,
    title: `${m.title} — ${m.syllabusNote}`,
    category: m.type === 'Revision' ? 'Revision' : 'General',
    priority: m.priority,
    deadline: m.date,
    date: m.date,
    completed: false,
    isDefault: false,
    niosType: 'None',
  }));

  return { chapters, lectures, milestoneTasks };
}
