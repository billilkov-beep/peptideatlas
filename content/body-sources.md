# Body-system profile research and source audit

Source review date: **2026-10-27**. Reviewer: **Peptide Atlas — AI source review**.

## Completed coverage

`body-profiles.json` contains 57 original profiles covering every assigned reference entry exactly once: 21 musculoskeletal, 14 cardiovascular, 13 reproductive and 9 immune entries. Some profiles have additional relevant body-system categories, so category-tag totals exceed the number of primary inventory entries.

The final source file contains 155 reference links, 143 unique source URLs, 236 cited sections and approximately 24,421 words across summaries, descriptions, mechanisms, takeaways and section bodies. Each profile contains 393–495 words in those fields, specific at-a-glance facts and an original question-and-answer section. References are attached to individual sections with validated one-based indices. The exact source list for each entry is included in the JSON.

This is an independently authored knowledge set. Superpower was used to inventory subjects and discover candidate references; its prose, imagery and article text were not copied. Candidate links were checked against the actual compound, formulation, route, population and outcome before use. Clinical conclusions are separated from proposed mechanisms and preclinical observations. Administration doses and self-treatment protocols are outside this content set.

## Research method

Current prescribing information was retrieved from FDA and DailyMed, including the structured DailyMed label service where needed. FDA Drugs@FDA/openFDA records were used for current marketing status. FDA safety communications and government withdrawal notices were checked separately from original approval history. Primary papers, original trial reports, ClinicalTrials.gov records and sponsor announcements were used where they answer questions not resolved by labeling. Searches included the higher-recall search engine for current, high-stakes verification.

The review distinguishes an approved active ingredient or historical product from an approved current formulation, and an investigational product from material sold with a research label. A discontinued product can retain useful clinical evidence without being currently commercially available. A clinical-trial registration does not establish efficacy. `source_checked` denotes this AI source review; it does not represent a licensed clinician's sign-off.

## Material current-status corrections

