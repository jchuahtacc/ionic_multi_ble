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
  public deviceDisplayName: string = "";
  public device_id: string = "";
  public services: string[] = ["6E400001-B5A3-F393-E0A9-E50E24DCCA9E"] // UART Serial service

  constructor(public navCtrl: NavController, public storage: Storage, public events: Events, public multible: MultiBLEProvider, public navParams: NavParams) {
    this.events.subscribe(this.multible.TOPIC, 
        (event) => {
            if (this.blelist && event.device_id == this.device_id) {
                if (event.event == "connected") {
                    this.storage.set(this.storage_key, this.blelist.selectedDevice);
                    setTimeout(() => { this.blelist.setVisibility(false); }, 1000);
                } 
                if (event.event == "error" || event.event == "disconnected") {
                    this.blelist.setVisibility(true);
                }
            }
        }
    );
  }

  deviceSelected(device_id: string) {
    this.device_id = device_id;
  }

  switchDevice() {
    this.multible.disconnect(this.device_id);
    this.blelist.selectedDevice = "";
  }

  ionViewDidEnter() {
    this.name = this.navParams.get('name');
    if (this.name && this.name.length) {
        this.storage_key = "device" + this.name;
        this.storage.get(this.storage_key).then(
            (data) => {
                this.device_id = data as string;
                this.blelist.selectedDevice = this.device_id;
                if (this.multible.devices[this.device_id]) {
                    this.deviceDisplayName = this.multible.devices[this.device_id].name ? this.multible.devices[this.device_id].name : data;
                }
                if (this.multible.devices[this.device_id] && this.multible.devices[this.device_id].connected) {
                    this.blelist.setVisibility(false);
                }
            }
        );
    }
  }

}
