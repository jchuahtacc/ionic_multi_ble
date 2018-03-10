import { Component, ViewChild } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { BLEListComponent } from '../../components/blelist/blelist';
import { MultiBLEProvider } from '../../providers/multible/multible';
import { AfterViewInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('blelist') blelist: BLEListComponent;
  public showlist: boolean = true;
  public storage_key : string = "HomePageKey";

  constructor(public navCtrl: NavController, public storage: Storage, public events: Events, public multible: MultiBLEProvider) {
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
    console.log("HomePage::deviceSelected", device_id);
  }

  ngAfterViewInit() {
    this.storage.get(this.storage_key).then(
        (data) => {
            this.blelist.selectedDevice = data as string;
        }
    );
  }

}
