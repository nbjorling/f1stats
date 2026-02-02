import { TrackData } from './types';

// Final batch - more accurate F1 circuits

export const baku: TrackData = {
  id: 'baku',
  name: 'Baku City Circuit',
  country: 'Azerbaijan',
  trackLength: 6003,
  viewBox: '0 0 450 800',
  // Baku - Ultra-long straight street circuit
  path: `
    M 225 750
    L 225 695
    Q 225 675 245 665
    L 300 640
    Q 325 630 340 615
    L 370 575
    Q 385 555 400 545
    L 425 530
    Q 440 520 440 500
    L 440 440
    Q 440 420 425 410
    L 385 385
    Q 360 375 340 360
    L 305 325
    Q 285 310 280 285
    L 275 240
    Q 275 215 290 200
    L 320 175
    Q 340 160 365 155
    L 405 150
    Q 425 150 435 135
    L 450 105
    Q 455 85 440 70
    L 410 45
    Q 385 30 355 30
    L 300 30
    Q 265 30 240 45
    L 200 75
    Q 175 95 160 120
    L 135 165
    Q 120 195 115 230
    L 110 280
    Q 110 315 120 345
    L 140 390
    Q 155 420 175 445
    L 205 485
    Q 225 510 230 540
    L 235 585
    Q 235 615 220 635
    L 195 665
    Q 175 685 160 700
    L 140 720
    Q 125 735 135 750
    L 165 775
    Q 185 790 210 790
    L 225 790
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.95,
    exitT: 0.065,
    boxT: 0.04,
  },
};

export const marinaBay: TrackData = {
  id: 'marina-bay',
  name: 'Marina Bay Street Circuit',
  country: 'Singapore',
  trackLength: 4940,
  viewBox: '0 0 600 650',
  // Marina Bay - Night race with tight corners
  path: `
    M 300 600
    L 300 540
    Q 300 520 280 510
    L 220 485
    Q 190 475 170 455
    L 135 410
    Q 115 385 105 355
    L 90 305
    Q 85 275 95 245
    L 120 200
    Q 140 170 165 155
    L 210 130
    Q 245 115 280 115
    L 335 115
    Q 370 115 400 130
    L 445 160
    Q 475 185 495 215
    L 520 265
    Q 530 300 525 335
    L 510 385
    Q 490 425 460 455
    L 415 490
    Q 380 515 340 530
    L 305 545
    Q 290 550 285 565
    L 280 585
    Q 280 600 295 605
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.96,
    exitT: 0.085,
    boxT: 0.07,
  },
};

export const cota: TrackData = {
  id: 'cota',
  name: 'Circuit of the Americas',
  country: 'United States',
  trackLength: 5513,
  viewBox: '0 0 650 600',
  // COTA - Turn 1 uphill, stadium section, inspired by best corners
  path: `
    M 325 550
    L 325 490
    Q 325 470 345 460
    L 405 435
    Q 440 425 470 410
    L 520 375
    Q 550 355 575 335
    L 610 295
    Q 625 275 625 250
    L 625 195
    Q 625 170 610 150
    L 580 115
    Q 555 90 525 80
    L 470 65
    Q 435 60 400 65
    L 345 80
    Q 310 95 280 110
    L 230 140
    Q 195 165 170 185
    L 130 220
    Q 105 245 90 275
    L 70 320
    Q 60 355 70 390
    L 90 435
    Q 110 470 140 495
    L 185 525
    Q 225 545 265 550
    L 305 553
    Q 320 554 325 550
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.05,
    exitT: 0.12,
    boxT: 0.1,
  },
};

export const mexico: TrackData = {
  id: 'mexico',
  name: 'Autódromo Hermanos Rodríguez',
  country: 'Mexico',
  trackLength: 4304,
  viewBox: '0 0 550 500',
  // Mexico - High altitude with Peraltada and stadium section
  path: `
    M 275 450
    L 275 390
    Q 275 370 295 360
    L 350 335
    Q 380 325 405 310
    L 445 275
    Q 470 255 490 245
    L 525 230
    Q 545 220 545 200
    L 545 155
    Q 545 135 525 125
    L 475 100
    Q 445 85 410 82
    L 355 78
    Q 320 78 290 90
    L 245 115
    Q 215 135 190 150
    L 145 180
    Q 115 205 95 230
    L 70 270
    Q 55 300 60 330
    L 75 370
    Q 95 405 125 425
    L 170 450
    Q 210 465 245 465
    L 270 465
    Q 275 465 275 455
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.97,
    exitT: 0.095,
    boxT: 0.07,
  },
};

