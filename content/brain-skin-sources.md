# Brain and Skin source review

Reviewed: 2026-10-27. Reviewer: Peptide Atlas — AI source review.

## Deliverable and coverage

`brain-skin-profiles.json` contains **37 canonical articles covering all 41 Brain and Skin reference entries**: 11 Brain articles cover 13 names, and 26 Skin articles cover 28 names. Every original reference name is retained exactly in `referenceNames`; aliases support alternative molecule and development names. There are 121 substantive article sections, 115 linked source entries, and 92 distinct source URLs. Articles contain approximately 400–520 words of public-facing narrative, headings, and at-a-glance facts, excluding bibliographies and metadata.

The four consolidations in this batch are Bremelanotide/PT-141; Trofinetide/its predecessor-program heading; Afamelanotide/Melanotan I; and GHK-Cu/Copper tripeptide-1. These are identity consolidations, not removal of reference coverage. The Dalbavancin/Oritavancin/Telavancin reference is retained as a comparison of three distinct medicines, not falsely modeled as one chemical molecule. Existing `ghk-cu`, `epitalon`, `semax`, and `selank` slugs are preserved for stable-ID mapping by the import process.

Eight articles include original FAQ sections because the corresponding reference article contains FAQs: Bremelanotide (the PT-141 reference context), Epitalon, Semax, Selank, Dihexa, Cerebrolysin, GHK-Cu, and Acetyl hexapeptide-8. Each FAQ section has 1-based source indices and new wording.

## Research and authorship method

The Superpower site was used to establish coverage, molecule names, field types, and its outbound source list. No reference-site prose, body illustration, JavaScript, photographs, or other visual assets are reproduced in these articles. Medical and scientific explanations were written anew from the primary sources linked in the JSON.

Sources were checked using official FDA/DailyMed labeling and notices, original trial and experimental papers, primary journal retraction notices, official supplier product information, and CIR ingredient assessments. Original publication metadata and author abstracts were also retrieved through the public Europe PMC service; selected open-access full texts were examined where the exact ingredient or study design required it. This does **not** imply that every cited paper was read in full. Publisher blocks and paywalls were not bypassed. Manufacturer announcements and supplier studies are labeled as such and are not treated as independent confirmations.

`source_checked` means AI checking of source identity, relevance, study design, and claim boundaries. It does not claim a human physician review, clinical validation of the entire application, exhaustive systematic review, or approval of a treatment. Clinical-use articles contain no prescribing doses or self-injection instructions. Regulatory classifications are scoped to the jurisdiction text; medicine approval is tied to product and indication. Cosmetic status and ingredient listings are not represented as FDA efficacy approvals.

## Material corrections and evidence boundaries

