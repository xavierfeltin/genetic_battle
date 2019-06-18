import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, PatternValidator } from '@angular/forms';
import { SimuInfoService } from '../../services/simu-info.service';
import { GameEngine } from '../../engine/game.engine';
import { Configuration } from '../../models/configuration.interface';

@Component({
  selector: 'app-simu-config',
  styleUrls: ['./simu-config.component.css'],
  templateUrl: './simu-config.component.html'
})
export class SimuConfigComponent implements OnInit {
  integerPattern = '^-?[0-9]+';
  floatPattern = '^-?[0-9]+.?[0-9]*';
  hiddenLayerPattern = '^([0-9]+;)*([0-9]+)';
  simu: GameEngine;
  defaultConfig: Configuration;

  isValidFormSubmitted: boolean;
  formSimu: FormGroup = null;

  constructor(private fb: FormBuilder, private service: SimuInfoService) {
  }

  ngOnInit() {
    this.simu = this.service.getGame();
    this.defaultConfig = this.simu.getDefaultConfiguration();

    this.formSimu = this.fb.group({
      resetSimulation: ['', Validators.required],
      debugMode: ['', Validators.required],
      simu_global: this.fb.group({
        nbStartingShips: ['', [Validators.pattern(this.integerPattern), Validators.required]],
        maxShips: ['', [Validators.pattern(this.integerPattern), Validators.required]],
        energyFuel: ['', [Validators.pattern(this.floatPattern), Validators.required]],
        energyFire: ['', [Validators.pattern(this.floatPattern), Validators.required]],
        damageMissile: ['', [Validators.pattern(this.integerPattern), Validators.required]],
        nbStartingHealth: ['', [Validators.pattern(this.integerPattern), Validators.required]],
        rateHealth: ['', [Validators.pattern(this.floatPattern), Validators.required]],
        nbHealthDestroyingShip: ['', [Validators.pattern(this.integerPattern), Validators.required]],
        lifeFromHealth: ['', [Validators.pattern(this.integerPattern), Validators.required]]
      }),
      simu_genetic: this.fb.group(
        this.generateFbGroupNeuroEvo()
      )
    });

    this.resetSimulation.setValue(this.defaultConfig.resetSimulation);
    this.debugMode.setValue(this.defaultConfig.debugMode);
    this.nbStartingShips.setValue(this.defaultConfig.nbStartingShips);
    this.maxShips.setValue(this.defaultConfig.maxShips);
    this.energyFuel.setValue(this.defaultConfig.energyFuel);
    this.energyFire.setValue(this.defaultConfig.energyFire);
    this.damageMissile.setValue(this.defaultConfig.damageMissile);
    this.nbStartingHealth.setValue(this.defaultConfig.nbStartingHealth);
    this.rateHealth.setValue(this.defaultConfig.rateHealth);
    this.nbHealthDestroyingShip.setValue(this.defaultConfig.nbHealthDestroyingShip);
    this.lifeFromHealth.setValue(this.defaultConfig.lifeFromHealth);
    this.cloneRate.setValue(this.defaultConfig.cloneRate);
    this.breedingRate.setValue(this.defaultConfig.breedingRate);
    this.mutationRate.setValue(this.defaultConfig.mutationRate);
    this.crossOverRate.setValue(this.defaultConfig.crossOverRate);
    this.evolutionMode.setValue(this.defaultConfig.evolutionMode);
    this.nnStructure.setValue(this.defaultConfig.nnStructure.join(';'));

    const neuroEvoInputs = this.getActivateNeuroEvoInputs();
    // tslint:disable-next-line:forin
    for (const name in neuroEvoInputs) {
      const key = 'simu_genetic.' + name;
      this.formSimu.get(key).setValue(this.defaultConfig.neuroInvoInputs[name].status);
    }
  }

  onSubmit() {
    let isFormOk = false;
    if (this.formSimu.invalid) {
      console.log('The form has invalid element:');
      for (const name in this.formSimu.controls) {
        if (this.formSimu.controls[name].invalid) {
          console.log('  - ' + name);
          // Ignore neuro evolution fields if not setting a neuro evolution simulation
          if (name === 'simu_genetic' && this.formSimu.value.simu_genetic.evolutionMode === 'geneticalgo') {
            isFormOk = true;
          }
        }
      }

      this.isValidFormSubmitted = isFormOk;
    }

    if (!isFormOk) {
      return;
    }

    const formValues = this.formSimu.value;

    const neuroInvoInputs = this.getActivateNeuroEvoInputs();
    let isOneValueChecked = false;
    // tslint:disable-next-line:forin
    for (const key in neuroInvoInputs) {
      isOneValueChecked = formValues.simu_genetic[key];
      if (isOneValueChecked) { break; }
    }

    if (!isOneValueChecked) {
      console.log('invalid form - check at least one input for neuro evolution!');
      this.isValidFormSubmitted = false;
      return;
    }

    this.isValidFormSubmitted = true;
    const configuration = this.fromFormToConfiguration(formValues);
    this.simu.setConfigucation(configuration);
  }

