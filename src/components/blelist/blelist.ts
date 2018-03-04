import { Component, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { MultiBLEProvider } from '../../providers/multible/multible';


/**
 * Generated class for the BlelistComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'blelist',
  templateUrl: 'blelist.html'
})
export class BLEListComponent {

  @Input('currentId') currentId: String;
  @Output() select = new EventEmitter();


  constructor(private multible: MultiBLEProvider) {
    this.multible.startScan();
  }

  emitSelect(device: any) {
    this.select.emit(device);
  }

  enableBluetooth() {
    console.log("BLEListComponent::enableBluetooth");
    this.multible.enableBluetooth();
  }

  stopScanning() {
    console.log("BLEListComponent::stopScanning");
    this.multible.stopScan();
  }

  startScanning() {
    console.log("BLEListComponent::startScanning");
    this.multible.startScan();
  }

}
