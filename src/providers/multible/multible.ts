import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';

export class BLEDeviceInfo {
  public name: String;
  public id: String;
  public connected: boolean = false;
}

/*
  Generated class for the MultiBLEProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MultiBLEProvider {
  public devices: any = { }; 
  public device_ids: string[] = [];
  public stored_devices: any = { };
  public scanning: boolean = false;
  public isEnabled: boolean = false;

  constructor(private ble: BLE, private storage: Storage, private zone: NgZone) {
    this.checkBluetooth();
    this.storage.ready().then(
        (ready_data) => {
            this.storage.get("multible_devices").then(
                (data) => {
                    this.stored_devices = data;
                    for (var i in this.stored_devices) {
                        this.updateDevice(this.stored_devices[i]);
                        this.devices[this.stored_devices[i].id].connected = false;
                    }
                },
                (error) => {
                    console.log("MultiBLEProvider::constructor could not retrieve stored devices", error);
                }
            );
        }
    );
  }

  checkBluetooth() {
    this.ble.isEnabled().then(
        (data) => {
            console.log("MultiBLEProvider::constructor bluetooth enabled");
            this.isEnabled = true;
        },
        (error) => {
            console.log("MultiBLEProvider::constructor bluetooth disabled");
            this.isEnabled = false;
        }
    );
  }

  enableBluetooth() {
    this.ble.enable().then(
        (data) => {
            this.checkBluetooth();
        },
        (error) => {
            this.checkBluetooth();
        }
    );
  }

  saveDevice(deviceId: string) {
    if (this.devices[deviceId]) {
        this.stored_devices[deviceId] = this.devices[deviceId];
        this.storage.set("multible_devices", this.stored_devices).then(
            (data) => {
                console.log("MultiBLEProvider::saveDevice success", data);
            },
            (error) => {
                console.log("MultiBLEProvider::saveDevice error", error);
            }
        );
    }
  }

  forgetDevice(deviceId: string) {
    if (this.stored_devices[deviceId]) {
        delete this.stored_devices[deviceId];
        this.storage.set("multible_devices", this.stored_devices).then(
            (data) => {
                console.log("MultiBLEProvider::forgetDevice success", data);
            },
            (error) => {
                console.log("MultiBLEProvider::forgetDevice error", error);
            }
        );
    }
  }

  updateDevice(device: any) {
    this.devices[device.id] = device;
    this.device_ids = Object.keys(this.devices);
  }

  // ASCII only
  stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  stopScan() {
    this.ble.stopScan().then(
        (data) => {
            this.scanning = false;
        }
    );
  }

  startScan(services: string[] = []) {
    this.scanning = true;
    this.ble.startScan(services).subscribe(
        (data) => {
            this.zone.run(
                () => {
                    var device = new BLEDeviceInfo();
                    device.id = data.id;
                    if (data.name) {
                        device.name = data.name;
                    }
                    this.updateDevice(device);
                }
            );
        },
        (error) => {
            console.log("MultiBLE::refresh error: ", error);
        },
        () => {
            console.log("MultiBLE::refresh finished");
            this.scanning = false;
        }
    );
  }

  disconnect(deviceId: string) {
    console.log("MultiBLEProvider::disconnect", deviceId);
    return new Promise(
        (resolve, reject) => {
            this.ble.disconnect(deviceId).then(
                (data) => {
                    this.devices[deviceId].connected = false;
                    this.forgetDevice(deviceId);
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
        }
    );
  }

  connect(deviceId: string) {
    console.log("MultiBLEProvider::connect initiating", deviceId);
    this.saveDevice(deviceId);
    return new Observable(
        (observer) => { 
            this.ble.connect(deviceId).subscribe( 
                (data) => {
                    console.log("MultiBLEProvider::connect success", data);
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = true; 
                        }
                    );
                    observer.next(data);
                },
                (error) => {
                    console.log("MultiBLEProvider::connect error", error);
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = false; 
                        }
                    );
                    observer.error(error);
                },
                () => {
                    console.log("MultiBLEProvider::connect finished for device", deviceId);
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = false;
                        }
                    );
                    observer.complete();
                }
            );
        }
    );
  }

}
