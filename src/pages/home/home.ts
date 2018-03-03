import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLEListComponent } from '../../components/blelist/blelist';
import { MultiBLEProvider } from '../../providers/multible/multible';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public currentId: String = "30:AE:A4:14:50:96";

  constructor(public navCtrl: NavController, private multible: MultiBLEProvider) {

  }

  deviceSelected(device: any) {
    console.log("Device selected", device);
    this.multible.connect(device.id);
  }

}
