/** Original vector illustration authored for Peptide Atlas. No external artwork. */
export function bodySvg(prefix: string): string {
  return `<svg class="atlas-body-svg" viewBox="0 0 360 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="${prefix}-body" x1="110" y1="180" x2="245" y2="220" gradientUnits="userSpaceOnUse"><stop stop-color="#b5ceca"/><stop offset=".23" stop-color="#e9f1ee"/><stop offset=".48" stop-color="#f5f8f3"/><stop offset=".7" stop-color="#d5e4de"/><stop offset="1" stop-color="#92b4af"/></linearGradient>
    <linearGradient id="${prefix}-head" x1="147" y1="69" x2="211" y2="76" gradientUnits="userSpaceOnUse"><stop stop-color="#a5c1bb"/><stop offset=".42" stop-color="#f4f7f0"/><stop offset="1" stop-color="#acc7c0"/></linearGradient>
    <linearGradient id="${prefix}-leg" x1="130" y1="410" x2="177" y2="420" gradientUnits="userSpaceOnUse"><stop stop-color="#b1cbc5"/><stop offset=".43" stop-color="#eff4ec"/><stop offset="1" stop-color="#a3bfb7"/></linearGradient>
    <linearGradient id="${prefix}-organ" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b3d5c9"/><stop offset="1" stop-color="#77a99b"/></linearGradient>
    <radialGradient id="${prefix}-halo"><stop stop-color="#eef5ef" stop-opacity=".9"/><stop offset="1" stop-color="#f5f9f4" stop-opacity="0"/></radialGradient>
    <radialGradient id="${prefix}-shade"><stop stop-color="#315d52" stop-opacity=".18"/><stop offset="1" stop-color="#315d52" stop-opacity="0"/></radialGradient>
    <filter id="${prefix}-soft"><feGaussianBlur stdDeviation="2.3"/></filter>
  </defs>
  <ellipse cx="180" cy="315" rx="165" ry="290" fill="url(#${prefix}-halo)"/>
  <ellipse cx="180" cy="618" rx="80" ry="13" fill="url(#${prefix}-shade)"/>
  <g class="human-surface" stroke="#98b7ad" stroke-width=".9" stroke-linejoin="round">
    <path d="M165 106 C166 124 164 134 153 139 L131 146 C113 150 107 161 103 182 L91 225 C87 242 81 257 77 276 L65 326 C62 343 60 355 58 369 C57 377 55 383 57 390 C58 395 62 395 63 390 L66 377 L66 399 C66 405 71 406 72 399 L73 381 L75 404 C76 409 81 409 81 403 L81 380 L85 401 C86 407 91 405 90 398 L87 377 L92 389 C95 394 99 390 97 384 L89 358 C88 351 89 341 91 332 L105 287 C109 275 113 264 115 252 L128 210 C130 226 132 240 137 255 C143 275 142 290 137 308 C130 328 131 348 135 365 L141 401 C143 415 143 428 141 440 C138 459 140 477 145 498 L150 539 C151 551 152 564 151 578 L146 592 C143 599 136 601 135 607 C133 612 138 616 147 616 L161 616 C171 616 173 610 171 601 L170 579 C173 560 176 541 175 520 L173 478 C174 461 174 449 172 435 L171 405 L175 373 C177 363 178 352 180 344 C182 352 183 363 185 373 L189 405 L188 435 C186 449 186 461 187 478 L185 520 C184 541 187 560 190 579 L189 601 C187 610 189 616 199 616 L213 616 C222 616 227 612 225 607 C224 601 217 599 214 592 L209 578 C208 564 209 551 210 539 L215 498 C220 477 222 459 219 440 C217 428 217 415 219 401 L225 365 C229 348 230 328 223 308 C218 290 217 275 223 255 C228 240 230 226 232 210 L245 252 C247 264 251 275 255 287 L269 332 C271 341 272 351 271 358 L263 384 C261 390 265 394 268 389 L273 377 L270 398 C269 405 274 407 275 401 L279 380 L279 403 C279 409 284 409 285 404 L287 381 L288 399 C289 406 294 405 294 399 L294 377 L297 390 C298 395 302 395 303 390 C305 383 303 377 302 369 C300 355 298 343 295 326 L283 276 C279 257 273 242 269 225 L257 182 C253 161 247 150 229 146 L207 139 C196 134 194 124 195 106 Z" fill="url(#${prefix}-body)"/>
    <path d="M151 60 C151 41 164 30 180 30 C196 30 209 41 209 60 L208 78 C215 76 217 82 212 91 L206 94 C204 106 195 118 180 120 C165 118 156 106 154 94 L148 91 C143 82 145 76 152 78 Z" fill="url(#${prefix}-head)"/>
    <path d="M140 352 C142 380 149 405 148 429 C147 441 148 448 151 453 C158 451 164 446 166 436 L169 394 L173 354" fill="url(#${prefix}-leg)" stroke="none" opacity=".52"/>
    <path d="M220 352 C218 380 211 405 212 429 C213 441 212 448 209 453 C202 451 196 446 194 436 L191 394 L187 354" fill="url(#${prefix}-leg)" stroke="none" opacity=".35"/>
  </g>
  <g class="anatomy-lines" fill="none" stroke="#7ca295" stroke-width="1.1" stroke-linecap="round" opacity=".38">
    <path d="M163 124 Q166 144 177 151 M197 124 Q194 144 183 151 M129 159 Q151 163 174 157 M231 159 Q209 163 186 157"/>
    <path d="M128 170 C140 165 160 169 175 182 L175 204 C155 216 139 207 132 198 M232 170 C220 165 200 169 185 182 L185 204 C205 216 221 207 228 198"/>
    <path d="M180 163 L180 246 M173 214 Q161 213 153 222 M187 214 Q199 213 207 222 M175 231 Q163 228 156 237 M185 231 Q197 228 204 237 M176 248 Q166 246 159 253 M184 248 Q194 246 201 253"/>
    <path d="M149 219 C144 241 149 255 155 271 M211 219 C216 241 211 255 205 271 M145 278 Q155 303 177 318 M215 278 Q205 303 183 318"/>
    <path d="M122 175 Q105 196 104 223 Q105 237 112 241 M238 175 Q255 196 256 223 Q255 237 248 241 M103 254 Q87 292 81 331 M257 254 Q273 292 279 331"/>
    <path d="M142 332 C153 341 158 372 156 406 M218 332 C207 341 202 372 204 406 M157 354 Q168 380 166 411 M203 354 Q192 380 194 411"/>
    <path d="M148 430 Q157 423 166 430 L164 443 Q157 449 150 442 Z M212 430 Q203 423 194 430 L196 443 Q203 449 210 442 Z"/>
    <path d="M148 461 C160 470 162 492 160 514 L158 562 M212 461 C200 470 198 492 200 514 L202 562 M154 582 L162 600 M206 582 L198 600"/>
    <path d="M161 78 Q168 74 175 78 M185 78 Q192 74 199 78 M179 80 L176 94 Q180 98 185 94 M171 105 Q180 108 189 105" opacity=".5"/>
  </g>
  <g class="body-region brain-region" data-region="brain" fill="url(#${prefix}-organ)" stroke="#638e80" stroke-width=".8" opacity=".5">
    <path d="M178 44 C164 40 157 50 159 57 C152 63 155 73 161 75 C161 84 169 88 177 84 Z M182 44 C196 40 203 50 201 57 C208 63 205 73 199 75 C199 84 191 88 183 84 Z"/>
    <g fill="none" opacity=".7"><path d="M168 47 Q160 55 168 61 Q159 64 163 73 M175 49 Q167 53 174 59 L174 72 Q165 75 171 81 M192 47 Q200 55 192 61 Q201 64 197 73 M185 49 Q193 53 186 59 L186 72 Q195 75 189 81"/></g>
  </g>
  <g class="body-region" data-region="cardiovascular" fill="url(#${prefix}-organ)" stroke="#638e80" stroke-width=".8" opacity=".45">
    <path d="M177 183 C163 178 151 187 147 203 C143 216 144 234 152 238 C162 243 174 234 176 220 Z M183 183 C197 178 209 187 213 203 C217 216 216 234 208 238 C198 243 186 234 184 220 Z" opacity=".45"/>
    <path d="M187 205 C182 196 188 190 194 192 C199 193 201 198 202 202 C212 197 216 204 213 212 C210 220 202 226 198 230 C191 226 186 216 187 205 Z"/>
    <path d="M190 197 L189 185 Q190 181 194 182 L198 195 M202 202 Q204 189 198 187" fill="none" stroke-width="2.8"/>
  </g>
  <g class="body-region" data-region="digestive" fill="url(#${prefix}-organ)" stroke="#638e80" stroke-width=".8" opacity=".48">
    <path d="M180 241 C183 254 180 259 189 261 C198 253 207 256 207 267 C207 279 193 282 184 276 C178 272 176 267 177 260 L176 241 Z"/>
    <path d="M157 282 C150 285 150 300 154 311 C158 318 174 320 188 319 C203 319 209 315 209 304 L207 287 C206 281 197 280 193 285 C187 279 179 282 173 284 C167 280 161 280 157 282 Z" opacity=".85"/>
    <g fill="none" stroke-width="1.5"><path d="M160 288 C176 286 198 286 199 291 C199 296 164 292 164 298 C164 304 198 298 198 305 C198 311 164 306 164 312 M178 318 L178 327"/></g>
  </g>
  <g class="body-region" data-region="hormones" fill="url(#${prefix}-organ)" stroke="#638e80" stroke-width=".8" opacity=".55">
    <path d="M178 135 C168 126 165 131 169 141 C171 146 174 147 178 141 L182 141 C186 147 189 146 191 141 C195 131 192 126 182 135 Z"/>
    <path d="M162 260 Q158 251 153 258 M205 260 Q209 251 214 258" fill="none" stroke-width="3"/>
  </g>
  <g class="body-region" data-region="immune" fill="#77ab96" stroke="#638e80" stroke-width=".6" opacity=".6">
    <circle cx="164" cy="145" r="2.4"/><circle cx="160" cy="153" r="2"/><circle cx="196" cy="145" r="2.4"/><circle cx="200" cy="153" r="2"/>
    <circle cx="139" cy="183" r="3"/><circle cx="143" cy="190" r="2"/><circle cx="221" cy="183" r="3"/><circle cx="217" cy="190" r="2"/>
    <path d="M151 170 Q161 161 170 168 Q174 173 168 179 Q158 181 151 170 Z"/>
    <circle cx="156" cy="320" r="3"/><circle cx="162" cy="325" r="2"/><circle cx="204" cy="320" r="3"/><circle cx="198" cy="325" r="2"/>
    <path d="M162 153 L143 183 M198 153 L217 183 M143 190 Q146 257 156 320 M217 190 Q214 257 204 320" fill="none" stroke-dasharray="2 3"/>
  </g>
  <g class="body-region" data-region="reproductive" fill="url(#${prefix}-organ)" stroke="#638e80" stroke-width=".8" opacity=".45">
    <path d="M167 331 Q180 321 193 331 L188 341 Q180 346 172 341 Z"/>
    <path d="M167 331 Q156 327 154 337 M193 331 Q204 327 206 337" fill="none" stroke-width="2"/>
  </g>
  <g class="body-region" data-region="musculoskeletal" fill="none" stroke="#649480" stroke-width="3" stroke-linecap="round" opacity=".1">
    <path d="M153 348 L157 417 M207 348 L203 417 M156 454 L160 553 M204 454 L200 553 M119 189 L106 246 M241 189 L254 246 M98 274 L80 342 M262 274 L280 342"/>
  </g>
  <g class="body-region skin-highlight" data-region="skin" opacity="0" fill="none" stroke="#1f9c80" stroke-width="5" stroke-linecap="round"><path d="M116 170 Q102 194 100 220 L86 267 M244 170 Q258 194 260 220 L274 267"/></g>
  </svg>`;
}