  private fromFormToConfiguration(formValues: any): Configuration {
    const neuroInvoInputs = this.getActivateNeuroEvoInputs();
    const configInputs = {};
    // tslint:disable-next-line:forin
    for (const key in neuroInvoInputs) {
      configInputs[key] = formValues.simu_genetic[key];
    }

    const configuration: Configuration = {
      nbStartingShips: parseInt(formValues.simu_global.nbStartingShips),
      maxShips: parseInt(formValues.simu_global.maxShips),
      energyFuel: parseFloat(formValues.simu_global.energyFuel),
      energyFire: parseFloat(formValues.simu_global.energyFire),
      damageMissile: parseInt(formValues.simu_global.damageMissile),
      nbStartingHealth: parseInt(formValues.simu_global.nbStartingHealth),
      rateHealth: parseFloat(formValues.simu_global.rateHealth),
      nbHealthDestroyingShip: parseInt(formValues.simu_global.nbHealthDestroyingShip),
      lifeFromHealth: parseInt(formValues.simu_global.lifeFromHealth),
      cloneRate: parseFloat(formValues.simu_genetic.cloneRate),
      breedingRate: parseFloat(formValues.simu_genetic.breedingRate),
      mutationRate: parseFloat(formValues.simu_genetic.mutationRate),
      crossOverRate: parseFloat(formValues.simu_genetic.crossOverRate),
      evolutionMode: formValues.simu_genetic.evolutionMode,
      nnStructure: formValues.simu_genetic.nnStructure.split(';').map(str => parseInt(str)),
      resetSimulation: formValues.resetSimulation,
      debugMode: formValues.debugMode,
      neuroInvoInputs: configInputs
    };

    return configuration;
  }

  public getActivateNeuroEvoInputs(): {} {
    return this.defaultConfig.neuroInvoInputs;
  }

  public generateFbGroupNeuroEvo(): {} {
    const fbGroup = {
      cloneRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      breedingRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      mutationRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      crossOverRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      evolutionMode: ['', Validators.required],
      nnStructure: ['', [Validators.pattern(this.hiddenLayerPattern), Validators.required]]
    };

    const inputs = this.getActivateNeuroEvoInputs();
    // tslint:disable-next-line:forin
    for (const key in inputs) {
      fbGroup[key] = [false, Validators.required];
    }
    return fbGroup;
  }

  get nbStartingShips() {
    return this.formSimu.get('simu_global.nbStartingShips');
  }

  get maxShips() {
    return this.formSimu.get('simu_global.maxShips');
  }

  get energyFuel() {
    return this.formSimu.get('simu_global.energyFuel');
  }

  get energyFire() {
    return this.formSimu.get('simu_global.energyFire');
  }

  get damageMissile() {
    return this.formSimu.get('simu_global.damageMissile');
  }

  get nbStartingHealth() {
    return this.formSimu.get('simu_global.nbStartingHealth');
  }

  get rateHealth() {
    return this.formSimu.get('simu_global.rateHealth');
  }

  get nbHealthDestroyingShip() {
    return this.formSimu.get('simu_global.nbHealthDestroyingShip');
  }

  get lifeFromHealth() {
    return this.formSimu.get('simu_global.lifeFromHealth');
  }

  get cloneRate() {
    return this.formSimu.get('simu_genetic.cloneRate');
  }

  get breedingRate() {
    return this.formSimu.get('simu_genetic.breedingRate');
  }

  get crossOverRate() {
    return this.formSimu.get('simu_genetic.crossOverRate');
  }

  get mutationRate() {
    return this.formSimu.get('simu_genetic.mutationRate');
  }

  get evolutionMode() {
    return this.formSimu.get('simu_genetic.evolutionMode');
  }

  get nnStructure() {
    return this.formSimu.get('simu_genetic.nnStructure');
  }

  get resetSimulation() {
    return this.formSimu.get('resetSimulation');
  }

  get debugMode() {
    return this.formSimu.get('debugMode');
  }
}
