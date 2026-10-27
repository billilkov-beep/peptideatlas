# FDA and clinical-trial display audit

Catalogue release: **2026-10-27.2**. Source check: **October 27, 2026**. This is an AI-assisted source review, not clinician review.

All 147 canonical profiles have an explicit `displayStatus` and a `displayStatusNote`. The public colour badge is a navigation aid; the note and full article define the relevant product, route, indication, jurisdiction, and evidence limits. The original country-neutral `regulatoryStatus` remains unchanged for compatibility.

| Display status | Profiles | Meaning |
| --- | ---: | --- |
| `fda_approved` | 75 | A specified FDA-approved product context exists; the note distinguishes approval from current marketing and availability. |
| `clinical_trial` | 13 | An investigational clinical program has supported ongoing studies. This includes active studies that are not recruiting, and is not an enrollment or benefit claim. |
| `not_fda_approved` | 42 | No FDA approval for the profile's product context, including foreign-only approvals, withdrawn approvals, research preparations, and inactive or unconfirmed current trial programs. |
| `cosmetic` | 17 | Cosmetic/topical ingredient context, not FDA drug approval or an approved injectable treatment. |

The FDA's [cosmetic-products explanation](https://www.fda.gov/cosmetics/cosmetic-products-ingredients/cosmetic-products) distinguishes cosmetic marketing from drug approval. Cosmetics are kept visually distinct so the interface does not suggest that their regulatory route is the same as an investigational medicine.

## Rules applied

- The display classification is maintained as central content. Connectors carry the explicit fields; they must not turn a country-neutral `approved_medicine` value into an FDA-approved badge.
- FDA approval is product- and indication-specific. A reviewed molecule name does not approve every product sold under that name, every route, or every advertised use.
- A discontinued marketing listing is different from an explicit withdrawal of approval. Availability limitations remain visible in the note and article.
- An old human study is not sufficient for the current clinical-trial badge. Completed, terminated, withdrawn, or only planned studies do not automatically qualify. An active multi-drug platform also does not make a closed treatment arm active.
- ClinicalTrials.gov records are sponsor-maintained and can lag actual recruitment. The audit records the last update, and dated or stale records are explicitly qualified. No badge guarantees that a person can enroll.
- Older imported records can omit the new fields. Their badge must remain neutral and require review; the application does not infer FDA approval.

## Foreign approvals and historical approvals