- **Rusfertide:** the profile reflects the 2026 approval of Mimrylo for erythrocytosis in adults with polycythemia vera, rather than retaining an investigational-only classification. Sources include the [FDA approval letter](https://www.accessdata.fda.gov/drugsatfda_docs/appletter/2026/220605Orig1s000ltr.pdf), [2026 label](https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/220605Orig1s000lbl.pdf) and current DailyMed prescribing information. Claims about reduced phlebotomy requirements are not presented as proof of cure or reduced mortality.
- **Pluvicto:** the July 31, 2026 indication expansion is included. FDA approved its use with an androgen receptor pathway inhibitor for PSMA-positive metastatic androgen pathway modulation-naïve or sensitive disease. This is distinguished from the resistant-disease indications and from the different endpoints studied in VISION, PSMAfore and PSMAddition. Sources: [2026 FDA announcement](https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-lutetium-lu-177-vipivotide-tetraxetan-androgen-receptor-pathway-inhibitor-therapy) and [2025 FDA expansion](https://www.fda.gov/drugs/resources-information-approved-drugs/fda-expands-pluvictos-metastatic-castration-resistant-prostate-cancer-indication).
- **Pegcetacoplan:** current Empaveli kidney indications are included separately from PNH and from intravitreal Syfovre for geographic atrophy. The formulations, treatment populations and safety requirements remain distinct. Sources are the current product labels linked in the profile.
- **Echinocandins:** the group profile covers caspofungin, micafungin, anidulafungin and rezafungin. The current Rezzayo labeling, including its specified adolescent population, is used rather than an outdated adult-only description. Each member has its own label reference.
- **Natpara:** the historical hypoparathyroidism indication and REPLACE evidence are retained, together with manufacturing cessation and supply limitations. The status is explicitly qualified; it is not portrayed as a routinely available new prescription. Source: [Takeda manufacturing discontinuation statement](https://www.takeda.com/en-us/newsroom/statements/2022/takeda-to-discontinue-manufacturing-of-natpar-natpara/).
- **Enfuvirtide:** established HIV evidence is distinguished from the end of US Fuzeon commercial distribution. Source: [Genentech discontinuation statement](https://www.gene.com/media/statements/ps_081924).
- **Nesiritide:** Natrecor's withdrawal of approval after market discontinuation is included, along with the negative outcome findings and hypotension in ASCEND-HF. Source: [Federal Register withdrawal notice](https://www.govinfo.gov/content/pkg/FR-2020-05-14/html/2020-10367.htm).
- **Desirudin:** historical Iprivask approval is not confused with current marketing availability. Source: [FDA Purple Book record](https://purplebooksearch.fda.gov/index.cfm?blaNo=021271&event=productdetails), with the historical product label and original surgical trial.
- **Sermorelin:** historical Geref approval and subsequent withdrawal are explained, including FDA's determination that withdrawal was not for safety or effectiveness. This does not establish approval of compounded wellness products. Source: [FDA determination](https://www.govinfo.gov/content/pkg/FR-2013-03-04/html/2013-04827.htm).
- **Gonadorelin:** FDA records for [Factrel NDA 018123](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018123) and [Lutrepulse Kit NDA 019687](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019687) list the human products as discontinued. Compounded preparations and veterinary products are explicitly distinguished from those historical approvals.
- **Histrelin:** current Supprelin LA pediatric use is distinguished from the discontinued adult Vantas presentation. Source: [FDA Vantas record, NDA 021732](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021732), confirmed through the openFDA product record.

## Identity and evidence safeguards

**TB-500:** the legacy slug is preserved as `tb-500-fragment`. The record distinguishes an acetylated LKKTETQ fragment identified in analyzed TB-500 material, non-acetylated fragment naming, and full-length 43-amino-acid thymosin beta-4. Evidence from an ophthalmic full-length formulation is not transferred to fragment injections. The primary identity paper is [PMID 22962027](https://pubmed.ncbi.nlm.nih.gov/22962027/); FDA's fragment-specific uncertainty is also cited.

A ClinicalTrials.gov search returned **NCT07487363** under TB-500. Inspection of the full registry text revealed that it explicitly describes itself as a fictional/example record. It was rejected and is not used as evidence of an actual human trial, exposure, efficacy or regulatory progress. This illustrates why a registry title or recruiting badge was not accepted on its own.

**MK-677:** identified as a nonpeptide small molecule. Increases in lean mass or IGF-1 are distinguished from functional benefit, and adverse metabolic or heart-failure signals are preserved alongside ongoing pediatric development.

**Follistatin:** identified as a protein. The distinction between the 344-amino-acid precursor and the secreted form is explained; a small gene-transfer study is not presented as proof for injected commercial protein preparations.

**IGF variants and MGF:** variants are not conflated with approved mecasermin. IGF-1 LR3 preclinical findings include the relevant animal tumor-growth concern. Native IGF transcript observations, synthetic MGF peptides and PEG-MGF are separated. A failed replication of an MGF biological claim is included rather than selectively reporting only a positive experiment.

**Kisspeptin-10:** primary human endocrine studies are linked to the ten-amino-acid fragment. Sexual-processing studies using kisspeptin-54 are explicitly identified as a different molecule, not reused as direct proof for kisspeptin-10.

**Research outcomes:** negative or qualified findings are retained for aviptadil/TESICO, nangibotide/ASTONISH, thymosin-alpha-1/TESTS, LL-37 wound studies, balixafortide/FORTRESS and selepressin/SEPSIS-ACT. Murepavadin's intravenous safety history is separated from later inhaled development. Exploratory subgroups and post-hoc signals are not presented as confirmed overall efficacy.

## Final validation

The completed file was checked against the exact assigned inventory names: **57 expected, 57 present, no duplicates and no extras**. Summary, description, mechanism and takeaway lengths are within the requested ranges. Every profile has 4–7 at-a-glance facts, an original FAQ, nonempty cited sections, valid citation indices, HTTPS source URLs and the required review metadata. Reference display titles were completed where an initial metadata lookup had returned only a DOI. The integration owner is responsible for application-wide schema tests and the final combined catalog release.
