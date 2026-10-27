export const VIEWER_VERSION = '1.2.0';

export const CATEGORY_META = [
  { id: 'brain', label: 'Brain & sleep', short: 'Brain', color: '#628dba', point: [0, 3.12, .20], svg: [180, 69] },
  { id: 'skin', label: 'Skin & aging', short: 'Skin', color: '#d29d7c', point: [-.48, 2.32, .15], svg: [116, 191] },
  { id: 'digestive', label: 'Digestive & metabolism', short: 'Digestive', color: '#bf9970', point: [.035, 1.99, .24], svg: [185, 277] },
  { id: 'immune', label: 'Immune system', short: 'Immune', color: '#9b8cb5', point: [-.19, 2.42, .25], svg: [151, 178] },
  { id: 'hormones', label: 'Hormones', short: 'Hormones', color: '#bd929d', point: [0, 2.73, .15], svg: [180, 137] },
  { id: 'musculoskeletal', label: 'Bones & muscles', short: 'Muscles', color: '#8ba383', point: [.20, 1.08, .16], svg: [209, 433] },
  { id: 'cardiovascular', label: 'Heart & circulation', short: 'Heart', color: '#bc8284', point: [.115, 2.32, .285], svg: [199, 213] },
  { id: 'reproductive', label: 'Reproductive system', short: 'Reproductive', color: '#b28caa', point: [0, 1.65, .22], svg: [180, 333] },
] as const;

export type CategoryId = typeof CATEGORY_META[number]['id'];

export function validCategory(value?: string | null): CategoryId | null {
  return CATEGORY_META.some(item => item.id === value) ? value as CategoryId : null;
}
