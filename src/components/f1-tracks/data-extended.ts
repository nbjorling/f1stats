import { TrackData } from './types';

// More accurate F1 circuit tracks for 2025 calendar

export const bahrain: TrackData = {
  id: 'bahrain',
  name: 'Bahrain International Circuit',
  country: 'Bahrain',
  trackLength: 5412,
  viewBox: '-50 -30 460 332',
  path: `M235.141 243.869H224.141H202.641L93.6412 242.869
  C69.6412 242.702 19.1412 242.469 9.14121 242.869
  C-3.3588 243.369 -1.35878 237.369 9.14121 227.369
  C19.6412 217.369 20.1412 214.869 13.6412 200.369
  C8.44121 188.769 8.47455 173.869 9.14121 167.869
  C12.8079 142.536 21.4412 82.869 26.6412 46.869
  C33.1412 1.86902 33.1412 4.86902 39.1412 1.36902
  C43.9412 -1.43098 50.1412 3.20235 52.6412 5.86902
  C59.6412 14.2024 76.4412 33.569 87.6412 44.369
  C101.641 57.869 106.141 54.369 118.141 61.869
  C130.141 69.369 128.141 78.869 127.141 84.869
  C126.141 90.869 125.641 96.869 127.141 103.369
  C128.641 109.869 130.641 112.869 155.141 129.869
  C179.641 146.869 187.141 152.369 185.141 157.369
  C183.541 161.369 173.475 162.369 168.641 162.369
  L119.641 155.369
  C107.641 153.536 81.6412 150.369 73.6412 152.369
  C63.6412 154.869 58.6412 165.369 53.6412 171.369
  C49.6412 176.169 52.9746 177.369 55.1412 177.369
  L93.6412 181.869
  C150.141 183.036 265.141 184.669 273.141 181.869
  C283.141 178.369 281.641 162.869 277.641 148.369
  C273.641 133.869 253.141 124.869 240.641 121.869
  C228.141 118.869 214.141 103.869 210.141 94.869
  C206.941 87.669 208.808 75.5357 210.141 70.369
  C215.141 58.2024 225.641 33.069 227.641 29.869
  C230.141 25.869 238.141 21.369 244.141 20.869
  C248.941 20.469 254.475 26.7023 256.641 29.869
  C291.641 89.0357 363.541 209.669 371.141 218.869
  C378.741 228.069 375.975 232.369 373.641 233.369
  C370.475 235.369 363.641 239.469 361.641 239.869
  C361.174 239.962 356.141 242.869 351.141 243.369
  L235.141 243.869
  `,
  sectors: {
    s1End: 0.15,
    s2End: 0.4,
  },
  pit: {
    entryT: 0.9,
    exitT: 0.08,
    boxT: 0.03,
  },
};

