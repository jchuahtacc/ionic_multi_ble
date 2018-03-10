# Ionic Multi-BLE App

This boilerplate for an Ionic Framework app allows simultaneous connections to multiple Bluetooth LE devices, each on a separate page. Each page remembers the last device it connected to.

It abstracts the [`@ionic-native/ble`](https://ionicframework.com/docs/native/ble/) package and uses [Events](https://ionicframework.com/docs/api/util/Events/) on the `multible` topic to communicate device connection status.
