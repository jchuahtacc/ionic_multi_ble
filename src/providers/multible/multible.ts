import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';

export class BLEDeviceInfo {
  public name: string;
  public id: string;
  public connected: boolean = false;
  public connecting: boolean = false;
  public stored: boolean = false;
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
  public reconnecting: boolean = false;
  public STORAGE_KEY: string = "multible_devices";

  constructor(private ble: BLE, private storage: Storage, private zone: NgZone) {
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.checkBluetooth();
    this.storage.ready().then(
        (ready_data) => {
            this.storage.get(this.STORAGE_KEY).then(
                (data) => {
                    if (data) {
                        this.zone.run(
                            () => {
                                this.stored_devices = data;
                                console.log("MultiBLEProvider::constructor loaded stored devices", data);
                                for (var device_id of Object.keys(this.stored_devices)) {
                                    if (this.stored_devices[device_id].stored) {
                                        this.devices[device_id] = this.stored_devices[device_id];
                                        this.devices[device_id].connected = false;
                                        this.devices[device_id].connecting = false;
                                    }
                                }
                                this.reconnectAll();
                            }
                        );
                    }
                },
                (error) => {
                    console.log("MultiBLEProvider::constructor could not retrieve stored devices", error);
                }
            );
        }
    );
  }

  disconnectAll() {
    for (var device_id of Object.keys(this.devices)) {
        if (this.devices[device_id].connected) {
            this.disconnect(device_id);
        }
    }
  }

  forgetAll() {
    this.disconnectAll();
    for (var device_id of Object.keys(this.devices)) {
        this.devices[device_id].stored = false;
    }
    this.stored_devices = { };
    this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
        (data) => {
            console.log("MultiBLEProvider::forgetAll success", data);
            this.storage.get(this.STORAGE_KEY).then(
            (data) => { console.log("MultiBLEProvider::forgetAll storage is now", data); }
            );
        },
        (error) => {
            console.log("MultiBLEProvider::forgetAll failure", error);
        }
    );
    
  }

  reconnectAll() {
    if (this.isEnabled && !this.reconnecting && Object.keys(this.stored_devices).length > 0) {
        console.log("MultiBLEProvider::reconnectAll initiating reconnect for stored_devices", Object.keys(this.stored_devices));
        this.reconnecting = true;
        var connection_callback = () => {
            var connecting = false;
            for (var device_id of Object.keys(this.stored_devices)) {
                connecting = connecting || this.devices[device_id].connecting;
            }
            this.reconnecting = connecting;
            if (!this.reconnecting) {
                console.log("MultiBLEProvider::reconnectAll finished");
            }
        };
        for (var device_id of Object.keys(this.stored_devices)) {
            if (!this.devices[device_id].connected && !this.devices[device_id].connecting) {
                console.log("MultiBLEProvider::reconnectAll attempting", this.devices[device_id]);
                this.connect(device_id).subscribe(
                    connection_callback,
                    connection_callback,
                    connection_callback
                );
            } else {
                console.log("MultiBLEProvider::reconnectAll skipping", this.devices[device_id]);
            }
        }    
    } else {
        console.log("MultiBLEProvider::reconnectAll already in progress");
    }
  }

  checkBluetooth() {
    this.ble.isEnabled().then(
        (data) => {
            console.log("MultiBLEProvider::constructor bluetooth enabled");
            this.isEnabled = true;
            this.reconnectAll();
        },
        (error) => {
            console.log("MultiBLEProvider::constructor bluetooth disabled");
            this.isEnabled = false;
            this.zone.run(
                () => {
                    for (var device_id of Object.keys(this.devices)) {
                        this.devices[device_id].connected = false;
                        this.devices[device_id].connecting = false;
                    }
                }
            );
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
    this.devices[deviceId].stored = true;
    this.stored_devices = { };
    for (var device_id of Object.keys(this.devices)) {
        if (this.devices[device_id].stored) {
            this.stored_devices[device_id] = this.devices[device_id];
        }
    }
    this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
        (data) => {
            console.log("MultiBLEProvider::saveDevice success", this.stored_devices);
        },
        (error) => {
            console.log("MultiBLEProvider::saveDevice error", error);
        }
    );
  }

  forgetDevice(deviceId: string) {
    if (this.devices[deviceId]) {
        this.devices[deviceId].stored = false;
    }
    if (this.stored_devices[deviceId]) {
        delete this.stored_devices[deviceId];
        this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
            (data) => {
                console.log("MultiBLEProvider::forgetDevice success", data);
            },
            (error) => {
                console.log("MultiBLEProvider::forgetDevice error", error);
            }
        );
    }
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
            this.zone.run(
                () => {
                    this.scanning = false;
                    this.device_ids = Object.keys(this.devices);
                    console.log("MultiBLEProvider::stopScan");
                }
            );
        }
    );
  }

  startScan(services: string[] = []) {
    this.scanning = true;
    this.ble.startScan(services).subscribe(
        (data) => {
            this.zone.run(
                () => {
                    if (this.devices[data.id]) {
                        console.log("MultiBLEProvider::startScan refreshing device", data);
                        if (data.name != this.devices[data.id].name) {
                            this.devices[data.id].name = data.name;
                            this.device_ids = Object.keys(this.devices);
                        }
                    } else {
                        console.log("MultiBLEProvider::startScan found new device", data);
                        var device = new BLEDeviceInfo();
                        device.id = data.id;
                        if (data.name) {
                            device.name = data.name;
                        }
                        this.devices[data.id] = device;
                        this.device_ids = Object.keys(this.devices);
                    }
                    if (data.id in Object.keys(this.stored_devices) && !this.devices[data.id].connected) {
                        console.log("MultiBLEProvider::startScan reconnecting to stored device", device.id);
                        this.connect(data.id);
                    }
                }
            );
        },
        (error) => {
            console.log("MultiBLE::startScan error: ", error);
        },
        () => {
            console.log("MultiBLE::startScan finished");
            this.zone.run(
                () => {
                    this.scanning = false;
                }
            );
        }
    );
    setTimeout(
        () => {
            this.stopScan();
        },
        10000
    );
  }

  disconnect(deviceId: string) {
    console.log("MultiBLEProvider::disconnect", deviceId);
    return new Promise(
        (resolve, reject) => {
            this.ble.disconnect(deviceId).then(
                (data) => {
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = false;
                            this.device_ids = Object.keys(this.devices);
                        }
                    );
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
    this.zone.run(
        () => {
            this.devices[deviceId].connecting = true;
            this.device_ids = Object.keys(this.devices);
        }
    );
    return new Observable(
        (observer) => { 
            this.ble.connect(deviceId).subscribe( 
                (data) => {
                    console.log("MultiBLEProvider::connect success", data);
                    this.zone.run(
                        () => {
                            this.saveDevice(deviceId);
                            this.devices[deviceId].connected = true; 
                            this.devices[deviceId].connecting = false;
                        }
                    );
                    observer.next(data);
                },
                (error) => {
                    console.log("MultiBLEProvider::connect error", error);
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = false; 
                            this.devices[deviceId].connecting = false;
                            console.log("Current device list", this.devices);
                        }
                    );
                    observer.error(error);
                },
                () => {
                    console.log("MultiBLEProvider::connect finished for device", deviceId);
                    this.zone.run(
                        () => {
                            this.devices[deviceId].connected = false;
                            this.devices[deviceId].connecting = false;
                        }
                    );
                    observer.complete();
                }
            );
        }
    );
  }

}