export const jeddah: TrackData = {
  id: 'jeddah',
  name: 'Jeddah Corniche Circuit',
  country: 'Saudi Arabia',
  trackLength: 6174,
  viewBox: '0 0 400 750',
  // Jeddah - High-speed coastal street circuit
  path: `
    M 200 700
    L 200 650
    Q 200 630 220 620
    L 275 595
    Q 295 585 305 570
    L 330 525
    Q 340 505 355 495
    L 380 475
    Q 395 465 395 445
    L 395 390
    Q 395 370 380 360
    L 345 335
    Q 325 325 315 310
    L 290 265
    Q 280 245 295 230
    L 330 200
    Q 350 185 365 175
    L 385 160
    Q 395 150 390 135
    L 375 95
    Q 365 75 345 65
    L 300 40
    Q 275 30 250 35
    L 200 50
    Q 175 60 160 80
    L 135 120
    Q 125 140 115 160
    L 90 215
    Q 80 235 85 255
    L 100 300
    Q 110 320 125 335
    L 155 365
    Q 170 380 170 400
    L 170 445
    Q 170 465 155 475
    L 120 495
    Q 100 505 90 520
    L 70 555
    Q 60 570 65 590
    L 85 635
    Q 100 660 120 675
    L 155 695
    Q 175 705 195 705
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.95,
    exitT: 0.07,
    boxT: 0.05,
  },
};

export const albertPark: TrackData = {
  id: 'albert-park',
  name: 'Albert Park Circuit',
  country: 'Australia',
  trackLength: 5278,
  viewBox: '0 0 600 550',
  // Albert Park - Lake circuit with fast corners
  path: `
    M 300 500
    L 300 440
    Q 300 420 280 410
    L 220 385
    Q 195 375 175 360
    L 135 320
    Q 115 300 100 275
    L 75 225
    Q 65 200 80 180
    L 115 145
    Q 135 125 160 120
    L 215 110
    Q 245 105 270 120
    L 310 150
    Q 335 170 360 180
    L 420 205
    Q 450 220 475 235
    L 515 265
    Q 535 280 535 305
    L 535 360
    Q 535 385 515 400
    L 470 430
    Q 445 445 415 450
    L 360 460
    Q 330 465 310 480
    L 295 495
    Q 285 505 300 510
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

export const shanghai: TrackData = {
  id: 'shanghai',
  name: 'Shanghai International Circuit',
  country: 'China',
  trackLength: 5451,
  viewBox: '0 0 650 550',
  // Shanghai - Unique snail shell Turn 1 complex
  path: `
    M 325 500
    L 325 440
    Q 325 420 345 410
    L 405 385
    Q 435 375 460 360
    L 505 320
    Q 530 300 550 285
    L 585 255
    Q 605 240 605 215
    L 605 165
    Q 605 140 585 125
    L 545 95
    Q 520 80 490 75
    L 425 65
    Q 390 60 360 70
    L 310 90
    Q 280 105 255 120
    L 205 155
    Q 180 175 160 190
    L 115 220
    Q 90 235 70 255
    L 45 290
    Q 30 315 40 340
    L 65 380
    Q 85 405 115 415
    L 175 435
    Q 210 445 240 455
    L 285 470
    Q 310 480 325 490
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

export const miami: TrackData = {
  id: 'miami',
  name: 'Miami International Autodrome',
  country: 'United States',
  trackLength: 5410,
  viewBox: '0 0 550 550',
  // Miami - Stadium section and marina turns
  path: `
    M 275 500
    L 275 440
    Q 275 420 295 410
    L 350 385
    Q 375 375 395 365
    L 435 340
    Q 460 325 480 315
    L 510 295
    Q 525 285 525 265
    L 525 210
    Q 525 190 510 180
    L 470 155
    Q 445 140 415 135
    L 355 125
    Q 325 120 300 130
    L 255 155
    Q 230 170 210 180
    L 165 205
    Q 140 220 120 235
    L 85 265
    Q 65 285 60 310
    L 55 350
    Q 55 375 70 395
    L 100 430
    Q 120 450 145 460
    L 195 480
    Q 225 490 255 495
    L 270 500
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.96,
    exitT: 0.08,
    boxT: 0.06,
  },
};

