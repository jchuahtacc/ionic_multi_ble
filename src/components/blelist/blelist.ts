import { Component, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { MultiBLEProvider, BLEDevice } from '../../providers/multible/multible';


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


  constructor(private multible: MultiBLEProvider, public zone: NgZone) {
    this.multible.rescan(this.zone);
  }

  emitSelect(device: any) {
    this.select.emit(device);
  }

}
