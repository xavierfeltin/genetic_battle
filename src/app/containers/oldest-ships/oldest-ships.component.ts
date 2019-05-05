import { Component, OnInit } from '@angular/core';
import { SimuInfoService } from '../../services/simu-info.service';
import { Ship } from '../../models/ship.model';

@Component({
  selector: 'app-oldest-ships',
  templateUrl: './oldest-ships.component.html',
  styleUrls: ['./oldest-ships.component.css']
})
export class OldestShipsComponent implements OnInit {
  private oldestShip: Ship;
  private aliveOldestShip: Ship;

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.service.getOldestShip().subscribe((ship: Ship) => this.oldestShip = ship.copy());
    this.service.getAliveOldestShip().subscribe((ship: Ship) => this.aliveOldestShip = ship.copy());
  }
}
