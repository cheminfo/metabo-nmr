'use strict';

const OCL = require('openchemlib');
const { readFileSync } = require('fs');
const { join } = require('path');
const { NMR } = require('spectra-data');
const predictor = require('nmr-predictor');

async function createSpectra() {
  let data = JSON.parse(readFileSync(join(__dirname, './icl.json'), 'utf-8'));

  data = data.slice(0, 10);

  for (let entry of data) {
    entry.ocl.value = unescape(entry.ocl.value);
    entry.ocl.coordinates = unescape(entry.ocl.coordinates);
    const molecule = OCL.Molecule.fromIDCode(
      entry.ocl.value,
      entry.ocl.coordinates,
    );
    molecule.addImplicitHydrogens();
    const molfile = molecule.toMolfile();

    const signals = await predictor.spinus(molfile, { group: false });
    console.log(signals);
    const spectrum = NMR.fromSignals(signals, {
      frequency: 400,
      from: 0,
      to: 11,
      lineWidth: 1,
      nbPoints: 65536,
      noisePercent: 0,
    });
  }
}

createSpectra();
