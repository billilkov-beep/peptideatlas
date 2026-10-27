# Clinical catalog source and coverage audit

Reviewed: 2026-10-27  
Scope: the reference guide’s Digestive and Hormones categories  
Content file: `clinical-profiles.json`  
Review type: AI source review; this is not a claim of review or sign-off by a licensed clinician.

## Completion and identity

The file contains 53 canonical profiles covering all 54 exact reference names in these two categories. The 35 Digestive entries and 19 Hormones entries share one canonical tesamorelin record. Both `Tesamorelin` and `Tesamorelin (off-label)` are retained in that record’s `referenceNames`. Its text distinguishes the approved HIV-associated lipodystrophy indication from unapproved general weight-management or wellness use.

AOD-9604 and Fragment 176–191 remain separate records because catalog shorthand does not establish chemical equivalence. AOD-9604’s defined modified sequence is distinguished from incompletely specified fragment products. Brilacidin and 5-Amino-1MQ are explicitly identified as nonpeptide molecules despite appearing in the reference catalog. Insulin analogs are retained as a family record with product-specific limitations. Humanin and its HNG analog are distinguished; HNG is not silently treated as a synonym.

The reference inventory and article audit were used to establish scope and discover sources. Profile prose, section titles, summaries, comparison explanations and questions are newly written. Text was not copied from Superpower’s articles. All 12 entries whose article audit recorded a frequently-asked-questions heading have an original cited FAQ section. The audit did not expose the individual source FAQ questions, so those sections address compound-specific questions from verified evidence rather than claiming a word-for-word reproduction of the reference FAQ.

## Research method

The primary-source corpus includes FDA prescribing information, FDA advisory documents and announcements, current DailyMed labels, regulator records, original clinical and laboratory research, sponsor trial announcements and SEC filings. Public FDA labeling records were retrieved through the openFDA label endpoint and linked through their stable DailyMed SPL identifiers. Original paper abstracts were retrieved from PubMed and linked by DOI or PubMed identifier. For recently changed status and medical claims, web verification included primary regulatory sources and original studies; sponsor disclosures were used where no published regulator record or journal report was identified.

Sources are attached to each profile as numbered references. Every narrative section has one or more valid one-based citation indexes. Citations should be rendered next to those sections in the application. Summary fields are supported by the same profile’s detailed, cited sections and source list. Source review date is separate from the original source’s publication date. Sources and approval scopes should be rechecked as new labels, trial findings and regulator decisions appear.

Evidence labels describe the character of the evidence, not a recommendation. A clinical study can be negative, and an approved medicine can have a narrow indication or a conditional approval. `approved_medicine` is always interpreted together with `jurisdiction` and the regulatory section. This matters especially for China-only mazdutide, South-Korea-approved efpeglenatide and historically approved but commercially withdrawn albiglutide. No dosing schedules, reconstitution instructions, procurement links or personalized treatment regimens are supplied.

## Corrections that matter for publication

| Record | Verified distinction reflected in the profile |
|---|---|
| Semaglutide | Product-specific uses distinguish Ozempic from Wegovy; current Wegovy information includes oral and injectable formulations and a defined noncirrhotic MASH indication under accelerated approval. |
| Tirzepatide | Mounjaro and Zepbound retain distinct labeling; Zepbound’s obstructive-sleep-apnea indication is limited to the labeled population. |
| Linaclotide | The current prescribing information includes expanded pediatric eligibility; old all-pediatric contraindication language is not retained. |
| Setmelanotide | The 2026 label includes acquired hypothalamic obesity in the specified age group, alongside named genetic indications; it is not general obesity approval. |
| Enlicitide | The 2026 FDA approval of Lipfendra is reflected. LDL lowering is distinguished from an unproven claim of its own completed cardiovascular-outcomes benefit. |
| Elamipretide | FDA accelerated approval of Forzinity for the specified Barth syndrome population is reflected. The small randomized study’s negative walking/fatigue primary endpoints and reliance on later muscle-strength evidence remain visible. |
| Efpeglenatide | South Korea’s October 2026 approval is identified with its actual adult weight-management scope; it is not presented as FDA approval. |
| Mazdutide | Chinese weight-management and diabetes approvals are identified by jurisdiction. |
| Albiglutide | Historical approval, subsequent commercial withdrawal and cardiovascular trial results are separate facts. The broad approved-medicine enum does not mean the product is currently marketed. |
| Somapacitan | Current expanded pediatric labeling is represented; the profile is not limited to older growth-hormone-deficiency-only descriptions. |
| Somatropin | Product-specific pediatric, adult growth-hormone-deficiency, HIV-wasting and short-bowel roles are distinguished. HIV wasting is not the tesamorelin lipodystrophy indication. |
| Retatrutide | Current phase 3 findings are included while its unapproved status remains explicit. |
| CagriSema | Positive placebo-controlled studies coexist with the sponsor’s report that REDEFINE 4 did not meet its primary noninferiority comparison against tirzepatide. |
| Amycretin | The newer zenagamtide name is searchable; oral and injectable development programs are distinguished. |
| Apraglutide | Positive short-bowel findings are presented with endpoint limitations and the additional regulatory-development requirement. |
| Glepaglutide | The differing results of the two studied schedules and the continued development program are described; phase 3 efficacy does not imply approval. |
| Larazotide acetate | The earlier phase 2 signal is presented with the phase 3 discontinuation; no claim of an active successful pivotal program is made. |
| PN-943 | Direct PN-943 phase 1 and IDEAL sources replace a citation to the different predecessor PTG-100. The failed primary comparison and exploratory lower-group signal are not conflated. |
| Pemvidutide | Improvement in MASH resolution is distinguished from the nonsignificant fibrosis endpoint in the cited phase 2 study. |
| BPC-157, KPV and MOTS-c | FDA compounding reviews are not described as finished-medicine approvals. Sparse or absent human clinical evidence remains explicit. |
| AOD-9604 | Negative major human weight-loss trial findings are included alongside animal experiments. |
| MOTS-c | Measurement of naturally occurring peptide during human exercise is separated from peptide-administration studies in mice. |
| Humanin | Human associations, rodent interventions and worm lifespan findings are not combined into a claim of proven human longevity treatment. |

