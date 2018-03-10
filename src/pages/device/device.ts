import { Component, ViewChild } from '@angular/core';
import { NavController, Events, NavParams } from 'ionic-angular';
import { BLEListComponent } from '../../components/blelist/blelist';
import { MultiBLEProvider } from '../../providers/multible/multible';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-device',
  templateUrl: 'device.html'
})

export class DevicePage {

  @ViewChild('blelist') blelist: BLEListComponent;
  public showlist: boolean = true;
  public storage_key : string = "";
  public name: string = "";

  constructor(public navCtrl: NavController, public storage: Storage, public events: Events, public multible: MultiBLEProvider, public navParams: NavParams) {
    this.events.subscribe(this.multible.TOPIC, 
        (event) => {
            if (this.blelist && event.device_id == this.blelist.selectedDevice) {
                if (event.event == "connected") {
                    this.storage.set(this.storage_key, this.blelist.selectedDevice);
                    setTimeout(() => { this.blelist.setVisibility(false); }, 1000);
                } 
                if (event.event == "error") {
                    this.blelist.setVisibility(true);
                }
            }
        }
    );
  }

  deviceSelected(device_id: string) {
    console.log("DevicePage::deviceSelected", device_id);
  }

  ionViewDidEnter() {
    this.name = this.navParams.get('name');
    if (this.name && this.name.length) {
        this.storage_key = "device" + this.name;
        this.storage.get(this.storage_key).then(
            (data) => {
                this.blelist.selectedDevice = data as string;
            }
        );
    }
  }

}
