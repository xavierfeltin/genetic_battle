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

  simu: GameEngine;
  isValidFormSubmitted: boolean;
  formSimu = this.fb.group({
    resetSimulation: [false, Validators.required],
    debugMode: [false, Validators.required],
    simu_global: this.fb.group({
      nbStartingShips: ['', [Validators.pattern(this.integerPattern), Validators.required]],
      energyFuel: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      energyFire: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      damageMissile: ['', [Validators.pattern(this.integerPattern), Validators.required]],
      nbStartingHealth: ['', [Validators.pattern(this.integerPattern), Validators.required]],
      rateHealth: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      nbHealthDestroyingShip: ['', [Validators.pattern(this.integerPattern), Validators.required]],
      lifeFromHealth: ['', [Validators.pattern(this.integerPattern), Validators.required]]
    }),
    simu_genetic: this.fb.group({
      cloneRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      crossOverRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      mutationRate: ['', [Validators.pattern(this.floatPattern), Validators.required]],
      evolutionMode: ['', Validators.required]
    })
  });

  constructor(private fb: FormBuilder, private service: SimuInfoService) { }

  ngOnInit() {
    this.simu = this.service.getGame();
    const config = this.simu.getDefaultConfiguration();

    this.formSimu.get('resetSimulation').setValue(config.resetSimulation);
    this.formSimu.get('debugMode').setValue(config.debugMode);
    this.nbStartingShips.setValue(config.nbStartingShips);
    this.energyFuel.setValue(config.energyFuel);
    this.energyFire.setValue(config.energyFire);
    this.damageMissile.setValue(config.damageMissile);
    this.nbStartingHealth.setValue(config.nbStartingHealth);
    this.rateHealth.setValue(config.rateHealth);
    this.nbHealthDestroyingShip.setValue(config.nbHealthDestroyingShip);
    this.lifeFromHealth.setValue(config.lifeFromHealth);
    this.cloneRate.setValue(config.cloneRate);
    this.crossOverRate.setValue(config.crossOverRate);
    this.mutationRate.setValue(config.mutationRate);
    this.evolutionMode.setValue(config.evolutionMode);
  }

  onSubmit() {
    if (this.formSimu.invalid) {
      this.isValidFormSubmitted = false;
      return;
    }
    this.isValidFormSubmitted = true;
    const formValues = this.formSimu.value;
    const configuration = this.fromFormToConfiguration(formValues);
    this.simu.setConfigucation(configuration);
  }

  private fromFormToConfiguration(formValues: any): Configuration {

    const configuration: Configuration = {
      nbStartingShips: parseInt(formValues.simu_global.nbStartingShips),
      energyFuel: parseFloat(formValues.simu_global.energyFuel),
      energyFire: parseFloat(formValues.simu_global.energyFire),
      damageMissile: parseInt(formValues.simu_global.damageMissile),
      nbStartingHealth: parseInt(formValues.simu_global.nbStartingHealth),
      rateHealth: parseFloat(formValues.simu_global.rateHealth),
      nbHealthDestroyingShip: parseInt(formValues.simu_global.nbHealthDestroyingShip),
      lifeFromHealth: parseInt(formValues.simu_global.lifeFromHealth),
      cloneRate: parseFloat(formValues.simu_genetic.cloneRate),
      crossOverRate: parseFloat(formValues.simu_genetic.crossOverRate),
      mutationRate: parseFloat(formValues.simu_genetic.mutationRate),
      evolutionMode: formValues.simu_genetic.evolutionMode,
      resetSimulation: formValues.resetSimulation,
      debugMode: formValues.debugMode
    }
    return configuration;
  }

  get nbStartingShips() {
    return this.formSimu.get('simu_global.nbStartingShips');
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

  get crossOverRate() {
    return this.formSimu.get('simu_genetic.crossOverRate');
  }

  get mutationRate() {
    return this.formSimu.get('simu_genetic.mutationRate');
  }

  get evolutionMode() {
    return this.formSimu.get('simu_genetic.evolutionMode');
  }
}
