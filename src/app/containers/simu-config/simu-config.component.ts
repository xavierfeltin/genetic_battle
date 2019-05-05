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

    this.formSimu = this.fb.group({
      resetSimulation: [true, Validators.required],
      simu_global: this.fb.group({
        nbStartingShips: ['30', Validators.required],
        energyFuel: ['0', Validators.required],
        energyFire: ['1', Validators.required],
        damageMissile: ['30', Validators.required],
        nbStartingHealth: ['20', Validators.required],
        rateHealth: ['0.01', Validators.required],
        nbHealthDestroyingShip: ['2', Validators.required],
        lifeFromHealth: ['20', Validators.required]
      }),      
      simu_genetic: this.fb.group({
        cloneRate: ['0.001', Validators.required],
        crossOverRate: ['0.001', Validators.required],
        mutationRate: ['0.05', Validators.required]
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
      resetSimulation: parseInt(formValues.resetSimulation) == 0 ? false : true
    }
    return configuration;
  }
}