**Efpeglenatide** is classified as not FDA approved: its cited [South Korean MFDS notice](https://www.mfds.go.kr/brd/m_1256/view.do?company_cd=&company_nm=&itm_seq_1=0&itm_seq_2=0&multi_itm_seq=0&page=1&seq=147&srchFr=&srchTo=&srchTp=&srchWord=) is a different jurisdiction. **Mazdutide** is also not FDA approved: its [Chinese approval announcements](https://en.innoventbio.com/InvestorsAndMedia/PressReleaseDetail?key=546) do not create a U.S. approval. Further studies of an already China-authorized product do not change that FDA classification.

**Nesiritide** is not shown as currently FDA approved: the [Federal Register notice](https://www.govinfo.gov/content/pkg/FR-2020-05-14/html/2020-10367.htm) withdrew Natrecor's approval effective June 15, 2020. **Sermorelin** likewise distinguishes [withdrawn Geref approvals](https://www.govinfo.gov/content/pkg/FR-2013-03-04/html/2013-04827.htm) from current compounded preparations. **Compounded gonadorelin** is classified for the compounded context; historical branded-product approval is not transferred to it.

The following retain the specified FDA product context with prominent availability qualifications:

| Profile | FDA record checked | Qualification |
| --- | --- | --- |
| Albiglutide | [Tanzeum, BLA 125431](https://purplebooksearch.fda.gov/index.cfm?blaNo=125431&event=productdetails) | Record lists discontinued marketing. |
| Desirudin | [Iprivask, BLA 021271](https://purplebooksearch.fda.gov/index.cfm?blaNo=021271&event=productdetails) | Record lists discontinued marketing. |
| Enfuvirtide | [Fuzeon, NDA 021481](https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?ApplNo=021481&event=overview.process) | FDA record lists discontinued marketing; [Genentech](https://www.gene.com/media/statements/ps_081924) ended U.S. distribution in February 2025. |
| Parathyroid hormone | [Natpara, BLA 125511](https://purplebooksearch.fda.gov/index.cfm?blaNo=125511&event=productdetails) | FDA product record exists; manufacturing discontinuation is separately documented in the article. |

**Bacitracin** retains the appropriate approved ophthalmic context, with injection withdrawals explicit. **Elamipretide** is scoped to Forzinity's accelerated Barth-syndrome approval. **Tesamorelin** is scoped to its approved HIV-associated lipodystrophy indication rather than general weight loss or anti-aging. The same product/indication limitation applies to every green badge.

## Older investigational entries that do not receive the current-trial badge

| Profile | Decision and primary evidence |
| --- | --- |
| Aviptadil | [I-SPY COVID-19](https://clinicaltrials.gov/study/NCT04488081) is overall active, but the aviptadil arm is explicitly closed. The aggregate platform status must not be applied to that arm. |
| Balixafortide | FORTRESS was terminated. A newer [pancreatic-cancer study](https://clinicaltrials.gov/study/NCT06981806) is listed as not yet recruiting, so it is not presented as active treatment research. An imaging-probe conjugate is not automatically equivalent to the therapeutic peptide. |
| Brilacidin | The identified human studies, including the [COVID-19 trial](https://clinicaltrials.gov/study/NCT04784897), are completed. Current active trial participation was not verified. |
| Davunetide | The [PSP trial](https://clinicaltrials.gov/study/NCT01110720) and other identified studies are completed. Reanalysis of an older dataset is not a new or ongoing trial. |
| Larazotide acetate | The [pivotal celiac study](https://clinicaltrials.gov/study/NCT03569007) was terminated. The later identified long-COVID study was completed in 2026. Registry synonym searches also retrieve the unrelated medicine migalastat because both used “AT1001”; those studies were not counted. |
| Murepavadin | The [intravenous pivotal study](https://clinicaltrials.gov/study/NCT03582007) was terminated. Separate early inhaled development does not establish a currently active trial. |
| Nangibotide | [ASTONISH](https://clinicaltrials.gov/study/NCT04055909) still lists active, not recruiting, but was last updated in April 2023 with estimated completion in May 2023. Published results and this stale status do not verify ongoing treatment research in October 2026. |
| PN-943 | [IDEAL](https://clinicaltrials.gov/study/NCT04504383) is completed and the sponsor's cited development update ended further internal commitment. |

## Current clinical-program evidence

The following registry records were read through the official ClinicalTrials.gov API v2 on October 27, 2026. The compact factual snapshot is retained in `content/regulatory-display-trial-records.json`. Registry status is not regulatory approval. For LTX-315, the existing 2026 sponsor disclosure also supports continuing development. For thymosin beta-4, the registry's recruiting label is retained with an explicit warning to recheck dated enrollment information; it does not apply to the TB-500 fragment.

| Profile | Registry record | Status in record | Record last updated |
| --- | --- | --- | --- |
| Amycretin | [NCT07668414](https://clinicaltrials.gov/study/NCT07668414) | recruiting | 2026-09-28 |
| Apraglutide | [NCT07742735](https://clinicaltrials.gov/study/NCT07742735) | recruiting | 2026-08-04 |
| Cagrilintide | [NCT07220642](https://clinicaltrials.gov/study/NCT07220642) | active not recruiting | 2026-08-06 |
| CagriSema | [NCT05669755](https://clinicaltrials.gov/study/NCT05669755) | active not recruiting | 2026-08-31 |
| Glepaglutide | [NCT07197944](https://clinicaltrials.gov/study/NCT07197944) | recruiting | 2026-09-29 |
| LTX-315 | [NCT06651151](https://clinicaltrials.gov/study/NCT06651151) | recruiting | 2024-10-26 |
| MK-677 (ibutamoren) | [NCT06948214](https://clinicaltrials.gov/study/NCT06948214) | recruiting | 2026-10-19 |
| NNZ-2591 | [NCT07281079](https://clinicaltrials.gov/study/NCT07281079) | recruiting | 2026-09-28 |
| Pemvidutide | [NCT07795164](https://clinicaltrials.gov/study/NCT07795164) | recruiting | 2026-09-23 |
| Petrelintide | [NCT07843498](https://clinicaltrials.gov/study/NCT07843498) | recruiting | 2026-10-07 |
| Retatrutide | [NCT06383390](https://clinicaltrials.gov/study/NCT06383390) | active not recruiting | 2026-10-08 |
| Survodutide | [NCT06632444](https://clinicaltrials.gov/study/NCT06632444) | recruiting | 2026-10-14 |
| Thymosin beta-4 | [NCT05555589](https://clinicaltrials.gov/study/NCT05555589) | recruiting | 2025-12-23 |

## Complete display mapping

This is an audit of the published central fields, not a second editable catalogue. The canonical IDs, article content, and all 152 reference names are retained.

| Profile | Central display classification |
| --- | --- |
| 5-Amino-1MQ | `not_fda_approved` |
| Abaloparatide | `fda_approved` |
| Acetyl hexapeptide-8 | `cosmetic` |
| Acetyl octapeptide-3 | `cosmetic` |
| Acetyl tetrapeptide-5 | `cosmetic` |
| Afamelanotide | `fda_approved` |
| Albiglutide | `fda_approved` |
| Amycretin | `clinical_trial` |
| Angiotensin II | `fda_approved` |
| AOD-9604 | `not_fda_approved` |
| Apraglutide | `clinical_trial` |
| Aviptadil | `not_fda_approved` |
| Bacitracin | `fda_approved` |
| Balixafortide | `not_fda_approved` |
| Bivalirudin | `fda_approved` |
| BPC-157 | `not_fda_approved` |
| Bremelanotide | `fda_approved` |
| Brilacidin | `not_fda_approved` |
| Cagrilintide | `clinical_trial` |
| CagriSema | `clinical_trial` |
| Calcitonin-salmon | `fda_approved` |
| Carnosine | `cosmetic` |
| Cerebrolysin | `not_fda_approved` |
| Cetrorelix | `fda_approved` |
| CJC-1295 | `not_fda_approved` |
| Corticotropin | `fda_approved` |
| Cosyntropin | `fda_approved` |
| Cyclosporine | `fda_approved` |
| Dalbavancin / Oritavancin / Telavancin | `fda_approved` |
| Daptomycin | `fda_approved` |
| Dasiglucagon | `fda_approved` |
| Davunetide | `not_fda_approved` |
| Degarelix | `fda_approved` |
| Desirudin | `fda_approved` |
| Desmopressin | `fda_approved` |
| Difelikefalin | `fda_approved` |
| Dihexa | `not_fda_approved` |
| Dipeptide diaminobutyroyl benzylamide diacetate | `cosmetic` |
| DSIP | `not_fda_approved` |
| Dulaglutide | `fda_approved` |
| Ecallantide | `fda_approved` |
| Echinocandins | `fda_approved` |
| Efpeglenatide | `not_fda_approved` |
| Elamipretide | `fda_approved` |
| Enfuvirtide | `fda_approved` |
| Enlicitide | `fda_approved` |
| Epitalon | `not_fda_approved` |
| Eptifibatide | `fda_approved` |
| Etelcalcetide | `fda_approved` |
| Exenatide | `fda_approved` |
| Follistatin-344 | `not_fda_approved` |
| Fragment 176-191 | `not_fda_approved` |
| Ga-68 dotatate | `fda_approved` |
| Ganirelix | `fda_approved` |
| GHK-Cu | `cosmetic` |
| GHRP-2 | `not_fda_approved` |
| GHRP-6 | `not_fda_approved` |
| Glepaglutide | `clinical_trial` |
| Glucagon | `fda_approved` |
| Glutathione | `cosmetic` |
| Gonadorelin (compounded) | `not_fda_approved` |
| Goserelin | `fda_approved` |
| Hexapeptide-9 | `cosmetic` |
| Hexarelin | `not_fda_approved` |
| Histrelin | `fda_approved` |
| Human chorionic gonadotropin | `fda_approved` |
| Humanin | `not_fda_approved` |
| Icatibant | `fda_approved` |
| IGF-1 DES | `not_fda_approved` |
| IGF-1 LR3 | `not_fda_approved` |
| Insulin analogs (multiple) | `fda_approved` |
| Ipamorelin | `not_fda_approved` |
| Kisspeptin-10 | `not_fda_approved` |
| KPV | `not_fda_approved` |
| Lanreotide | `fda_approved` |
| Larazotide acetate | `not_fda_approved` |
| Leuprolide | `fda_approved` |
| Linaclotide | `fda_approved` |
| Liraglutide | `fda_approved` |
| Lixisenatide | `fda_approved` |
| LL-37 | `not_fda_approved` |
| LTX-315 | `clinical_trial` |
| Lutetium Lu-177 dotatate | `fda_approved` |
| Lutetium Lu-177 vipivotide tetraxetan | `fda_approved` |
| Mazdutide | `not_fda_approved` |
| Mecasermin | `fda_approved` |
| Mechano growth factor | `not_fda_approved` |
| Melanotan II | `not_fda_approved` |
| MK-677 (ibutamoren) | `clinical_trial` |
| Motixafortide | `fda_approved` |
| MOTS-c | `not_fda_approved` |
| Murepavadin | `not_fda_approved` |
| Nafarelin | `fda_approved` |
| Nangibotide | `not_fda_approved` |
| Nesiritide | `not_fda_approved` |
| NNZ-2591 | `clinical_trial` |
| Nonapeptide-1 | `cosmetic` |
| Octreotide | `fda_approved` |
| Oligopeptide-1 | `cosmetic` |
| Oxytocin | `fda_approved` |
| Palmitoyl hexapeptide-12 | `cosmetic` |
| Palmitoyl pentapeptide-4 | `cosmetic` |
| Palmitoyl tetrapeptide-7 | `cosmetic` |
| Palmitoyl tripeptide-1 | `cosmetic` |
| Palmitoyl tripeptide-38 | `cosmetic` |
| Palopegteriparatide | `fda_approved` |
| Parathyroid hormone | `fda_approved` |
| Pasireotide | `fda_approved` |
| Pegcetacoplan | `fda_approved` |
| Pegvisomant | `fda_approved` |
| Pemvidutide | `clinical_trial` |
| Pentapeptide-18 | `cosmetic` |
| Petrelintide | `clinical_trial` |
| Plecanatide | `fda_approved` |
| PN-943 | `not_fda_approved` |
| Polymyxin B / Colistin | `fda_approved` |
| Pramlintide | `fda_approved` |
| Retatrutide | `clinical_trial` |
| Rusfertide | `fda_approved` |
| Secretin | `fda_approved` |
| Selank | `not_fda_approved` |
| Selepressin | `not_fda_approved` |
| Semaglutide | `fda_approved` |
| Semax | `not_fda_approved` |
| Sermorelin | `not_fda_approved` |
| Setmelanotide | `fda_approved` |
| Sincalide | `fda_approved` |
| Somapacitan | `fda_approved` |
| Somatropin (rhGH) | `fda_approved` |
| Survodutide | `clinical_trial` |
| TB-500 | `not_fda_approved` |
| Teduglutide | `fda_approved` |
| Teriparatide | `fda_approved` |
| Terlipressin | `fda_approved` |
| Tesamorelin | `fda_approved` |
| Thymosin alpha-1 | `not_fda_approved` |
| Thymosin beta-4 | `clinical_trial` |
| Thymulin | `not_fda_approved` |
| Tirzepatide | `fda_approved` |
| Tripeptide-10 citrulline | `cosmetic` |
| Triptorelin | `fda_approved` |
| Trofinetide | `fda_approved` |
| Vancomycin | `fda_approved` |
| Vasopressin | `fda_approved` |
| Vosoritide | `fda_approved` |
| Ziconotide | `fda_approved` |
| Zilucoplan | `fda_approved` |

## Validation and migration

`catalog:check` now requires an explicit classification and scope note in all 147 bundled profiles. API filtering validates the four permitted values. Tests cover foreign versus FDA approval, withdrawn approvals, closed trial arms, completed studies, discontinued marketing, and neutral legacy imports. The release installer upgrades untouched imported records while preserving canonical UUIDs and editorial changes. The portable schema stays version 1 with optional additive fields.