- **Dihexa:** the 2012 HGF/Met modifier paper and the 2014 procognitive/synaptogenic paper were retracted in 2025. Retraction notices are cited directly. The article does not retain their positive findings as reliable evidence. FDA's current compounding-risk page separately documents the lack of identified human exposure data for Dihexa acetate.
- **NNZ-2591:** DOI `10.1212/NXG.0000000000200405` is an erratum to the 18-participant open-label Phelan-McDermid trial, not an independent trial. The randomized Koala program is described as a development program. The current manufacturer alias **ercanetide** is retained.
- **Epitalon and Semax:** the July 2026 FDA PCAC briefings are scientific advisory documents, not marketing approvals or final compounding determinations. Their clinical and safety limitations are stated without claiming that mechanistic cancer concerns prove observed human cancer causation.
- **Davunetide:** the 313-participant PSP trial had negative primary outcomes. The separately consulted original MCI trial (Morimoto et al., PMID 23594991) also found no significant difference in its composite memory score; two task-level signals do not establish an overall cognitive benefit. The original Oz et al. mechanism experiments (PMID 25178163) support EB1/EB3-dependent cellular effects, not human treatment efficacy. Its broad introductory characterization of earlier clinical benefits is not repeated in place of the actual trial results. For these additions, the MCI author abstract was read directly on PubMed and the mechanism author abstract through Europe PMC; full-text review is not claimed.
- **DSIP:** controlled historical insomnia studies found weak or clinically limited effects. They are included alongside the historical rationale, rather than presenting the molecule's name as proof of benefit.
- **Cerebrolysin:** a porcine-derived mixture, not one defined peptide. The 1,070-patient CASTA trial had a negative confirmatory endpoint; the CAPTAIN analysis addresses a different traumatic-brain-injury setting. No U.S. approval was identified. A historical FDA enforcement source is not presented as a current comprehensive compounding-law determination.
- **Bacitracin:** distinguish topical/ophthalmic products from injection applications withdrawn for safety/effectiveness reasons. The 2022 Federal Register determination is cited. No blanket claim that every OTC product received an individual new-drug approval is made.
- **LTX-315:** later development names **VP-315 / ruxotemitide** are retained. Early solid-tumor phase 1 whole-patient response criteria differ from later sponsor-reported BCC lesion histology. Current development is not treated as approval or equivalence to surgery.
- **GHK-Cu:** the small post-laser randomized study found no significant objective advantage in redness or wrinkles, despite higher satisfaction. The 2007 hair-follicle study commonly cited for GHK-Cu actually studied **AHK-Cu**. Palmitoyl tripeptide-1 is also chemically different.
- **Acetyl octapeptide-3:** the reference site's cited acetyl hexapeptide-3/tripeptide-10 study does not study acetyl octapeptide-3. Our SNAP-8 article explains that mismatch and uses the actual multi-active microneedle study as limited product-level evidence.
- **Hexapeptide-9:** the 2025 randomized trial tested **cyclized** hexapeptide-9. Another study tested an ionic-liquid delivery combination. Neither is generalized to all conventional linear-peptide creams.
- **Acetyl tetrapeptide-5:** the 2026 infraorbital study is a single-arm injected HA/amino-acid/peptide combination. It cannot isolate the peptide or establish a topical-cream effect. Original Eyeseryl is distinguished from later product-family names.
- **Nonapeptide-1:** the tea-polyphenol paper uses nonapeptide-1 acetate in cell comparator/combination conditions. It is not a human nonapeptide-1 efficacy trial.
- **Oligopeptide-1:** exact cosmetic ingredient/product identity is flagged. The small 2026 comparison uses two different complete serums and cannot isolate an EGF effect.
- **Matrixyl family:** original Matrixyl (palmitoyl pentapeptide-4), Matrixyl 3000 (two peptides), and Matrixyl synthe’6 (palmitoyl tripeptide-38) are different products. Blend-level outcomes are not attributed to individual actives without a suitable design.
- **Tripeptide-10 citrulline:** the original development paper describes a tetrapeptide despite the INCI name. Its collagen-organization rationale differs from proof of increased collagen quantity.
- **Carnosine, glutathione, and other cosmetics:** cellular or ex vivo antioxidant effects, increased biomarkers, and small appearance trials are not equated with proven disease prevention, lifespan extension, sunscreen performance, or injectable safety.

## Per-article source map

Source numbers below match the 1-based `citations` arrays in each article. `ingredient_registry` includes CIR's primary ingredient-identity/safety-assessment documents; CIR is not described as an FDA regulator or an efficacy-approval body.

### Bremelanotide