export const imola: TrackData = {
  id: 'imola',
  name: 'Autodromo Enzo e Dino Ferrari',
  country: 'Italy',
  trackLength: 4909,
  viewBox: '0 0 550 550',
  // Imola - Historic circuit with Tamburello, Villeneuve chicane, Acque Minerali
  path: `
    M 275 500
    L 275 440
    Q 275 420 260 405
    L 215 370
    Q 190 355 170 335
    L 130 285
    Q 110 260 105 230
    L 100 180
    Q 100 155 115 135
    L 145 100
    Q 165 80 190 75
    L 245 65
    Q 280 60 310 75
    L 355 105
    Q 385 125 410 145
    L 450 185
    Q 475 210 485 240
    L 495 285
    Q 500 315 485 340
    L 460 380
    Q 440 410 415 430
    L 375 460
    Q 350 475 320 485
    L 285 495
    Q 270 500 275 505
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.98,
    exitT: 0.1,
    boxT: 0.08,
  },
};

export const barcelona: TrackData = {
  id: 'barcelona',
  name: 'Circuit de Barcelona-Catalunya',
  country: 'Spain',
  trackLength: 4675,
  viewBox: '0 0 600 500',
  // Barcelona - Test circuit with varied corners
  path: `
    M 300 450
    L 300 390
    Q 300 370 320 360
    L 375 335
    Q 400 325 420 310
    L 455 275
    Q 475 255 495 245
    L 545 220
    Q 565 210 565 190
    L 565 140
    Q 565 120 545 110
    L 485 80
    Q 455 65 420 62
    L 360 58
    Q 325 56 295 65
    L 245 85
    Q 215 100 190 115
    L 145 145
    Q 120 165 105 190
    L 80 230
    Q 65 260 70 290
    L 85 335
    Q 100 365 125 385
    L 165 415
    Q 195 435 225 443
    L 270 452
    Q 290 455 300 455
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

export const montreal: TrackData = {
  id: 'montreal',
  name: 'Circuit Gilles Villeneuve',
  country: 'Canada',
  trackLength: 4361,
  viewBox: '0 0 700 400',
  // Montreal - Island circuit with hairpin and casino chicane
  path: `
    M 350 350
    L 350 300
    Q 350 280 330 270
    L 270 245
    Q 245 235 220 220
    L 175 185
    Q 150 165 130 145
    L 95 105
    Q 75 85 90 65
    L 125 35
    Q 150 20 180 25
    L 235 40
    Q 270 50 300 65
    L 360 95
    Q 400 115 440 130
    L 520 160
    Q 565 175 600 190
    L 650 215
    Q 675 230 675 255
    L 675 295
    Q 675 320 655 330
    L 600 355
    Q 565 370 525 370
    L 460 370
    Q 425 370 400 355
    L 370 335
    Q 355 325 350 310
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.95,
    exitT: 0.075,
    boxT: 0.05,
  },
};

export const redBullRing: TrackData = {
  id: 'red-bull-ring',
  name: 'Red Bull Ring',
  country: 'Austria',
  trackLength: 4318,
  viewBox: '0 0 550 400',
  // Red Bull Ring - Short, fast Alpine circuit with elevation
  path: `
    M 275 350
    L 275 295
    Q 275 275 295 265
    L 355 240
    Q 385 230 410 215
    L 455 180
    Q 480 160 505 150
    L 535 140
    Q 555 135 555 115
    L 555 80
    Q 555 60 535 55
    L 480 45
    Q 450 40 420 50
    L 370 70
    Q 340 85 315 95
    L 260 120
    Q 230 135 205 145
    L 155 165
    Q 125 180 100 200
    L 65 235
    Q 45 260 45 290
    L 45 320
    Q 45 340 65 345
    L 115 355
    Q 145 360 175 355
    L 225 345
    Q 255 340 275 335
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

export const hungaroring: TrackData = {
  id: 'hungaroring',
  name: 'Hungaroring',
  country: 'Hungary',
  trackLength: 4381,
  viewBox: '0 0 500 550',
  // Hungaroring - Tight, twisty circuit near Budapest
  path: `
    M 250 500
    L 250 440
    Q 250 420 235 405
    L 195 375
    Q 170 360 150 340
    L 115 295
    Q 95 270 85 240
    L 75 190
    Q 70 160 85 135
    L 115 100
    Q 140 75 170 70
    L 220 65
    Q 255 65 285 80
    L 330 110
    Q 360 135 385 155
    L 425 190
    Q 450 215 460 245
    L 470 290
    Q 475 320 465 350
    L 445 390
    Q 425 425 395 445
    L 350 470
    Q 320 485 285 490
    L 250 495
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

export const zandvoort: TrackData = {
  id: 'zandvoort',
  name: 'Circuit Zandvoort',
  country: 'Netherlands',
  trackLength: 4259,
  viewBox: '0 0 500 550',
  // Zandvoort - Seaside circuit with banked Turn 3 and 14
  path: `
    M 250 500
    L 250 440
    Q 250 420 270 410
    L 325 385
    Q 355 375 380 365
    L 425 340
    Q 450 325 460 305
    L 475 265
    Q 480 240 470 215
    L 450 175
    Q 430 145 405 130
    L 360 105
    Q 330 90 295 85
    L 245 80
    Q 210 80 180 95
    L 140 120
    Q 110 140 90 165
    L 60 210
    Q 45 245 50 280
    L 65 330
    Q 80 365 105 390
    L 145 425
    Q 175 450 210 465
    L 240 480
    Q 250 485 250 495
    Z
  `,
  sectors: {
    s1End: 0.33,
    s2End: 0.67,
  },
  pit: {
    entryT: 0.98,
    exitT: 0.1,
    boxT: 0.08,
  },
};