export const lasVegas: TrackData = {
  id: 'las-vegas',
  name: 'Las Vegas Strip Circuit',
  country: 'United States',
  trackLength: 6120,
  viewBox: '0 0 450 850',
  // Las Vegas - Long straight down the Strip at night
  path: `
    M 225 800
    L 225 745
    Q 225 725 245 715
    L 300 690
    Q 325 680 340 670
    L 375 645
    Q 395 630 410 620
    L 435 600
    Q 450 590 450 570
    L 450 505
    Q 450 485 435 475
    L 395 450
    Q 370 440 345 435
    L 290 425
    Q 260 420 240 410
    L 205 390
    Q 185 380 180 360
    L 175 320
    Q 173 295 185 275
    L 210 245
    Q 230 225 255 220
    L 305 212
    Q 340 210 370 220
    L 415 240
    Q 445 255 460 275
    L 480 310
    Q 490 335 485 360
    L 475 400
    Q 460 435 435 460
    L 395 495
    Q 365 520 335 535
    L 285 560
    Q 250 575 225 585
    L 180 605
    Q 155 615 140 635
    L 115 675
    Q 100 705 105 735
    L 120 775
    Q 135 805 160 815
    L 195 825
    Q 215 830 225 825
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.94,
    exitT: 0.055,
    boxT: 0.04,
  },
};

export const lusail: TrackData = {
  id: 'lusail',
  name: 'Lusail International Circuit',
  country: 'Qatar',
  trackLength: 5380,
  viewBox: '0 0 600 500',
  // Lusail - Fast flowing desert circuit
  path: `
    M 300 450
    L 300 390
    Q 300 370 320 360
    L 375 335
    Q 405 325 430 310
    L 475 275
    Q 500 255 520 245
    L 560 225
    Q 580 215 580 195
    L 580 145
    Q 580 125 560 115
    L 505 85
    Q 470 70 435 67
    L 375 63
    Q 340 63 310 75
    L 265 100
    Q 235 120 210 135
    L 165 165
    Q 135 185 115 210
    L 85 250
    Q 70 280 75 310
    L 90 355
    Q 110 390 140 410
    L 185 435
    Q 225 450 265 452
    L 295 453
    Q 300 453 300 450
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.98,
    exitT: 0.105,
    boxT: 0.08,
  },
};

export const yasMarina: TrackData = {
  id: 'yas-marina',
  name: 'Yas Marina Circuit',
  country: 'United Arab Emirates',
  trackLength: 5281,
  viewBox: '0 0 600 550',
  // Yas Marina - Twilight race with hotel section and marina
  path: `
    M 300 500
    L 300 440
    Q 300 420 280 410
    L 220 385
    Q 190 375 165 360
    L 125 325
    Q 100 305 85 280
    L 65 240
    Q 55 210 65 180
    L 90 140
    Q 115 110 145 95
    L 195 75
    Q 235 65 275 70
    L 330 85
    Q 370 100 405 120
    L 455 155
    Q 490 185 515 220
    L 540 265
    Q 550 300 545 335
    L 530 380
    Q 510 420 480 445
    L 435 475
    Q 395 495 350 500
    L 310 503
    Q 295 504 290 495
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.99,
    exitT: 0.11,
    boxT: 0.09,
  },
};