## Validation results

- Canonical profiles: **53**.
- Exact reference names covered: **54**; no omissions, extras or duplicate coverage.
- Cited narrative sections: **278**; every citation index resolves within its own profile.
- Reference entries: **133**, representing **128** unique URLs.
- Original FAQ sections: **12**; all audit-indicated FAQ entries covered.
- All summaries contain 30–55 words, descriptions 80–140, mechanisms 50–90 and takeaways 25–45. Every profile contains 350–650 words across those fields, at-a-glance values and narrative sections.
- All records have at least five specific at-a-glance facts and at least five cited narrative sections. No empty records, duplicate slugs or duplicate section IDs were found.
- Evidence labels: clinical: 13, established: 34, limited: 2, preclinical: 4.
- Regulatory labels: approved_medicine: 34, clinical_trials: 12, research_only: 7.

## Source register

The following register reproduces the reference links stored in each profile. Numbers correspond to section citation indexes in that profile. Current label links can change when a manufacturer or regulator updates the underlying document; historical trial papers remain useful for interpreting the evidence, but they do not supersede current approved labeling.

### Semaglutide

- Canonical slug: `semaglutide`.
- Reference coverage: Semaglutide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [Wegovy current prescribing information](https://www.novo-pi.com/wegovy.pdf) — regulatory; accessed 2026-10-27.
2. [FDA: Ozempic prescribing information, 2026](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/209637s038lbl.pdf) — regulatory; accessed 2026-10-27.
3. [Once-Weekly Semaglutide in Adults with Overweight or Obesity.](https://doi.org/10.1056/NEJMoa2032183) — primary research; accessed 2026-10-27.
4. [Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes.](https://doi.org/10.1056/NEJMoa2307563) — primary research; accessed 2026-10-27.

### Tirzepatide

- Canonical slug: `tirzepatide`.
- Reference coverage: Tirzepatide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Zepbound current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=487cd7e7-434c-4925-99fa-aa80b1cc776b) — regulatory; accessed 2026-10-27.
2. [FDA: Mounjaro prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215866s009lbl.pdf) — regulatory; accessed 2026-10-27.
3. [Tirzepatide Once Weekly for the Treatment of Obesity.](https://doi.org/10.1056/NEJMoa2206038) — primary research; accessed 2026-10-27.
4. [FDA approves first medication for obstructive sleep apnea](https://www.fda.gov/news-events/press-announcements/fda-approves-first-medication-obstructive-sleep-apnea) — regulatory; accessed 2026-10-27.

### Dasiglucagon

- Canonical slug: `dasiglucagon`.
- Reference coverage: Dasiglucagon.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Zegalogue prescribing information, 2026](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/214231s004lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Dasiglucagon-A Next-Generation Glucagon Analog for Rapid and Effective Treatment of Severe Hypoglycemia: Results of Phase 3 Randomized Double-Blind Clinical Trial.](https://doi.org/10.2337/dc20-2995) — primary research; accessed 2026-10-27.

### Ga-68 dotatate

- Canonical slug: `ga-68-dotatate`.
- Reference coverage: Ga-68 dotatate.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Netspot prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b2b3be70-17d8-4093-896c-f1c54a2cf242) — regulatory; accessed 2026-10-27.
2. [Safety and Efficacy of 68Ga-DOTATATE PET/CT for Diagnosis, Staging, and Treatment Management of Neuroendocrine Tumors.](https://doi.org/10.2967/jnumed.115.163865) — primary research; accessed 2026-10-27.
3. [DailyMed: Lutathera prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=72d1a024-00b7-418a-b36e-b2cb48f2ab55) — regulatory; accessed 2026-10-27.

### Glucagon

- Canonical slug: `glucagon`.
- Reference coverage: Glucagon.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Baqsimi prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/212097s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [DailyMed: GlucaGen current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8cc40354-b5ac-45b6-a211-93b44444f2a3) — regulatory; accessed 2026-10-27.
3. [Intranasal Glucagon for Treatment of Insulin-Induced Hypoglycemia in Adults With Type 1 Diabetes: A Randomized Crossover Noninferiority Study.](https://doi.org/10.2337/dc15-1498) — primary research; accessed 2026-10-27.

### Lanreotide

- Canonical slug: `lanreotide`.
- Reference coverage: Lanreotide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Somatuline Depot prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6e4a41fd-a753-4362-87ee-8cc56ed3660d) — regulatory; accessed 2026-10-27.
2. [Lanreotide in metastatic enteropancreatic neuroendocrine tumors.](https://doi.org/10.1056/NEJMoa1316158) — primary research; accessed 2026-10-27.

### Linaclotide

- Canonical slug: `linaclotide`.
- Reference coverage: Linaclotide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [Linzess prescribing information, revised October 2026](https://www.rxabbvie.com/pdf/linzess_pi.pdf) — regulatory; accessed 2026-10-27.
2. [Linaclotide for irritable bowel syndrome with constipation: a 26-week, randomized, double-blind, placebo-controlled trial to evaluate efficacy and safety.](https://doi.org/10.1038/ajg.2012.254) — primary research; accessed 2026-10-27.

### Liraglutide

- Canonical slug: `liraglutide`.
- Reference coverage: Liraglutide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Saxenda prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3946d389-0926-4f77-a708-0acb8153b143) — regulatory; accessed 2026-10-27.
2. [FDA: Victoza prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022341s044lbl.pdf) — regulatory; accessed 2026-10-27.
3. [Liraglutide and Cardiovascular Outcomes in Type 2 Diabetes.](https://doi.org/10.1056/NEJMoa1603827) — primary research; accessed 2026-10-27.

### Lutetium Lu-177 dotatate

- Canonical slug: `lutetium-lu-177-dotatate`.
- Reference coverage: Lutetium Lu-177 dotatate.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Lutathera prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=72d1a024-00b7-418a-b36e-b2cb48f2ab55) — regulatory; accessed 2026-10-27.
2. [Phase 3 Trial of 177Lu-Dotatate for Midgut Neuroendocrine Tumors.](https://doi.org/10.1056/NEJMoa1607427) — primary research; accessed 2026-10-27.

### Octreotide

- Canonical slug: `octreotide`.
- Reference coverage: Octreotide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Sandostatin injection prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4e2c9856-1836-49f0-9472-4dbeeb408f39) — regulatory; accessed 2026-10-27.
2. [Placebo-controlled, double-blind, prospective, randomized study on the effect of octreotide LAR in the control of tumor growth in patients with metastatic neuroendocrine midgut tumors: a report from the PROMID Study Group.](https://doi.org/10.1200/JCO.2009.22.8510) — primary research; accessed 2026-10-27.

### Plecanatide

- Canonical slug: `plecanatide`.
- Reference coverage: Plecanatide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Trulance prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fe2895bf-71a6-493a-b0ca-e06b2dfefc82) — regulatory; accessed 2026-10-27.
2. [A Randomized Phase III Clinical Trial of Plecanatide, a Uroguanylin Analog, in Patients With Chronic Idiopathic Constipation.](https://doi.org/10.1038/ajg.2016.611) — primary research; accessed 2026-10-27.

### Setmelanotide

- Canonical slug: `setmelanotide`.
- Reference coverage: Setmelanotide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Imcivree prescribing information, 2026](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/213793s009lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Efficacy and safety of setmelanotide, an MC4R agonist, in individuals with severe obesity due to LEPR or POMC deficiency: single-arm, open-label, multicentre, phase 3 trials.](https://doi.org/10.1016/S2213-8587(20)30364-8) — primary research; accessed 2026-10-27.

### Sincalide

- Canonical slug: `sincalide`.
- Reference coverage: Sincalide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Kinevac prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1408aabb-6982-48e5-ae9f-504ec43b0003) — regulatory; accessed 2026-10-27.
2. [Sincalide-stimulated cholescintigraphy: a multicenter investigation to determine optimal infusion methodology and gallbladder ejection fraction normal values.](https://doi.org/10.2967/jnumed.109.069393) — primary research; accessed 2026-10-27.

### Teduglutide

- Canonical slug: `teduglutide`.
- Reference coverage: Teduglutide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Gattex prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=66b69c1e-b25c-44d3-b5ff-1c1de9a516fa) — regulatory; accessed 2026-10-27.
2. [Long-Term Teduglutide for the Treatment of Patients With Intestinal Failure Associated With Short Bowel Syndrome.](https://doi.org/10.1038/ctg.2015.69) — primary research; accessed 2026-10-27.

### Terlipressin

- Canonical slug: `terlipressin`.
- Reference coverage: Terlipressin.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Terlivaz prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/022231s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Terlipressin plus Albumin for the Treatment of Type 1 Hepatorenal Syndrome.](https://doi.org/10.1056/NEJMoa2008290) — primary research; accessed 2026-10-27.

### Tesamorelin

- Canonical slug: `tesamorelin`.
- Reference coverage: Tesamorelin; Tesamorelin (off-label).
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Egrifta current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3d783378-b02d-4f19-99dd-0fc91a042224) — regulatory; accessed 2026-10-27.
2. [Effects of tesamorelin, a growth hormone-releasing factor, in HIV-infected patients with abdominal fat accumulation: a randomized placebo-controlled trial with a safety extension.](https://doi.org/10.1097/QAI.0b013e3181cbdaff) — primary research; accessed 2026-10-27.

### Retatrutide

- Canonical slug: `retatrutide`.
- Reference coverage: Retatrutide.
- Status: clinical; clinical_trials.
- Jurisdiction: United States — investigational; no FDA-approved retatrutide medicine identified as of 2026-10-27.

1. [Retatrutide, a Triple Hormone Receptor Agonist, for Treatment of Obesity.](https://doi.org/10.1056/NEJMoa2604169) — primary research; accessed 2026-10-27.
2. [Triple-Hormone-Receptor Agonist Retatrutide for Obesity - A Phase 2 Trial.](https://doi.org/10.1056/NEJMoa2301972) — primary research; accessed 2026-10-27.
3. [FDA: Concerns with unapproved GLP-1 drugs used for weight loss](https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss) — regulatory; accessed 2026-10-27.

### Cagrilintide

- Canonical slug: `cagrilintide`.
- Reference coverage: Cagrilintide.
- Status: clinical; clinical_trials.
- Jurisdiction: United States — investigational; no FDA-approved cagrilintide medicine identified as of 2026-10-27.

1. [Once-weekly cagrilintide for weight management in people with overweight and obesity: a multicentre, randomised, double-blind, placebo-controlled and active-controlled, dose-finding phase 2 trial.](https://doi.org/10.1016/S0140-6736(21)01751-7) — primary research; accessed 2026-10-27.
2. [Coadministered Cagrilintide and Semaglutide in Adults with Overweight or Obesity.](https://doi.org/10.1056/NEJMoa2502081) — primary research; accessed 2026-10-27.
3. [FDA: Concerns with unapproved GLP-1 drugs used for weight loss](https://www.fda.gov/drugs/drug-alerts-and-statements/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss) — regulatory; accessed 2026-10-27.

### Amycretin

- Canonical slug: `amycretin`.
- Reference coverage: Amycretin.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational clinical-development program; no FDA marketing approval identified as of 2026-10-27.

1. [Efficacy and safety of once-daily oral zenagamtide, a novel unimolecular GLP-1 and amylin receptor agonist, in adults with type 2 diabetes: a multicentre, randomised, parallel, double-blind, placebo-controlled, dose-finding, phase 2 trial.](https://doi.org/10.1016/S0140-6736(26)01247-X) — primary research; accessed 2026-10-27.
2. [Amycretin, a novel, unimolecular GLP-1 and amylin receptor agonist administered subcutaneously: results from a phase 1b/2a randomised controlled study.](https://doi.org/10.1016/S0140-6736(25)01185-7) — primary research; accessed 2026-10-27.
3. [Safety, tolerability, pharmacokinetics, and pharmacodynamics of the first-in-class GLP-1 and amylin receptor agonist, amycretin: a first-in-human, phase 1, double-blind, randomised, placebo-controlled trial.](https://doi.org/10.1016/S0140-6736(25)01176-6) — primary research; accessed 2026-10-27.

### Apraglutide

- Canonical slug: `apraglutide`.
- Reference coverage: Apraglutide.
- Status: clinical; clinical_trials.
- Jurisdiction: United States — investigational; additional confirmatory development requested by FDA.

1. [STARS Phase 3 Trial: Once-Weekly Apraglutide Reduces Parenteral Support in Short Bowel Syndrome-Intestinal Failure.](https://doi.org/10.1016/j.cgh.2026.08.026) — primary research; accessed 2026-10-27.
2. [Ironwood: Apraglutide clinical and regulatory update, April 2025](https://investor.ironwoodpharma.com/press-releases/press-release-details/2025/Ironwood-Pharmaceuticals-Provides-Clinical-and-Regulatory-Update-on-Apraglutide/default.aspx) — manufacturer; accessed 2026-10-27.
3. [Ironwood: 2026 first-quarter results and STARS-2 development update](https://investor.ironwoodpharma.com/press-releases/press-release-details/2026/Ironwood-Pharmaceuticals-Reports-Strong-First-Quarter-2026-Results-With-97-Year-Over-Year-LINZESS-U-S--Net-Sales-Growth-Maintains-Full-Year-2026-Financial-Guidance/default.aspx) — manufacturer; accessed 2026-10-27.

### Brilacidin

- Canonical slug: `brilacidin`.
- Reference coverage: Brilacidin.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; no FDA-approved brilacidin medicine identified as of 2026-10-27.

1. [Innovation Pharmaceuticals: Brilacidin development programs](https://www.ipharminc.com/brilacidin-1/) — manufacturer; accessed 2026-10-27.
2. [Brilacidin Demonstrates Inhibition of SARS-CoV-2 in Cell Culture.](https://doi.org/10.3390/v13020271) — primary research; accessed 2026-10-27.
3. [Brilacidin, a COVID-19 drug candidate, demonstrates broad-spectrum antiviral activity against human coronaviruses OC43, 229E, and NL63 through targeting both the virus and the host cell.](https://doi.org/10.1002/jmv.27616) — primary research; accessed 2026-10-27.
4. [Innovation Pharmaceuticals: Analysis of Brilacidin COVID-19 phase 2 dataset](https://www.accessnewswire.com/newsroom/en/healthcare-and-pharmaceutical/innovation-pharmaceuticals-analyzing-full-dataset-for-its-brilacidin-c-676242) — manufacturer; accessed 2026-10-27.

### CagriSema

- Canonical slug: `cagrisema`.
- Reference coverage: CagriSema.
- Status: clinical; clinical_trials.
- Jurisdiction: United States — application under review in the current sponsor disclosures; no FDA approval identified as of 2026-10-27.

1. [Coadministered Cagrilintide and Semaglutide in Adults with Overweight or Obesity.](https://doi.org/10.1056/NEJMoa2502081) — primary research; accessed 2026-10-27.
2. [Cagrilintide-Semaglutide in Adults with Overweight or Obesity and Type 2 Diabetes.](https://doi.org/10.1056/NEJMoa2502082) — primary research; accessed 2026-10-27.
3. [Novo Nordisk SEC filing: REDEFINE 4 results and regulatory status, February 2026](https://www.sec.gov/Archives/edgar/data/353278/000117184326000996/f6k_022326.htm) — manufacturer; accessed 2026-10-27.

### Enlicitide

- Canonical slug: `enlicitide`.
- Reference coverage: Enlicitide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Lipfendra prescribing information, July 2026](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/220848Orig1s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [A Placebo-Controlled Trial of the Oral PCSK9 Inhibitor Enlicitide.](https://doi.org/10.1056/NEJMoa2511002) — primary research; accessed 2026-10-27.

### Glepaglutide

- Canonical slug: `glepaglutide`.
- Reference coverage: Glepaglutide.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; current sponsor information states no FDA or other health-authority approval.

1. [Glepaglutide, a Long-Acting Glucagon-like Peptide-2 Analogue, Reduces Parenteral Support in Patients With Short Bowel Syndrome: A Phase 3 Randomized Controlled Trial.](https://doi.org/10.1053/j.gastro.2024.11.023) — primary research; accessed 2026-10-27.
2. [Zealand Pharma: Glepaglutide pipeline and EASE-5 status](https://www.zealandpharma.com/pipeline/glepaglutide/) — manufacturer; accessed 2026-10-27.

### Larazotide acetate

- Canonical slug: `larazotide-acetate`.
- Reference coverage: Larazotide acetate.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; pivotal celiac program discontinued; no FDA marketing approval identified.

1. [Larazotide acetate for persistent celiac symptoms: randomized controlled trial](https://pubmed.ncbi.nlm.nih.gov/25683116/) — primary research; accessed 2026-10-27.
2. [9 Meters Biopharma SEC filing: discontinuation of larazotide celiac development](https://www.sec.gov/Archives/edgar/data/1551986/000155198622000091/nmtr-20220630.htm) — manufacturer; accessed 2026-10-27.
3. [ClinicalTrials.gov: larazotide phase 3 celiac study](https://clinicaltrials.gov/study/NCT03569007) — trial; accessed 2026-10-27.

### Mazdutide

- Canonical slug: `mazdutide`.
- Reference coverage: Mazdutide.
- Status: established; approved_medicine.
- Jurisdiction: China — NMPA-approved for weight management and type 2 diabetes; no U.S. FDA approval identified as of 2026-10-27.

1. [Innovent: NMPA approval of mazdutide for weight management](https://en.innoventbio.com/InvestorsAndMedia/PressReleaseDetail?key=546) — manufacturer; accessed 2026-10-27.
2. [Innovent: 2025 update confirming weight-management and diabetes approvals](https://en.innoventbio.com/InvestorsAndMedia/PressReleaseDetail?key=573) — manufacturer; accessed 2026-10-27.
3. [Once-Weekly Mazdutide in Chinese Adults with Obesity or Overweight.](https://doi.org/10.1056/NEJMoa2411528) — primary research; accessed 2026-10-27.

### Pemvidutide

- Canonical slug: `pemvidutide`.
- Reference coverage: Pemvidutide.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; no FDA-approved pemvidutide medicine identified as of 2026-10-27.

1. [Safety and efficacy of weekly pemvidutide versus placebo for metabolic dysfunction-associated steatohepatitis (IMPACT): 24-week results from a multicentre, randomised, double-blind, phase 2b study.](https://doi.org/10.1016/S0140-6736(25)02114-2) — primary research; accessed 2026-10-27.
2. [Safety and efficacy of 24 weeks of pemvidutide in metabolic dysfunction-associated steatotic liver disease: A randomized, controlled clinical trial.](https://doi.org/10.1016/j.jhepr.2025.101483) — primary research; accessed 2026-10-27.

### Petrelintide

- Canonical slug: `petrelintide`.
- Reference coverage: Petrelintide.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; no FDA-approved petrelintide medicine identified as of 2026-10-27.

1. [Petrelintide, a human amylin analogue for the treatment of obesity (ZUPREME 1): a randomised, double-blind, placebo-controlled, phase 2 trial.](https://doi.org/10.1016/S2213-8587(26)00213-5) — primary research; accessed 2026-10-27.
2. [Roche: Petrelintide ZUPREME-1 phase 2 results, March 2026](https://www.roche.com/media/releases/med-cor-2026-03-05) — manufacturer; accessed 2026-10-27.
3. [Zealand Pharma: Petrelintide pipeline](https://www.zealandpharma.com/pipeline/petrelintide/) — manufacturer; accessed 2026-10-27.

### PN-943

- Canonical slug: `pn-943`.
- Reference coverage: PN-943.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; sponsor discontinued further internal development commitment after the phase 2 extension; no FDA approval identified.

1. [PN-943 healthy-volunteer pharmacokinetic and pharmacodynamic studies](https://pubmed.ncbi.nlm.nih.gov/33942566/) — primary research; accessed 2026-10-27.
2. [Protagonist: IDEAL phase 2 topline results](https://www.prnewswire.com/news-releases/protagonist-therapeutics-announces-topline-data-from-phase-2-ideal-study-of-pn-943-in-ulcerative-colitis-301532339.html) — manufacturer; accessed 2026-10-27.
3. [Protagonist: Third-quarter 2022 update and PN-943 development priorities](https://www.prnewswire.com/news-releases/protagonist-reports-third-quarter-2022-financial-results-and-provides-corporate-update-301672171.html) — manufacturer; accessed 2026-10-27.

### Survodutide

- Canonical slug: `survodutide`.
- Reference coverage: Survodutide.
- Status: clinical; clinical_trials.
- Jurisdiction: Investigational; no FDA-approved survodutide medicine identified as of 2026-10-27.

1. [A Phase 2 Randomized Trial of Survodutide in MASH and Fibrosis.](https://doi.org/10.1056/NEJMoa2401755) — primary research; accessed 2026-10-27.
2. [Boehringer Ingelheim: SYNCHRONIZE-1 phase 3 obesity results](https://www.boehringer-ingelheim.com/us/human-health/metabolic-diseases/results-phase-iii-synchronize-1-obesity-trial) — manufacturer; accessed 2026-10-27.
3. [Survodutide phase 3 trial in adults with obesity without diabetes](https://doi.org/10.1056/NEJMoa2600751) — primary research; accessed 2026-10-27.

### BPC-157

- Canonical slug: `bpc-157`.
- Reference coverage: BPC-157.
- Status: limited; research_only.
- Jurisdiction: United States — no FDA-approved BPC-157 medicine; compounding-policy review is distinct from drug approval.

1. [BPC-157 effects on tendon outgrowth, survival and migration](https://pubmed.ncbi.nlm.nih.gov/21030672/) — primary research; accessed 2026-10-27.
2. [FDA 2026 evaluation of BPC-157-related bulk drug substances](https://www.fda.gov/media/193343/download) — regulatory; accessed 2026-10-27.
3. [FDA July 2026 Pharmacy Compounding Advisory Committee meeting](https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026) — regulatory; accessed 2026-10-27.

### KPV

- Canonical slug: `kpv`.
- Reference coverage: KPV.
- Status: preclinical; research_only.
- Jurisdiction: United States — no FDA-approved KPV medicine; compounding review is a separate regulatory question.

1. [Melanocortin-derived tripeptide KPV has anti-inflammatory potential in murine models of inflammatory bowel disease.](https://doi.org/10.1002/ibd.20334) — primary research; accessed 2026-10-27.
2. [Orally Targeted Delivery of Tripeptide KPV via Hyaluronic Acid-Functionalized Nanoparticles Efficiently Alleviates Ulcerative Colitis.](https://doi.org/10.1016/j.ymthe.2016.11.020) — primary research; accessed 2026-10-27.
3. [FDA July 2026 PCAC presentations: KPV evaluation](https://www.fda.gov/media/193773/download) — regulatory; accessed 2026-10-27.

### AOD-9604

- Canonical slug: `aod-9604`.
- Reference coverage: AOD-9604.
- Status: clinical; research_only.
- Jurisdiction: United States — no FDA-approved AOD-9604 medicine; human obesity development did not establish efficacy.

1. [Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone.](https://doi.org/10.1159/000053183) — primary research; accessed 2026-10-27.
2. [Increase of fat oxidation and weight loss in obese mice caused by chronic treatment with human growth hormone or a modified C-terminal fragment.](https://doi.org/10.1038/sj.ijo.0801740) — primary research; accessed 2026-10-27.
3. [FDA December 2024 PCAC evaluation of AOD-9604](https://www.fda.gov/media/183891/download) — regulatory; accessed 2026-10-27.
4. [Detection and in vitro metabolism of AOD9604](https://pubmed.ncbi.nlm.nih.gov/25208511/) — primary research; accessed 2026-10-27.

### 5-Amino-1MQ

- Canonical slug: `5-amino-1mq`.
- Reference coverage: 5-Amino-1MQ.
- Status: preclinical; research_only.
- Jurisdiction: Research compound; no FDA-approved 5-Amino-1MQ medicine identified.

1. [Selective and membrane-permeable small molecule inhibitors of nicotinamide N-methyltransferase reverse high fat diet-induced obesity in mice.](https://doi.org/10.1016/j.bcp.2017.11.007) — primary research; accessed 2026-10-27.
2. [Nicotinamide N-methyltransferase inhibition mitigates obesity-related metabolic dysfunction](https://pubmed.ncbi.nlm.nih.gov/39161060/) — primary research; accessed 2026-10-27.
3. [Reduced calorie diet combined with NNMT inhibition establishes a distinct microbiome in DIO mice.](https://doi.org/10.1038/s41598-021-03670-5) — primary research; accessed 2026-10-27.

### Fragment 176-191

- Canonical slug: `fragment-176-191`.
- Reference coverage: Fragment 176-191.
- Status: limited; research_only.
- Jurisdiction: Research-only identity-sensitive entry; no FDA-approved Fragment 176–191 medicine identified.

1. [Detection and in vitro metabolism of AOD9604: sequence identity](https://pubmed.ncbi.nlm.nih.gov/25208511/) — primary research; accessed 2026-10-27.
2. [Antilipogenic action of synthetic C-terminal sequence 177–191 of human growth hormone](https://pubmed.ncbi.nlm.nih.gov/8358331/) — primary research; accessed 2026-10-27.
3. [FDA December 2024 review of AOD-9604 efficacy and safety](https://www.fda.gov/media/183891/download) — regulatory; accessed 2026-10-27.

### Albiglutide

- Canonical slug: `albiglutide`.
- Reference coverage: Albiglutide.
- Status: established; approved_medicine.
- Jurisdiction: Historical FDA approval; commercial discontinuation. European Union authorization withdrawn in 2018 at the manufacturer’s request.

1. [FDA: historical Tanzeum prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/125431s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Albiglutide and cardiovascular outcomes in patients with type 2 diabetes and cardiovascular disease (Harmony Outcomes): a double-blind, randomised placebo-controlled trial.](https://doi.org/10.1016/S0140-6736(18)32261-X) — primary research; accessed 2026-10-27.
3. [EMA: Eperzan withdrawal and authorization history](https://www.ema.europa.eu/en/medicines/human/EPAR/eperzan) — regulatory; accessed 2026-10-27.

### Corticotropin

- Canonical slug: `corticotropin`.
- Reference coverage: Corticotropin.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [Acthar Gel current prescribing information, October 2026](https://www.acthar.com/Static/pdf/Acthar-PI.pdf) — regulatory; accessed 2026-10-27.
2. [Randomized ACTH versus prednisone trial in infantile spasms](https://pubmed.ncbi.nlm.nih.gov/8604274/) — primary research; accessed 2026-10-27.

### Cosyntropin

- Canonical slug: `cosyntropin`.
- Reference coverage: Cosyntropin.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Cortrosyn current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0c424fac-b114-41f6-aba8-cf710a34c26c) — regulatory; accessed 2026-10-27.

### Dulaglutide

- Canonical slug: `dulaglutide`.
- Reference coverage: Dulaglutide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Trulicity current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=463050bd-2b1c-40f5-b3c3-0a04bb433309) — regulatory; accessed 2026-10-27.
2. [Dulaglutide and cardiovascular outcomes in type 2 diabetes (REWIND): a double-blind, randomised placebo-controlled trial.](https://doi.org/10.1016/S0140-6736(19)31149-3) — primary research; accessed 2026-10-27.

### Exenatide

- Canonical slug: `exenatide`.
- Reference coverage: Exenatide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Exenatide injection current prescribing information, 2026](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e6cb5c8f-e97f-4a6a-95a4-939fd2393949) — regulatory; accessed 2026-10-27.
2. [FDA: Bydureon BCise prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/209210s024lbl.pdf) — regulatory; accessed 2026-10-27.

### Insulin analogs (multiple)

- Canonical slug: `insulin-analogs-multiple`.
- Reference coverage: Insulin analogs (multiple).
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Humalog insulin lispro prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b34cd3ff-d0af-4852-b4ef-2a8b4a93aeae) — regulatory; accessed 2026-10-27.
2. [Novo Nordisk: Tresiba insulin degludec prescribing information](https://www.novo-pi.com/tresiba.pdf) — regulatory; accessed 2026-10-27.

### Lixisenatide

- Canonical slug: `lixisenatide`.
- Reference coverage: Lixisenatide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [FDA: Adlyxin prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/208471s009lbl.pdf) — regulatory; accessed 2026-10-27.
2. [DailyMed: Soliqua 100/33 current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4bba538b-cf7c-4310-ae8f-cb711ed21bcc) — regulatory; accessed 2026-10-27.
3. [Lixisenatide in Patients with Type 2 Diabetes and Acute Coronary Syndrome.](https://doi.org/10.1056/NEJMoa1509225) — primary research; accessed 2026-10-27.

### Mecasermin

- Canonical slug: `mecasermin`.
- Reference coverage: Mecasermin.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Increlex current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d5b2b0e1-c523-468d-9a0b-4ae4e4a8dbce) — regulatory; accessed 2026-10-27.
2. [Long-term treatment with recombinant insulin-like growth factor (IGF)-I in children with severe IGF-I deficiency due to growth hormone insensitivity.](https://doi.org/10.1210/jc.2006-1610) — primary research; accessed 2026-10-27.

### Pasireotide

- Canonical slug: `pasireotide`.
- Reference coverage: Pasireotide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Signifor current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a09a25fc-a5a3-0c82-e053-2995a90a5d74) — regulatory; accessed 2026-10-27.
2. [DailyMed: Signifor LAR prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a0aad470-3f38-af97-e053-2995a90a383a) — regulatory; accessed 2026-10-27.
3. [A 12-month phase 3 study of pasireotide in Cushing's disease.](https://doi.org/10.1056/NEJMoa1105743) — primary research; accessed 2026-10-27.

### Pegvisomant

- Canonical slug: `pegvisomant`.
- Reference coverage: Pegvisomant.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Somavert prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3cbb485b-6df1-49ce-8747-592b395b1988) — regulatory; accessed 2026-10-27.
2. [Treatment of acromegaly with the growth hormone-receptor antagonist pegvisomant.](https://doi.org/10.1056/NEJM200004203421604) — primary research; accessed 2026-10-27.

### Pramlintide

- Canonical slug: `pramlintide`.
- Reference coverage: Pramlintide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: SymlinPen prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4aea30ff-eb0d-45c1-b114-3127966328ff) — regulatory; accessed 2026-10-27.

### Secretin

- Canonical slug: `secretin`.
- Reference coverage: Secretin.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: ChiRhoStim current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b4dfe70f-0a86-4488-9ba1-dcd8f86cbfcd) — regulatory; accessed 2026-10-27.

### Somapacitan

- Canonical slug: `somapacitan`.
- Reference coverage: Somapacitan.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Sogroya current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=eadd03b4-adc3-4b88-8a24-9d205c5b85aa) — regulatory; accessed 2026-10-27.
2. [Once-weekly Somapacitan is Effective and Well Tolerated in Adults with GH Deficiency: A Randomized Phase 3 Trial.](https://doi.org/10.1210/clinem/dgaa049) — primary research; accessed 2026-10-27.

### Somatropin (rhGH)

- Canonical slug: `somatropin-rhgh`.
- Reference coverage: Somatropin (rhGH).
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA-approved prescription medicine; indication and formulation restrictions apply.

1. [DailyMed: Genotropin current prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ffebf88b-d257-4542-9808-74d9b7167765) — regulatory; accessed 2026-10-27.
2. [FDA: Serostim prescribing information, July 2026](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/020604s104lbl.pdf) — regulatory; accessed 2026-10-27.
3. [FDA: Zorbtive prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020604s074lbl.pdf) — regulatory; accessed 2026-10-27.

### Efpeglenatide

- Canonical slug: `efpeglenatide`.
- Reference coverage: Efpeglenatide.
- Status: established; approved_medicine.
- Jurisdiction: South Korea — MFDS-approved October 2026 for defined adult weight-management use; no FDA approval identified.

1. [MFDS: first domestically developed GLP-1 obesity medicine approval, October 2026](https://www.mfds.go.kr/brd/m_1256/view.do?company_cd=&company_nm=&itm_seq_1=0&itm_seq_2=0&multi_itm_seq=0&page=1&seq=147&srchFr=&srchTo=&srchTp=&srchWord=) — regulatory; accessed 2026-10-27.
2. [Cardiovascular and Renal Outcomes with Efpeglenatide in Type 2 Diabetes.](https://doi.org/10.1056/NEJMoa2108269) — primary research; accessed 2026-10-27.

### Elamipretide

- Canonical slug: `elamipretide`.
- Reference coverage: Elamipretide.
- Status: established; approved_medicine.
- Jurisdiction: United States — FDA accelerated approval in September 2025 for Barth syndrome patients weighing at least 30 kg; confirmatory benefit requirement.

1. [DailyMed: Forzinity prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=146bf34c-76f2-48db-ac07-fb29cce2cd75) — regulatory; accessed 2026-10-27.
2. [Long-term efficacy and safety of elamipretide in patients with Barth syndrome: 168-week open-label extension results of TAZPOWER.](https://doi.org/10.1016/j.gim.2024.101138) — primary research; accessed 2026-10-27.

### MOTS-c

- Canonical slug: `mots-c`.
- Reference coverage: MOTS-c.
- Status: preclinical; research_only.
- Jurisdiction: United States — no FDA-approved MOTS-c medicine; compounding review does not establish approval.

1. [MOTS-c discovery and metabolic studies](https://pubmed.ncbi.nlm.nih.gov/25738459/) — primary research; accessed 2026-10-27.
2. [MOTS-c physical-function and exercise-response study](https://pubmed.ncbi.nlm.nih.gov/33473109/) — primary research; accessed 2026-10-27.
3. [FDA 2026 evaluation of MOTS-c-related bulk drug substances](https://www.fda.gov/media/193347/download) — regulatory; accessed 2026-10-27.

### Humanin

- Canonical slug: `humanin`.
- Reference coverage: Humanin.
- Status: preclinical; research_only.
- Jurisdiction: Research peptide; no FDA-approved humanin medicine identified as of 2026-10-27.

1. [Humanin: a novel central regulator of peripheral insulin action.](https://doi.org/10.1371/journal.pone.0006334) — primary research; accessed 2026-10-27.
2. [The mitochondrial derived peptide humanin is a regulator of lifespan and healthspan.](https://doi.org/10.18632/aging.103534) — primary research; accessed 2026-10-27.

