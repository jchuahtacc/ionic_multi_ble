import { Component, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { MultiBLEProvider } from '../../providers/multible/multible';
import { Events } from 'ionic-angular';


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
  @Output() deviceEvents: EventEmitter< any > = new EventEmitter();


  constructor(private multible: MultiBLEProvider, private events: Events, private zone: NgZone) {
    this.events.subscribe(multible.TOPIC, (event) => {
        console.log("Event notification", event);
    });
    this.multible.startScan();
  }

  selectDevice(device_id: any) {
    this.multible.connect(device_id);
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
