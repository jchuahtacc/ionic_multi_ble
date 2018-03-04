import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BLEListComponent } from '../../components/blelist/blelist';
import { MultiBLEProvider } from '../../providers/multible/multible';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public currentId: string = "30:AE:A4:14:50:96";

  constructor(public navCtrl: NavController, private multible: MultiBLEProvider) {

  }

  deviceSelected(device_id: string) {
    console.log("HomePage::deviceSelected", device_id);
    this.multible.connect(device_id).subscribe(
        (data) => {
            console.log("HomePage::deviceSelected connection data", data);
        },
        (error) => {
            console.log("HomePage::deviceSelected connection error", error);
        },
        () => {
            console.log("HomePage::deviceSelected connection finished");
        }
    );
  }

}
