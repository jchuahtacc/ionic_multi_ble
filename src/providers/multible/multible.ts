import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';

export class BLEDevice {
  public name: String;
  public id: String;
}

/*
  Generated class for the MultibleProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MultiBLEProvider {
  public devices: BLEDevice[] = [];
  constructor(private ble: BLE) {
    console.log('Hello MultiBLEProvider Provider');
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

  rescan(zone: NgZone) {
    this.ble.scan([], 60).subscribe(
        (data) => {
            zone.run(
                () => {
                    console.log("MultiBLE::refresh response: ", data);
                    var device = new BLEDevice();
                    device.id = data.id;
                    if (data.name) {
                        device.name = data.name;
                    }
                    this.devices.push(device);
                }
            );
        },
        (error) => {
            console.log("MultiBLE::refresh error: ", error);
        },
        () => {
            console.log("MultiBLE::refresh finished");
        }
    );
  }

  connect(deviceId: string) {
    console.log("Initiating connection", deviceId);
    this.ble.connect(deviceId).subscribe( 
        (data) => {
            console.log("Connection success", data);
        },
        (error) => {
            console.log("Connection failure", error);
        },
        () => {
            console.log("Connection finished for device", deviceId);
        }
    );
  }

}
