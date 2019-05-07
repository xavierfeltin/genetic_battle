import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SimuInfoService } from '../../services/simu-info.service';
import { GameEngine } from '../../engine/game.engine';
import { Configuration } from '../../models/configuration.interface';

@Component({
  selector: 'app-simu-config',
  styleUrls: ['./simu-config.component.css'],
  templateUrl: './simu-config.component.html'
})
export class SimuConfigComponent implements OnInit {

  formSimu: FormGroup;
  simu: GameEngine;

  constructor(private fb: FormBuilder, private service: SimuInfoService) { }

  ngOnInit() {
    this.simu = this.service.getGame();
    const config = this.simu.getDefaultConfiguration();

    this.formSimu = this.fb.group({
      resetSimulation: [config.resetSimulation, Validators.required],
      debugMode: [config.debugMode, Validators.required],
      simu_global: this.fb.group({
        nbStartingShips: [config.nbStartingShips, Validators.required],
        energyFuel: [config.energyFuel, Validators.required],
        energyFire: [config.energyFire, Validators.required],
        damageMissile: [config.damageMissile, Validators.required],
        nbStartingHealth: [config.nbStartingHealth, Validators.required],
        rateHealth: [config.rateHealth, Validators.required],
        nbHealthDestroyingShip: [config.nbHealthDestroyingShip, Validators.required],
        lifeFromHealth: [config.lifeFromHealth, Validators.required]
      }),
      simu_genetic: this.fb.group({
        cloneRate: [config.cloneRate, Validators.required],
        crossOverRate: [config.crossOverRate, Validators.required],
        mutationRate: [config.mutationRate, Validators.required]
      })
    });
  }

  onSubmit() {
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
      resetSimulation: formValues.resetSimulation,
      debugMode: formValues.debugMode
    }
    return configuration;
  }
}