- Slug: `bremelanotide`. Reference names: Bremelanotide; PT-141.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 493.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [FDA prescribing information: Vyleesi (bremelanotide)](https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210557s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Bremelanotide for HSDD: two randomized phase 3 trials](https://doi.org/10.1097/AOG.0000000000003500) — trial; accessed 2026-10-27.

### Trofinetide

- Slug: `trofinetide`. Reference names: Trofinetide; Trofinetide (predecessor programs).
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 416.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [FDA prescribing information: Daybue (trofinetide)](https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217026s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Trofinetide for Rett syndrome: randomized phase 3 LAVENDER study](https://doi.org/10.1038/s41591-023-02398-1) — trial; accessed 2026-10-27.

### Ziconotide

- Slug: `ziconotide`. Reference names: Ziconotide.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 411.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DailyMed: Prialt (ziconotide) prescribing information](https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b025d8ed-937d-4597-9ad1-0b2f6e0ee5b1) — regulatory; accessed 2026-10-27.
2. [Intrathecal ziconotide for refractory cancer or AIDS pain: randomized trial](https://doi.org/10.1001/jama.291.1.63) — trial; accessed 2026-10-27.

### Davunetide

- Slug: `davunetide`. Reference names: Davunetide.
- Evidence: `clinical`. Regulatory context: `clinical_trials`. Article words: approximately 500.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Davunetide in progressive supranuclear palsy: randomized phase 2/3 trial](https://doi.org/10.1016/S1474-4422(14)70088-2) — trial; accessed 2026-10-27.
2. [AL-108 in amnestic mild cognitive impairment: randomized 12-week study](https://pubmed.ncbi.nlm.nih.gov/23594991/) — trial; accessed 2026-10-27.
3. [The ADNP/NAP motif, dendritic spines, and microtubule end-binding proteins: original experiments](https://pubmed.ncbi.nlm.nih.gov/25178163/) — primary_research; accessed 2026-10-27.

### NNZ-2591

- Slug: `nnz-2591`. Reference names: NNZ-2591.
- Evidence: `clinical`. Regulatory context: `clinical_trials`. Article words: 412.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [NNZ-2591 in children and adolescents with Phelan-McDermid syndrome: open-label phase 2 results](https://doi.org/10.1212/NXG.0000000000200338) — trial; accessed 2026-10-27.
2. [Neuren: 2025 full-year accounts and 2026 development update](https://neurenpharma.com/announcements/dxX2gq-appendix-4e-and-2025-full-year-accounts) — manufacturer; accessed 2026-10-27.
3. [Erratum to the NNZ-2591 phase 2 Phelan-McDermid report](https://doi.org/10.1212/NXG.0000000000200405) — primary_research; accessed 2026-10-27.
4. [Neuren July 2026 PMSF update identifying NNZ-2591 as ercanetide](https://neurenpharma.com/announcements/0z5WWZ-neuren-highlights-participation-in-pmsf-family-conference) — manufacturer; accessed 2026-10-27.

### Epitalon

- Slug: `epitalon`. Reference names: Epitalon.
- Evidence: `preclinical`. Regulatory context: `research_only`. Article words: 479.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Epithalon induces telomerase activity and telomere elongation in cultured human cells](https://doi.org/10.1023/a:1025493705728) — primary_research; accessed 2026-10-27.
2. [Epitalon and telomere length in normal and cancer cell lines](https://pubmed.ncbi.nlm.nih.gov/40908429/) — primary_research; accessed 2026-10-27.
3. [FDA July 2026 PCAC briefing: Epitalon-related bulk substances](https://www.fda.gov/media/193345/download) — regulatory; accessed 2026-10-27.

### Semax

- Slug: `semax`. Reference names: Semax.
- Evidence: `limited`. Regulatory context: `research_only`. Article words: 482.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Semax in acute hemispheric ischemic stroke: clinical and electrophysiological report](https://pubmed.ncbi.nlm.nih.gov/11517472/) — trial; accessed 2026-10-27.
2. [Semax at different stages of ischemic stroke rehabilitation](https://pubmed.ncbi.nlm.nih.gov/29798983/) — trial; accessed 2026-10-27.
3. [Semax and dopaminergic/serotonergic systems in rodents](https://doi.org/10.1007/s11064-005-8826-8) — primary_research; accessed 2026-10-27.
4. [FDA July 2026 PCAC briefing: Semax-related bulk substances](https://www.fda.gov/media/193348/download) — regulatory; accessed 2026-10-27.

### Selank

- Slug: `selank`. Reference names: Selank.
- Evidence: `limited`. Regulatory context: `research_only`. Article words: 485.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Selank versus medazepam in generalized anxiety disorder and neurasthenia](https://pubmed.ncbi.nlm.nih.gov/18454096/) — trial; accessed 2026-10-27.
2. [Selank effects on gene expression involved in neurotransmission in rats](https://doi.org/10.3389/fphar.2016.00031) — primary_research; accessed 2026-10-27.
3. [FDA: safety concerns for certain bulk substances proposed for compounding](https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks) — regulatory; accessed 2026-10-27.

### DSIP

- Slug: `dsip`. Reference names: DSIP.
- Evidence: `limited`. Regulatory context: `research_only`. Article words: 429.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DSIP in chronic insomnia: double-blind study of 16 patients](https://pubmed.ncbi.nlm.nih.gov/1299794/) — trial; accessed 2026-10-27.
2. [Short-term DSIP in chronic insomnia: double-blind crossover study](https://pubmed.ncbi.nlm.nih.gov/3583493/) — trial; accessed 2026-10-27.
3. [DSIP for chronic pain episodes: seven-patient pilot study](https://doi.org/10.1159/000115716) — trial; accessed 2026-10-27.
4. [FDA: safety concerns for certain bulk substances proposed for compounding](https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks) — regulatory; accessed 2026-10-27.

### Dihexa

- Slug: `dihexa`. Reference names: Dihexa.
- Evidence: `limited`. Regulatory context: `research_only`. Article words: 500.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Retraction notice: Development of Angiotensin IV Analogs as HGF/Met Modifiers](https://pubmed.ncbi.nlm.nih.gov/40312092/) — primary_research; accessed 2026-10-27.
2. [Retraction notice: Procognitive and Synaptogenic Effects of Angiotensin IV-Derived Peptides](https://pubmed.ncbi.nlm.nih.gov/40312093/) — primary_research; accessed 2026-10-27.
3. [FDA: safety concerns for certain bulk substances proposed for compounding](https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks) — regulatory; accessed 2026-10-27.

### Cerebrolysin

- Slug: `cerebrolysin`. Reference names: Cerebrolysin.
- Evidence: `clinical`. Regulatory context: `unspecified`. Article words: 515.
- Jurisdiction: United States: no FDA approval identified in this source review; country-specific authorizations require local verification.

1. [CASTA: Cerebrolysin in acute ischemic stroke in Asia, randomized trial](https://pubmed.ncbi.nlm.nih.gov/22282884/) — trial; accessed 2026-10-27.
2. [CAPTAIN trial series: prospective combined analysis in traumatic brain injury](https://pubmed.ncbi.nlm.nih.gov/33620612/) — trial; accessed 2026-10-27.
3. [FDA 2020 warning letter addressing unapproved compounded products including Cerebrolysin](https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/tailor-made-compounding-llc-594743-04012020) — regulatory; accessed 2026-10-27.

### Afamelanotide

- Slug: `afamelanotide`. Reference names: Afamelanotide; Melanotan I.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 407.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [FDA prescribing information: Scenesse (afamelanotide)](https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/210797s000lbl.pdf) — regulatory; accessed 2026-10-27.
2. [Afamelanotide for erythropoietic protoporphyria: randomized trials](https://doi.org/10.1056/NEJMoa1411481) — trial; accessed 2026-10-27.

### Bacitracin

- Slug: `bacitracin`. Reference names: Bacitracin.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 434.
- Jurisdiction: United States: established topical/ophthalmic medicine contexts; bacitracin injection approvals withdrawn.

1. [White petrolatum versus bacitracin after dermatologic surgery: randomized trial](https://pubmed.ncbi.nlm.nih.gov/8805732/) — trial; accessed 2026-10-27.
2. [FDA determination: bacitracin for injection withdrawn for safety or effectiveness reasons](https://www.federalregister.gov/documents/2022/09/15/2022-19995/determination-that-bacitracin-for-injection-10000-unitsvial-and-50000-unitsvial-was-withdrawn-from) — regulatory; accessed 2026-10-27.
3. [DailyMed: bacitracin zinc and polymyxin B sulfate ophthalmic ointment](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b317249-30eb-4415-8a1c-cfedb4ba3549) — regulatory; accessed 2026-10-27.

### Dalbavancin / Oritavancin / Telavancin

- Slug: `dalbavancin-oritavancin-telavancin`. Reference names: Dalbavancin / Oritavancin / Telavancin.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 422.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DISCOVER trials: dalbavancin versus conventional therapy for skin infection](https://doi.org/10.1056/NEJMoa1310480) — trial; accessed 2026-10-27.
2. [DailyMed: Dalvance prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4b4674d8-4d1e-4728-8465-d42ada33fa5c) — regulatory; accessed 2026-10-27.
3. [DailyMed: Orbactiv prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ff09a726-9f9b-4e30-b509-396781293220) — regulatory; accessed 2026-10-27.
4. [DailyMed: Vibativ prescribing information](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=5359b759-db7c-4672-9e8a-59c93869bd91&type=display) — regulatory; accessed 2026-10-27.

### Daptomycin

- Slug: `daptomycin`. Reference names: Daptomycin.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 418.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Merck prescribing information: Cubicin (daptomycin)](https://www.merck.com/product/usa/pi_circulars/c/cubicin/cubicin_pi.pdf) — regulatory; accessed 2026-10-27.
2. [Daptomycin versus standard therapy for S. aureus bacteremia and endocarditis](https://doi.org/10.1056/NEJMoa053783) — trial; accessed 2026-10-27.

### Difelikefalin

- Slug: `difelikefalin`. Reference names: Difelikefalin.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 425.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DailyMed: Korsuva (difelikefalin) prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0c7b81f2-0fd3-47cb-8b0f-185e07f19c87) — regulatory; accessed 2026-10-27.
2. [KALM-1: phase 3 difelikefalin trial in hemodialysis-associated pruritus](https://doi.org/10.1056/NEJMoa1912770) — trial; accessed 2026-10-27.

### Ecallantide

- Slug: `ecallantide`. Reference names: Ecallantide.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 415.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DailyMed: Kalbitor (ecallantide) prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f56aec67-c662-477c-b866-bfc23e8809cf) — regulatory; accessed 2026-10-27.
2. [Ecallantide for acute hereditary-angioedema attacks: randomized trial](https://doi.org/10.1056/NEJMoa0905079) — trial; accessed 2026-10-27.

### Icatibant

- Slug: `icatibant`. Reference names: Icatibant.
- Evidence: `established`. Regulatory context: `approved_medicine`. Article words: 414.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [DailyMed: Firazyr (icatibant) prescribing information](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ed6657ca-ab68-477a-9968-e12dc928b540) — regulatory; accessed 2026-10-27.
2. [FAST-3: randomized placebo-controlled icatibant trial in acute HAE](https://doi.org/10.1016/j.anai.2011.08.015) — trial; accessed 2026-10-27.

### LTX-315

- Slug: `ltx-315`. Reference names: LTX-315.
- Evidence: `clinical`. Regulatory context: `clinical_trials`. Article words: 476.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [LTX-315 phase 1 trial: safety, antitumor activity, and T-cell responses](https://doi.org/10.1158/1078-0432.CCR-20-3435) — trial; accessed 2026-10-27.
2. [Verrica announcement: FDA acceptance of LTX-315 IND for basal-cell-carcinoma research](https://verrica.com/press_release/verrica-pharmaceuticals-announces-fda-acceptance-of-its-ind-application-for-ltx-315-a-potential-first-in-class-oncolytic-peptide-based-immunotherapy-for-the-treatment-of-basal-cell-carcinoma/) — manufacturer; accessed 2026-10-27.
3. [Verrica 2025 phase 2 basal-cell-carcinoma data and development update](https://verrica.com/press_release/verrica-pharmaceuticals-presents-new-data-on-vp-315-from-its-phase-2-clinical-trial-in-basal-cell-carcinoma-at-the-40th-society-for-immunotherapy-of-cancer-annual-meeting/) — manufacturer; accessed 2026-10-27.
4. [Verrica May 2026 update: VP-315 remains in development](https://verrica.com/wp-content/uploads/2026/05/2026-05-12-VRCA-1Q26-Financial-Results-FINAL-1.pdf) — manufacturer; accessed 2026-10-27.

### GHK-Cu

- Slug: `ghk-cu`. Reference names: GHK-Cu; Copper tripeptide-1.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 481.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Topical GHK-Cu after CO2 laser resurfacing: randomized clinical study](https://doi.org/10.1001/archfaci.8.4.252) — trial; accessed 2026-10-27.
2. [GHK-Cu and collagen synthesis in fibroblast cultures](https://pubmed.ncbi.nlm.nih.gov/3169264/) — primary_research; accessed 2026-10-27.
3. [GHK-Cu and connective-tissue accumulation in rat wounds](https://pubmed.ncbi.nlm.nih.gov/8227353/) — primary_research; accessed 2026-10-27.
4. [AHK-Cu, a different complex: human hair follicles ex vivo and cultured cells](https://pubmed.ncbi.nlm.nih.gov/17703734/) — primary_research; accessed 2026-10-27.
5. [FDA: safety concerns for certain bulk substances proposed for compounding](https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks) — regulatory; accessed 2026-10-27.

### Melanotan II

- Slug: `melanotan-ii`. Reference names: Melanotan II.
- Evidence: `limited`. Regulatory context: `research_only`. Article words: 416.
- Jurisdiction: United States: no approved tanning indication; Australian TGA warning also documented.

1. [Melanotan II pilot phase 1 study in three volunteers](https://pubmed.ncbi.nlm.nih.gov/8637402/) — trial; accessed 2026-10-27.
2. [Melanoma associated with Melanotan II and sunbed use: case report](https://pubmed.ncbi.nlm.nih.gov/24355990/) — primary_research; accessed 2026-10-27.
3. [TGA: warning on tanning products containing melanotan](https://www.tga.gov.au/news/blog/dont-risk-using-tanning-products-containing-melanotan) — regulatory; accessed 2026-10-27.

### Glutathione

- Slug: `glutathione`. Reference names: Glutathione.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 428.
- Jurisdiction: United States: supplement/cosmetic contexts do not establish an approved skin-lightening injection.

1. [Oral glutathione and skin pigmentation: randomized placebo-controlled study](https://doi.org/10.3109/09546631003801619) — trial; accessed 2026-10-27.
2. [Cystine plus glutathione and pigmentation: randomized comparative trial](https://doi.org/10.1111/jocd.14137) — trial; accessed 2026-10-27.
3. [Oral glutathione supplementation and body stores: randomized trial](https://pubmed.ncbi.nlm.nih.gov/24791752/) — trial; accessed 2026-10-27.
4. [FDA: concerns about dietary glutathione material used for sterile injections](https://www.fda.gov/drugs/human-drug-compounding/fda-highlights-concerns-using-dietary-ingredient-glutathione-compound-sterile-injectables) — regulatory; accessed 2026-10-27.

### Acetyl hexapeptide-8

- Slug: `acetyl-hexapeptide-8`. Reference names: Acetyl hexapeptide-8.
- Evidence: `clinical`. Regulatory context: `cosmetic`. Article words: 464.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Argireline in Chinese subjects: randomized placebo-controlled wrinkle study](https://doi.org/10.1007/s40257-013-0009-9) — trial; accessed 2026-10-27.
2. [Acetyl hexapeptide-3 and tripeptide-10 citrulline: randomized formulation study](https://doi.org/10.1111/jocd.12314) — trial; accessed 2026-10-27.
3. [CIR revised tentative assessment of acetyl hexapeptide-8 amide: identity and cosmetic-use data](https://www.cir-safety.org/sites/default/files/acetyl122020revTR.pdf) — ingredient_registry; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Palmitoyl pentapeptide-4

- Slug: `palmitoyl-pentapeptide-4`. Reference names: Palmitoyl pentapeptide-4.
- Evidence: `clinical`. Regulatory context: `cosmetic`. Article words: 407.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Topical palmitoyl pentapeptide in photoaged facial skin: controlled split-face study](https://doi.org/10.1111/j.1467-2494.2005.00261.x) — trial; accessed 2026-10-27.
2. [KTTKS from type I procollagen and extracellular-matrix production](https://pubmed.ncbi.nlm.nih.gov/8486721/) — primary_research; accessed 2026-10-27.
3. [Croda: original Matrixyl ingredient identity](https://www.crodabeauty.com/en-gb/products/product/5598-matrixyl) — manufacturer; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Acetyl octapeptide-3

- Slug: `acetyl-octapeptide-3`. Reference names: Acetyl octapeptide-3.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 395.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Bioactive-peptide hyaluronic-acid microneedle patches: single-center clinical study](https://pubmed.ncbi.nlm.nih.gov/31134751/) — trial; accessed 2026-10-27.
2. [Different ingredient: acetyl hexapeptide-3 with tripeptide-10 citrulline](https://doi.org/10.1111/jocd.12314) — trial; accessed 2026-10-27.
3. [Lubrizol: SNAP-8 peptide solution C product identity](https://www.lubrizol.com/solutions/products/beauty/detail-pages/snap-8-peptide-solution-c) — manufacturer; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Acetyl tetrapeptide-5

- Slug: `acetyl-tetrapeptide-5`. Reference names: Acetyl tetrapeptide-5.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 430.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Infraorbital tissue changes after a multi-component hyaluronic-acid/amino-acid intervention: single-arm study](https://doi.org/10.7759/cureus.109369) — trial; accessed 2026-10-27.
2. [Lubrizol: original Eyeseryl peptide solution G identity](https://www.lubrizol.com/solutions/products/beauty/detail-pages/eyeseryl-peptide-solution-g) — manufacturer; accessed 2026-10-27.
3. [Cayman Chemical: acetyl tetrapeptide-5 material identity and safety sheet](https://cdn.caymanchem.com/cdn/msds/27152m.pdf) — manufacturer; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Carnosine

- Slug: `carnosine`. Reference names: Carnosine.
- Evidence: `preclinical`. Regulatory context: `cosmetic`. Article words: 445.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [L-carnosine and solar-simulated radiation in an ex vivo human skin model](https://doi.org/10.1111/php.13850) — primary_research; accessed 2026-10-27.
2. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Dipeptide diaminobutyroyl benzylamide diacetate

- Slug: `dipeptide-diaminobutyroyl-benzylamide-diacetate`. Reference names: Dipeptide diaminobutyroyl benzylamide diacetate.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 421.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [dsm-firmenich: SYN-AKE ingredient, proposed action, and supplier studies](https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/beauty-care/products/syn-ake.html) — manufacturer; accessed 2026-10-27.
2. [Multi-active peptide serum: ex vivo and clinical studies](https://doi.org/10.1111/ics.70087) — trial; accessed 2026-10-27.
3. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Hexapeptide-9

- Slug: `hexapeptide-9`. Reference names: Hexapeptide-9.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 413.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Cyclized hexapeptide-9: randomized active- and vehicle-controlled cosmetic trial](https://doi.org/10.1111/jocd.70290) — trial; accessed 2026-10-27.
2. [Hexapeptide-9 with an ionic-liquid delivery system: experimental and clinical work](https://doi.org/10.1016/j.mtbio.2025.101527) — primary_research; accessed 2026-10-27.
3. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Nonapeptide-1

- Slug: `nonapeptide-1`. Reference names: Nonapeptide-1.
- Evidence: `preclinical`. Regulatory context: `cosmetic`. Article words: 425.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Tea polyphenols and UVA-induced melanogenesis, including nonapeptide-1 comparator experiments](https://doi.org/10.5114/ada.2022.115890) — primary_research; accessed 2026-10-27.
2. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Oligopeptide-1

- Slug: `oligopeptide-1`. Reference names: Oligopeptide-1.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 436.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Synthetic/recombinant-EGF-context versus human-derived growth-factor serum: randomized pilot](https://doi.org/10.1111/jocd.70927) — trial; accessed 2026-10-27.
2. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Palmitoyl hexapeptide-12

- Slug: `palmitoyl-hexapeptide-12`. Reference names: Palmitoyl hexapeptide-12.
- Evidence: `preclinical`. Regulatory context: `cosmetic`. Article words: 421.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Palmitoyl hexapeptide-12 in human skin layers: imaging and mechanical study](https://doi.org/10.1021/acsabm.4c01816) — primary_research; accessed 2026-10-27.
2. [CIR final safety assessment: tripeptide-1, hexapeptide-12, derivatives, and palmitoyl tetrapeptide-7](https://cir-safety.org/sites/default/files/tripep062014final.pdf) — ingredient_registry; accessed 2026-10-27.
3. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Palmitoyl tetrapeptide-7

- Slug: `palmitoyl-tetrapeptide-7`. Reference names: Palmitoyl tetrapeptide-7.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 417.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Multi-component eye cream including palmitoyl tripeptide-1 and palmitoyl tetrapeptide-7](https://doi.org/10.1111/srt.13790) — trial; accessed 2026-10-27.
2. [Croda: Matrixyl 3000 ingredient composition and supplier claims](https://www.crodabeauty.com/en-gb/products/product/3007-matrixyl_1_3000) — manufacturer; accessed 2026-10-27.
3. [CIR final safety assessment: tripeptide-1, hexapeptide-12, derivatives, and palmitoyl tetrapeptide-7](https://cir-safety.org/sites/default/files/tripep062014final.pdf) — ingredient_registry; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Palmitoyl tripeptide-1

- Slug: `palmitoyl-tripeptide-1`. Reference names: Palmitoyl tripeptide-1.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 400.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Multi-component eye cream including palmitoyl tripeptide-1 and palmitoyl tetrapeptide-7](https://doi.org/10.1111/srt.13790) — trial; accessed 2026-10-27.
2. [CIR final safety assessment: tripeptide-1, hexapeptide-12, derivatives, and palmitoyl tetrapeptide-7](https://cir-safety.org/sites/default/files/tripep062014final.pdf) — ingredient_registry; accessed 2026-10-27.
3. [Croda: Matrixyl 3000 ingredient composition and supplier claims](https://www.crodabeauty.com/en-gb/products/product/3007-matrixyl_1_3000) — manufacturer; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Palmitoyl tripeptide-38

- Slug: `palmitoyl-tripeptide-38`. Reference names: Palmitoyl tripeptide-38.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 413.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Vitamin C/E and palmitoyl tripeptide-38 serum: open-label facial-aging study](https://doi.org/10.1111/jocd.13770) — trial; accessed 2026-10-27.
2. [Croda: Matrixyl synthe’6 composition and supplier claims](https://www.crodabeauty.com/en-gb/products/product/3046-matrixyl_1_synthe_1_6) — manufacturer; accessed 2026-10-27.
3. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Pentapeptide-18

- Slug: `pentapeptide-18`. Reference names: Pentapeptide-18.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 414.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Leuphasyl-containing emulsions: small cosmetic volunteer study](https://doi.org/10.3390/cosmetics1020075) — trial; accessed 2026-10-27.
2. [Retinol and pentapeptide-18 lipid-nanocarrier formulations](https://doi.org/10.3390/life14101212) — primary_research; accessed 2026-10-27.
3. [Pentapeptide-18: spectroscopic characterization and molecular-interaction analysis](https://doi.org/10.1016/j.compbiolchem.2026.108952) — primary_research; accessed 2026-10-27.
4. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

### Tripeptide-10 citrulline

- Slug: `tripeptide-10-citrulline`. Reference names: Tripeptide-10 citrulline.
- Evidence: `limited`. Regulatory context: `cosmetic`. Article words: 421.
- Jurisdiction: United States; status and indications may differ elsewhere.

1. [Decorin-like peptide development and in vitro collagen-fibril organization](https://doi.org/10.1111/j.1468-2494.2008.00429.x) — primary_research; accessed 2026-10-27.
2. [Tripeptide-10 citrulline and acetyl hexapeptide-3: randomized cosmetic study](https://doi.org/10.1111/jocd.12314) — trial; accessed 2026-10-27.
3. [FDA: authority over cosmetics and the distinction from drug approval](https://www.fda.gov/cosmetics/cosmetics-laws-regulations/fda-authority-over-cosmetics-how-cosmetics-are-not-fda-approved-are-fda-regulated) — regulatory; accessed 2026-10-27.

